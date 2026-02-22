/**
 * Nominatim geocoding service — ported from original
 * Rate-limited: 1 request per second (Nominatim ToS)
 */

import type { GeocodingResult } from '$lib/types';

const BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'TripViz/2.0 (https://tripviz.wiredu.cloud)';

let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
	const now = Date.now();
	const elapsed = now - lastRequestTime;
	if (elapsed < 1000) {
		await new Promise((r) => setTimeout(r, 1000 - elapsed));
	}
	lastRequestTime = Date.now();
	return fetch(url, { headers: { 'User-Agent': USER_AGENT } });
}

/**
 * Search for locations by query string.
 * Returns up to `limit` results (default 5).
 */
export async function searchLocations(
	query: string,
	limit = 5
): Promise<GeocodingResult[]> {
	if (!query.trim()) return [];

	const params = new URLSearchParams({
		q: query,
		format: 'json',
		limit: String(limit),
		addressdetails: '1',
		// Bias toward Japan
		countrycodes: 'jp',
		'accept-language': 'de,en'
	});

	try {
		const res = await rateLimitedFetch(`${BASE_URL}/search?${params}`);
		if (!res.ok) throw new Error(`Nominatim error ${res.status}`);
		const data = (await res.json()) as GeocodingResult[];
		return data;
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
		// Return only the first part (place name) to keep it short
		return data.display_name?.split(',')[0] ?? '';
	} catch {
		return '';
	}
}
