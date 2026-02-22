/**
 * Firebase Realtime Database collaborative session service
 * Ported from firebase-collaborative.js — adapted to Svelte stores
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
	getDatabase,
	ref,
	set,
	update,
	remove,
	onValue,
	onDisconnect,
	type Database
} from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { points } from '$lib/stores/points';
import { collab } from '$lib/stores/ui';
import { saveAllPoints } from './db';
import type { Point } from '$lib/types';

// ─── Config (public — Firebase security rules enforce access control) ─────────

const firebaseConfig = {
	apiKey: 'AIzaSyDW6WRwLe1V7oEj5B708aDcKDukaXEF5Xs',
	authDomain: 'tripviz.firebaseapp.com',
	databaseURL: 'https://tripviz-default-rtdb.europe-west1.firebasedatabase.app',
	projectId: 'tripviz',
	storageBucket: 'tripviz.firebasestorage.app',
	messagingSenderId: '964198243405',
	appId: '1:964198243405:web:d8bb2be98649957b811004'
};

// ─── Module State ─────────────────────────────────────────────────────────────

let app: FirebaseApp | null = null;
let db: Database | null = null;
let currentTripId: string | null = null;

function getDB(): Database {
	if (!db) throw new Error('Firebase not initialised');
	return db;
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function initFirebase() {
	if (db) return;
	app = initializeApp(firebaseConfig);
	db = getDatabase(app);
	const auth = getAuth(app);
	await signInAnonymously(auth);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Remove undefined/null values — Firebase rejects them */
function cleanForFirebase(obj: Record<string, unknown>): Record<string, unknown> {
	const cleaned: Record<string, unknown> = {};
	for (const key in obj) {
		const value = obj[key];
		if (value === undefined || value === null) continue;
		if (Array.isArray(value)) {
			cleaned[key] = value.filter((v) => v !== undefined && v !== null);
		} else if (typeof value === 'object') {
			cleaned[key] = cleanForFirebase(value as Record<string, unknown>);
		} else {
			cleaned[key] = value;
		}
	}
	return cleaned;
}

export function generateTripId(): string {
	return 'trip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

function getUserId(): string {
	const KEY = 'tripviz-user-id';
	let id = localStorage.getItem(KEY);
	if (!id) {
		id = 'user_' + Math.random().toString(36).substring(2, 9);
		localStorage.setItem(KEY, id);
	}
	return id;
}

// ─── Session ─────────────────────────────────────────────────────────────────

/**
 * Start or join a collaborative session.
 * Uploads current local points to Firebase, then listens for changes.
 */
export async function startCollaborativeSession(
	tripId: string | null,
	localPoints: Point[]
): Promise<string> {
	await initFirebase();
	const database = getDB();

	currentTripId = tripId ?? generateTripId();

	// Upload current local points
	if (localPoints.length > 0) {
		const pointsObj: Record<string, unknown> = {};
		for (const p of localPoints) {
			const fbId = p.firebaseId ?? `point_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
			pointsObj[fbId] = cleanForFirebase({ ...(p as unknown as Record<string, unknown>), firebaseId: fbId });
		}
		await set(ref(database, `trips/${currentTripId}/points`), pointsObj);
	}

	// Listen for remote changes
	onValue(ref(database, `trips/${currentTripId}/points`), (snapshot) => {
		const data = snapshot.val() as Record<string, Point> | null;
		const incoming: Point[] = data
			? Object.entries(data).map(([key, val]) => ({ ...val, firebaseId: key }))
			: [];

		points.set(incoming);
		saveAllPoints(incoming).catch(console.error);
	});

	// Presence
	const userId = getUserId();
	const presenceRef = ref(database, `trips/${currentTripId}/presence/${userId}`);
	await set(presenceRef, { name: 'User', online: true, lastSeen: Date.now() });
	onDisconnect(presenceRef).remove();

	// Listen to presence count
	onValue(ref(database, `trips/${currentTripId}/presence`), (snapshot) => {
		const users = snapshot.val() ?? {};
		const count = Object.keys(users).length;
		collab.update((s) => ({ ...s, onlineCount: count }));
	});

	collab.set({ active: true, tripId: currentTripId, onlineCount: 1, userId });

	// Reflect in URL
	const url = new URL(window.location.href);
	url.searchParams.set('collab', currentTripId);
	window.history.pushState({}, '', url.toString());

	return currentTripId;
}

export async function stopCollaborativeSession() {
	currentTripId = null;
	collab.set({ active: false, tripId: null, onlineCount: 0, userId: null });
	const url = new URL(window.location.href);
	url.searchParams.delete('collab');
	window.history.replaceState({}, '', url.toString());
}

// ─── CRUD sync ───────────────────────────────────────────────────────────────

export async function addPointToFirebase(point: Point) {
	if (!currentTripId || !db) return;
	const fbId = `point_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
	await set(
		ref(db, `trips/${currentTripId}/points/${fbId}`),
		cleanForFirebase({ ...(point as unknown as Record<string, unknown>), firebaseId: fbId, createdAt: Date.now() })
	);
}

export async function updatePointInFirebase(point: Point) {
	if (!currentTripId || !db || !point.firebaseId) return;
	await update(
		ref(db, `trips/${currentTripId}/points/${point.firebaseId}`),
		cleanForFirebase({ ...(point as unknown as Record<string, unknown>), updatedAt: Date.now() })
	);
}

export async function deletePointFromFirebase(firebaseId: string) {
	if (!currentTripId || !db) return;
	await remove(ref(db, `trips/${currentTripId}/points/${firebaseId}`));
}
