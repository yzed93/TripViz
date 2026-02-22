<script lang="ts">
	import { closeModal } from '$lib/stores/ui';
	import { collab } from '$lib/stores/ui';
	import { points } from '$lib/stores/points';
	import { startCollaborativeSession, stopCollaborativeSession, generateTripId } from '$lib/services/firebase';

	let joinId = $state('');
	let loading = $state(false);
	let error = $state('');

	async function create() {
		loading = true;
		error = '';
		try {
			let pts: import('$lib/types').Point[] = [];
			points.subscribe((v) => (pts = v))();
			await startCollaborativeSession(null, pts);
			closeModal();
		} catch (e) {
			error = 'Verbindung fehlgeschlagen. Bitte Firebase konfigurieren.';
		} finally {
			loading = false;
		}
	}

	async function join() {
		if (!joinId.trim()) { error = 'Bitte Trip-ID eingeben.'; return; }
		loading = true;
		error = '';
		try {
			let pts: import('$lib/types').Point[] = [];
			points.subscribe((v) => (pts = v))();
			await startCollaborativeSession(joinId.trim(), pts);
			closeModal();
		} catch (e) {
			error = 'Trip nicht gefunden oder Verbindung fehlgeschlagen.';
		} finally {
			loading = false;
		}
	}

	async function leave() {
		await stopCollaborativeSession();
	}
</script>

<div class="modal-overlay" onclick={closeModal} role="dialog" aria-label="Kollaboration">
	<div class="modal-panel" onclick={(e) => e.stopPropagation()}>
		<div class="modal-header">
			<h2 class="font-bold text-base">👥 Kollaboration</h2>
			<button class="btn btn-ghost" onclick={closeModal} aria-label="Schließen">✕</button>
		</div>

		<div class="modal-body" style="display: flex; flex-direction: column; gap: 1.25rem;">
			{#if $collab.active}
				<div
					class="rounded-xl p-4"
					style="background: color-mix(in srgb, var(--accent-primary) 10%, var(--bg-card)); border: 1px solid var(--accent-primary);"
				>
					<div class="font-semibold mb-1 text-sm">✅ Aktive Session</div>
					<div class="text-xs mb-2" style="color: var(--text-muted);">Trip-ID:</div>
					<code class="text-sm block px-3 py-2 rounded" style="background: var(--bg-main); color: var(--accent-primary);">
						{$collab.tripId}
					</code>
					<div class="text-xs mt-2" style="color: var(--text-muted);">
						👥 {$collab.onlineCount} Person(en) online
					</div>
				</div>

				<button class="btn btn-danger" onclick={leave}>Session beenden</button>
			{:else}
				<div>
					<h3 class="font-semibold text-sm mb-1">Neue Session erstellen</h3>
					<p class="text-xs mb-3" style="color: var(--text-muted);">
						Starte eine Echtzeit-Session und lade Freunde ein, gemeinsam zu planen.
					</p>
					<button class="btn btn-primary w-full" onclick={create} disabled={loading}>
						{loading ? '⏳ Verbinde…' : '🚀 Session erstellen'}
					</button>
				</div>

				<div style="border-top: 1px solid var(--border); padding-top: 1.25rem;">
					<h3 class="font-semibold text-sm mb-1">Session beitreten</h3>
					<p class="text-xs mb-3" style="color: var(--text-muted);">
						Gib die Trip-ID eines Freundes ein.
					</p>
					<div class="flex gap-2">
						<input
							type="text"
							class="form-input flex-1 text-sm"
							placeholder="trip_123_abc…"
							bind:value={joinId}
						/>
						<button class="btn btn-secondary text-sm flex-shrink-0" onclick={join} disabled={loading}>
							Beitreten
						</button>
					</div>
				</div>

				{#if error}
					<div class="text-sm rounded px-3 py-2" style="background: #ef444415; color: #ef4444; border: 1px solid #ef444440;">
						{error}
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>
