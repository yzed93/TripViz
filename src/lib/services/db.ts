/**
 * TripVizDB — IndexedDB service (ported from original TripVizDB class)
 * Stores: trips, points, settings, images
 * DB version 3 — maintains backwards compatibility with existing user data
 */

import type { Point, PointImage, Theme, ExportData } from '$lib/types';

const DB_NAME = 'TripVizDB';
const DB_VERSION = 3;

// ─── Open / Init ─────────────────────────────────────────────────────────────

let _db: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
	if (_db) return _db;

	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => reject(request.error);

		request.onsuccess = () => {
			_db = request.result;
			resolve(_db);
		};

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;

			if (!db.objectStoreNames.contains('trips')) {
				const tripStore = db.createObjectStore('trips', { keyPath: 'id', autoIncrement: true });
				tripStore.createIndex('created_at', 'created_at', { unique: false });
			}

			if (!db.objectStoreNames.contains('points')) {
				const pointStore = db.createObjectStore('points', { keyPath: 'id' });
				pointStore.createIndex('date', 'date', { unique: false });
				pointStore.createIndex('type', 'type', { unique: false });
			}

			if (!db.objectStoreNames.contains('settings')) {
				db.createObjectStore('settings', { keyPath: 'key' });
			}

			if (!db.objectStoreNames.contains('images')) {
				const imageStore = db.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
				imageStore.createIndex('point_id', 'point_id', { unique: false });
				imageStore.createIndex('uploaded_at', 'uploaded_at', { unique: false });
			}
		};
	});
}

function getDB(): IDBDatabase {
	if (!_db) throw new Error('DB not initialised. Call initDB() first.');
	return _db;
}

// ─── Points ──────────────────────────────────────────────────────────────────

export async function getPoints(): Promise<Point[]> {
	const db = getDB();
	const tx = db.transaction(['points'], 'readonly');
	const store = tx.objectStore('points');
	const request = store.getAll();
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result as Point[]);
		request.onerror = () => reject(request.error);
	});
}

export async function addPoint(point: Point): Promise<void> {
	const db = getDB();
	const tx = db.transaction(['points'], 'readwrite');
	const store = tx.objectStore('points');
	const request = store.add(point);
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

export async function updatePoint(point: Point): Promise<void> {
	const db = getDB();
	const tx = db.transaction(['points'], 'readwrite');
	const store = tx.objectStore('points');
	const request = store.put(point);
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

export async function deletePoint(pointId: string): Promise<void> {
	const db = getDB();
	const tx = db.transaction(['points'], 'readwrite');
	const store = tx.objectStore('points');
	const request = store.delete(pointId);
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

/** Replaces all existing points (used for import / collab sync) */
export async function saveAllPoints(points: Point[]): Promise<void> {
	const db = getDB();
	const tx = db.transaction(['points'], 'readwrite');
	const store = tx.objectStore('points');
	store.clear();
	for (const point of points) {
		store.add(point);
	}
	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function saveSetting(key: string, value: unknown): Promise<void> {
	const db = getDB();
	const tx = db.transaction(['settings'], 'readwrite');
	const store = tx.objectStore('settings');
	const request = store.put({ key, value });
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

export async function getSetting<T = unknown>(key: string): Promise<T | undefined> {
	const db = getDB();
	const tx = db.transaction(['settings'], 'readonly');
	const store = tx.objectStore('settings');
	const request = store.get(key);
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result?.value as T);
		request.onerror = () => reject(request.error);
	});
}

// ─── Images ──────────────────────────────────────────────────────────────────

function hasImageStore(): boolean {
	return getDB().objectStoreNames.contains('images');
}

export async function addImage(pointId: string, imageFile: File): Promise<number | null> {
	if (!hasImageStore()) return null;

	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = async (e) => {
			try {
				const dataUrl = e.target!.result as string;
				const [compressed, thumbnail] = await Promise.all([
					compressImage(dataUrl, 1024, 0.8),
					compressImage(dataUrl, 200, 0.6)
				]);

				const image: Omit<PointImage, 'id'> = {
					point_id: pointId,
					data: compressed,
					thumbnail,
					filename: imageFile.name,
					size: imageFile.size,
					type: imageFile.type,
					uploaded_at: new Date().toISOString()
				};

				const db = getDB();
				const tx = db.transaction(['images'], 'readwrite');
				const store = tx.objectStore('images');
				const request = store.add(image);

				request.onsuccess = () => resolve(request.result as number);
				request.onerror = () => reject(request.error);
			} catch (err) {
				reject(err);
			}
		};

		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(imageFile);
	});
}

export async function getImages(pointId: string): Promise<PointImage[]> {
	if (!hasImageStore()) return [];
	const db = getDB();
	const tx = db.transaction(['images'], 'readonly');
	const store = tx.objectStore('images');
	const index = store.index('point_id');
	const request = index.getAll(pointId);
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result as PointImage[]);
		request.onerror = () => reject(request.error);
	});
}

export async function deleteImage(imageId: number): Promise<void> {
	if (!hasImageStore()) return;
	const db = getDB();
	const tx = db.transaction(['images'], 'readwrite');
	const store = tx.objectStore('images');
	const request = store.delete(imageId);
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

export async function deleteImagesForPoint(pointId: string): Promise<void> {
	const images = await getImages(pointId);
	for (const img of images) {
		await deleteImage(img.id);
	}
}

// ─── Export / Import ─────────────────────────────────────────────────────────

export async function exportData(): Promise<ExportData> {
	const points = await getPoints();
	const theme = (await getSetting<Theme>('theme')) ?? 'cyberpunk';
	return {
		version: 1,
		exportDate: new Date().toISOString(),
		points,
		settings: { theme }
	};
}

export async function importData(data: ExportData): Promise<void> {
	if (!data.points || !Array.isArray(data.points)) {
		throw new Error('Ungültiges Datenformat');
	}
	await saveAllPoints(data.points);
	if (data.settings?.theme) {
		await saveSetting('theme', data.settings.theme);
	}
}

// ─── Image Compression ───────────────────────────────────────────────────────

export function compressImage(dataUrl: string, maxSize = 1024, quality = 0.8): Promise<string> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			let { width, height } = img;

			if (width > maxSize || height > maxSize) {
				if (width > height) {
					height = (height / width) * maxSize;
					width = maxSize;
				} else {
					width = (width / height) * maxSize;
					height = maxSize;
				}
			}

			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
			resolve(canvas.toDataURL('image/jpeg', quality));
		};
		img.onerror = reject;
		img.src = dataUrl;
	});
}
