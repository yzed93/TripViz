import { writable } from 'svelte/store';
import type { Theme, ThemeDefinition } from '$lib/types';
import { browser } from '$app/environment';

// ─── Theme Definitions ───────────────────────────────────────────────────────

export const THEMES: ThemeDefinition[] = [
	{
		id: 'cyberpunk',
		name: 'Cyberpunk Dark',
		emoji: '🌆',
		pro: false,
		colors: {
			bgMain: '#0a0a0f',
			bgSecondary: '#111118',
			bgCard: '#16161f',
			accentPrimary: '#00d4ff',
			accentSecondary: '#0066ff',
			textMain: '#e0e0ff',
			textMuted: '#6b7280',
			border: '#1e1e2e',
			mustSee: '#ff6b35'
		}
	},
	{
		id: 'sakura',
		name: 'Sakura',
		emoji: '🌸',
		pro: false,
		colors: {
			bgMain: '#0d0508',
			bgSecondary: '#160b10',
			bgCard: '#1e0f16',
			accentPrimary: '#ff80ab',
			accentSecondary: '#f06292',
			textMain: '#fce4ec',
			textMuted: '#9e6b7a',
			border: '#2d1520',
			mustSee: '#ff4081'
		}
	},
	{
		id: 'zen',
		name: 'Zen Garden',
		emoji: '🍃',
		pro: false,
		colors: {
			bgMain: '#050d08',
			bgSecondary: '#0a1a0e',
			bgCard: '#0f2214',
			accentPrimary: '#4caf50',
			accentSecondary: '#81c784',
			textMain: '#e8f5e9',
			textMuted: '#5a7a5e',
			border: '#1a3320',
			mustSee: '#ff9800'
		}
	},
	{
		id: 'ocean',
		name: 'Ocean Blue',
		emoji: '🌊',
		pro: false,
		colors: {
			bgMain: '#020810',
			bgSecondary: '#050f1e',
			bgCard: '#08162a',
			accentPrimary: '#00bcd4',
			accentSecondary: '#0288d1',
			textMain: '#e0f7fa',
			textMuted: '#4a7a8a',
			border: '#0d2540',
			mustSee: '#ff5722'
		}
	},
	{
		id: 'matcha',
		name: 'Matcha',
		emoji: '🍵',
		pro: false,
		colors: {
			bgMain: '#080d07',
			bgSecondary: '#101a0e',
			bgCard: '#182614',
			accentPrimary: '#8bc34a',
			accentSecondary: '#aed581',
			textMain: '#f1f8e9',
			textMuted: '#607d4a',
			border: '#1e3318',
			mustSee: '#ff7043'
		}
	},
	{
		id: 'neon',
		name: 'Tokyo Neon',
		emoji: '⚡',
		pro: true,
		colors: {
			bgMain: '#050510',
			bgSecondary: '#0a0a1e',
			bgCard: '#10102a',
			accentPrimary: '#ff0080',
			accentSecondary: '#7b00ff',
			textMain: '#f0e0ff',
			textMuted: '#6040a0',
			border: '#1a1040',
			mustSee: '#00ff80'
		}
	},
	{
		id: 'fuji',
		name: 'Fuji Sunset',
		emoji: '🗻',
		pro: true,
		colors: {
			bgMain: '#0d0508',
			bgSecondary: '#180b10',
			bgCard: '#221018',
			accentPrimary: '#ff6b35',
			accentSecondary: '#ff4081',
			textMain: '#fff3e0',
			textMuted: '#8a5a4a',
			border: '#301520',
			mustSee: '#9c27b0'
		}
	},
	{
		id: 'midnight',
		name: 'Midnight Purple',
		emoji: '🌌',
		pro: true,
		colors: {
			bgMain: '#05030d',
			bgSecondary: '#0a0618',
			bgCard: '#100c22',
			accentPrimary: '#7c3aed',
			accentSecondary: '#a855f7',
			textMain: '#ede9fe',
			textMuted: '#5b4880',
			border: '#1a1035',
			mustSee: '#ec4899'
		}
	}
];

// ─── Store ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'tripviz-theme';

function createThemeStore() {
	const initial: Theme = browser
		? ((localStorage.getItem(STORAGE_KEY) as Theme) ?? 'cyberpunk')
		: 'cyberpunk';

	const { subscribe, set } = writable<Theme>(initial);

	return {
		subscribe,
		set(theme: Theme) {
			if (browser) {
				localStorage.setItem(STORAGE_KEY, theme);
				applyThemeToDom(theme);
			}
			set(theme);
		}
	};
}

export const currentTheme = createThemeStore();

export function getThemeDef(id: Theme): ThemeDefinition {
	return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

// ─── Apply theme to DOM via CSS custom properties ─────────────────────────────

export function applyThemeToDom(themeId: Theme) {
	const theme = getThemeDef(themeId);
	const root = document.documentElement;
	const c = theme.colors;

	root.style.setProperty('--bg-main', c.bgMain);
	root.style.setProperty('--bg-secondary', c.bgSecondary);
	root.style.setProperty('--bg-card', c.bgCard);
	root.style.setProperty('--accent-primary', c.accentPrimary);
	root.style.setProperty('--accent-secondary', c.accentSecondary);
	root.style.setProperty('--text-main', c.textMain);
	root.style.setProperty('--text-muted', c.textMuted);
	root.style.setProperty('--border', c.border);
	root.style.setProperty('--must-see', c.mustSee);

	// Update body background immediately
	document.body.style.backgroundColor = c.bgMain;
}
