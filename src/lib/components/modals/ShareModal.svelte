<script lang="ts">
	import { closeModal } from '$lib/stores/ui';
	import { points } from '$lib/stores/points';
	import { currentTheme } from '$lib/stores/theme';
	import { encodeTripToUrl } from '$lib/services/compression';
	import { downloadJSON, generateQRCode, downloadMapAsImage } from '$lib/services/export';
	import { exportData } from '$lib/services/db';

	let shareUrl = $state('');
	let qrSrc = $state('');
	let copied = $state(false);
	let activeTab = $state<'link' | 'qr' | 'image' | 'json'>('link');

	async function generateLink() {
		const data = await exportData();
		shareUrl = encodeTripToUrl(data);
		qrSrc = await generateQRCode(shareUrl);
	}

	async function copyLink() {
		await navigator.clipboard.writeText(shareUrl);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	async function downloadJSON_() {
		const data = await exportData();
		downloadJSON(data);
	}

	async function downloadImage() {
		const mapEl = document.getElementById('map-container');
		if (mapEl) await downloadMapAsImage(mapEl as HTMLElement);
	}

	// Generate link on open
	$effect(() => {
		generateLink();
	});
</script>

<div class="modal-overlay" onclick={closeModal} role="dialog" aria-label="Trip teilen">
	<div class="modal-panel" onclick={(e) => e.stopPropagation()}>
		<div class="modal-header">
			<h2 class="font-bold text-base">🔗 Trip teilen</h2>
			<button class="btn btn-ghost" onclick={closeModal} aria-label="Schließen">✕</button>
		</div>

		<!-- Tab bar -->
		<div class="flex" style="border-bottom: 1px solid var(--border);">
			{#each [['link', '🔗 Link'], ['qr', '📱 QR'], ['image', '🖼️ Bild'], ['json', '📥 JSON']] as [id, label]}
				<button
					class="flex-1 py-2.5 text-xs font-medium transition-all"
					style={activeTab === id
						? 'color: var(--accent-primary); border-bottom: 2px solid var(--accent-primary);'
						: 'color: var(--text-muted); border-bottom: 2px solid transparent;'}
					onclick={() => (activeTab = id as typeof activeTab)}
				>{label}</button>
			{/each}
		</div>

		<div class="modal-body">
			{#if activeTab === 'link'}
				<p class="text-sm mb-3" style="color: var(--text-muted);">
					Dieser Link enthält alle deine Reisedaten komprimiert. Teile ihn mit Freunden!
				</p>
				<div class="flex gap-2">
					<input
						type="text"
						readonly
						value={shareUrl}
						class="form-input text-xs flex-1"
						style="font-family: monospace;"
					/>
					<button class="btn btn-primary text-sm flex-shrink-0" onclick={copyLink}>
						{copied ? '✓' : '📋'}
					</button>
				</div>

			{:else if activeTab === 'qr'}
				<div class="flex flex-col items-center gap-4">
					<p class="text-sm" style="color: var(--text-muted);">
						QR-Code mit dem Smartphone scannen, um den Trip zu laden.
					</p>
					{#if qrSrc}
						<div class="p-4 rounded-xl" style="background: var(--bg-card);">
							<img src={qrSrc} alt="QR Code" class="w-48 h-48" />
						</div>
					{/if}
				</div>

			{:else if activeTab === 'image'}
				<div class="text-center">
					<p class="text-sm mb-4" style="color: var(--text-muted);">
						Exportiert die aktuelle Kartenansicht als PNG-Bild.
					</p>
					<button class="btn btn-primary" onclick={downloadImage}>
						📸 Karte als Bild exportieren
					</button>
				</div>

			{:else if activeTab === 'json'}
				<div class="text-center">
					<p class="text-sm mb-4" style="color: var(--text-muted);">
						Exportiert alle Reisedaten als JSON-Datei zur Sicherung oder zum Übertragen.
					</p>
					<button class="btn btn-primary" onclick={downloadJSON_}>
						📥 JSON herunterladen
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>
