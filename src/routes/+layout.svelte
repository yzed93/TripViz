<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { currentTheme, applyThemeToDom } from '$lib/stores/theme';
	import { initDB, getPoints, getSetting } from '$lib/services/db';
	import { points } from '$lib/stores/points';
	import { decodeTripFromUrl, clearUrlData } from '$lib/services/compression';
	import { saveAllPoints } from '$lib/services/db';
	import { openModal } from '$lib/stores/ui';
	import type { Theme } from '$lib/types';

	let { children } = $props();

	onMount(async () => {
		// Apply saved theme immediately
		applyThemeToDom($currentTheme);

		// Subscribe to theme changes
		const unsub = currentTheme.subscribe(applyThemeToDom);

		// Initialise IndexedDB
		await initDB();

		// Check for shared trip data in URL
		const sharedData = decodeTripFromUrl();
		if (sharedData?.points?.length) {
			await saveAllPoints(sharedData.points);
			points.set(sharedData.points);
			if (sharedData.settings?.theme) {
				currentTheme.set(sharedData.settings.theme as Theme);
			}
			clearUrlData();
		} else {
			// Load from local DB
			const savedPoints = await getPoints();
			points.set(savedPoints);
		}

		// Load saved theme from DB (in case it differs from localStorage)
		const savedTheme = await getSetting<Theme>('theme');
		if (savedTheme) {
			currentTheme.set(savedTheme);
		}

		// Show welcome modal on first visit
		const tourShown = localStorage.getItem('tripviz-tour-shown');
		if (!tourShown) {
			openModal('welcome');
		}

		return unsub;
	});
</script>

{@render children()}
