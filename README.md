<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>TripViz - Transport & POI Suche</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Leaflet CSS & JS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <!-- Leaflet AntPath -->
    <script src="https://cdn.jsdelivr.net/npm/leaflet-ant-path@1.3.0/dist/leaflet-ant-path.js"></script>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-main: #0f0f0f; 
            --panel-bg: rgba(20, 20, 20, 0.95);
            --border-color: rgba(255, 255, 255, 0.1);
            --accent-primary: #00f2ff; 
            --accent-transport: #ff2d55; 
            --text-main: #ffffff;
            --text-secondary: #a0a0a0;
            --input-bg: #1a1a1a;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-main);
            color: var(--text-main);
            height: 100vh;
            margin: 0;
            overflow: hidden;
        }

        h1, h2, .brand-font { font-family: 'Space Grotesk', sans-serif; }

        #map { 
            position: absolute;
            top: 0;
            bottom: 0;
            width: 100%;
            z-index: 1;
        }

        /* Sidebar & Modals */
        #sidebar {
            position: fixed;
            z-index: 1010;
            background: var(--panel-bg);
            backdrop-filter: blur(25px);
            border-left: 1px solid var(--border-color);
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            flex-direction: column;
            box-shadow: -10px 0 40px rgba(0,0,0,0.6);
        }

        @media (max-width: 768px) {
            #sidebar { bottom: 0; left: 0; right: 0; height: 75vh; border-radius: 32px 32px 0 0; transform: translateY(100%); }
            #sidebar.open { transform: translateY(0); }
        }

        @media (min-width: 769px) {
            #sidebar { top: 20px; right: 20px; bottom: 20px; width: 380px; border-radius: 32px; transform: translateX(calc(100% + 40px)); }
            #sidebar.open { transform: translateX(0); }
        }

        #add-form-overlay {
            position: fixed;
            inset: 0;
            z-index: 1200;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.7); 
            backdrop-filter: blur(10px);
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        #add-form-overlay.open { pointer-events: auto; opacity: 1; }

        .modal-content {
            background: #121212;
            width: 95%;
            max-width: 440px;
            padding: 24px;
            border-radius: 32px;
            border: 1px solid rgba(255,255,255,0.1);
            transform: translateY(20px);
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            max-height: 90vh;
            overflow-y: auto;
        }

        .open .modal-content { transform: translateY(0); }

        /* Search Suggestion Styling */
        .suggestions-box {
            position: absolute;
            bottom: 100%;
            left: 0;
            right: 0;
            background: #222;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            margin-bottom: 8px;
            z-index: 1300;
            max-height: 200px;
            overflow-y: auto;
            box-shadow: 0 -10px 25px rgba(0,0,0,0.5);
        }

        .top-suggestions { bottom: auto !important; top: 100% !important; margin-top: 8px; margin-bottom: 0; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }

        .suggestion-item {
            padding: 10px 14px;
            cursor: pointer;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            font-size: 13px;
            color: white;
        }

        .suggestion-item:hover { background: rgba(0, 242, 255, 0.1); }

        /* Buttons & Controls */
        .action-btn {
            background: var(--accent-primary);
            color: #000;
            width: 54px;
            height: 54px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 30px rgba(0, 242, 255, 0.2);
            cursor: pointer;
            transition: all 0.2s;
        }

        .floating-search-bar {
            background: rgba(30, 30, 30, 0.9);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 24px;
            display: flex;
            align-items: center;
            padding: 4px;
            width: 100%;
            max-width: 450px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.6);
        }

        /* Improved Form Elements Visibility */
        input, select, textarea {
            background: #1a1a1a !important;
            border: 1px solid rgba(255,255,255,0.15) !important;
            border-radius: 14px !important;
            padding: 12px 14px !important;
            color: #ffffff !important;
            width: 100%;
            font-size: 14px;
        }

        select option {
            background-color: #1a1a1a;
            color: white;
        }

        input:focus, select:focus, textarea:focus {
            border-color: var(--accent-primary) !important;
            outline: none;
        }

        input::placeholder {
            color: rgba(255,255,255,0.4);
        }

        .itinerary-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 16px;
            margin-bottom: 12px;
        }

        .brand-logo {
            position: fixed;
            top: 24px;
            left: 24px;
            z-index: 1050;
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(0,0,0,0.7);
            padding: 8px 16px;
            border-radius: 16px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
        }
    </style>
</head>
<body>

    <div id="map"></div>

    <!-- Branding -->
    <div class="brand-logo">
        <div class="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-black">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <span class="brand-font font-bold text-lg tracking-tight">TripViz</span>
    </div>

    <!-- Schnellsuchbar Unten Mittig -->
    <div class="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1050] w-full px-6 flex justify-center pointer-events-none">
        <div class="floating-search-bar pointer-events-auto relative">
            <div class="pl-4 text-cyan-400"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg></div>
            <input type="text" id="global-search" oninput="debouncedSearch(this.value, 'global')" placeholder="Bar, Hotel, Stadt schnell finden..." style="background:transparent!important; border:none!important;">
            <div id="global-suggestions" class="suggestions-box hidden"></div>
        </div>
    </div>

    <!-- Sidebar Toggle Button (Rechts Unten) -->
    <div class="fixed bottom-10 right-8 z-[1050]">
        <button onclick="toggleSidebar()" class="action-btn">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
    </div>

    <!-- Formular Modal -->
    <div id="add-form-overlay" class="hidden">
        <div class="modal-content">
            <div class="flex justify-between items-center mb-6">
                <h3 id="form-title" class="brand-font font-bold text-white/90 uppercase tracking-widest text-sm">Punkt Planen</h3>
                <button onclick="cancelAdd()" class="text-white/30 hover:text-white text-xl">✕</button>
            </div>
            
            <div class="space-y-5">
                <div class="flex p-1 bg-white/5 rounded-2xl">
                    <button onclick="setType('activity')" id="btn-activity" class="flex-1 py-2 text-[10px] font-bold rounded-xl bg-white/10 text-cyan-400 transition-all">AKTIVITÄT</button>
                    <button onclick="setType('transport')" id="btn-transport" class="flex-1 py-2 text-[10px] font-bold rounded-xl text-white/40 transition-all">TRANSPORT</button>
                </div>

                <!-- Activity Fields -->
                <div id="activity-fields" class="relative">
                    <label class="text-[10px] text-white/40 block mb-1 ml-1 uppercase font-bold">Name / Ort</label>
                    <input type="text" id="point-title" oninput="debouncedSearch(this.value, 'point')" placeholder="z.B. Bar High Five">
                    <div id="point-suggestions" class="suggestions-box top-suggestions hidden"></div>
                </div>

                <!-- Transport Fields -->
                <div id="transport-fields" class="hidden space-y-4">
                    <div class="relative">
                        <label class="text-[10px] text-white/40 block mb-1 ml-1 uppercase font-bold">Abfahrt</label>
                        <input type="text" id="transport-start" oninput="debouncedSearch(this.value, 'start')" placeholder="Startort suchen...">
                        <div id="start-suggestions" class="suggestions-box top-suggestions hidden"></div>
                    </div>
                    <div class="relative">
                        <label class="text-[10px] text-white/40 block mb-1 ml-1 uppercase font-bold">Ankunft</label>
                        <input type="text" id="transport-end" oninput="debouncedSearch(this.value, 'end')" placeholder="Zielort suchen...">
                        <div id="end-suggestions" class="suggestions-box top-suggestions hidden"></div>
                    </div>
                    <label class="text-[10px] text-white/40 block mb-1 ml-1 uppercase font-bold">Verkehrsmittel</label>
                    <select id="transport-method">
                        <option value="🚆 Zug">🚆 Shinkansen / Zug</option>
                        <option value="✈️ Flug">✈️ Inlandsflug</option>
                        <option value="🚌 Bus">🚌 Highway Bus</option>
                        <option value="🚕 Taxi">🚕 Taxi / Uber</option>
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-[10px] text-white/40 block mb-1 ml-1 uppercase font-bold">Datum</label>
                        <input type="date" id="point-date">
                    </div>
                    <div>
                        <label class="text-[10px] text-white/40 block mb-1 ml-1 uppercase font-bold">Budget (¥)</label>
                        <input type="number" id="point-budget" placeholder="0">
                    </div>
                </div>

                <textarea id="point-desc" rows="2" placeholder="Notizen..."></textarea>

                <div class="flex gap-3 pt-4">
                    <button id="delete-btn" onclick="deletePoint()" class="hidden w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                    <button onclick="savePoint()" class="flex-grow py-4 bg-cyan-500 text-black font-bold rounded-2xl uppercase text-[11px] tracking-widest shadow-lg shadow-cyan-500/30">Speichern</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Sidebar -->
    <aside id="sidebar">
        <div class="p-8 flex-shrink-0">
            <h2 class="brand-font font-bold text-2xl mb-2">Reiseplan</h2>
            <div class="flex flex-col gap-1 mb-6">
                <div class="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
                    <span id="point-count" class="text-cyan-400">0 Stopps</span>
                </div>
                <div class="flex flex-col">
                    <span id="total-budget-jpy" class="text-emerald-400 font-bold text-lg">¥ 0</span>
                    <span id="total-budget-eur" class="text-white/40 text-[10px] uppercase font-bold">€ 0.00</span>
                </div>
            </div>
            <label class="text-[10px] text-white/40 block mb-1 uppercase font-bold">Tag filtern</label>
            <select id="day-filter" onchange="renderPoints()" class="w-full text-xs"></select>
        </div>
        <div id="itinerary-list" class="flex-grow overflow-y-auto px-8 pb-20"></div>
    </aside>

    <script>
        const STADIA_API_KEY = "2831d4eb-094e-4752-a3c9-1ae9e9d65f94";
        const STORAGE_KEY = 'tripviz_pro_data';
        const JPY_EUR_RATE = 1 / 160.50; // Beispielhafter Wechselkurs

        let map, markers = [], paths = [], points = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        let currentType = 'activity', editingId = null;
        let tempCoords = { start: null, end: null };
        let searchTimeout;

        window.onload = function() {
            map = L.map('map', { zoomControl: false, attributionControl: false }).setView([35.6762, 139.6503], 6);
            L.tileLayer(`https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${STADIA_API_KEY}`).addTo(map);

            map.on('click', e => {
                if(editingId) return;
                tempCoords.start = [e.latlng.lat, e.latlng.lng];
                showAddForm();
            });

            updateDayFilter();
            renderPoints();
        };

        function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }

        function debouncedSearch(q, target) {
            clearTimeout(searchTimeout);
            if(q.length < 3) {
                document.getElementById(`${target}-suggestions`)?.classList.add('hidden');
                return;
            }
            searchTimeout = setTimeout(() => execSearch(q, target), 400);
        }

        async function execSearch(q, target) {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&countrycodes=jp&limit=5`);
                const data = await res.json();
                const container = document.getElementById(`${target}-suggestions`);
                if(!container) return;

                container.innerHTML = data.map(item => `
                    <div class="suggestion-item" onclick="selectLocation('${target}', '${item.display_name.replace(/'/g, "\\'")}', ${item.lat}, ${item.lon})">
                        ${item.display_name.split(',').slice(0,2).join(',')}
                    </div>
                `).join('');
                container.classList.remove('hidden');
            } catch (e) {
                console.error("Suche fehlgeschlagen", e);
            }
        }

        function selectLocation(target, name, lat, lon) {
            const coords = [lat, lon];
            if(target === 'global') {
                tempCoords.start = coords;
                document.getElementById('point-title').value = name.split(',')[0];
                showAddForm();
            } else if(target === 'point' || target === 'start') {
                tempCoords.start = coords;
                document.getElementById(target === 'point' ? 'point-title' : 'transport-start').value = name.split(',')[0];
            } else if(target === 'end') {
                tempCoords.end = coords;
                document.getElementById('transport-end').value = name.split(',')[0];
            }
            
            document.querySelectorAll('.suggestions-box').forEach(b => b.classList.add('hidden'));
            map.flyTo(coords, 14);
        }

        function setType(t) {
            currentType = t;
            document.getElementById('btn-activity').className = t === 'activity' ? "flex-1 py-2 text-[10px] font-bold rounded-xl bg-white/10 text-cyan-400 transition-all" : "flex-1 py-2 text-[10px] font-bold rounded-xl text-white/40";
            document.getElementById('btn-transport').className = t === 'transport' ? "flex-1 py-2 text-[10px] font-bold rounded-xl bg-white/10 text-rose-500" : "flex-1 py-2 text-[10px] font-bold rounded-xl text-white/40";
            document.getElementById('activity-fields').classList.toggle('hidden', t !== 'activity');
            document.getElementById('transport-fields').classList.toggle('hidden', t !== 'transport');
        }

        function showAddForm() {
            document.getElementById('add-form-overlay').classList.remove('hidden');
            setTimeout(() => document.getElementById('add-form-overlay').classList.add('open'), 10);
            document.getElementById('delete-btn').classList.toggle('hidden', !editingId);
            if(!editingId) {
                document.getElementById('point-date').value = new Date().toISOString().split('T')[0];
                document.getElementById('point-budget').value = '';
                document.getElementById('point-desc').value = '';
            }
        }

        function cancelAdd() {
            document.getElementById('add-form-overlay').classList.remove('open');
            setTimeout(() => document.getElementById('add-form-overlay').classList.add('hidden'), 300);
            editingId = null;
            tempCoords = { start: null, end: null };
            document.getElementById('point-title').value = '';
            document.getElementById('transport-start').value = '';
            document.getElementById('transport-end').value = '';
        }

        function savePoint() {
            const pData = {
                id: editingId || Date.now(),
                type: currentType,
                date: document.getElementById('point-date').value,
                budget: parseFloat(document.getElementById('point-budget').value) || 0,
                desc: document.getElementById('point-desc').value,
                coords: tempCoords.start,
                endCoords: tempCoords.end
            };

            if(currentType === 'activity') {
                pData.title = document.getElementById('point-title').value || "Unbenannter Punkt";
            } else {
                pData.title = `${document.getElementById('transport-method').value}: ${document.getElementById('transport-start').value || '?'} → ${document.getElementById('transport-end').value || '?'}`;
            }

            if(editingId) points = points.map(p => p.id === editingId ? pData : p);
            else points.push(pData);

            points.sort((a,b) => new Date(a.date) - new Date(b.date));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(points));
            renderPoints();
            updateDayFilter();
            cancelAdd();
        }

        function deletePoint() {
            points = points.filter(p => p.id !== editingId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(points));
            renderPoints();
            updateDayFilter();
            cancelAdd();
        }

        function renderPoints() {
            markers.forEach(m => map.removeLayer(m));
            paths.forEach(p => map.removeLayer(p));
            markers = []; paths = [];
            
            const list = document.getElementById('itinerary-list');
            const filter = document.getElementById('day-filter').value;
            list.innerHTML = '';

            let totalBudgetGlobal = 0;
            const grouped = points.reduce((acc, p) => {
                if(!acc[p.date]) acc[p.date] = [];
                acc[p.date].push(p);
                return acc;
            }, {});

            Object.keys(grouped).sort().forEach(date => {
                let dayTotalBudget = grouped[date].reduce((sum, p) => sum + p.budget, 0);
                totalBudgetGlobal += dayTotalBudget;

                if(filter !== 'all' && date !== filter) return;
                
                const dayHeader = document.createElement('div');
                dayHeader.className = "flex flex-col gap-1 mb-4 mt-6 border-b border-white/5 pb-2";
                
                const dayLabel = new Date(date).toLocaleDateString('de-DE', {weekday:'long', day:'2-digit', month:'short'});
                const dayEur = (dayTotalBudget * JPY_EUR_RATE).toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2});

                dayHeader.innerHTML = `
                    <div class="flex justify-between items-center text-[10px] uppercase font-bold text-white/30">
                        <span>${dayLabel}</span>
                        <div class="text-right">
                           <span class="text-white/60">¥ ${dayTotalBudget.toLocaleString()}</span>
                           <span class="ml-2 text-white/20">€ ${dayEur}</span>
                        </div>
                    </div>
                `;
                list.appendChild(dayHeader);

                grouped[date].forEach(p => {
                    const card = document.createElement('div');
                    card.className = "itinerary-card hover:border-cyan-500 transition-all cursor-pointer";
                    card.innerHTML = `
                        <div class="flex justify-between items-start">
                            <span class="text-xs font-bold text-white/90 pr-4">${p.title}</span>
                            <div class="text-right flex flex-col items-end">
                                <span class="text-[10px] text-cyan-400 whitespace-nowrap font-bold">¥${p.budget.toLocaleString()}</span>
                                <span class="text-[8px] text-white/30 whitespace-nowrap">€${(p.budget * JPY_EUR_RATE).toFixed(2)}</span>
                            </div>
                        </div>
                    `;
                    card.onclick = () => {
                        editingId = p.id;
                        currentType = p.type;
                        tempCoords = { start: p.coords, end: p.endCoords };
                        setType(p.type);
                        showAddForm();
                        if(p.type === 'activity') {
                            document.getElementById('point-title').value = p.title;
                        } else {
                            const parts = p.title.split(': ')[1].split(' → ');
                            document.getElementById('transport-start').value = parts[0] || '';
                            document.getElementById('transport-end').value = parts[1] || '';
                        }
                        document.getElementById('point-budget').value = p.budget;
                        document.getElementById('point-desc').value = p.desc;
                        map.flyTo(p.coords, 13);
                    };
                    list.appendChild(card);

                    const color = p.type === 'activity' ? '#00f2ff' : '#ff2d55';
                    if(p.coords) {
                        markers.push(L.circleMarker(p.coords, { radius: 7, color: '#fff', weight: 2, fillColor: color, fillOpacity: 1 }).addTo(map));
                    }
                    
                    if(p.type === 'transport' && p.coords && p.endCoords) {
                        markers.push(L.circleMarker(p.endCoords, { radius: 5, color: color, weight: 2, fillColor: '#000', fillOpacity: 1 }).addTo(map));
                        const path = L.polyline.antPath([p.coords, p.endCoords], { color: color, dashArray: [10, 20], delay: 1500, weight: 4 }).addTo(map);
                        paths.push(path);
                    }
                });
            });

            document.getElementById('total-budget-jpy').innerText = `¥ ${totalBudgetGlobal.toLocaleString()}`;
            document.getElementById('total-budget-eur').innerText = `€ ${(totalBudgetGlobal * JPY_EUR_RATE).toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            document.getElementById('point-count').innerText = `${points.length} Stopps`;
        }

        function updateDayFilter() {
            const f = document.getElementById('day-filter');
            const dates = [...new Set(points.map(p => p.date))].sort();
            f.innerHTML = '<option value="all">Gesamte Reise</option>';
            dates.forEach(d => f.innerHTML += `<option value="${d}">${new Date(d).toLocaleDateString('de-DE')}</option>`);
        }
    </script>
</body>
</html>
