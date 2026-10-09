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

Mitarbeiter werden in der Verwaltung mit Name, E-Mail und Sollstunden eingeladen. Einrichtung siehe „Mitarbeiter per E-Mail einladen“ unten.

## 5. Prüfen

Mit Verwaltung anmelden, Mitarbeiterprofil anlegen. In einem getrennten Browser/privaten Fenster mit dem Mitarbeiter anmelden. Manuellen Eintrag einreichen; in der Verwaltung „Daten aktualisieren“ drücken, genehmigen; beim Mitarbeiter aktualisieren und Nachweis prüfen. Rollen werden aus Firestore geladen, nicht aus der gespeicherten Ansicht.

## Bestehende Demo-Daten

Die bisherigen lokalen Daten bleiben unter `zeitwerk-demo-v1` erhalten. Sie werden nicht automatisch hochgeladen oder fremden Konten zugeordnet. Die Firebase-Version startet mit den zentralen Daten. Ein geprüfter Import mit Zuordnung zu Benutzer-UIDs ist ein eigener nächster Schritt.

## Aktuelle Grenzen

Speichern benötigt Internet. Keine automatische Hintergrundsynchronisation; „Daten aktualisieren“ oder Neuladen lädt den zentralen Stand. Eine gleichzeitige Änderung derselben Daten wird abgewiesen. Direkter Exportversand per E-Mail fehlt weiterhin. Timer-Buchungen sind sofort wirksam, manuelle Einträge benötigen Freigabe. Die Regeln sichern Zugriff und Freigaberechte ab, gewährleisten aber keine manipulationssichere Stempeluhr. Geänderte Sollstunden wirken weiterhin rückwirkend auf die Anzeige von Überstunden.

Vor Verwendung echter Personaldaten mit zwei Konten Zugriffsschutz und Freigabeablauf prüfen. Die Regeln müssen erst im Firebase-Projekt veröffentlicht werden; ein GitHub-Push veröffentlicht sie nicht.


## Mitarbeiter per E-Mail einladen

Die Verwaltung trägt in der App Name, E-Mail und Sollstunden ein. Die Callable Function `inviteEmployee` prüft die Verwalterrolle serverseitig, erzeugt einen Authentication-Nutzer mit einem unbekannten Zufallspasswort und speichert das Mitarbeiterprofil unter dessen UID. Die App fordert anschließend die Firebase-E-Mail zum Zurücksetzen/Festlegen des Passworts an. Der Mitarbeiter legt über den Link sein eigenes Passwort fest und meldet sich in Zeitwerk an. Es gibt keine öffentliche Verwalterregistrierung.

Einmalig auf dem Rechner mit Node.js im Repository ausführen:

```sh
npm --prefix functions install
npx firebase-tools login
npx firebase-tools deploy --only functions,firestore:rules --project arbeitszeiterfassung-8ca47
```

Die Bereitstellung benötigt Zugriff auf das Firebase-Projekt und den Blaze-Tarif. Die Function liegt in europe-west3. Zugangsdaten gehören nicht in das Repository. In Firebase Authentication muss E-Mail/Passwort aktiviert sein. Die E-Mail-Vorlage „Passwort zurücksetzen“ kann für den Einladungsablauf angepasst werden; sie wird auch für „Passwort vergessen“ verwendet.

Schlägt der Versand nach erfolgreicher Anlage fehl, bleibt der Mitarbeiter bestehen. In „Mitarbeiter bearbeiten“ den Mitarbeiter auswählen und „Einladung erneut senden“ verwenden. Alternativ kann er auf der Anmeldeseite „Passwort vergessen“ nutzen. Bereits vorhandene Authentication-E-Mail-Adressen werden nicht automatisch übernommen. Eine erneute Einladung an bereits aktive Mitarbeiter ist ein Passwort-Reset. Firebase-Versandlimits gelten; die App bestätigt die Anforderung, nicht die Zustellung.

Prüfung nach Deployment: als Verwalter einen Testmitarbeiter einladen, E-Mail-Link öffnen, Passwort festlegen, in einem anderen Browser anmelden, eigenen Antrag einreichen und als Verwalter genehmigen. Ein Mitarbeiter darf die Callable Function nicht aufrufen können.
