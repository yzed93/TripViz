<script lang="ts">
	import { ui, toggleSidebar, setView, openModal } from '$lib/stores/ui';
	import SearchBar from './SearchBar.svelte';
	import type { ViewType } from '$lib/types';

	const views: Array<{ id: ViewType; label: string; icon: string }> = [
		{ id: 'map', label: 'Karte', icon: '🗺️' },
		{ id: 'calendar', label: 'Kalender', icon: '📅' },
		{ id: 'timeline', label: 'Zeitstrahl', icon: '⏱️' }
	];
</script>

<header
	class="flex items-center gap-3 px-4"
	style="
		height: var(--header-height);
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border);
		position: relative;
		z-index: 20;
	"
>
	<!-- Logo -->
	<div class="flex items-center gap-2 flex-shrink-0">
		<span class="text-xl">🗾</span>
		<span class="font-bold text-sm tracking-wide hidden sm:block" style="color: var(--accent-primary)">
			TripViz
		</span>
	</div>

	<!-- View Switcher (map / calendar / timeline) -->
	<div
		class="flex items-center rounded-lg overflow-hidden flex-shrink-0"
		style="background: var(--bg-card); border: 1px solid var(--border);"
	>
		{#each views as view}
			<button
				class="px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1"
				style={$ui.activeView === view.id
					? 'background: var(--accent-primary); color: var(--bg-main);'
					: 'color: var(--text-muted);'}
				onclick={() => setView(view.id)}
				title={view.label}
			>
				<span>{view.icon}</span>
				<span class="hidden md:inline">{view.label}</span>
			</button>
		{/each}
	</div>

	<!-- Search -->
	<div class="flex-1">
		<SearchBar />
	</div>

	<!-- Sidebar toggle -->
	<button
		class="btn btn-ghost flex-shrink-0"
		onclick={toggleSidebar}
		title={$ui.sidebarOpen ? 'Sidebar schließen' : 'Sidebar öffnen'}
		aria-label="Sidebar umschalten"
	>
		{$ui.sidebarOpen ? '◀' : '▶'}
	</button>
</header>
