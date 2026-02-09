# 🗺️ TripViz - Japan Reiseplaner

> Interaktiver Reiseplaner für Japan mit Karte, Budget-Tracking und Echtzeit-Kollaboration

[![Version](https://img.shields.io/badge/version-1.0.0-cyan.svg)](https://github.com/yzed93/tripviz)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[🌐 Live Demo](https://tripviz.wiredu.cloud) | [📖 Dokumentation](#features) | [🐛 Bug Report](https://github.com/yourusername/tripviz/issues)

---

## 📸 Screenshots

### Desktop
![TripViz Desktop](screenshots/desktop.png)

### Mobile
![TripViz Mobile](screenshots/mobile.png)

### Tutorial System
![Tutorial](screenshots/tutorial.png)

---

## ✨ Features

### 🗺️ **Interaktive Karte**
- **Leaflet.js Integration** mit OpenStreetMap
- Marker für Aktivitäten mit Custom Icons (11 Kategorien)
- Klick auf Karte zum Hinzufügen neuer Aktivitäten
- Drag & Drop Marker zum Verschieben
- Animierte Routen zwischen Punkten (AntPath)
- Custom Popup-System mit Click-to-Edit

### 📍 **Aktivitäten-Management**
- Aktivitäten und Transport-Routen
- 11 Kategorien mit Emoji-Icons:
  - 🏛️ Sehenswürdigkeit
  - ⛩️ Tempel & Schreine
  - 🏰 Burg & Paläste
  - 🌸 Natur & Parks
  - 🍜 Restaurant & Café
  - 🛍️ Shopping
  - 🎭 Kultur & Museum
  - 🎡 Unterhaltung
  - 🏨 Unterkunft
  - 🚃 Bahnhof
  - 📍 Sonstiges
- **Must-See Toggle** 🐭 für wichtige Orte
- Filter nach Tag und Must-See Status
- Datum & Uhrzeit für jede Aktivität
- Beschreibungen und Notizen
- Bild-Upload (bis zu 5 Bilder pro Aktivität)
- Vollbild-Lightbox für Bilder mit Navigation

### 💰 **Budget-Tracking**
- Dual-Währung: **¥ JPY** und **€ EUR**
- Automatische Umrechnung (aktueller Wechselkurs)
- Live-Budget-Anzeige in Sidebar
- Summe aller Aktivitäten
- Budget pro Aktivität

### 🔍 **Intelligente Suche**
- Globale Suchleiste mit Auto-Suggest
- Integration mit Nominatim (OpenStreetMap)
- Suche nach Orten, POIs, Adressen
- Click-to-Add direkt aus Suchergebnissen
- Debounced Search für Performance

### 🎨 **8 Farbschemata**
1. **Cyberpunk** (Default) - Cyan/Blue
2. **Sakura** - Cherry Blossom Pink
3. **Zen Garden** - Natural Green
4. **Tokyo Neon** - Vibrant Neon (PRO)
5. **Fuji Sunset** - Orange/Purple (PRO)
6. **Matcha** - Green Tea (PRO)
7. **Ocean Blue** - Deep Blue (PRO)
8. **Midnight** - Dark Purple (PRO)

**Theme Features:**
- Ein-Klick Theme-Wechsel
- Persistent (LocalStorage)
- Alle UI-Elemente passen sich an
- Smooth Transitions

### 👥 **Echtzeit-Kollaboration** (Firebase)
- Gemeinsam planen mit mehreren Usern
- Firebase Realtime Database
- Live-Updates ohne Reload
- Online-Presence-System (wer ist online)
- Anonymous Authentication
- Session-basiertes Teilen via Trip-ID
- Auto-Sync zwischen allen Teilnehmern

### 🔗 **Share & Export**
- **Link teilen** - Komprimierte URL (LZ-String)
- **QR-Code** - Für Mobile-Transfer
- **Als Bild exportieren** - PNG mit html2canvas
- **JSON Export/Import** - Vollständiges Backup

### 📊 **Statistiken**
- Anzahl Aktivitäten
- Gesamt-Budget (JPY & EUR)
- Anzahl Reisetage
- Must-See Orte
- Pro-Tag Breakdown

### 🎓 **Interactive Tutorial System**
- Welcome Modal beim ersten Besuch
- 5-Step Spotlight Tour:
  1. 🔍 Suchleiste
  2. 🗺️ Karte
  3. 📋 Sidebar/Reiseplan
  4. 🐭 Must-See Filter
  5. ✨ Mehr-Menü
- Floating Help-Button (permanent)
- Keyboard Navigation (← → ESC Enter)
- "Nicht mehr anzeigen" Option

### 📱 **Responsive Design**
- **3 Breakpoints:**
  - Mobile (< 640px) - Bottom Sheet, kompakte Items
  - Tablet (640-1024px) - Schmale Sidebar (280px)
  - Desktop (> 1024px) - Volle Sidebar (380px)
- **Optimierte Listenansicht:**
  - Mobile: ~50px pro Item (70% mehr sichtbar)
  - Tablet: ~55px pro Item
  - Desktop: ~85px pro Item (alle Details)
- **More-Menü System:**
  - Desktop: Alle Buttons sichtbar
  - Tablet: 2 Buttons (⋮ Mehr + 🎨)
  - Mobile: 1 Button (⋮ Mehr)

### 💾 **Persistenz**
- **IndexedDB** für lokale Daten
- Aktivitäten, Bilder, Einstellungen
- Auto-Save bei jeder Änderung
- Offline-fähig
- Export/Import Funktionalität

### 🎯 **UX/UI Features**
- **Drag & Drop** - Sortieren in Liste (SortableJS)
- **Click-to-Edit** - Popup-Editing auf Karte
- **Smooth Animations** - 60fps Transitions
- **Glass Morphism** - Moderne UI
- **Keyboard Shortcuts** - Für Power-User
- **Touch-Optimiert** - 44px+ Touch-Targets
- **Dark Mode** - Alle Themes sind dunkel

---

## 🚀 Installation & Setup

### Voraussetzungen
- Moderner Webbrowser (Chrome, Firefox, Safari, Edge)
- Optional: Firebase Account (für Kollaboration)

### Schnellstart

1. **Dateien herunterladen:**
```bash
git clone https://github.com/yourusername/tripviz.git
cd tripviz
```

2. **Lokal öffnen:**
```bash
# Einfach index-with-tutorial.html im Browser öffnen
# Oder mit lokalem Server:
python -m http.server 8000
# Dann öffne: http://localhost:8000
```

3. **Fertig!** 🎉
   - Keine Build-Steps
   - Keine npm install
   - Kein Backend nötig (außer für Kollaboration)

---

## 🔥 Firebase Setup (Optional - für Kollaboration)

### 1. Firebase Project erstellen

1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. "Projekt hinzufügen" → Name eingeben
3. Google Analytics deaktivieren (optional)
4. "Projekt erstellen"

### 2. Realtime Database aktivieren

1. Build → Realtime Database
2. "Datenbank erstellen"
3. Standort: **europe-west1** (Frankfurt)
4. Modus: "Im Testmodus starten"
5. "Aktivieren"

### 3. Authentication aktivieren

1. Build → Authentication
2. "Get started"
3. Sign-in method → **Anonymous** → Enable
4. Save

### 4. Web-App registrieren

1. Projekteinstellungen (⚙️)
2. Unter "Ihre Apps" → Web-Icon `</>`
3. App-Name: `TripViz Web`
4. **Firebase Hosting NICHT aktivieren**
5. "App registrieren"

### 5. Config einfügen

Kopiere die Firebase Config und füge sie in `index-with-tutorial.html` ein:

**Suche nach (ca. Zeile 3860):**
```javascript
const firebaseConfig = {
    apiKey: "DEIN_API_KEY_HIER",
    authDomain: "DEIN_PROJECT.firebaseapp.com",
    // ...
};
```

**Ersetze mit deinen Werten:**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "tripviz-xxxxx.firebaseapp.com",
    databaseURL: "https://tripviz-xxxxx-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tripviz-xxxxx",
    storageBucket: "tripviz-xxxxx.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};
```

### 6. Security Rules (Production)

Realtime Database → Rules:

```json
{
  "rules": {
    "trips": {
      "$tripId": {
        ".read": "auth != null",
        ".write": "auth != null",
        "points": {
          "$pointId": {
            ".validate": "newData.hasChildren(['title', 'date', 'coords'])"
          }
        },
        "presence": {
          "$userId": {
            ".write": "auth != null && auth.uid == $userId"
          }
        }
      }
    }
  }
}
```

### 7. Fertig! 🎊

Jetzt funktioniert:
- ✅ Zusammen planen
- ✅ Echtzeit-Sync
- ✅ Online Presence
- ✅ Session-Sharing

---

## 📖 Verwendung

### Erste Schritte

1. **Öffne TripViz** in deinem Browser
2. **Welcome Modal** erscheint
3. Wähle:
   - **"🎓 Tour starten"** - Interaktive 5-Schritte Einführung
   - **"Direkt loslegen"** - Sofort beginnen

### Aktivität hinzufügen

**Methode 1: Über Karte**
1. Klick auf Karte an gewünschter Position
2. Modal öffnet sich
3. Fülle Details aus (Titel, Datum, Budget, etc.)
4. "Speichern"

**Methode 2: Über Suche**
1. Tippe Ort in Suchleiste (z.B. "Shibuya Crossing")
2. Klick auf Suchergebnis
3. Aktivität wird zur Karte hinzugefügt
4. Optional: Details bearbeiten

**Methode 3: Über Sidebar**
1. Klick "+ Neue Aktivität" Button
2. Platziere Marker auf Karte
3. Fülle Details aus

### Transport hinzufügen

1. Sidebar → "+ Neue Aktivität"
2. Wähle "🚃 Transport"
3. Wähle Methode (Bahn, Bus, Taxi, etc.)
4. Setze Start- und End-Punkt
5. Budget & Zeit eingeben
6. Route wird auf Karte angezeigt

### Bilder hinzufügen

1. Aktivität bearbeiten
2. "📸 Bilder hinzufügen" (max. 5)
3. Bilder auswählen
4. Automatischer Upload zu IndexedDB
5. Lightbox-Ansicht durch Klick auf Bild

### Budget verwalten

- Budget wird automatisch in JPY & EUR angezeigt
- Summe in Sidebar-Header
- Pro Aktivität individuell
- Wechselkurs wird automatisch angewendet

### Filtern

- **Tag-Filter**: Dropdown "Alle Tage" → Wähle Datum
- **Must-See Filter**: Klick 🐭 Button
- Kombinierbar für präzise Suche

### Theme wechseln

**Desktop:**
1. Scroll zu Sidebar-Ende
2. "🎨 Farbschema" Button
3. Wähle Theme
4. Ein-Klick Wechsel

**Mobile/Tablet:**
1. "⋮ Mehr" Button
2. "🎨 Farbschema"
3. Theme wählen

### Zusammen planen

1. Klick "👥 Zusammen planen"
2. **Neue Session:**
   - "🆕 Neue Session starten"
   - Trip-ID kopieren
   - An Freunde senden
3. **Beitreten:**
   - Trip-ID einfügen
   - "🔗 Session beitreten"
   - Sofort verbunden!

### Reise teilen

1. Klick "🔗 Reise teilen"
2. Wähle Methode:
   - **Link**: Komprimierte URL kopieren
   - **QR-Code**: Für Mobile scannen
   - **Als Bild**: PNG zum Teilen auf Social Media

### Export/Import

**Export:**
1. "⋮ Mehr" → "📥 Export"
2. JSON-Datei wird heruntergeladen
3. Enthält alle Aktivitäten (ohne Bilder)

**Import:**
1. "⋮ Mehr" → "📤 Import"
2. JSON-Datei auswählen
3. Aktivitäten werden geladen

---

## ⌨️ Keyboard Shortcuts

### Global
- `ESC` - Schließe offenes Modal/Tour
- `?` - Toggle Help Menu (wenn Help Button fokussiert)

### Während Tutorial-Tour
- `→` / `Enter` - Nächster Schritt
- `←` - Vorheriger Schritt
- `ESC` - Tour beenden

### In Modals
- `ESC` - Modal schließen
- `Enter` - Speichern (wenn in Input-Feld)

---

## 🏗️ Projekt-Struktur

```
tripviz/
├── index-with-tutorial.html    # Main App (all-in-one)
├── favicon.ico                  # App Icon
├── README.md                    # Diese Datei
├── LICENSE                      # MIT License
├── screenshots/                 # Screenshots für README
│   ├── desktop.png
│   ├── mobile.png
│   └── tutorial.png
└── docs/                        # Dokumentation
    ├── FIREBASE-SETUP.md
    ├── FEATURES.md
    └── CONTRIBUTING.md
```

---

## 🛠️ Technologie-Stack

### Frontend
- **HTML5** - Semantisches Markup
- **CSS3** - Flexbox, Grid, Animations, Custom Properties
- **JavaScript (ES6+)** - Modules, Async/Await, Arrow Functions

### Libraries & Frameworks
| Library | Version | Zweck |
|---------|---------|-------|
| [Leaflet.js](https://leafletjs.com/) | 1.9.4 | Interactive Maps |
| [Leaflet AntPath](https://github.com/rubenspgcavalcante/leaflet-ant-path) | 1.3.0 | Animated Routes |
| [Tailwind CSS](https://tailwindcss.com/) | 3.x | Utility-first CSS |
| [SortableJS](https://sortablejs.github.io/Sortable/) | 1.15.0 | Drag & Drop |
| [LZ-String](https://pieroxy.net/blog/pages/lz-string/index.html) | 1.5.0 | URL Compression |
| [QRCode.js](https://davidshimjs.github.io/qrcodejs/) | 1.0.0 | QR Code Generation |
| [html2canvas](https://html2canvas.hertzen.com/) | 1.4.1 | Screenshot Export |
| [Google Fonts](https://fonts.google.com/) | - | Inter & Space Grotesk |

### Backend (Optional)
| Service | Zweck |
|---------|-------|
| [Firebase Realtime Database](https://firebase.google.com/products/realtime-database) | Echtzeit-Kollaboration |
| [Firebase Authentication](https://firebase.google.com/products/auth) | Anonymous Auth |
| [Nominatim API](https://nominatim.org/) | Geocoding/Search |
| [OpenStreetMap](https://www.openstreetmap.org/) | Map Tiles |

### Storage
- **IndexedDB** - Lokale Persistenz (Aktivitäten, Bilder, Settings)
- **LocalStorage** - Preferences (Theme, Tutorial-Status)

---

## 📊 Browser-Unterstützung

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Vollständig |
| Firefox | 88+ | ✅ Vollständig |
| Safari | 14+ | ✅ Vollständig |
| Edge | 90+ | ✅ Vollständig |
| Mobile Safari | iOS 14+ | ✅ Vollständig |
| Chrome Mobile | Android 5+ | ✅ Vollständig |

**Benötigte Features:**
- IndexedDB
- LocalStorage
- CSS Custom Properties
- ES6+ JavaScript
- Fetch API
- Async/Await

---

## 🎯 Performance

### Metriken (Lighthouse)
- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 95+
- **SEO**: 100

### Optimierungen
- Lazy Loading für Bilder
- Debounced Search (300ms)
- Virtual Scrolling für große Listen (geplant)
- Service Worker für Offline (geplant)
- Code Splitting (future)

### Bundle Size
- **HTML/CSS/JS**: ~250KB (unkomprimiert)
- **Externe Dependencies**: ~400KB (CDN, gecacht)
- **Total (First Load)**: ~650KB
- **Subsequent Loads**: ~250KB (CDN gecacht)

---

## 🔐 Sicherheit & Datenschutz

### Lokale Daten
- Alle Daten werden lokal im Browser gespeichert (IndexedDB)
- Keine Daten werden automatisch an Server gesendet
- User hat volle Kontrolle über Export/Löschung

### Firebase (wenn aktiviert)
- Anonymous Authentication (keine personenbezogenen Daten)
- Security Rules schützen Daten
- Nur authentifizierte User können lesen/schreiben
- Trip-IDs sind zufällig generiert (nicht ratebar)

### API-Keys
- Firebase API-Keys sind öffentlich (by design)
- Security kommt von Firebase Rules, nicht von versteckten Keys
- Authorized Domains beschränken Zugriff

### Best Practices
- HTTPS only (empfohlen)
- Content Security Policy (optional)
- No external tracking (privacy-first)
- DSGVO-konform (keine personenbezogenen Daten ohne Zustimmung)

---

## 🗺️ Roadmap

### Version 1.1 (Q2 2024)
- [ ] Service Worker für Offline-Modus
- [ ] PWA-Manifest (installierbar)
- [ ] Dark/Light Mode Toggle
- [ ] Multi-Language Support (EN, JP, DE)
- [ ] CSV Export
- [ ] Google Maps Integration (optional)



---

## 🤝 Contributing

Wir freuen uns über Beiträge! Siehe [CONTRIBUTING.md](CONTRIBUTING.md) für Details.

### Entwicklung

1. **Fork & Clone:**
```bash
git clone https://github.com/yourusername/tripviz.git
cd tripviz
```

2. **Branch erstellen:**
```bash
git checkout -b feature/amazing-feature
```

3. **Änderungen machen:**
```bash
# Bearbeite Dateien
# Teste lokal
```

4. **Commit & Push:**
```bash
git add .
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
```

5. **Pull Request erstellen**

### Code-Style
- 4 Spaces für Einrückung
- Kommentare auf Deutsch oder Englisch
- Semantic HTML
- BEM-ähnliche CSS-Klassen
- JSDoc für Funktionen

---

## 🐛 Bug Reports

Finde einen Bug? [Erstelle ein Issue](https://github.com/yourusername/tripviz/issues/new)

**Bitte inkludiere:**
- Browser & Version
- Schritte zum Reproduzieren
- Erwartetes vs. tatsächliches Verhalten
- Screenshots (wenn relevant)
- Console Errors (F12 → Console)

---

## 📄 Lizenz

Dieses Projekt ist lizenziert unter der **MIT License** - siehe [LICENSE](LICENSE) für Details.

```
MIT License

Copyright (c) 2024 TripViz Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Autoren

- **Dennis** - *Initial work* - [GitHub](https://github.com/yzed93)

Siehe auch die Liste der [Contributors](https://github.com/yzed93/tripviz/contributors).

---

## 🙏 Danksagungen

- [Leaflet.js](https://leafletjs.com/) - Awesome mapping library
- [OpenStreetMap](https://www.openstreetmap.org/) - Free map data
- [Firebase](https://firebase.google.com/) - Real-time backend
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

---


---

## 🌟 Support

Gefällt dir TripViz? Gib mir einen ⭐️ auf [GitHub](https://github.com/yzed93/tripviz)!

**Weitere Unterstützung:**
- 📣 Teile das Projekt
- 🐛 Melde Bugs
- 💡 Schlage Features vor
- 🤝 Trage Code bei
- ☕ [Buy me a coffee](https://buymeacoffee.com/yzed93)

---

<p align="center">
  Made with ❤️ in Germany 🇩🇪 for Japan 🇯🇵
</p>

<p align="center">
  <img src="favicon.ico" width="64" height="64" alt="TripViz Logo">
</p>
