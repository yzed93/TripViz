<script lang="ts">
	import { closeModal } from '$lib/stores/ui';
	import { tripStats } from '$lib/stores/points';
</script>

<div class="modal-overlay" onclick={closeModal} role="dialog" aria-label="Statistiken">
	<div class="modal-panel" onclick={(e) => e.stopPropagation()}>
		<div class="modal-header">
			<h2 class="font-bold text-base">📊 Reise-Statistiken</h2>
			<button class="btn btn-ghost" onclick={closeModal} aria-label="Schließen">✕</button>
		</div>

		<div class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
			<!-- Summary cards -->
			<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
				{#each [
					['🏛️', 'Aktivitäten', $tripStats.activityCount],
					['🚆', 'Routen', $tripStats.transportCount],
					['📅', 'Reisetage', $tripStats.days],
					['★', 'Must-See', $tripStats.mustSeeCount]
				] as [icon, label, value]}
					<div class="rounded-xl p-4 text-center" style="background: var(--bg-card); border: 1px solid var(--border);">
						<div class="text-2xl">{icon}</div>
						<div class="font-bold text-xl mt-1" style="color: var(--accent-primary);">{value}</div>
						<div class="text-xs" style="color: var(--text-muted);">{label}</div>
					</div>
				{/each}
			</div>

			<!-- Budget -->
			<div class="rounded-xl p-4" style="background: var(--bg-card); border: 1px solid var(--border);">
				<div class="font-semibold text-sm mb-3">💰 Gesamtbudget</div>
				<div class="flex justify-between items-center mb-1">
					<span class="text-sm" style="color: var(--text-muted);">Japanische Yen</span>
					<span class="font-bold" style="color: var(--accent-primary);">¥{$tripStats.totalBudgetJPY.toLocaleString()}</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm" style="color: var(--text-muted);">Euro</span>
					<span class="font-bold" style="color: var(--accent-primary);">€{$tripStats.totalBudgetEUR.toFixed(2)}</span>
				</div>
			</div>

			<!-- Per-day breakdown -->
			{#if Object.keys($tripStats.perDayBudget).length > 0}
				<div class="rounded-xl p-4" style="background: var(--bg-card); border: 1px solid var(--border);">
					<div class="font-semibold text-sm mb-3">📅 Budget pro Tag</div>
					<div style="display: flex; flex-direction: column; gap: 0.5rem;">
						{#each Object.entries($tripStats.perDayBudget).sort(([a], [b]) => a.localeCompare(b)) as [day, budget]}
							<div class="flex justify-between items-center text-sm">
								<span style="color: var(--text-muted);">
									{new Date(day + 'T00:00:00').toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}
								</span>
								<div class="flex gap-3">
									{#if budget.jpy > 0}<span>¥{budget.jpy.toLocaleString()}</span>{/if}
									{#if budget.eur > 0}<span style="color: var(--text-muted);">€{budget.eur.toFixed(0)}</span>{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if $tripStats.dateRange.start && $tripStats.dateRange.end}
				<div class="text-xs text-center" style="color: var(--text-muted);">
					Reisezeitraum: {new Date($tripStats.dateRange.start + 'T00:00:00').toLocaleDateString('de-DE')} – {new Date($tripStats.dateRange.end + 'T00:00:00').toLocaleDateString('de-DE')}
				</div>
			{/if}
		</div>
	</div>
</div>
