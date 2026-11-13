# Website-Erweiterung: Month Atlas 1.1

## Bestätigter Umfang

- Design-Grundlage ist ausdrücklich der letzte Commit vor den lokalen,
  uncommitteten Designänderungen (`5708152`), nicht der lokale Editorial-Entwurf.
  Zweispaltige Hero-Sektion, ursprüngliche Feature-Karten, schlichte Navigation,
  Fußzeile, Farbthemen und Typografie bleiben die Grundlage; kein Redesign.
- Die später ergänzten Funktionen und beide Sprachen bleiben erhalten.
  Lokale, nun ungenutzte Entwurfsdateien werden nicht pauschal gelöscht.
- Nur veröffentlichte Funktionen bewerben: Termintitelsuche, eigene lokale
  Terminmitteilungen, Ferienmarkierungen, verstellbarer Tagesbereich und
  Deutsch/Englisch in der App.
- Direkten App-Store-Link ergänzen, „App entdecken“ erhalten.
- Alle drei Seiten einschließlich Metadaten und Navigation auf Deutsch und Englisch.
- Echte vorhandene App-Aufnahmen pro Sprache verwenden; keine neuen Simulatoraufnahmen.

## Sprachwahl

- DE/EN-Pille wie bei Quicklog Baby, an Month Atlas' bestehende Farben angepasst.
- Deutsche URLs unverändert; Englisch unter `/en/`, mit `/en/imprint/`
  und `/en/privacy/` für die rechtlichen Seiten.
- Sprachwechsel führt zur entsprechenden Seite.
- Nur beim Einstieg auf der deutschen Startseite: bevorzugte Browsersprache
  `de` einschließlich regionaler Varianten → Deutsch, sonst Englisch.
- Direkte Unterseiten behalten ihre Sprache. Manuelle Auswahl hat Vorrang;
  gespeichert ausschließlich in `sessionStorage` für den aktuellen Tab.
- Keine Cookies oder dauerhafte Sprachspeicherung. Ist Sitzungsspeicher gesperrt,
  sichert ein `lang`-URL-Parameter die manuelle Wahl.
- Ohne JavaScript bleiben beide Sprachen und der Umschalter zugänglich;
  automatische Erkennung entfällt.

## Quellen und Grenzen

- Öffentliche Version 1.1, veröffentlicht am 11. November 2026:
  https://apps.apple.com/de/app/month-atlas/id6829733469
- Öffentliche Metadaten: https://itunes.apple.com/lookup?id=6829733469&country=de
- App-Fachmodell: `../ios-calendar/GLOSSARY.md`; Funktionsdokumente:
  `TERMINMITTEILUNGEN.md`, `HOLIDAY-CALENDAR.md`,
  `DAY-PANEL.md`, `LOCALIZATION.md` im dortigen `docs/`-Verzeichnis.
  Suchumfang zusätzlich in `App/EventSearch.swift` und `App/CalendarStore.swift`.
- Suche: nur Titel, ausgewählte Kalender ohne Ferienkalender, ±1 Jahr.
- Ferienkalender: vorhandene Kalenderdaten, keine eingebauten Ferienlisten.
- Terminmitteilungen: iOS-Berechtigung erforderlich; doppelte Mitteilungen mit
  Apple Kalender möglich; keine lückenlose oder unbegrenzt aktuelle Zustellung.
- Screenshots: unveränderte Originalaufnahmen vom 10. November 2026 aus
  `../ios-calendar/marketing/app-store/screenshots/{de-DE,en-US}/raw/1320x2868/`.
  Englische Bilder zeigen die US-Region, keine britische Lokalisierung.
  `05-light`, `03-adaptive` und `01-month` werden für Monatsübersicht, adaptive
  Höhe und Dunkelmodus verwendet. Bereits kopierte Kalenderauswahl- und
  Editoraufnahmen bleiben als Dateien erhalten. Neue Funktionen werden
  textlich in Karten des ursprünglichen Designs erklärt.

## Prüfung

- `npm test`: Astro-Typprüfung, statischer Build aller sechs Seiten und 20 Tests.
- Automatisierte Tests für Browser-Sprachwahl, manuelle Priorität, Sitzungsspeicher,
  gesperrten Speicher, Direktlinks, Sprachalternativen, lokale Ziele und Inhalte.
- Zusätzlich in Chromium geprüft: Browserlokalisierungen de-DE, de-AT, en-US
  und fr-FR; Sprachwechsel mit Neuladen; Wechsel zwischen rechtlichen Seiten;
  beide Sprachen im Hell-/Dunkelmodus bei 320, 375, 768, 1280 und 1440 Pixeln.
- Keine horizontalen Überläufe oder Browserfehler; Sprachlinks mindestens 44 × 44 Pixel.
  Sprachlinks und FAQ zusätzlich mit deaktiviertem JavaScript geprüft.
