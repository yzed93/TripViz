<script lang="ts">
	import { closeModal } from '$lib/stores/ui';

	const STORAGE_KEY = 'tripviz-tour-shown';

	let dontShowAgain = $state(false);

	function close() {
		if (dontShowAgain) {
			localStorage.setItem(STORAGE_KEY, 'true');
		}
		closeModal();
	}

	const steps = [
		{
			icon: '🔍',
			title: 'Suche',
			text: 'Suche Orte und Sehenswürdigkeiten über die Suchleiste oben. Klick auf ein Ergebnis, um es hinzuzufügen.'
		},
		{
			icon: '🗺️',
			title: 'Karte',
			text: 'Klicke irgendwo auf die Karte, um einen neuen Ort hinzuzufügen. Marker können per Drag & Drop verschoben werden.'
		},
		{
			icon: '📋',
			title: 'Itinerar',
			text: 'In der Sidebar siehst du alle geplanten Orte. Ziehe sie per Drag & Drop in die richtige Reihenfolge.'
		},
		{
			icon: '📅',
			title: 'Kalender & Zeitstrahl',
			text: 'Wechsle zwischen Karten-, Kalender- und Zeitstrahl-Ansicht mit den Buttons oben links.'
		},
		{
			icon: '👥',
			title: 'Kollaboration',
			text: 'Plane gemeinsam mit Freunden in Echtzeit über den Collab-Button — keine Anmeldung nötig!'
		}
	];

	let step = $state(0);
</script>

<div class="modal-overlay" onclick={close} role="dialog" aria-label="Willkommen">
	<div class="modal-panel" onclick={(e) => e.stopPropagation()} style="max-width: 440px; text-align: center;">
		<div class="modal-body" style="padding: 2rem;">
			<div class="text-5xl mb-4">{steps[step].icon}</div>
			<div class="text-4xl font-bold mb-1" style="color: var(--accent-primary);">TripViz</div>
			<div class="text-sm mb-2" style="color: var(--text-muted);">Interaktiver Japan-Reiseplaner</div>

			<div class="rounded-xl p-4 mb-6" style="background: var(--bg-card); border: 1px solid var(--border);">
				<div class="font-bold mb-2">{steps[step].title}</div>
				<p class="text-sm" style="color: var(--text-muted); line-height: 1.6;">{steps[step].text}</p>
			</div>

			<!-- Dots -->
			<div class="flex justify-center gap-2 mb-6">
				{#each steps as _, i}
					<div
						class="rounded-full transition-all"
						style="
							width: {i === step ? '20px' : '8px'};
							height: 8px;
							background: {i === step ? 'var(--accent-primary)' : 'var(--border)'};
						"
					></div>
				{/each}
			</div>

			<div class="flex gap-3 justify-center">
				{#if step > 0}
					<button class="btn btn-secondary" onclick={() => step--}>◀ Zurück</button>
				{/if}

				{#if step < steps.length - 1}
					<button class="btn btn-primary" onclick={() => step++}>Weiter ▶</button>
				{:else}
					<button class="btn btn-primary" onclick={close}>🚀 Loslegen!</button>
				{/if}
			</div>

			<label class="flex items-center justify-center gap-2 mt-4 text-xs cursor-pointer" style="color: var(--text-muted);">
				<input type="checkbox" bind:checked={dontShowAgain} />
				Nicht mehr anzeigen
			</label>
		</div>
	</div>
</div>
