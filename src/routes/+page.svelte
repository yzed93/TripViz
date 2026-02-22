<script lang="ts">
	import Header from '$lib/components/ui/Header.svelte';
	import MapContainer from '$lib/components/map/MapContainer.svelte';
	import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
	import ActivityForm from '$lib/components/forms/ActivityForm.svelte';
	import ThemeModal from '$lib/components/modals/ThemeModal.svelte';
	import ShareModal from '$lib/components/modals/ShareModal.svelte';
	import CollabModal from '$lib/components/modals/CollabModal.svelte';
	import StatsModal from '$lib/components/modals/StatsModal.svelte';
	import WelcomeModal from '$lib/components/tutorial/WelcomeModal.svelte';
	import CalendarView from '$lib/components/calendar/CalendarView.svelte';
	import TimelineView from '$lib/components/timeline/TimelineView.svelte';
	import { ui } from '$lib/stores/ui';

	// Keyboard shortcut: ESC closes any open modal
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && $ui.activeModal) {
			ui.update((s) => ({ ...s, activeModal: null, editingPointId: null, addingPointCoords: null }));
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div id="app-layout">
	<Header />

	<div id="app-content">
		<!-- Map is always rendered (hidden when calendar/timeline active) -->
		<div
			id="map-container"
			class:hidden={$ui.activeView !== 'map'}
		>
			<MapContainer />
		</div>

		<!-- Calendar View -->
		{#if $ui.activeView === 'calendar'}
			<CalendarView />
		{/if}

		<!-- Timeline View -->
		{#if $ui.activeView === 'timeline'}
			<TimelineView />
		{/if}

		<Sidebar />
	</div>
</div>

<!-- Modals — rendered at root level to avoid stacking context issues -->
{#if $ui.activeModal === 'addEdit'}
	<ActivityForm />
{/if}

{#if $ui.activeModal === 'theme'}
	<ThemeModal />
{/if}

{#if $ui.activeModal === 'share'}
	<ShareModal />
{/if}

{#if $ui.activeModal === 'collab'}
	<CollabModal />
{/if}

{#if $ui.activeModal === 'stats'}
	<StatsModal />
{/if}

{#if $ui.activeModal === 'welcome'}
	<WelcomeModal />
{/if}
