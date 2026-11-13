import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const basePath = "/ios-calendar-site";
const origin = "https://anweihe.github.io";
const pagePairs = [
  { de: "/", en: "/en" },
  { de: "/impressum", en: "/en/imprint" },
  { de: "/datenschutz", en: "/en/privacy" },
];
const publicPath = (route) => `${basePath}${route === "/" ? "/" : `${route}/`}`;

async function readPage(route) {
  const path = route === "/" ? "dist/index.html" : `dist${route}/index.html`;
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("the public pages render with consistent navigation", async () => {
  for (const lang of ["de", "en"]) {
    for (const pair of pagePairs) {
      const html = await readPage(pair[lang]);
      assert.ok(html.includes(`<html lang="${lang}"`));
      assert.equal([...html.matchAll(/<h1\b/g)].length, 1, "each page has exactly one main heading");
      for (const destination of pagePairs) {
        assert.ok(html.includes(`href="${publicPath(destination[lang])}"`));
      }
      // The only script detects language; the original design needs no motion/menu script.
      const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
      assert.equal(scripts.length, 1);
      assert.ok(scripts[0][1].includes(`src="${basePath}/language.js"`));
      await access(new URL("../dist/language.js", import.meta.url));
      assert.doesNotMatch(html, /<(?:img|script)[^>]+src="https?:\/\//i);
      assert.doesNotMatch(
        html,
        /<link(?=[^>]+rel="(?:stylesheet|preload)")[^>]+href="https?:\/\//i,
      );
    }
  }
});

test("both home pages describe the released features and link to the App Store", async () => {
  for (const lang of ["de", "en"]) {
    const html = await readPage(lang === "de" ? "/" : "/en");

    assert.match(html, /<h1[^>]*>[^<]*Month Atlas[^<]*<\/h1>/);
    const copy = lang === "de"
      ? ["für iPhone ab iOS 17", "Termine bearbeiten", "Kalender anpassen", "Termintitelsuche", "Eigene Terminmitteilungen", "Ferienmarkierungen", "Verstellbarer Tagesbereich", "Deutsch und Englisch"]
      : ["iPhone with iOS 17 or later", "Edit events", "Customize calendars", "Event title search", "Local event notifications", "Holiday highlights", "Adjustable day panel", "German and English"];
    for (const text of copy) assert.ok(html.includes(text), `missing ${lang} copy: ${text}`);
    assert.match(html, new RegExp(`src="${basePath}/app-icon\\.png"`));
    const captures = ["month-overview", "adaptive-month", "dark-month"];
    for (const name of captures) {
      assert.match(html, new RegExp(`src="${basePath}/screenshots/${lang}/${name}\\.png"`));
      const data = await readFile(new URL(`../dist/screenshots/${lang}/${name}.png`, import.meta.url));
      assert.deepEqual(data.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      assert.equal(data.readUInt32BE(16), 1320);
      assert.equal(data.readUInt32BE(20), 2868);
    }
    assert.ok(html.includes(`href="https://apps.apple.com/${lang === "de" ? "de" : "us"}/app/month-atlas/id6829733469"`));
    assert.match(html, /href="#calendar_workflow"/);

    await Promise.all([
      access(new URL("../dist/app-icon.png", import.meta.url)),
      access(new URL("../dist/month-atlas-screenshot.png", import.meta.url)),
    ]);
  }
});

test("the committed hero, cards and simple navigation remain the design baseline", async () => {
  for (const route of ["/", "/en"]) {
    const html = await readPage(route);
    assert.match(html, /class="hero site-shell min-h-\[42rem\] py-16 lg:py-24"/);
    assert.match(html, /hero-content grid/);
    assert.match(html, /phone-shot h-auto w-full rounded-\[1\.65rem\]/);
    assert.match(html, /class="card border-base-300 bg-base-100 border shadow-sm"/);
    assert.equal([...html.matchAll(/class="card border-base-300 bg-base-100 border shadow-sm"/g)].length, 8);
    assert.match(html, /class="navbar site-shell/);
    assert.match(html, /class="footer footer-horizontal/);
    assert.doesNotMatch(html, /intro-stage|product-intro|workflow-media|site-menu|data-reveal|data-hero-entrance/);
  }
});

test("product sections and native disclosures remain usable without scripts", async () => {
  const html = await readPage("/");
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, "element IDs are unique");
  for (const fragment of [...html.matchAll(/href="#([^"]+)"/g)]) {
    assert.ok(ids.includes(fragment[1]), `missing local destination: ${fragment[1]}`);
  }
  const questions = [...html.matchAll(/<details class="question[^"]*"([^>]*)>/g)];
  assert.equal(questions.length, 7);
  assert.match(questions[0][1], /\bopen\b/);
  assert.ok(questions.slice(1).every((question) => !/\bopen\b/.test(question[1])));
  assert.match(html, /Auf Wunsch bekommen volle Wochen mehr Platz/);
  assert.match(html, /Aptabase erhält ausgewählte Nutzungsaktionen/);
  assert.match(html, /keine Kalendernamen oder Termininhalte/);
  assert.match(html, /Notizen, Orte und URLs werden nicht durchsucht/);
  assert.match(html, /Eine lückenlose Zustellung ist nicht garantiert/);
  assert.match(html, /Feriendaten sind nicht eingebaut/);
});

test("language links, document metadata and alternates pair the equivalent pages", async () => {
  for (const pair of pagePairs) {
    for (const lang of ["de", "en"]) {
      const html = await readPage(pair[lang]);
      assert.ok(html.includes(`<link rel="canonical" href="${origin}${publicPath(pair[lang])}"`));
      for (const alternate of ["de", "en"]) {
        assert.ok(html.includes(`<link rel="alternate" hreflang="${alternate}" href="${origin}${publicPath(pair[alternate])}"`));
      }
      assert.ok(html.includes(`<link rel="alternate" hreflang="x-default" href="${origin}${publicPath(pair.de)}"`));
      assert.ok(html.includes(`property="og:locale" content="${lang === "de" ? "de_DE" : "en_US"}"`));
      const switcher = html.match(/<nav class="language-switcher"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
      assert.ok(switcher, "a visible native-link language switcher exists");
      for (const alternate of ["de", "en"]) {
        const anchor = switcher.match(new RegExp(`<a\\b[^>]*data-language="${alternate}"[^>]*>`))?.[0];
        assert.ok(anchor?.includes(`href="${publicPath(pair[alternate])}"`));
        assert.ok(anchor.includes(`lang="${alternate}"`));
        assert.ok(anchor.includes(`hreflang="${alternate}"`));
        assert.equal(anchor.includes('aria-current="page"'), alternate === lang);
      }
      if (lang === "en") {
        assert.doesNotMatch(html, /Menü|Fragen zur App|Datenschutz lesen|Kalender anpassen|Zum Inhalt springen/);
      }
    }
  }
});

test("all local links, images and fragments resolve across both languages", async () => {
  for (const route of pagePairs.flatMap((pair) => [pair.de, pair.en])) {
    const html = await readPage(route);
    for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (!href.startsWith(basePath) && !href.startsWith("#")) continue;
      const target = new URL(href, `${origin}${publicPath(route)}`);
      const relative = target.pathname.slice(basePath.length);
      const file = relative.endsWith("/") ? `${relative}index.html` : relative;
      const data = await readFile(new URL(`../dist${file}`, import.meta.url));
      if (target.hash) {
        assert.ok(data.toString().includes(`id="${target.hash.slice(1)}"`), `missing destination ${href}`);
      }
    }
  }
});

test("the imprint exposes the required operator contact", async () => {
  const html = await readPage("/impressum");

  assert.match(html, /Angaben gemäß § 5 DDG/);
  assert.match(html, /André Weihe/);
  assert.match(html, /mailto:andre@andreweihe\.de/);
});

test("the privacy page covers the website and app data flows", async () => {
  const html = await readPage("/datenschutz");

  assert.match(html, /GitHub Pages/);
  assert.match(html, /IP-Adresse des Besuchers/);
  assert.match(html, /USA und weiteren Ländern/);
  assert.match(html, /Standardvertragsklauseln/);
  assert.match(html, /EventKit/);
  assert.match(html, /vollen Zugriff auf Kalenderereignisse/);
  assert.match(html, /UserDefaults/);
  assert.match(html, /Kalenderanbieter[^.]*synchronisieren/);
  assert.match(html, /Aptabase/);
  assert.match(html, /App-Start/);
  assert.match(html, /Gerätemodell/);
  assert.match(html, /Tinybird Data S\.L\./);
  assert.match(html, /Amazon Web Services EMEA SARL/);
  assert.match(html, /höchstens fünf Jahre/);
  assert.match(html, /keine Kalendernamen|keine Namen von Kalendern/);
  assert.match(html, /Auskunft über deine verarbeiteten/);
  assert.match(html, /Widerspruch gegen Verarbeitungen/);
  assert.match(html, /andre@andreweihe\.de/);

  const aptabaseSection = html.match(
    /<h3>Datensparsame Nutzungsanalyse mit Aptabase<\/h3>([\s\S]*?)<h2>4\./,
  );
  assert.ok(aptabaseSection, "Aptabase privacy section is present");
  assert.match(aptabaseSection[1], /Art\. 6 Abs\. 1 lit\. f DSGVO/);
});

test("both legal translations include contact details and current data flows", async () => {
  const german = await readPage("/datenschutz");
  const english = await readPage("/en/privacy");
  assert.equal([...english.matchAll(/<h2>/g)].length, [...german.matchAll(/<h2>/g)].length);
  assert.equal([...english.matchAll(/<h3>/g)].length, [...german.matchAll(/<h3>/g)].length);
  for (const html of [german, english]) {
    for (const term of ["sessionStorage", "EventKit", "UserDefaults", "Aptabase", "Tinybird Data S.L.", "Amazon Web Services EMEA SARL"]) {
      assert.ok(html.includes(term), `missing privacy topic: ${term}`);
    }
    assert.match(html, /mailto:andre@andreweihe\.de/);
    assert.doesNotMatch(html, /Feiertagskalender/);
  }
  assert.match(german, /Lokale Terminmitteilungen/);
  assert.match(english, /Local event notifications/);
  assert.match(english, /lock screen/);
  assert.match(english, /no more than five years/);
  const imprint = await readPage("/en/imprint");
  assert.match(imprint, /Section 5 DDG/);
  assert.match(imprint, /André Weihe/);
  assert.match(imprint, /70736 Fellbach/);
});
