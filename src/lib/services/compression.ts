/**
 * URL compression service using LZ-String
 * Encodes/decodes full trip data into a shareable URL
 */

import LZString from 'lz-string';
import type { ExportData } from '$lib/types';

const PARAM = 'data';

/**
 * Compress trip data and return a full shareable URL.
 */
export function encodeTripToUrl(data: ExportData): string {
	const json = JSON.stringify(data);
	const compressed = LZString.compressToEncodedURIComponent(json);
	const url = new URL(window.location.href);
	url.search = '';
	url.searchParams.set(PARAM, compressed);
	return url.toString();
}

/**
 * Decode trip data from the current URL (or a given URL string).
 * Returns null if no data is present or decoding fails.
 */
export function decodeTripFromUrl(urlString?: string): ExportData | null {
	try {
		const url = new URL(urlString ?? window.location.href);
		const compressed = url.searchParams.get(PARAM);
		if (!compressed) return null;

		const json = LZString.decompressFromEncodedURIComponent(compressed);
		if (!json) return null;

		return JSON.parse(json) as ExportData;
	} catch {
		return null;
	}
}

/**
 * Remove the ?data= parameter from the current URL without reload.
 */
export function clearUrlData() {
	const url = new URL(window.location.href);
	url.searchParams.delete(PARAM);
	window.history.replaceState({}, '', url.toString());
}
