<script lang="ts">
	import { onMount } from 'svelte';
	import { openEditModal } from '$lib/stores/ui';
	import { points } from '$lib/stores/points';
	import { saveAllPoints } from '$lib/services/db';
	import { CATEGORIES } from '$lib/types';
	import type { Point } from '$lib/types';

	let { points: displayPoints }: { points: Point[] } = $props();

	let listEl: HTMLElement;

	function getCategoryEmoji(cat: string): string {
		return CATEGORIES.find((c) => c.id === cat)?.emoji ?? '📍';
	}

	function formatDate(date?: string): string {
		if (!date) return '';
		return new Date(date + 'T00:00:00').toLocaleDateString('de-DE', {
			weekday: 'short',
			day: 'numeric',
			month: 'short'
		});
	}

	function formatBudget(jpy: number, eur: number): string {
		const parts: string[] = [];
		if (jpy > 0) parts.push(`¥${jpy.toLocaleString()}`);
		if (eur > 0) parts.push(`€${eur.toFixed(0)}`);
		return parts.join(' · ');
	}

	// Drag & Drop reordering via SortableJS
	onMount(async () => {
		const Sortable = (await import('sortablejs')).default;
		if (!listEl) return;

		Sortable.create(listEl, {
			animation: 150,
			ghostClass: 'sortable-ghost',
			onEnd: async (evt) => {
				const from = evt.oldIndex ?? 0;
				const to = evt.newIndex ?? 0;
				if (from === to) return;

				// Reorder the full points array to match display order
				const ids = displayPoints.map((p) => p.id);
				const moved = ids.splice(from, 1)[0];
				ids.splice(to, 0, moved);

				// Reconstruct full points array with new order
				points.update((all) => {
					const lookup = new Map(all.map((p) => [p.id, p]));
					const reordered = ids.map((id) => lookup.get(id)!).filter(Boolean);
					// Preserve points not currently displayed (other day filters etc.)
					const others = all.filter((p) => !ids.includes(p.id));
					return [...reordered, ...others];
				});

				const current = await import('$lib/stores/points').then((m) => {
					let pts: Point[] = [];
					m.points.subscribe((v) => (pts = v))();
					return pts;
				});
				await saveAllPoints(current);
			}
		});
	});
</script>

<div
	bind:this={listEl}
	class="flex-1 overflow-y-auto p-3"
	style="display: flex; flex-direction: column; gap: 0.5rem;"
>
	{#if displayPoints.length === 0}
		<div class="text-center py-12" style="color: var(--text-muted);">
			<div class="text-4xl mb-3">🗾</div>
			<p class="text-sm">Klick auf die Karte, um Orte hinzuzufügen</p>
		</div>
	{:else}
		{#each displayPoints as point (point.id)}
			<button
				class="itinerary-item w-full text-left"
				class:must-see={point.mustSee}
				onclick={() => openEditModal(point.id)}
			>
				<span class="item-emoji">
					{point.type === 'transport' ? (point.transportMethod?.split(' ')[0] ?? '🚀') : getCategoryEmoji(point.category)}
				</span>

				<div class="item-content">
					<div class="item-title">{point.title}</div>
					<div class="item-meta">
						{#if point.date}{formatDate(point.date)}{/if}
						{#if point.date && (point.budgetJPY > 0 || point.budgetEUR > 0)} · {/if}
						{formatBudget(point.budgetJPY, point.budgetEUR)}
					</div>
					{#if point.type === 'transport' && point.transportStart && point.transportEnd}
						<div class="item-meta">
							{point.transportStart} → {point.transportEnd}
						</div>
					{/if}
				</div>

				{#if point.mustSee}
					<span class="must-see-badge">★</span>
				{/if}
			</button>
		{/each}
	{/if}
</div>

<style>
	:global(.sortable-ghost) {
		opacity: 0.4;
		background: var(--accent-primary) !important;
	}
</style>
