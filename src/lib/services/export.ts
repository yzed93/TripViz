/**
 * Export service: JSON download, PNG screenshot, QR code generation
 */

import type { ExportData } from '$lib/types';

// ─── JSON Export ─────────────────────────────────────────────────────────────

export function downloadJSON(data: ExportData, filename = 'tripviz-export.json') {
	const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

export function parseImportFile(file: File): Promise<ExportData> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const data = JSON.parse(e.target!.result as string) as ExportData;
				if (!data.points || !Array.isArray(data.points)) {
					reject(new Error('Ungültiges Format: "points" Array fehlt'));
					return;
				}
				resolve(data);
			} catch {
				reject(new Error('Datei konnte nicht gelesen werden'));
			}
		};
		reader.onerror = () => reject(reader.error);
		reader.readAsText(file);
	});
}

// ─── PNG Screenshot ───────────────────────────────────────────────────────────

export async function downloadMapAsImage(element: HTMLElement, filename = 'tripviz-map.png') {
	const { default: html2canvas } = await import('html2canvas');
	const canvas = await html2canvas(element, {
		useCORS: true,
		allowTaint: true,
		backgroundColor: null
	});
	const url = canvas.toDataURL('image/png');
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
}

// ─── QR Code ─────────────────────────────────────────────────────────────────

/**
 * Generate a QR code for the given URL and return it as a data URL.
 * The canvas element is rendered into a temporary DOM node.
 */
export async function generateQRCode(url: string): Promise<string> {
	const QRCode = (await import('qrcode')).default;
	return QRCode.toDataURL(url, {
		width: 256,
		margin: 2,
		color: { dark: '#ffffff', light: '#00000000' }
	});
}
