# Firebase einrichten

Projekt: arbeitszeiterfassung-8ca47. Die Web-Konfiguration ist öffentlich; Passwörter/Service-Account-Schlüssel niemals ins Repository schreiben.

## 1. Authentication

Firebase Console → Build → Authentication → Jetzt starten → Anmeldemethode → E-Mail/Passwort aktivieren.
Unter Einstellungen → Autorisierte Domains `snakefreak85.github.io` hinzufügen.
Unter Nutzer den ersten Verwaltungsbenutzer mit E-Mail und Passwort anlegen. Die Benutzer-UID kopieren. Passwort nicht an den Entwickler schicken.

## 2. Firestore

Build → Firestore Database → Datenbank erstellen → Standard-Datenbank `(default)` → Produktionsmodus. Eine geeignete EU-Region wählen, beispielsweise Frankfurt, falls verfügbar.
Unter Regeln den vollständigen Inhalt von `firestore.rules` einfügen und veröffentlichen. Niemals offene Testregeln verwenden.
Alternativ mit angemeldeter Firebase CLI: `firebase deploy --only firestore:rules`.

## 3. Erstes Verwaltungsprofil

Unter Firestore → Daten Sammlung `users` erstellen. Dokument-ID ist exakt die UID des Verwaltungsbenutzers aus Authentication.
Felder:

| Feld | Typ | Beispiel |
|---|---|---|
| name | string | Sascha Thiele |
| daily | number | 480 |
| role | string | admin |

Dieses erste Profil wird in der Console angelegt. Die App kann sich selbst keine Verwaltungsrechte geben.

## 4. Mitarbeiter

Für jeden Mitarbeiter zuerst unter Authentication → Nutzer einen Zugang erstellen. Anschließend in Zeitwerk → Verwaltung → Einstellungen → Mitarbeiter hinzufügen die zugehörige UID, Namen und Sollstunden eintragen. Neue Profile erhalten ausschließlich die Rolle `employee`. Mitarbeiter sehen nur eigene Daten und können bestehende Arbeitszeitnachweise nicht direkt überschreiben.

## 5. Prüfen

Mit Verwaltung anmelden, Mitarbeiterprofil anlegen. In einem getrennten Browser/privaten Fenster mit dem Mitarbeiter anmelden. Manuellen Eintrag einreichen; in der Verwaltung „Daten aktualisieren“ drücken, genehmigen; beim Mitarbeiter aktualisieren und Nachweis prüfen. Rollen werden aus Firestore geladen, nicht aus der gespeicherten Ansicht.

## Bestehende Demo-Daten

Die bisherigen lokalen Daten bleiben unter `zeitwerk-demo-v1` erhalten. Sie werden nicht automatisch hochgeladen oder fremden Konten zugeordnet. Die Firebase-Version startet mit den zentralen Daten. Ein geprüfter Import mit Zuordnung zu Benutzer-UIDs ist ein eigener nächster Schritt.

## Aktuelle Grenzen

Speichern benötigt Internet. Keine automatische Hintergrundsynchronisation; „Daten aktualisieren“ oder Neuladen lädt den zentralen Stand. Eine gleichzeitige Änderung derselben Daten wird abgewiesen. Direkter E-Mail-Versand fehlt weiterhin. Timer-Buchungen sind sofort wirksam, manuelle Einträge benötigen Freigabe. Die Regeln sichern Zugriff und Freigaberechte ab, gewährleisten aber keine manipulationssichere Stempeluhr. Geänderte Sollstunden wirken weiterhin rückwirkend auf die Anzeige von Überstunden.

Vor Verwendung echter Personaldaten mit zwei Konten Zugriffsschutz und Freigabeablauf prüfen. Die Regeln müssen erst im Firebase-Projekt veröffentlicht werden; ein GitHub-Push veröffentlicht sie nicht.
