<script lang="ts">
	import { ui, closeModal } from '$lib/stores/ui';
	import { points } from '$lib/stores/points';
	import { addPoint, updatePoint, deletePoint, addImage, getImages, deleteImage } from '$lib/services/db';
	import { addPointToFirebase, updatePointInFirebase, deletePointFromFirebase } from '$lib/services/firebase';
	import { collab } from '$lib/stores/ui';
	import { CATEGORIES, TRANSPORT_METHODS } from '$lib/types';
	import type { Point, ActivityCategory, TransportMethod, PointImage } from '$lib/types';
	import { onMount } from 'svelte';

	// ─── Helpers ─────────────────────────────────────────────────────────────

	function generateId(): string {
		return `point_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
	}

	const isEditing = $derived($ui.editingPointId !== null);
	const existingPoint = $derived(
		isEditing ? $points.find((p) => p.id === $ui.editingPointId) ?? null : null
	);

	// ─── Form State ───────────────────────────────────────────────────────────

	let type = $state<'activity' | 'transport'>('activity');
	let title = $state('');
	let category = $state<ActivityCategory>('landmark');
	let mustSee = $state(false);
	let date = $state('');
	let time = $state('');
	let budgetJPY = $state(0);
	let budgetEUR = $state(0);
	let description = $state('');
	let transportStart = $state('');
	let transportEnd = $state('');
	let transportMethod = $state<TransportMethod>('🚃 Train');
	let images = $state<PointImage[]>([]);
	let newImageFiles = $state<File[]>([]);

	// ─── Init from existing point ─────────────────────────────────────────────

	onMount(async () => {
		if (existingPoint) {
			type = existingPoint.type;
			title = existingPoint.title;
			category = existingPoint.category;
			mustSee = existingPoint.mustSee;
			date = existingPoint.date ?? '';
			time = existingPoint.time ?? '';
			budgetJPY = existingPoint.budgetJPY;
			budgetEUR = existingPoint.budgetEUR;
			description = existingPoint.description ?? '';
			transportStart = existingPoint.transportStart ?? '';
			transportEnd = existingPoint.transportEnd ?? '';
			transportMethod = existingPoint.transportMethod ?? '🚃 Train';
			images = await getImages(existingPoint.id);
		}
	});

	// ─── Save ─────────────────────────────────────────────────────────────────

	async function save() {
		if (!title.trim()) return;

		const coords = existingPoint?.coords ?? $ui.addingPointCoords ?? { lat: 35.6762, lng: 139.6503 };
		const now = Date.now();

		const point: Point = {
			id: existingPoint?.id ?? generateId(),
			firebaseId: existingPoint?.firebaseId,
			type,
			title: title.trim(),
			coords,
			category,
			mustSee,
			date: date || undefined,
			time: time || undefined,
			budgetJPY,
			budgetEUR,
			description: description.trim() || undefined,
			transportStart: type === 'transport' ? transportStart : undefined,
			transportEnd: type === 'transport' ? transportEnd : undefined,
			transportMethod: type === 'transport' ? transportMethod : undefined,
			created_at: existingPoint?.created_at ?? now,
			updated_at: now
		};

		if (isEditing) {
			await updatePoint(point);
			points.update((all) => all.map((p) => (p.id === point.id ? point : p)));
			if ($collab.active) await updatePointInFirebase(point);
		} else {
			await addPoint(point);
			points.update((all) => [...all, point]);
			if ($collab.active) await addPointToFirebase(point);
		}

		// Upload new images
		for (const file of newImageFiles) {
			await addImage(point.id, file);
		}

		closeModal();
	}

	// ─── Delete ───────────────────────────────────────────────────────────────

	async function remove() {
		if (!existingPoint) return;
		if (!confirm(`"${existingPoint.title}" wirklich löschen?`)) return;

		await deletePoint(existingPoint.id);
		points.update((all) => all.filter((p) => p.id !== existingPoint.id));
		if ($collab.active && existingPoint.firebaseId) {
			await deletePointFromFirebase(existingPoint.firebaseId);
		}
		closeModal();
	}

	// ─── Image handling ───────────────────────────────────────────────────────

	async function removeImage(img: PointImage) {
		await deleteImage(img.id);
		images = images.filter((i) => i.id !== img.id);
	}

	function onFileChange(e: Event) {
		const files = Array.from((e.target as HTMLInputElement).files ?? []);
		const remaining = 5 - images.length - newImageFiles.length;
		newImageFiles = [...newImageFiles, ...files.slice(0, remaining)];
	}
</script>

<!-- Modal Overlay -->
<div class="modal-overlay" onclick={closeModal} role="dialog" aria-modal="true" aria-label="Ort bearbeiten">
	<div class="modal-panel" onclick={(e) => e.stopPropagation()}>
		<!-- Header -->
		<div class="modal-header">
			<h2 class="font-bold text-base">
				{isEditing ? '✏️ Bearbeiten' : '➕ Neuer Ort'}
			</h2>
			<button class="btn btn-ghost" onclick={closeModal} aria-label="Schließen">✕</button>
		</div>

		<!-- Body -->
		<div class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
			<!-- Type toggle -->
			<div class="flex gap-2">
				<button
					class="btn flex-1 text-sm"
					style={type === 'activity' ? 'background: var(--accent-primary); color: var(--bg-main); border: none;' : 'background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted);'}
					onclick={() => (type = 'activity')}
				>🏛️ Aktivität</button>
				<button
					class="btn flex-1 text-sm"
					style={type === 'transport' ? 'background: var(--accent-primary); color: var(--bg-main); border: none;' : 'background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted);'}
					onclick={() => (type = 'transport')}
				>🚆 Transport</button>
			</div>

			<!-- Title -->
			<div>
				<label class="form-label" for="point-title">Name / Ort</label>
				<input
					id="point-title"
					type="text"
					class="form-input"
					placeholder="z.B. Shibuya Crossing"
					bind:value={title}
				/>
			</div>

			{#if type === 'activity'}
				<!-- Category -->
				<div>
					<label class="form-label" for="point-category">Kategorie</label>
					<select id="point-category" class="form-input" bind:value={category}>
						{#each CATEGORIES as cat}
							<option value={cat.id}>{cat.emoji} {cat.label}</option>
						{/each}
					</select>
				</div>
			{:else}
				<!-- Transport fields -->
				<div class="flex gap-3">
					<div style="flex: 1;">
						<label class="form-label" for="transport-start">Von</label>
						<input id="transport-start" type="text" class="form-input" placeholder="z.B. Tokyo" bind:value={transportStart} />
					</div>
					<div style="flex: 1;">
						<label class="form-label" for="transport-end">Nach</label>
						<input id="transport-end" type="text" class="form-input" placeholder="z.B. Kyoto" bind:value={transportEnd} />
					</div>
				</div>
				<div>
					<label class="form-label" for="transport-method">Verkehrsmittel</label>
					<select id="transport-method" class="form-input" bind:value={transportMethod}>
						{#each TRANSPORT_METHODS as m}
							<option value={m}>{m}</option>
						{/each}
					</select>
				</div>
			{/if}

			<!-- Date & Time -->
			<div class="flex gap-3">
				<div style="flex: 1;">
					<label class="form-label" for="point-date">Datum</label>
					<input id="point-date" type="date" class="form-input" bind:value={date} />
				</div>
				<div style="flex: 1;">
					<label class="form-label" for="point-time">Zeit</label>
					<select id="point-time" class="form-input" bind:value={time}>
						<option value="">Keine Angabe</option>
						<option value="morning">🌅 Morgen</option>
						<option value="afternoon">☀️ Nachmittag</option>
						<option value="evening">🌙 Abend</option>
					</select>
				</div>
			</div>

			<!-- Budget -->
			<div class="flex gap-3">
				<div style="flex: 1;">
					<label class="form-label" for="budget-jpy">Budget ¥ JPY</label>
					<input id="budget-jpy" type="number" min="0" class="form-input" bind:value={budgetJPY} />
				</div>
				<div style="flex: 1;">
					<label class="form-label" for="budget-eur">Budget € EUR</label>
					<input id="budget-eur" type="number" min="0" step="0.01" class="form-input" bind:value={budgetEUR} />
				</div>
			</div>

			<!-- Must-See toggle -->
			<div class="flex items-center justify-between">
				<div>
					<div class="font-medium text-sm">Must-See ★</div>
					<div class="text-xs" style="color: var(--text-muted);">Als Top-Sehenswürdigkeit markieren</div>
				</div>
				<label class="toggle">
					<input type="checkbox" bind:checked={mustSee} />
					<span class="toggle-slider"></span>
				</label>
			</div>

			<!-- Description -->
			<div>
				<label class="form-label" for="point-desc">Notizen</label>
				<textarea
					id="point-desc"
					class="form-input"
					rows="3"
					placeholder="Tipps, Öffnungszeiten, Eintrittspreise…"
					bind:value={description}
					style="resize: vertical;"
				></textarea>
			</div>

			<!-- Images -->
			<div>
				<label class="form-label">Bilder ({images.length + newImageFiles.length}/5)</label>

				{#if images.length > 0 || newImageFiles.length > 0}
					<div class="flex gap-2 flex-wrap mb-2">
						{#each images as img (img.id)}
							<div class="relative">
								<img src={img.thumbnail} alt={img.filename} class="w-16 h-16 object-cover rounded" />
								<button
									class="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center"
									style="background: #ef4444; color: white;"
									onclick={() => removeImage(img)}
									aria-label="Bild entfernen"
								>✕</button>
							</div>
						{/each}
						{#each newImageFiles as file}
							<div class="w-16 h-16 rounded flex items-center justify-center text-xs text-center"
								style="background: var(--bg-card); border: 1px dashed var(--border); color: var(--text-muted);">
								{file.name.slice(0, 8)}…
							</div>
						{/each}
					</div>
				{/if}

				{#if images.length + newImageFiles.length < 5}
					<label
						class="flex items-center justify-center gap-2 rounded-lg cursor-pointer text-sm"
						style="border: 1px dashed var(--border); padding: 0.75rem; color: var(--text-muted);"
					>
						📎 Bilder hinzufügen
						<input type="file" accept="image/*" multiple class="hidden" onchange={onFileChange} />
					</label>
				{/if}
			</div>
		</div>

		<!-- Footer -->
		<div
			class="flex items-center justify-between px-6 py-4"
			style="border-top: 1px solid var(--border);"
		>
			{#if isEditing}
				<button class="btn btn-danger text-sm" onclick={remove}>🗑️ Löschen</button>
			{:else}
				<div></div>
			{/if}

			<div class="flex gap-2">
				<button class="btn btn-secondary text-sm" onclick={closeModal}>Abbrechen</button>
				<button class="btn btn-primary text-sm" onclick={save} disabled={!title.trim()}>
					{isEditing ? '✓ Speichern' : '➕ Hinzufügen'}
				</button>
			</div>
		</div>
	</div>
</div>
