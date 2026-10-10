# QR-Zeiterfassung

Die Verwaltung öffnet unter Einstellungen den gemeinsamen Zeitwerk-QR-Code.
Druckoptionen: ein A4-Aushang mit Anleitung oder eine einseitige QR-Karte
im Querformat mit 76 × 51 mm. Die Karte enthält ausschließlich den QR-Code.
Die Druckseite ist ebenfalls 76 × 51 mm groß. Originalgröße / 100 % wählen
und passendes Papierformat im Druckdialog einstellen.
Die Druckansicht folgt der gewählten App-Sprache.

Mitarbeiter öffnen „QR-Code scannen“, erlauben den Kamerazugriff und scannen
den Code. Danach stehen Arbeitsbeginn, Pause starten, Pause beenden und
Feierabend zur Auswahl. Nur passende Aktionen sind aktiv. Jede Auswahl gilt
für das angemeldete Konto, auch wenn die Verwaltung einen anderen Mitarbeiter
in der Übersicht ausgewählt hat. Nach jeder Buchung muss erneut gescannt
werden. Der Arbeitsbeginn und Pausen werden zentral im Timer gespeichert;
beim Feierabend entsteht der Nachweis ohne zusätzliche Freigabe.

Die Rückkamera wird bevorzugt, das Video läuft inline auf Mobilgeräten.
Die Kamera wird bei Schließen, erfolgreichem Scan und Wechsel in den
Hintergrund gestoppt. QR-Fotos können alternativ eingelesen werden.
Manuelle Einträge bleiben verfügbar. Ein Scan mit der normalen Handykamera
öffnet ebenfalls die App mit der Aktionsauswahl nach der Anmeldung.

Der statische QR-Code enthält ausschließlich die öffentliche App-Adresse
und Stationskennung; keine Mitarbeiterdaten und keine Zugangsdaten. Er ist
kein Anwesenheitsnachweis und kann auch als Foto verwendet werden.
Für das Buchen wird eine Internetverbindung benötigt. Die vorhandenen
Firebase-Regeln gelten weiterhin; ein neuer Backend-Deploy ist nicht nötig.

Scanner: jsQR 1.4.0; Generator: qrcode-generator 1.4.4, lokal unter vendor
mit MIT-Lizenzen. Es gibt keine zusätzliche Scanner-CDN-Abhängigkeit.

Validierung: synthetischer QR-Encode/Decode-Rundlauf, gültige Statuswechsel,
Pausenabzug, Doppelaktionen, Kontosperren, zweisprachige Druckvorlagen sowie
DOM-Prüfung des Kamera-Schließens. Physische Kamera- und Druckertests müssen
auf den Zielgeräten erfolgen.
