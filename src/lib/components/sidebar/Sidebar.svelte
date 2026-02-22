<script lang="ts">
	import { ui, openModal, openAddModal } from '$lib/stores/ui';
	import { filter, setDayFilter, toggleMustSee } from '$lib/stores/filter';
	import { filteredPoints } from '$lib/stores/filter';
	import { tripStats, tripDays } from '$lib/stores/points';
	import { collab } from '$lib/stores/ui';
	import ItineraryList from './ItineraryList.svelte';

	$effect(() => {
		// Close sidebar on mobile when a modal opens
		if ($ui.activeModal && window.innerWidth < 640) {
			// keep open for better UX
		}
	});
</script>

<aside
	id="sidebar"
	class:collapsed={!$ui.sidebarOpen}
	aria-label="Reiseplan"
>
	<!-- Summary Strip -->
	<div
		class="flex items-center justify-between px-4 py-3 flex-shrink-0"
		style="border-bottom: 1px solid var(--border);"
	>
		<div class="flex gap-4 text-sm">
			<span>
				<span class="font-bold" style="color: var(--accent-primary)">{$tripStats.activityCount}</span>
				<span style="color: var(--text-muted)"> Orte</span>
			</span>
			<span>
				<span class="font-bold" style="color: var(--accent-primary)">¥{$tripStats.totalBudgetJPY.toLocaleString()}</span>
			</span>
			{#if $tripStats.mustSeeCount > 0}
				<span>
					<span class="font-bold" style="color: var(--must-see)">★{$tripStats.mustSeeCount}</span>
				</span>
			{/if}
		</div>

		{#if $collab.active}
			<div
				class="text-xs px-2 py-1 rounded-full flex items-center gap-1"
				style="background: var(--bg-card); border: 1px solid var(--border); color: var(--accent-primary);"
			>
				👥 {$collab.onlineCount}
			</div>
		{/if}
	</div>

	<!-- Filters -->
	<div
		class="flex items-center gap-2 px-4 py-2 flex-shrink-0"
		style="border-bottom: 1px solid var(--border);"
	>
		<!-- Day filter -->
		<select
			class="form-input text-xs py-1"
			style="flex: 1;"
			value={$filter.selectedDay ?? ''}
			onchange={(e) => setDayFilter((e.target as HTMLSelectElement).value || null)}
		>
			<option value="">Alle Tage</option>
			{#each $tripDays as day}
				<option value={day}>{new Date(day + 'T00:00:00').toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}</option>
			{/each}
		</select>

		<!-- Must-See toggle -->
		<button
			class="btn text-xs flex-shrink-0 px-2 py-1"
			style={$filter.mustSeeOnly
				? 'background: var(--must-see); color: white; border: none;'
				: 'background: var(--bg-card); color: var(--text-muted); border: 1px solid var(--border);'}
			onclick={toggleMustSee}
			title="Must-See Filter"
		>
			★ Must-See
		</button>
	</div>

	<!-- Add Stop -->
	<div class="px-3 pt-2 pb-1 flex-shrink-0 flex justify-center">
		<button class="btn btn-primary justify-center" style="min-width: 200px;" onclick={() => openAddModal()}>
			+ Stop hinzufügen
		</button>
	</div>

	<!-- Itinerary list -->
	<ItineraryList points={$filteredPoints} />

	<!-- Action buttons -->
	<div
		class="flex flex-wrap gap-2 p-3 flex-shrink-0"
		style="border-top: 1px solid var(--border);"
	>
		<button class="btn btn-ghost text-xs flex-1" onclick={() => openModal('theme')} title="Themes">
			🎨 Theme
		</button>
		<button class="btn btn-ghost text-xs flex-1" onclick={() => openModal('collab')} title="Kollaboration">
			👥 Collab
		</button>
		<button class="btn btn-ghost text-xs flex-1" onclick={() => openModal('share')} title="Teilen">
			🔗 Teilen
		</button>
		<button class="btn btn-ghost text-xs flex-1" onclick={() => openModal('stats')} title="Statistiken">
			📊 Stats
		</button>
	</div>
</aside>
