<script lang="ts">
	import { calendarDays } from '$lib/stores/points';
	import { setDayFilter } from '$lib/stores/filter';
	import { setView } from '$lib/stores/ui';
	import { CATEGORIES } from '$lib/types';
	import type { CalendarDay } from '$lib/types';

	function getCategoryEmoji(cat: string): string {
		return CATEGORIES.find((c) => c.id === cat)?.emoji ?? '📍';
	}

	function formatDate(iso: string): { weekday: string; day: string; month: string } {
		const d = new Date(iso + 'T00:00:00');
		return {
			weekday: d.toLocaleDateString('de-DE', { weekday: 'long' }),
			day: d.toLocaleDateString('de-DE', { day: 'numeric' }),
			month: d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
		};
	}

	function selectDay(day: CalendarDay) {
		setDayFilter(day.date);
		setView('map');
	}

	// Group days by month
	const groupedByMonth = $derived(() => {
		const groups = new Map<string, CalendarDay[]>();
		for (const day of $calendarDays) {
			const d = new Date(day.date + 'T00:00:00');
			const key = d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key)!.push(day);
		}
		return [...groups.entries()];
	});
</script>

<div class="flex-1 overflow-y-auto" style="background: var(--bg-main);">
	{#if $calendarDays.length === 0}
		<div class="flex flex-col items-center justify-center h-full" style="color: var(--text-muted);">
			<div class="text-6xl mb-4">📅</div>
			<div class="font-semibold mb-2">Noch keine Tage geplant</div>
			<p class="text-sm text-center max-w-xs" style="color: var(--text-muted);">
				Füge Aktivitäten mit einem Datum hinzu, um sie hier im Kalender zu sehen.
			</p>
		</div>
	{:else}
		<div style="padding: 1.5rem;">
			{#each groupedByMonth() as [month, days]}
				<!-- Month header -->
				<div
					class="text-base font-bold mb-3"
					style="color: var(--accent-primary); margin-top: 1rem;"
				>
					{month}
				</div>

				<div class="calendar-grid" style="padding: 0; margin-bottom: 1.5rem;">
					{#each days as day}
						{@const fmt = formatDate(day.date)}
						<button
							class="calendar-day-card w-full text-left"
							onclick={() => selectDay(day)}
						>
							<!-- Day header -->
							<div class="calendar-day-header">
								<div>
									<div class="calendar-day-date">{fmt.weekday}</div>
									<div class="text-sm font-medium" style="color: var(--text-muted);">
										{fmt.day} {fmt.month}
									</div>
								</div>
								<div class="calendar-day-count">{day.points.length} Orte</div>
							</div>

							<!-- Category pills -->
							<div class="calendar-category-pills">
								{#each day.points.slice(0, 6) as point}
									<span class="category-pill" title={point.title}>
										{point.type === 'transport'
											? (point.transportMethod?.split(' ')[0] ?? '🚀')
											: getCategoryEmoji(point.category)}
									</span>
								{/each}
								{#if day.points.length > 6}
									<span class="category-pill" style="color: var(--text-muted);">+{day.points.length - 6}</span>
								{/if}
							</div>

							<!-- Activities list (truncated) -->
							<div style="display: flex; flex-direction: column; gap: 0.25rem; margin-top: 0.5rem;">
								{#each day.points.slice(0, 4) as point}
									<div
										class="text-xs flex items-center gap-1.5 truncate"
										style="color: {point.mustSee ? 'var(--must-see)' : 'var(--text-muted)'};"
									>
										{#if point.mustSee}<span>★</span>{/if}
										<span class="truncate">{point.title}</span>
										{#if point.time}
											<span class="flex-shrink-0" style="opacity: 0.6;">
												{point.time === 'morning' ? '🌅' : point.time === 'afternoon' ? '☀️' : point.time === 'evening' ? '🌙' : ''}
											</span>
										{/if}
									</div>
								{/each}
								{#if day.points.length > 4}
									<div class="text-xs" style="color: var(--text-muted); opacity: 0.7;">
										… und {day.points.length - 4} weitere
									</div>
								{/if}
							</div>

							<!-- Budget row -->
							{#if day.totalBudgetJPY > 0 || day.totalBudgetEUR > 0}
								<div class="calendar-budget flex items-center justify-between mt-2">
									<span>💰</span>
									<div class="flex gap-2">
										{#if day.totalBudgetJPY > 0}
											<span style="color: var(--accent-primary);">¥{day.totalBudgetJPY.toLocaleString()}</span>
										{/if}
										{#if day.totalBudgetEUR > 0}
											<span>€{day.totalBudgetEUR.toFixed(0)}</span>
										{/if}
									</div>
								</div>
							{/if}

							<!-- Must-See count badge -->
							{#if day.mustSeeCount > 0}
								<div class="flex items-center gap-1 mt-1.5">
									<span class="text-xs px-2 py-0.5 rounded-full font-medium" style="background: color-mix(in srgb, var(--must-see) 15%, transparent); color: var(--must-see); border: 1px solid color-mix(in srgb, var(--must-see) 30%, transparent);">
										★ {day.mustSeeCount} Must-See
									</span>
								</div>
							{/if}
						</button>
					{/each}
				</div>
			{/each}
		</div>
	{/if}
</div>
