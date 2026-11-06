# Month Atlas Website

Statische Website für die iPhone-App **Month Atlas**. Sie enthält die Produktseite, das Impressum und die gemeinsame Datenschutzerklärung für Website und App.

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

Der Befehl führt die Astro-Typprüfung aus, erstellt den Produktionsbuild und prüft die erzeugten öffentlichen HTML-Seiten.

## GitHub Pages

Die Website ist für `https://anweihe.github.io/ios-calendar-site/` konfiguriert. Der Workflow unter `.github/workflows/deploy.yml` veröffentlicht Änderungen an `main`, sobald in den Repository-Einstellungen unter **Pages** die Quelle **GitHub Actions** aktiviert wurde.
