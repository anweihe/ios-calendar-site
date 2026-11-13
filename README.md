# Month Atlas Website

Statische Website für die iPhone-App **Month Atlas**. Sie enthält die Produktseite, das Impressum und die gemeinsame Datenschutzerklärung für Website und App auf Deutsch und Englisch.

## Sprachen und Inhalte

- Design-Grundlage ist der letzte Commit vor den lokalen, uncommitteten Designänderungen: zweispaltige Hero-Sektion, Feature-Karten und schlichte Navigation.
- Deutsch: `/`, `/impressum/`, `/datenschutz/`
- Englisch: `/en/`, `/en/imprint/`, `/en/privacy/`
- Der DE/EN-Umschalter im Header führt zur entsprechenden Seite. Beim Einstieg auf der deutschen Startseite wird Deutsch für eine bevorzugte deutsche Browsersprache gewählt, sonst Englisch. Die manuelle Auswahl hat Vorrang und bleibt im aktuellen Tab gespeichert.
- Gemeinsame Produkttexte und Navigation: `src/i18n/translations.ts`; Sprachrouten: `src/i18n/routes.ts`.
- Beide Produktseiten verwenden `src/components/HomePage.astro`. Rechtliche Texte liegen in den jeweiligen Seitendateien; Änderungen bitte in beiden Sprachen nachführen.
- Fachbegriffe: [GLOSSARY.md](GLOSSARY.md). Abgestimmter Umfang, Bildquellen und Prüfnachweise: [docs/website-update.md](docs/website-update.md).

## Entwicklung

Voraussetzung: Node.js 22.12 oder neuer.

```sh
npm install
npm run dev
```

Die lokale Entwicklung läuft standardmäßig unter `http://localhost:4321/ios-calendar-site/`.

## Prüfung

```sh
npm test
```

Der Befehl führt die Astro-Typprüfung aus, erstellt den Produktionsbuild und prüft die erzeugten öffentlichen HTML-Seiten sowie die Sprachwahl.

## GitHub Pages

Die Website ist für `https://anweihe.github.io/ios-calendar-site/` konfiguriert. Der Workflow unter `.github/workflows/deploy.yml` veröffentlicht Änderungen an `main`, sobald in den Repository-Einstellungen unter **Pages** die Quelle **GitHub Actions** aktiviert wurde.
