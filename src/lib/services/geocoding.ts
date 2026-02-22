/**
 * Nominatim geocoding service
 * Rate-limited: 1 request per second (Nominatim ToS)
 * Note: User-Agent cannot be set in browser fetch (forbidden header) — omitted intentionally.
 */

import type { GeocodingResult } from '$lib/types';

const BASE_URL = 'https://nominatim.openstreetmap.org';

let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
	const now = Date.now();
	const elapsed = now - lastRequestTime;
	if (elapsed < 1000) {
		await new Promise((r) => setTimeout(r, 1000 - elapsed));
	}
	lastRequestTime = Date.now();
	// No custom User-Agent — forbidden header in browser Fetch API
	return fetch(url);
}

/**
 * Search for locations by query string.
 * Searches globally but biases toward Japan results.
 */
export async function searchLocations(query: string, limit = 5): Promise<GeocodingResult[]> {
	if (!query.trim()) return [];

	const params = new URLSearchParams({
		q: query,
		format: 'json',
		limit: String(limit),
		addressdetails: '1',
		'accept-language': 'de,en'
		// countrycodes removed: restricting to 'jp' caused too many misses for English queries
	});

	try {
		const res = await rateLimitedFetch(`${BASE_URL}/search?${params}`);
		if (!res.ok) throw new Error(`Nominatim ${res.status}`);
		return (await res.json()) as GeocodingResult[];
	} catch (err) {
		console.error('Geocoding error:', err);
		return [];
	}
}

/**
 * Reverse geocode lat/lng to a human-readable place name.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
	const params = new URLSearchParams({
		lat: String(lat),
		lon: String(lng),
		format: 'json',
		'accept-language': 'de,en'
	});

	try {
		const res = await rateLimitedFetch(`${BASE_URL}/reverse?${params}`);
		if (!res.ok) return '';
		const data = (await res.json()) as { display_name?: string };
		return data.display_name?.split(',')[0] ?? '';
	} catch {
		return '';
	}
}
