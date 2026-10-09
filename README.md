# Zeitwerk · Arbeitszeiterfassung

Mobile, deutschsprachige PWA für die geplante Zeiterfassung eines Betriebs mit 7–8 Mitarbeitern. Direkt auf GitHub Pages lauffähig, ohne Build-Schritt.

## Stand dieser Version

**Lokale Demo, noch kein produktives Mehrbenutzersystem.** Der Ansichtswechsel ist keine Authentifizierung. Daten und laufende Buchungen liegen ausschließlich im localStorage des jeweiligen Browsers. Keine echten Mitarbeiterdaten verwenden. Browserdatenlöschung entfernt alle Einträge.

- Start, Pause und Feierabend sowie manuelle Einträge
- Urlaub/Krankheit, ganzer oder halber Tag
- Manuelle Erstbuchungen und Änderungen benötigen Verwaltungsfreigabe
- Ursprüngliche Werte gelten bis zur Genehmigung; Änderungsanträge bleiben mit Entscheidung erhalten
- Name und Zeitraum auf Nachweisen, formatierter XLSX-Download, PDF über Browserdruck
- Wochenenden bleiben auswählbar, bundesweite Feiertage werden markiert
- Mitarbeiter hinzufügen, Sollstunden und Empfängeradresse hinterlegen
- Offline-Oberfläche durch Service Worker

E-Mail-Button erklärt den noch fehlenden Versanddienst. Es wird kein erfolgreicher Versand simuliert. Der XLSX-Export enthält Spaltenbreiten, Zeitformate, Überschriften und Summen. Regionale Feiertage, Urlaubskonto, frei konfigurierbare Wochenpläne und ein verrechnetes Überstundenkonto sind noch nicht enthalten. Abwesenheiten werden mit dem hinterlegten Tagessoll angezeigt; Anspruchs- und Entgeltregeln werden noch nicht geprüft. In der Demo gibt es einen Eintrag pro Tag, keine mehreren Schichten.

## Lokal prüfen

`python3 -m http.server 8000`

Dann http://localhost:8000 öffnen. `npm test` prüft Berechnung und Feiertage; `npm run check` prüft Syntax.

## Nächster Schritt: betrieblicher Einsatz

Serverseitige Anmeldung und Rollen, zentrale Datenbank mit Zugriff nur auf eigene Mitarbeiterdaten, serverseitige Freigaben und unveränderlicher Änderungsverlauf, Datensicherung, konfigurierbarer Arbeitskalender, Abwesenheits-/Überstundenregeln sowie XLSX/PDF-Erzeugung und E-Mail-Versand mit Versandprotokoll. SMTP-Schlüssel gehören niemals in dieses öffentliche Repository oder Browsercode. Anbieter und Betriebskonfiguration sind noch festzulegen.

Überstundenspalte und Summe zeigen positive Mehrarbeit gegenüber dem Tagessoll (Montag bis Freitag). Am Wochenende und an bundesweiten Feiertagen beträgt das Soll 0. Urlaub und Krankheit erzeugen keine Überstunden. Kürzere Tage werden nicht gegengerechnet; kein tarifliches oder arbeitsvertragliches Überstundenkonto.
