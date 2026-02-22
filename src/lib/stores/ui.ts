import { writable } from 'svelte/store';
import type { UIState, ModalType, ViewType, Coords, CollabState } from '$lib/types';

// ─── UI State ────────────────────────────────────────────────────────────────

export const ui = writable<UIState>({
	sidebarOpen: true,
	activeModal: null,
	editingPointId: null,
	addingPointCoords: null,
	addingPointTitle: '',
	activeView: 'map'
});

// ─── Collaboration State ─────────────────────────────────────────────────────

export const collab = writable<CollabState>({
	active: false,
	tripId: null,
	onlineCount: 0,
	userId: null
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function openModal(modal: ModalType) {
	ui.update((s) => ({ ...s, activeModal: modal }));
}

export function closeModal() {
	ui.update((s) => ({
		...s,
		activeModal: null,
		editingPointId: null,
		addingPointCoords: null,
		addingPointTitle: ''
	}));
}

export function openEditModal(pointId: string) {
	ui.update((s) => ({ ...s, activeModal: 'addEdit', editingPointId: pointId, addingPointTitle: '' }));
}

/** Opens the add-form and optionally pre-fills the title (e.g. from search result). */
export function openAddModal(coords: Coords, title = '') {
	ui.update((s) => ({
		...s,
		activeModal: 'addEdit',
		addingPointCoords: coords,
		addingPointTitle: title,
		editingPointId: null
	}));
}

export function toggleSidebar() {
	ui.update((s) => ({ ...s, sidebarOpen: !s.sidebarOpen }));
}

export function setView(view: ViewType) {
	ui.update((s) => ({ ...s, activeView: view }));
}
