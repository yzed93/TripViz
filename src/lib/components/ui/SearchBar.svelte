<script lang="ts">
	import { searchLocations } from '$lib/services/geocoding';
	import { openAddModal } from '$lib/stores/ui';
	import type { GeocodingResult } from '$lib/types';

	let query = $state('');
	let results = $state<GeocodingResult[]>([]);
	let showResults = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout>;

	function onInput() {
		clearTimeout(debounceTimer);
		if (query.length < 3) {
			results = [];
			showResults = false;
			return;
		}
		debounceTimer = setTimeout(async () => {
			results = await searchLocations(query);
			showResults = results.length > 0;
		}, 300);
	}

	function selectResult(result: GeocodingResult) {
		openAddModal({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
		query = result.display_name.split(',')[0];
		showResults = false;
		results = [];
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			showResults = false;
			results = [];
		}
	}

	function onBlur() {
		// Delay to allow click on result
		setTimeout(() => { showResults = false; }, 150);
	}
</script>

<div class="relative w-full">
	<div
		class="flex items-center gap-2 rounded-lg px-3"
		style="background: var(--bg-card); border: 1px solid var(--border); height: 36px;"
	>
		<span class="text-sm" style="color: var(--text-muted)">🔍</span>
		<input
			type="text"
			placeholder="Ort oder Sehenswürdigkeit suchen…"
			bind:value={query}
			oninput={onInput}
			onkeydown={onKeydown}
			onblur={onBlur}
			class="flex-1 bg-transparent text-sm outline-none"
			style="color: var(--text-main);"
		/>
	</div>

	{#if showResults}
		<div
			class="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-50"
			style="background: var(--bg-card); border: 1px solid var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.5);"
		>
			{#each results as result}
				<button
					class="w-full text-left px-3 py-2 text-sm hover:opacity-80 transition-opacity border-b"
					style="border-color: var(--border); color: var(--text-main);"
					onmousedown={() => selectResult(result)}
				>
					<div class="font-medium truncate">{result.display_name.split(',')[0]}</div>
					<div class="text-xs truncate" style="color: var(--text-muted);">
						{result.display_name}
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>
