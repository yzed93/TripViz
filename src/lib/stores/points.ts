import { writable, derived } from 'svelte/store';
import type { Point, TripStats, CalendarDay, TimelineDay, TimelineSlot } from '$lib/types';

// ─── Primary Store ───────────────────────────────────────────────────────────

export const points = writable<Point[]>([]);

// ─── Derived: Trip Statistics ────────────────────────────────────────────────

export const tripStats = derived(points, ($points): TripStats => {
	const activities = $points.filter((p) => p.type === 'activity');
	const transports = $points.filter((p) => p.type === 'transport');
	const withDate = $points.filter((p) => p.date);

	const dates = withDate.map((p) => p.date!).sort();
	const uniqueDates = [...new Set(dates)];

	const perDayBudget: Record<string, { jpy: number; eur: number }> = {};
	for (const p of $points) {
		if (p.date) {
			if (!perDayBudget[p.date]) perDayBudget[p.date] = { jpy: 0, eur: 0 };
			perDayBudget[p.date].jpy += p.budgetJPY ?? 0;
			perDayBudget[p.date].eur += p.budgetEUR ?? 0;
		}
	}

	return {
		activityCount: activities.length,
		transportCount: transports.length,
		totalBudgetJPY: $points.reduce((sum, p) => sum + (p.budgetJPY ?? 0), 0),
		totalBudgetEUR: $points.reduce((sum, p) => sum + (p.budgetEUR ?? 0), 0),
		days: uniqueDates.length,
		mustSeeCount: $points.filter((p) => p.mustSee).length,
		perDayBudget,
		dateRange: {
			start: dates[0] ?? null,
			end: dates[dates.length - 1] ?? null
		}
	};
});

// ─── Derived: Sorted unique days ─────────────────────────────────────────────

export const tripDays = derived(points, ($points): string[] => {
	const dates = $points.filter((p) => p.date).map((p) => p.date!);
	return [...new Set(dates)].sort();
});

// ─── Derived: Calendar view data ─────────────────────────────────────────────

export const calendarDays = derived(points, ($points): CalendarDay[] => {
	const byDate = new Map<string, Point[]>();

	for (const p of $points) {
		if (p.date) {
			if (!byDate.has(p.date)) byDate.set(p.date, []);
			byDate.get(p.date)!.push(p);
		}
	}

	return [...byDate.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([date, dayPoints]) => ({
			date,
			points: dayPoints,
			totalBudgetJPY: dayPoints.reduce((s, p) => s + (p.budgetJPY ?? 0), 0),
			totalBudgetEUR: dayPoints.reduce((s, p) => s + (p.budgetEUR ?? 0), 0),
			mustSeeCount: dayPoints.filter((p) => p.mustSee).length
		}));
});

// ─── Derived: Timeline view data ─────────────────────────────────────────────

const TIME_SLOTS: Array<{ id: string; label: string }> = [
	{ id: 'morning', label: '🌅 Morgen' },
	{ id: 'afternoon', label: '☀️ Nachmittag' },
	{ id: 'evening', label: '🌙 Abend' }
];

export const timelineDays = derived(points, ($points): TimelineDay[] => {
	const byDate = new Map<string, Point[]>();

	for (const p of $points) {
		if (p.date) {
			if (!byDate.has(p.date)) byDate.set(p.date, []);
			byDate.get(p.date)!.push(p);
		}
	}

	return [...byDate.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([date, dayPoints]) => {
			const slots: TimelineSlot[] = TIME_SLOTS.map(({ id, label }) => ({
				time: id,
				label,
				points: dayPoints.filter(
					(p) => p.time === id || (id === 'morning' && p.time?.includes(':') && parseInt(p.time) < 12) || (id === 'afternoon' && p.time?.includes(':') && parseInt(p.time) >= 12 && parseInt(p.time) < 18) || (id === 'evening' && p.time?.includes(':') && parseInt(p.time) >= 18)
				)
			}));

			const scheduled = slots.flatMap((s) => s.points);
			const unscheduled = dayPoints.filter((p) => !p.time && !scheduled.includes(p));

			return { date, slots, unscheduled };
		});
});
