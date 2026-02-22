// ─── Activity & Point Types ────────────────────────────────────────────────

export type ActivityCategory =
	| 'landmark'
	| 'temple'
	| 'castle'
	| 'nature'
	| 'restaurant'
	| 'shopping'
	| 'museum'
	| 'entertainment'
	| 'accommodation'
	| 'station'
	| 'other';

export type TransportMethod =
	| '🚆 Shinkansen'
	| '🚃 Train'
	| '🚌 Bus'
	| '✈️ Flight'
	| '🚗 Car'
	| '🚶 Walking'
	| '⛴️ Ferry'
	| '🚕 Taxi';

export type PointType = 'activity' | 'transport';

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | string;

export interface Coords {
	lat: number;
	lng: number;
}

export interface PointImage {
	id: number;
	point_id: string;
	data: string; // base64 full resolution
	thumbnail: string; // base64 compressed thumbnail
	filename: string;
	size: number;
	type: string;
	uploaded_at: string;
}

export interface Point {
	id: string;
	firebaseId?: string;
	type: PointType;
	title: string;
	coords: Coords;
	date?: string; // ISO date string YYYY-MM-DD
	time?: TimeSlot;
	category: ActivityCategory;
	mustSee: boolean;
	description?: string;
	budgetJPY: number;
	budgetEUR: number;
	images?: PointImage[];
	// Transport-specific
	transportStart?: string;
	transportEnd?: string;
	transportMethod?: TransportMethod;
	// Metadata
	created_at: number;
	updated_at: number;
	createdAt?: number; // Firebase compat
}

// ─── Theme Types ────────────────────────────────────────────────────────────

export type Theme =
	| 'cyberpunk'
	| 'sakura'
	| 'zen'
	| 'ocean'
	| 'matcha'
	| 'neon'
	| 'fuji'
	| 'midnight';

export interface ThemeDefinition {
	id: Theme;
	name: string;
	emoji: string;
	pro: boolean;
	colors: {
		bgMain: string;
		bgSecondary: string;
		bgCard: string;
		accentPrimary: string;
		accentSecondary: string;
		textMain: string;
		textMuted: string;
		border: string;
		mustSee: string;
	};
}

// ─── Filter & UI State ──────────────────────────────────────────────────────

export interface FilterState {
	mustSeeOnly: boolean;
	selectedDay: string | null; // ISO date string or null = all days
}

export interface UIState {
	sidebarOpen: boolean;
	activeModal: ModalType | null;
	editingPointId: string | null;
	addingPointCoords: Coords | null;
	activeView: ViewType;
}

export type ModalType =
	| 'addEdit'
	| 'theme'
	| 'share'
	| 'collab'
	| 'stats'
	| 'welcome'
	| 'calendar'
	| null;

export type ViewType = 'map' | 'calendar' | 'timeline';

// ─── Statistics ─────────────────────────────────────────────────────────────

export interface DayBudget {
	jpy: number;
	eur: number;
}

export interface TripStats {
	activityCount: number;
	transportCount: number;
	totalBudgetJPY: number;
	totalBudgetEUR: number;
	days: number;
	mustSeeCount: number;
	perDayBudget: Record<string, DayBudget>;
	dateRange: { start: string | null; end: string | null };
}

// ─── Export / Import ────────────────────────────────────────────────────────

export interface ExportData {
	version: number;
	exportDate: string;
	points: Point[];
	settings: {
		theme: Theme;
	};
}

// ─── Geocoding ──────────────────────────────────────────────────────────────

export interface GeocodingResult {
	display_name: string;
	lat: string;
	lon: string;
	type: string;
	addresstype: string;
}

// ─── Firebase Collaboration ─────────────────────────────────────────────────

export interface CollabPresence {
	name: string;
	online: boolean;
	lastSeen: number;
}

export interface CollabState {
	active: boolean;
	tripId: string | null;
	onlineCount: number;
	userId: string | null;
}

// ─── Calendar & Timeline ────────────────────────────────────────────────────

export interface CalendarDay {
	date: string; // ISO date string
	points: Point[];
	totalBudgetJPY: number;
	totalBudgetEUR: number;
	mustSeeCount: number;
}

export interface TimelineSlot {
	time: TimeSlot;
	label: string;
	points: Point[];
}

export interface TimelineDay {
	date: string;
	slots: TimelineSlot[];
	unscheduled: Point[];
}

// ─── Category Metadata ──────────────────────────────────────────────────────

export interface CategoryMeta {
	id: ActivityCategory;
	label: string;
	emoji: string;
	color: string;
}

export const CATEGORIES: CategoryMeta[] = [
	{ id: 'landmark', label: 'Sehenswürdigkeiten', emoji: '🏛️', color: '#60a5fa' },
	{ id: 'temple', label: 'Tempel & Schreine', emoji: '⛩️', color: '#f472b6' },
	{ id: 'castle', label: 'Burgen & Paläste', emoji: '🏰', color: '#a78bfa' },
	{ id: 'nature', label: 'Natur & Parks', emoji: '🌸', color: '#34d399' },
	{ id: 'restaurant', label: 'Restaurants & Cafés', emoji: '🍜', color: '#fb923c' },
	{ id: 'shopping', label: 'Shopping', emoji: '🛍️', color: '#f59e0b' },
	{ id: 'museum', label: 'Museen & Kultur', emoji: '🎨', color: '#22d3ee' },
	{ id: 'entertainment', label: 'Entertainment', emoji: '🎮', color: '#e879f9' },
	{ id: 'accommodation', label: 'Unterkunft', emoji: '🏨', color: '#4ade80' },
	{ id: 'station', label: 'Bahnhöfe', emoji: '🚃', color: '#94a3b8' },
	{ id: 'other', label: 'Sonstiges', emoji: '📍', color: '#64748b' }
];

export const TRANSPORT_METHODS: TransportMethod[] = [
	'🚆 Shinkansen',
	'🚃 Train',
	'🚌 Bus',
	'✈️ Flight',
	'🚗 Car',
	'🚶 Walking',
	'⛴️ Ferry',
	'🚕 Taxi'
];
