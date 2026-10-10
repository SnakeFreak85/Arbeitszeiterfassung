# Push-Benachrichtigungen

Neue Dokumente mit Status `pending` in `requests` lösen `notifyApprovalRequest`
aus. Änderungen an bestehenden Anträgen und neue direkt gespeicherte Arbeitstage
lösen keine Push-Nachricht aus. Alle aktiven Verwalter erhalten Nachrichten auf
jedem von ihnen aktivierten Gerät. Die Sprache wird pro Gerät gespeichert.

## Firebase aktivieren

1. Projekteinstellungen → Cloud Messaging → Webkonfiguration →
   Web-Push-Zertifikate → Schlüsselpaar generieren.
2. Den öffentlichen Schlüssel in `push-config.js` als `webPushKey` eintragen.
   Kein privater Schlüssel oder Service-Account gehört ins Repository.
3. Aktuelle `functions/index.js`, `functions/push-service.js` und
   `firestore.rules` lokal herunterladen und veröffentlichen:

   ```cmd
   npx firebase-tools deploy --only functions:notifyApprovalRequest,firestore:rules --project arbeitszeiterfassung-8ca47
   ```

4. In der App als Verwalter unter Einstellungen Benachrichtigungen aktivieren.
   Auf jedem weiteren Gerät wiederholen. Auf iPhone die zum Home-Bildschirm
   hinzugefügte App verwenden (iOS 16.4 oder neuer).
5. Mit einem Mitarbeiter einen neuen Urlaubs- oder Änderungsantrag einreichen.
   Push im Hintergrund, beim Antippen Freigaben und den Live-Zähler prüfen.

Der bestehende Service Worker verarbeitet die FCM-Datennachricht direkt als
Web-Push und zeigt genau eine Benachrichtigung. Das Antippen fokussiert eine
bereits geöffnete App oder öffnet `#approvals`. Die Navigation lädt aktuelle
Anträge. Der Zähler nutzt einen Firestore-Listener ohne das lokale Schreib-
Baseline zu verändern. Abmelden entfernt das aktivierte Gerät vom Konto.
Ungültige Tokens werden beim Versand entfernt. Veraltete Geräte können unter
Einstellungen deaktiviert werden. Der Server versendet nur für aktive Admins.

Eine erfolgreiche Einrichtung und Zustellung muss auf den echten Geräten
geprüft werden. Bisher wurden Versandlogik und Service-Worker-Verhalten lokal
mit simulierten Firebase-/Browser-Schnittstellen geprüft.
