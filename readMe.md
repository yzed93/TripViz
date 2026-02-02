TripViz – Japan Reiseplaner Dashboard

TripViz ist ein interaktives, webbasiertes Dashboard zur Planung von Japan-Reisen. Es kombiniert eine moderne Benutzeroberfläche im "Dark Mode"-Design mit geografischen Daten, um Aktivitäten und Transportwege visuell darzustellen.

✨ Features

Interaktive Karte: Basierend auf Leaflet.js und Stadia Maps (Alidade Smooth Dark) für eine ästhetische Darstellung Japans.

Duale Planung:

Aktivitäten: Markiere Sehenswürdigkeiten direkt per Klick auf die Karte.

Transportwege: Erstelle Routen (Shinkansen, Bus, Flug) durch einfache Texteingabe von Start- und Zielort.

Smart Geocoding: Nutzt die Nominatim API, um Städtenamen automatisch in Koordinaten umzuwandeln und Linien auf der Karte zu zeichnen.

Budget-Tracker: Automatische Summierung aller Reisekosten in Yen (¥) direkt in der Sidebar.

Responsive Design: Optimiert für Desktop und mobile Endgeräte (Mobile-First Sidebar).

Offline-First: Speichert alle Daten lokal im localStorage des Browsers, sodass kein Account notwendig ist.

🛠 Technologien

Frontend: HTML5, CSS3 (Tailwind CSS)

Karten-Engine: Leaflet.js

Karten-Provider: Stadia Maps (API-Key integriert)

Geocoding: OpenStreetMap Nominatim

Icons & Fonts: Space Grotesk & Inter (via Google Fonts)

🚀 Installation & Start

Da die App vollständig clientseitig läuft, ist keine Installation erforderlich:

Hinweis: Eine aktive Internetverbindung ist erforderlich, um die Kartendaten und die Geocoding-Dienste zu laden.

📖 Bedienungsanleitung

Aktivität hinzufügen: Klicke auf einen Punkt auf der Karte. Ein Fenster öffnet sich, in dem du Name, Datum und Budget eingeben kannst.

Transport planen: Klicke auf die Karte und schalte oben im Fenster auf "TRANSPORT" um. Gib den Start- und Zielort ein (z.B. "Tokyo" und "Kyoto"). Die App berechnet die Linie automatisch.

Sidebar nutzen: Klicke oben rechts auf das Burger-Menü, um deine Liste und das Gesamtbudget einzusehen.

Daten löschen: Am Ende der Sidebar findest du die Option "PLAN LÖSCHEN", um alle Einträge zu entfernen.

🎨 Design-Philosophie

Die App nutzt ein Cyber-Tokio-Thema:

Primärfarbe: Cyan (#00f2ff) für Aktivitäten.

Akzentfarbe: Rose/Transport-Rot (#ff2d55) für Bewegungen.

Hintergrund: Tiefes Schwarz mit Glasmorphismus-Effekten für maximale Lesbarkeit bei Nacht.

Entwickelt für Japan-Enthusiasten und Reiseplaner.
