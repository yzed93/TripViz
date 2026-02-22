<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { filteredPoints } from '$lib/stores/filter';
	import { points } from '$lib/stores/points';
	import { openAddModal, openEditModal } from '$lib/stores/ui';
	import { updatePoint, deletePoint } from '$lib/services/db';
	import type { Point } from '$lib/types';
	import { CATEGORIES } from '$lib/types';

	let mapEl: HTMLDivElement;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let L: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let map: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let markerLayer: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let routeLayer: any;

	// ─── Marker icon factory ─────────────────────────────────────────────────

	function getCategoryEmoji(category: string): string {
		return CATEGORIES.find((c) => c.id === category)?.emoji ?? '📍';
	}

	function createMarkerIcon(point: Point) {
		const emoji = point.type === 'transport' ? '🚀' : getCategoryEmoji(point.category);
		const mustSeeBorder = point.mustSee ? 'border: 2px solid var(--must-see);' : '';
		return L.divIcon({
			html: `<div style="
				font-size: 1.5rem;
				background: var(--bg-card);
				border-radius: 50%;
				width: 40px;
				height: 40px;
				display: flex;
				align-items: center;
				justify-content: center;
				border: 2px solid var(--accent-primary);
				${mustSeeBorder}
				box-shadow: 0 2px 8px rgba(0,0,0,0.5);
				cursor: pointer;
				transition: transform 0.15s;
			" onmouseenter="this.style.transform='scale(1.2)'" onmouseleave="this.style.transform='scale(1)'">${emoji}</div>`,
			className: '',
			iconSize: [40, 40],
			iconAnchor: [20, 20],
			popupAnchor: [0, -24]
		});
	}

	// ─── Popup content ───────────────────────────────────────────────────────

	function createPopupContent(point: Point): string {
		const emoji = point.type === 'transport' ? '🚀' : getCategoryEmoji(point.category);
		const budget =
			point.budgetJPY > 0
				? `<div style="color: var(--text-muted); font-size: 0.75rem; margin-top: 0.25rem;">¥${point.budgetJPY.toLocaleString()}</div>`
				: '';
		const mustSee = point.mustSee
			? `<span style="font-size: 0.7rem; background: var(--must-see); color: white; padding: 0.1rem 0.4rem; border-radius: 999px; margin-left: 0.25rem;">★ Must-See</span>`
			: '';

		return `
			<div style="padding: 0.75rem 1rem; min-width: 160px; font-family: inherit;">
				<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
					<span style="font-size: 1.25rem;">${emoji}</span>
					<span style="font-weight: 600; color: var(--text-main); font-size: 0.9rem;">${point.title}</span>
					${mustSee}
				</div>
				${point.description ? `<p style="font-size: 0.75rem; color: var(--text-muted); margin: 0.25rem 0;">${point.description}</p>` : ''}
				${budget}
				<div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
					<button
						onclick="window.__tripviz_editPoint('${point.id}')"
						style="flex: 1; padding: 0.375rem; background: var(--accent-primary); color: var(--bg-main); border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.75rem; font-weight: 600;"
					>✏️ Bearbeiten</button>
					<button
						onclick="window.__tripviz_deletePoint('${point.id}')"
						style="padding: 0.375rem 0.625rem; background: transparent; color: #ef4444; border: 1px solid #ef444460; border-radius: 0.375rem; cursor: pointer; font-size: 0.75rem;"
					>🗑️</button>
				</div>
			</div>
		`;
	}

	// ─── Render markers & routes ─────────────────────────────────────────────

	function renderMap(pts: Point[]) {
		if (!map || !markerLayer) return;

		markerLayer.clearLayers();
		routeLayer.clearLayers();

		const activities = pts.filter((p) => p.type === 'activity');
		const transports = pts.filter((p) => p.type === 'transport');

		for (const point of activities) {
			const marker = L.marker([point.coords.lat, point.coords.lng], {
				icon: createMarkerIcon(point),
				draggable: true
			});

			marker.bindPopup(createPopupContent(point), { maxWidth: 280 });

			marker.on('dragend', async () => {
				const latlng = marker.getLatLng();
				const updated: Point = {
					...point,
					coords: { lat: latlng.lat, lng: latlng.lng },
					updated_at: Date.now()
				};
				await updatePoint(updated);
				points.update((all) => all.map((p) => (p.id === point.id ? updated : p)));
			});

			markerLayer.addLayer(marker);
		}

		for (const t of transports) {
			if (!t.coords) continue;
			const icon = L.divIcon({
				html: `<div style="font-size: 1.25rem; background: var(--bg-card); border-radius: 0.375rem; padding: 0.125rem 0.375rem; border: 1px solid var(--border); cursor: pointer;">${t.transportMethod?.split(' ')[0] ?? '🚀'}</div>`,
				className: '',
				iconAnchor: [20, 16],
				popupAnchor: [0, -20]
			});
			const marker = L.marker([t.coords.lat, t.coords.lng], { icon });
			marker.bindPopup(createPopupContent(t));
			markerLayer.addLayer(marker);
		}
	}

	// ─── Delete from popup ────────────────────────────────────────────────────

	async function handleDeletePoint(pointId: string) {
		if (!confirm('Diesen Punkt wirklich löschen?')) return;
		await deletePoint(pointId);
		points.update((all) => all.filter((p) => p.id !== pointId));
		map.closePopup();
	}

	// ─── Mount / Destroy ─────────────────────────────────────────────────────

	let unsubscribe: () => void;

	onMount(async () => {
		// 1. Load Leaflet CSS by injecting a <link> tag — works reliably in all Vite setups
		if (!document.querySelector('link[data-leaflet]')) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
			link.setAttribute('data-leaflet', '');
			document.head.appendChild(link);
			// Wait for CSS to load before initialising map
			await new Promise<void>((resolve) => { link.onload = () => resolve(); });
		}

		// 2. Import Leaflet module
		const leafletModule = await import('leaflet');
		L = leafletModule.default ?? leafletModule;

		// 3. Initialise map
		map = L.map(mapEl, {
			center: [36.2048, 138.2529],
			zoom: 6,
			zoomControl: true
		});

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			maxZoom: 19
		}).addTo(map);

		markerLayer = L.layerGroup().addTo(map);
		routeLayer = L.layerGroup().addTo(map);

		// 4. Click on empty map to add a point
		map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
			openAddModal({ lat: e.latlng.lat, lng: e.latlng.lng });
		});

		// 5. Expose popup handlers globally (used in inline onclick strings)
		(window as unknown as Record<string, unknown>)['__tripviz_editPoint'] = (id: string) => {
			map.closePopup();
			openEditModal(id);
		};
		(window as unknown as Record<string, unknown>)['__tripviz_deletePoint'] = (id: string) => {
			handleDeletePoint(id);
		};

		// 6. Subscribe to filtered points — re-renders markers on change
		unsubscribe = filteredPoints.subscribe(renderMap);
	});

	onDestroy(() => {
		unsubscribe?.();
		map?.remove();
	});
</script>

<div bind:this={mapEl} class="w-full h-full" />
