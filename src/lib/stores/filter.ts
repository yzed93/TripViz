import { writable, derived } from 'svelte/store';
import { points } from './points';
import type { FilterState, Point } from '$lib/types';

// ─── Filter State ────────────────────────────────────────────────────────────

export const filter = writable<FilterState>({
	mustSeeOnly: false,
	selectedDay: null
});

// ─── Derived: Filtered Points ────────────────────────────────────────────────

export const filteredPoints = derived([points, filter], ([$points, $filter]): Point[] => {
	let result = $points;

	if ($filter.selectedDay) {
		result = result.filter((p) => p.date === $filter.selectedDay);
	}

	if ($filter.mustSeeOnly) {
		result = result.filter((p) => p.mustSee);
	}

	return result;
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function setDayFilter(day: string | null) {
	filter.update((f) => ({ ...f, selectedDay: day }));
}

export function toggleMustSee() {
	filter.update((f) => ({ ...f, mustSeeOnly: !f.mustSeeOnly }));
}

export function resetFilters() {
	filter.set({ mustSeeOnly: false, selectedDay: null });
}
