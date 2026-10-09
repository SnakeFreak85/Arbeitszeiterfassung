# Zeitwerk · Arbeitszeiterfassung

Deutschsprachige PWA auf GitHub Pages mit Firebase Authentication und Firestore.

Einrichtung: [FIREBASE_SETUP.md](FIREBASE_SETUP.md). Ohne eingerichtete Anmeldung, veröffentlichte Firestore-Regeln und Verwaltungsprofil ist keine Anmeldung in der Anwendung möglich.

Funktionen: Arbeitszeitbuttons, manuelle Einträge, Urlaub/Krankheit, Freigaben, Mitarbeiterbearbeitung, XLSX/PDF, Überstundenspalte. Mitarbeiterdaten werden zentral gespeichert. Bestehende lokale Demo-Daten werden nicht automatisch importiert.

`npm test` prüft Zeitberechnung. `npm run check` prüft JavaScript-Syntax. Lokal: `python3 -m http.server 8000`.

E-Mail-Versand ist noch nicht eingerichtet. Firebase-Konfiguration ist öffentlich, die Daten werden durch Authentication und Firestore-Regeln geschützt. Private Schlüssel gehören nicht ins Repository.
