import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const basePath = "/ios-calendar-site";

async function readPage(route) {
  const path = route === "/" ? "dist/index.html" : `dist${route}/index.html`;
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("the public pages render with consistent navigation", async () => {
  const pages = await Promise.all([
    readPage("/"),
    readPage("/impressum"),
    readPage("/datenschutz"),
  ]);

  for (const html of pages) {
    assert.match(html, /<html lang="de"/);
    assert.match(html, new RegExp(`href="${basePath}/"`));
    assert.match(html, new RegExp(`href="${basePath}/impressum/"`));
    assert.match(html, new RegExp(`href="${basePath}/datenschutz/"`));
    assert.doesNotMatch(html, /<script(?:\s|>)/i);
    assert.doesNotMatch(html, /<(?:img|script)[^>]+src="https?:\/\//i);
    assert.doesNotMatch(
      html,
      /<link(?=[^>]+rel="(?:stylesheet|preload)")[^>]+href="https?:\/\//i,
    );
  }
});

test("the home page describes Month Atlas without an unavailable store link", async () => {
  const html = await readPage("/");

  assert.match(html, /<h1[^>]*>[^<]*Month Atlas[^<]*<\/h1>/);
  assert.match(html, /Für iPhone ab iOS 17/);
  assert.match(html, /Monatsansicht/);
  assert.match(html, /Termine bearbeiten/);
  assert.match(html, /Kalender anpassen/);
  assert.match(html, new RegExp(`src="${basePath}/app-icon\\.png"`));
  assert.match(html, new RegExp(`src="${basePath}/month-atlas-screenshot\\.png"`));
  assert.doesNotMatch(html, /apps\.apple\.com/);

  await Promise.all([
    access(new URL("../dist/app-icon.png", import.meta.url)),
    access(new URL("../dist/month-atlas-screenshot.png", import.meta.url)),
  ]);
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
