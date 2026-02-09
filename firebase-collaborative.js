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
// INITIALIZATION
// ============================================

async function initFirebase() {
    try {
        // Import Firebase modules from CDN
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getDatabase, ref, onValue, set, push, remove, update, onDisconnect } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
        
        // Initialize Firebase
        firebaseApp = initializeApp(firebaseConfig);
        firebaseDB = getDatabase(firebaseApp);

      // In der initFirebase() Funktion:
const { getAuth, signInAnonymously } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
const auth = getAuth(firebaseApp);

// Sign in anonymously
await signInAnonymously(auth);
console.log('✅ Authenticated');
        console.log('✅ Firebase initialized');
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
            pointsObject[firebaseId] = {
                ...point,
                firebaseId
            };
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
    
    await set(pointRef, {
        ...point,
        firebaseId,
        createdAt: Date.now()
    });
}

async function updatePointInFirebase(point) {
    if (!isFirebaseEnabled || !currentTripId || !point.firebaseId) return;
    
    const { getDatabase, ref, update } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
    const db = getDatabase();
    
    const pointRef = ref(db, `trips/${currentTripId}/points/${point.firebaseId}`);
    
    await update(pointRef, {
        ...point,
        updatedAt: Date.now()
    });
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
    return `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getUserId() {
    let userId = localStorage.getItem('tripviz_user_id');
    if (!userId) {
        userId = `user_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('tripviz_user_id', userId);
    }
    return userId;
}

function updateOnlineUsers(users) {
    const userCount = Object.keys(users).length;
    console.log(`👥 ${userCount} user(s) online`);
    
    // Update UI
    const indicator = document.getElementById('online-indicator');
    if (indicator) {
        indicator.textContent = `👥 ${userCount} online`;
        indicator.style.display = userCount > 1 ? 'block' : 'none';
    }
}

// ============================================
// UI FUNCTIONS
// ============================================

function showCollaborativeModal() {
    const modal = document.createElement('div');
    modal.id = 'collaborative-modal';
    modal.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: var(--panel-bg); border-radius: 24px; max-width: 500px; width: 100%; padding: 32px; border: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h2 class="brand-font" style="font-size: 24px; font-weight: 700;">👥 Zusammen planen</h2>
                <button onclick="closeCollaborativeModal()" style="width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; border: none; color: rgba(255,255,255,0.5); cursor: pointer; transition: all 0.2s; font-size: 20px;">×</button>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <button onclick="createCollaborativeTrip()" style="width: 100%; py-4 px-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 text-cyan-400 text-sm font-bold rounded-xl border border-cyan-500/20 transition-all">
                    🆕 Neue Collaborative Session starten
                </button>
                
                <div style="text-align: center; color: rgba(255,255,255,0.4); font-size: 12px; font-weight: 600;">
                    ODER
                </div>
                
                <input 
                    type="text" 
                    id="join-trip-id" 
                    placeholder="Trip-ID eingeben..." 
                    style="width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: white; font-size: 14px;"
                />
                
                <button onclick="joinCollaborativeTrip()" style="width: 100%; py-4 px-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 text-purple-400 text-sm font-bold rounded-xl border border-purple-500/20 transition-all">
                    🔗 Existierender Session beitreten
                </button>
            </div>
            
            <div id="collaborative-status" style="margin-top: 24px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 12px; display: none;">
                <!-- Status wird hier angezeigt -->
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeCollaborativeModal() {
    const modal = document.getElementById('collaborative-modal');
    if (modal) modal.remove();
}

async function createCollaborativeTrip() {
    const tripId = await startCollaborativeSession();
    
    if (tripId) {
        const status = document.getElementById('collaborative-status');
        status.style.display = 'block';
        status.innerHTML = `
            <div style="color: var(--accent-primary); font-weight: 700; margin-bottom: 8px;">
                ✅ Session erstellt!
            </div>
            <div style="font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 12px;">
                Teile diese Trip-ID mit deinen Freunden:
            </div>
            <div style="display: flex; gap: 8px;">
                <input 
                    type="text" 
                    value="${tripId}" 
                    readonly 
                    id="trip-id-display"
                    style="flex: 1; padding: 10px 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: var(--accent-primary); font-family: monospace; font-size: 12px;"
                />
                <button 
                    onclick="copyTripId()" 
                    style="padding: 10px 16px; background: var(--accent-primary); color: #000; border: none; border-radius: 8px; font-weight: 700; font-size: 11px; cursor: pointer; white-space: nowrap;"
                >
                    COPY
                </button>
            </div>
        `;
        
        // Update URL
        window.history.pushState({}, '', `?collab=${tripId}`);
        
        showNotification('✅ Collaborative Session gestartet!', 'success');
    }
}

async function joinCollaborativeTrip() {
    const input = document.getElementById('join-trip-id');
    const tripId = input.value.trim();
    
    if (!tripId) {
        alert('Bitte Trip-ID eingeben!');
        return;
    }
    
    await startCollaborativeSession(tripId);
    
    const status = document.getElementById('collaborative-status');
    status.style.display = 'block';
    status.innerHTML = `
        <div style="color: var(--accent-primary); font-weight: 700;">
            ✅ Session beigetreten!
        </div>
        <div style="font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 8px;">
            Du kannst jetzt zusammen mit anderen planen.
        </div>
    `;
    
    // Update URL
    window.history.pushState({}, '', `?collab=${tripId}`);
    
    showNotification('✅ Session beigetreten!', 'success');
    
    setTimeout(() => {
        closeCollaborativeModal();
    }, 2000);
}

function copyTripId() {
    const element = document.getElementById('trip-id-display');
    if (!element) {
        alert('❌ Trip-ID nicht gefunden');
        return;
    }
    
    const tripId = element.textContent || element.innerText;
    
    if (!tripId || tripId.trim() === '') {
        alert('❌ Keine Trip-ID vorhanden');
        return;
    }
    
    // Moderne Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tripId)
            .then(() => {
                alert('📋 Trip-ID kopiert: ' + tripId);
            })
            .catch(err => {
                console.error('Clipboard API failed:', err);
                fallbackCopyToClipboard(tripId);
            });
    } else {
        // Fallback für ältere Browser
        fallbackCopyToClipboard(tripId);
    }
}

// Fallback-Methode
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    
    textArea.select();
    textArea.setSelectionRange(0, 99999); // Für mobile Geräte
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            alert('📋 Trip-ID kopiert: ' + text);
        } else {
            alert('❌ Kopieren fehlgeschlagen. Bitte manuell kopieren: ' + text);
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        alert('❌ Kopieren fehlgeschlagen. Trip-ID: ' + text);
    }
    
    document.body.removeChild(textArea);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(6, 182, 212, 0.9)'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: bold;
        font-size: 14px;
        z-index: 10001;
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

window.initFirebase = initFirebase;
window.startCollaborativeSession = startCollaborativeSession;
window.addPointToFirebase = addPointToFirebase;
window.updatePointInFirebase = updatePointInFirebase;
window.deletePointFromFirebase = deletePointFromFirebase;
window.showCollaborativeModal = showCollaborativeModal;
window.closeCollaborativeModal = closeCollaborativeModal;
window.createCollaborativeTrip = createCollaborativeTrip;
window.joinCollaborativeTrip = joinCollaborativeTrip;
window.copyTripId = copyTripId;
window.isFirebaseEnabled = () => isFirebaseEnabled;

// Check for collaborative URL on load
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const collabId = urlParams.get('collab');
    
    if (collabId) {
        // Auto-join collaborative session
        setTimeout(() => {
            startCollaborativeSession(collabId);
            showNotification('🔄 Collaborative Session wird geladen...', 'info');
        }, 1000);
    }
});

console.log('🔥 Firebase Collaborative Module loaded');
