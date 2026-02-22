<script lang="ts">
	import { timelineDays } from '$lib/stores/points';
	import { openEditModal } from '$lib/stores/ui';
	import { CATEGORIES } from '$lib/types';
	import type { Point, TimelineDay } from '$lib/types';

	function getCategoryEmoji(cat: string): string {
		return CATEGORIES.find((c) => c.id === cat)?.emoji ?? '📍';
	}

	function formatDate(iso: string): string {
		const d = new Date(iso + 'T00:00:00');
		return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
	}

	function formatBudget(p: Point): string {
		const parts: string[] = [];
		if (p.budgetJPY > 0) parts.push(`¥${p.budgetJPY.toLocaleString()}`);
		if (p.budgetEUR > 0) parts.push(`€${p.budgetEUR.toFixed(0)}`);
		return parts.join(' · ');
	}

	function getTimeSlotLabel(time: string): string {
		if (time === 'morning') return '🌅 Morgen';
		if (time === 'afternoon') return '☀️ Nachmittag';
		if (time === 'evening') return '🌙 Abend';
		return time;
	}

	// Day totals
	function dayBudget(day: TimelineDay): { jpy: number; eur: number } {
		const all = [...day.slots.flatMap((s) => s.points), ...day.unscheduled];
		return {
			jpy: all.reduce((s, p) => s + (p.budgetJPY ?? 0), 0),
			eur: all.reduce((s, p) => s + (p.budgetEUR ?? 0), 0)
		};
	}
</script>

<div class="flex-1 overflow-y-auto" style="background: var(--bg-main);">
	{#if $timelineDays.length === 0}
		<div class="flex flex-col items-center justify-center h-full" style="color: var(--text-muted);">
			<div class="text-6xl mb-4">⏱️</div>
			<div class="font-semibold mb-2">Noch keine Tagesplanung</div>
			<p class="text-sm text-center max-w-xs" style="color: var(--text-muted);">
				Füge Aktivitäten mit Datum und Tageszeit hinzu, um sie hier im Zeitstrahl zu sehen.
			</p>
		</div>
	{:else}
		<div class="timeline-container">
			{#each $timelineDays as day}
				{@const budget = dayBudget(day)}
				<div class="timeline-day">
					<!-- Day header -->
					<div class="timeline-day-header flex items-center justify-between">
						<span>{formatDate(day.date)}</span>
						{#if budget.jpy > 0 || budget.eur > 0}
							<span class="text-sm font-normal" style="color: var(--text-muted);">
								{#if budget.jpy > 0}¥{budget.jpy.toLocaleString()}{/if}
								{#if budget.eur > 0} · €{budget.eur.toFixed(0)}{/if}
							</span>
						{/if}
					</div>

					<!-- Time slots -->
					{#each day.slots as slot}
						{#if slot.points.length > 0}
							<div class="timeline-slot">
								<div class="timeline-slot-label">{slot.label}</div>
								<div class="timeline-slot-items">
									{#each slot.points as point}
										{#if point.type === 'transport'}
											<!-- Transport shown as connector -->
											<div class="timeline-transport">
												<span>{point.transportMethod ?? '🚀'}</span>
												<span class="text-xs font-medium">
													{#if point.transportStart && point.transportEnd}
														{point.transportStart} → {point.transportEnd}
													{:else}
														{point.title}
													{/if}
												</span>
											</div>
										{:else}
											<button
												class="timeline-item"
												class:must-see={point.mustSee}
												onclick={() => openEditModal(point.id)}
												style={point.mustSee ? 'border-left-color: var(--must-see);' : ''}
											>
												<span class="text-lg flex-shrink-0">{getCategoryEmoji(point.category)}</span>
												<div class="flex-1 min-w-0 text-left">
													<div class="font-medium text-sm flex items-center gap-1">
														{#if point.mustSee}<span style="color: var(--must-see); font-size: 0.7rem;">★</span>{/if}
														<span class="truncate">{point.title}</span>
													</div>
													{#if point.description}
														<div class="text-xs truncate" style="color: var(--text-muted);">{point.description}</div>
													{/if}
													{#if formatBudget(point)}
														<div class="text-xs mt-0.5" style="color: var(--accent-primary);">{formatBudget(point)}</div>
													{/if}
												</div>
												<div class="text-xs flex-shrink-0" style="color: var(--text-muted);">✏️</div>
											</button>
										{/if}
									{/each}
								</div>
							</div>
						{/if}
					{/each}

					<!-- Unscheduled items -->
					{#if day.unscheduled.length > 0}
						<div class="timeline-slot">
							<div class="timeline-slot-label" style="color: var(--text-muted); opacity: 0.7;">Ohne Zeit</div>
							<div class="timeline-slot-items">
								{#each day.unscheduled as point}
									<button
										class="timeline-item"
										class:must-see={point.mustSee}
										onclick={() => openEditModal(point.id)}
									>
										<span class="text-lg flex-shrink-0">
											{point.type === 'transport' ? (point.transportMethod?.split(' ')[0] ?? '🚀') : getCategoryEmoji(point.category)}
										</span>
										<div class="flex-1 min-w-0 text-left">
											<div class="font-medium text-sm truncate">
												{#if point.mustSee}<span style="color: var(--must-see); font-size: 0.7rem;">★ </span>{/if}
												{point.title}
											</div>
											{#if formatBudget(point)}
												<div class="text-xs" style="color: var(--accent-primary);">{formatBudget(point)}</div>
											{/if}
										</div>
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
