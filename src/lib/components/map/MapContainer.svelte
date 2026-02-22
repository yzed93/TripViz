<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as L from 'leaflet';
	import { filteredPoints } from '$lib/stores/filter';
	import { points } from '$lib/stores/points';
	import { openAddModal, openEditModal, ui } from '$lib/stores/ui';
	import { updatePoint, deletePoint, getImages } from '$lib/services/db';
	import type { Point } from '$lib/types';
	import { CATEGORIES } from '$lib/types';

	let mapEl: HTMLDivElement;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let map: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let markerLayer: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let routeLayer: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let tileLayer: any;

	let darkMap = true;

	const STADIA_KEY = '2831d4eb-094e-4752-a3c9-1ae9e9d65f94';
	const TILE_URLS = {
		dark: `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${STADIA_KEY}`,
		light: `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${STADIA_KEY}`
	};
	const TILE_ATTRIBUTION =
		'© <a href="https://stadiamaps.com/">Stadia Maps</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

	function toggleMapStyle() {
		darkMap = !darkMap;
		if (tileLayer) map.removeLayer(tileLayer);
		tileLayer = L.tileLayer(darkMap ? TILE_URLS.dark : TILE_URLS.light, {
			attribution: TILE_ATTRIBUTION,
			maxZoom: 20
		}).addTo(map);
	}

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

	function getColor(variable: string, fallback: string): string {
		return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || fallback;
	}

	function renderMap(pts: Point[]) {
		if (!map || !markerLayer) return;

		markerLayer.clearLayers();
		routeLayer.clearLayers();

		const activities = pts.filter((p) => p.type === 'activity');
		const transports = pts.filter((p) => p.type === 'transport');

		// ── Transport-Linien (startCoords → endCoords) ───────────────────────
		for (const t of transports) {
			if (t.startCoords && t.endCoords) {
				const secondary = getColor('--accent-secondary', '#0066ff');
				L.polyline(
					[[t.startCoords.lat, t.startCoords.lng], [t.endCoords.lat, t.endCoords.lng]],
					{ color: secondary, weight: 3, opacity: 0.6, dashArray: '10 18' }
				).addTo(routeLayer);
			}
		}

		for (const point of activities) {
			const marker = L.marker([point.coords.lat, point.coords.lng], {
				icon: createMarkerIcon(point),
				draggable: true
			});

			marker.bindPopup(createPopupContent(point), { maxWidth: 280 });

			// ── Hover-Tooltip mit erstem Bild ───────────────────────────────
			let tooltipLoaded = false;
			marker.on('mouseover', async () => {
				if (!tooltipLoaded) {
					tooltipLoaded = true;
					const imgs = await getImages(point.id);
					const emoji = getCategoryEmoji(point.category);
					const imgHtml = imgs.length > 0
						? `<img src="${imgs[0].thumbnail}" style="width:100%;height:90px;object-fit:cover;display:block;" />`
						: '';
					const dateHtml = point.date
						? `<div style="font-size:0.7rem;color:var(--text-muted);margin-top:0.2rem;">${new Date(point.date + 'T00:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}</div>`
						: '';
					marker.bindTooltip(
						`<div class="tripviz-tip">${imgHtml}<div style="padding:0.5rem 0.625rem;"><div style="font-weight:600;font-size:0.8rem;color:var(--text-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;">${emoji} ${point.title}</div>${dateHtml}</div></div>`,
						{ direction: 'top', className: 'tripviz-tip-wrap', opacity: 1, offset: [0, -8] }
					);
				}
				marker.openTooltip();
			});
			marker.on('mouseout', () => marker.closeTooltip());

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
			const emoji = t.transportMethod?.split(' ')[0] ?? '🚀';
			const iconHtml = (label: string) => `<div style="
				font-size: 1.25rem;
				background: var(--bg-card);
				border-radius: 0.5rem;
				width: 36px;
				height: 36px;
				display: flex;
				align-items: center;
				justify-content: center;
				border: 1px solid var(--border);
				cursor: pointer;
				box-shadow: 0 2px 6px rgba(0,0,0,0.4);
			">${label}</div>`;

			const makeIcon = (label: string) => L.divIcon({
				html: iconHtml(label),
				className: '',
				iconSize: [36, 36],
				iconAnchor: [18, 18],
				popupAnchor: [0, -20]
			});

			// Marker am Startpunkt
			const startMarker = L.marker([t.coords.lat, t.coords.lng], { icon: makeIcon(emoji) });
			startMarker.bindPopup(createPopupContent(t));
			markerLayer.addLayer(startMarker);

			// Marker am Endpunkt (wenn vorhanden)
			if (t.endCoords) {
				const endMarker = L.marker([t.endCoords.lat, t.endCoords.lng], { icon: makeIcon(emoji) });
				endMarker.bindPopup(createPopupContent(t));
				markerLayer.addLayer(endMarker);
			}
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
	let unsubView: () => void;

	onMount(async () => {
		// 1. Initialise map (Leaflet imported statically; CSS via app.css)
		map = L.map(mapEl, {
			center: [36.2048, 138.2529],
			zoom: 6,
			zoomControl: true
		});

		tileLayer = L.tileLayer(TILE_URLS.dark, {
			attribution: TILE_ATTRIBUTION,
			maxZoom: 20
		}).addTo(map);

		// 2. After flex-layout settles, force Leaflet to recalculate container dimensions
		setTimeout(() => map?.invalidateSize(), 150);

		markerLayer = L.layerGroup().addTo(map);
		routeLayer = L.layerGroup().addTo(map);

		// 3. Click on empty map to add a point
		map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
			openAddModal({ lat: e.latlng.lat, lng: e.latlng.lng });
		});

		// 4. Expose popup handlers globally (used in inline onclick strings)
		(window as unknown as Record<string, unknown>)['__tripviz_editPoint'] = (id: string) => {
			map.closePopup();
			openEditModal(id);
		};
		(window as unknown as Record<string, unknown>)['__tripviz_deletePoint'] = (id: string) => {
			handleDeletePoint(id);
		};

		// 5. Subscribe to filtered points — re-renders markers on change
		unsubscribe = filteredPoints.subscribe(renderMap);

		// 6. Re-invalidate map size whenever the map view becomes active again
		unsubView = ui.subscribe((state) => {
			if (state.activeView === 'map' && map) {
				setTimeout(() => map?.invalidateSize(), 50);
			}
		});
	});

	onDestroy(() => {
		unsubView?.();
		unsubscribe?.();
		map?.remove();
	});
</script>

<div bind:this={mapEl} style="position: absolute; inset: 0;" />

<button
	onclick={toggleMapStyle}
	title={darkMap ? 'Helle Karte' : 'Dunkle Karte'}
	style="
		position: absolute;
		top: 80px;
		left: 10px;
		z-index: 1000;
		width: 30px;
		height: 30px;
		background: var(--bg-card);
		border: 2px solid rgba(255,255,255,0.2);
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.9rem;
		box-shadow: 0 1px 5px rgba(0,0,0,0.4);
	"
>
	{darkMap ? '☀️' : '🌙'}
</button>
