// ============================================
// FIREBASE COLLABORATIVE EDITING MODULE
// ============================================

// SCHRITT 1: Firebase Config einfügen
const firebaseConfig = {
  apiKey: "AIzaSyDW6WRwLe1V7oEj5B708aDcKDukaXEF5Xs",
  authDomain: "tripviz.firebaseapp.com",
  databaseURL: "https://tripviz-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tripviz",
  storageBucket: "tripviz.firebasestorage.app",
  messagingSenderId: "964198243405",
  appId: "1:964198243405:web:d8bb2be98649957b811004",
  measurementId: "G-DN8V1VCQG0"
};


// Firebase State
let firebaseApp = null;
let firebaseDB = null;
let currentTripId = null;
let isFirebaseEnabled = false;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Remove undefined and null values from object
 * Firebase doesn't accept undefined values
 */
function cleanForFirebase(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const cleaned = {};
    
    for (const key in obj) {
        const value = obj[key];
        
        // Skip undefined and null
        if (value === undefined || value === null) {
            continue;
        }
        
        // Handle arrays
        if (Array.isArray(value)) {
            cleaned[key] = value.filter(item => item !== undefined && item !== null);
        }
        // Handle nested objects
        else if (typeof value === 'object') {
            cleaned[key] = cleanForFirebase(value);
        }
        // Handle primitives
        else {
            cleaned[key] = value;
        }
    }
    
    return cleaned;
}

// ============================================
// INITIALIZATION
// ============================================

async function initFirebase() {
    try {
        // Import Firebase modules from CDN
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getDatabase, ref, onValue, set, push, remove, update, onDisconnect } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
        const { getAuth, signInAnonymously } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        
        // Initialize Firebase
        firebaseApp = initializeApp(firebaseConfig);
        firebaseDB = getDatabase(firebaseApp);
        const auth = getAuth(firebaseApp);

        // Sign in anonymously
        await signInAnonymously(auth);
        console.log('✅ Firebase authenticated');
        
        return { getDatabase, ref, onValue, set, push, remove, update, onDisconnect };
    } catch (error) {
        console.error('❌ Firebase init error:', error);
        return null;
    }
}

// ============================================
// START COLLABORATIVE SESSION
// ============================================

async function startCollaborativeSession(tripId) {
    if (!tripId) {
        tripId = generateTripId();
    }
    
    currentTripId = tripId;
    
    // Initialize if not done
    if (!firebaseDB) {
        const firebase = await initFirebase();
        if (!firebase) {
            alert('❌ Firebase konnte nicht initialisiert werden.');
            return null;
        }
    }
    
    const { getDatabase, ref, onValue, set, push, remove, update, onDisconnect } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
    const db = getDatabase();
    
    // Reference to this trip
    const tripRef = ref(db, `trips/${tripId}/points`);
    
    // Upload current points to Firebase
    if (state.points.length > 0) {
        const pointsObject = {};
        state.points.forEach(point => {
            const firebaseId = point.firebaseId || `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // ✅ FIX: Clean point object - remove undefined values
            pointsObject[firebaseId] = cleanForFirebase({
                ...point,
                firebaseId
            });
        });
        await set(tripRef, pointsObject);
    }
    
    // Listen for changes
    onValue(tripRef, (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
            // Convert Firebase object to array
            const newPoints = Object.entries(data).map(([key, value]) => ({
                ...value,
                firebaseId: key
            }));
            
            // Check if data changed
            if (JSON.stringify(newPoints) !== JSON.stringify(state.points)) {
                state.points = newPoints;
                renderMap();
                renderList();
                
                console.log('🔄 Points updated from Firebase');
            }
        } else {
            // No data yet
            state.points = [];
            renderMap();
            renderList();
        }
    });
    
    // Set up presence
    const userId = getUserId();
    const presenceRef = ref(db, `trips/${tripId}/presence/${userId}`);
    await set(presenceRef, {
        name: 'User',
        online: true,
        lastSeen: Date.now()
    });
    onDisconnect(presenceRef).remove();
    
    // Listen to presence
    const allPresenceRef = ref(db, `trips/${tripId}/presence`);
    onValue(allPresenceRef, (snapshot) => {
        const users = snapshot.val() || {};
        updateOnlineUsers(users);
    });
    
    isFirebaseEnabled = true;
    
    return tripId;
}

// ============================================
// SYNC FUNCTIONS
// ============================================

async function addPointToFirebase(point) {
    if (!isFirebaseEnabled || !currentTripId) return;
    
    const { getDatabase, ref, set } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
    const db = getDatabase();
    
    const firebaseId = `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const pointRef = ref(db, `trips/${currentTripId}/points/${firebaseId}`);
    
    // ✅ FIX: Clean point before saving
    await set(pointRef, cleanForFirebase({
        ...point,
        firebaseId,
        createdAt: Date.now()
    }));
}

async function updatePointInFirebase(point) {
    if (!isFirebaseEnabled || !currentTripId || !point.firebaseId) return;
    
    const { getDatabase, ref, update } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
    const db = getDatabase();
    
    const pointRef = ref(db, `trips/${currentTripId}/points/${point.firebaseId}`);
    
    // ✅ FIX: Clean point before updating
    await update(pointRef, cleanForFirebase({
        ...point,
        updatedAt: Date.now()
    }));
}

async function deletePointFromFirebase(firebaseId) {
    if (!isFirebaseEnabled || !currentTripId || !firebaseId) return;
    
    const { getDatabase, ref, remove } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
    const db = getDatabase();
    
    const pointRef = ref(db, `trips/${currentTripId}/points/${firebaseId}`);
    await remove(pointRef);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateTripId() {
    return 'trip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getUserId() {
    let userId = localStorage.getItem('tripviz-user-id');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('tripviz-user-id', userId);
    }
    return userId;
}

function updateOnlineUsers(users) {
    const userCount = Object.keys(users).length;
    console.log(`👥 ${userCount} user(s) online`);
    
    // Update all indicators (desktop and mobile)
    const indicators = ['online-indicator', 'online-indicator-desktop', 'online-indicator-mobile'];
    indicators.forEach(id => {
        const indicator = document.getElementById(id);
        if (indicator) {
            indicator.textContent = `👥 ${userCount}`;
            indicator.style.display = userCount > 1 ? 'inline-block' : 'none';
        }
    });
}

// ============================================
// UI FUNCTIONS
// ============================================

function showCollaborativeModal() {
    document.getElementById('collaborative-modal').style.display = 'flex';
}

function closeCollaborativeModal() {
    document.getElementById('collaborative-modal').style.display = 'none';
}

async function createCollaborativeTrip() {
    const tripId = await startCollaborativeSession();
    
    if (tripId) {
        // Show Trip ID
        document.getElementById('trip-id-display').textContent = tripId;
        document.getElementById('trip-id-section').style.display = 'block';
        document.getElementById('join-section').style.display = 'none';
        
        // Show success
        alert('✅ Collaborative Session erstellt!\n\nTrip-ID: ' + tripId);
        
        // Add to URL
        const url = new URL(window.location);
        url.searchParams.set('collab', tripId);
        window.history.pushState({}, '', url);
    }
}

async function joinCollaborativeTrip() {
    const tripId = document.getElementById('join-trip-id').value.trim();
    
    if (!tripId) {
        alert('❌ Bitte Trip-ID eingeben!');
        return;
    }
    
    await startCollaborativeSession(tripId);
    
    closeCollaborativeModal();
    alert('✅ Collaborative Session beigetreten!');
    
    // Add to URL
    const url = new URL(window.location);
    url.searchParams.set('collab', tripId);
    window.history.pushState({}, '', url);
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

window.showCollaborativeModal = showCollaborativeModal;
window.closeCollaborativeModal = closeCollaborativeModal;
window.createCollaborativeTrip = createCollaborativeTrip;
window.joinCollaborativeTrip = joinCollaborativeTrip;
window.isFirebaseEnabled = () => isFirebaseEnabled;

// Check for collaborative URL on load
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const collabId = urlParams.get('collab');
    
    if (collabId) {
        // Auto-join collaborative session
        setTimeout(() => {
            startCollaborativeSession(collabId);
            alert('🔄 Collaborative Session wird geladen...');
        }, 1000);
    }
});

console.log('🔥 Firebase Collaborative Module loaded');
