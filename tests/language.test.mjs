import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const source = await readFile(new URL("../public/language.js", import.meta.url), "utf8");
const root = "https://anweihe.github.io/ios-calendar-site/";

function visit({
  lang = "de", page = "home", browser = ["en-US"], href = root,
  stored = new Map(), blocked = false,
} = {}) {
  const listeners = new Map();
  const redirects = [];
  class Element {
    constructor(language, destination) {
      this.dataset = { language };
      this.href = destination;
    }
    closest() { return this; }
  }
  runInNewContext(source, {
    URL,
    Element,
    document: {
      documentElement: { lang, dataset: { page, homeEn: "/ios-calendar-site/en/" } },
      addEventListener: (name, callback) => listeners.set(name, callback),
    },
    navigator: { languages: browser, language: browser[0] ?? "" },
    sessionStorage: {
      getItem(key) {
        if (blocked) throw new Error("Storage blocked");
        return stored.get(key) ?? null;
      },
      setItem(key, value) {
        if (blocked) throw new Error("Storage blocked");
        stored.set(key, value);
      },
    },
    location: {
      href,
      search: new URL(href).search,
      hash: new URL(href).hash,
      replace: (destination) => redirects.push(destination),
    },
  });
  return {
    redirects, stored,
    click(language, destination) {
      const link = new Element(language, destination);
      listeners.get("click")?.({ target: link });
      return link.href;
    },
  };
}

test("German browser languages stay German, including regional variants", () => {
  for (const language of ["de", "de-DE", "de-AT", "de-CH", "DE-de"]) {
    const result = visit({ browser: [language] });
    assert.deepEqual(result.redirects, []);
    assert.equal(result.stored.get("month-atlas-language"), "de");
  }
});

test("other preferred browser languages and unavailable languages select English", () => {
  for (const browser of [["en-US"], ["fr-FR"], ["ja"], ["en-GB", "de-DE"], []]) {
    assert.deepEqual(visit({ browser }).redirects, [`${root}en/`]);
  }
});

test("automatic redirect preserves the base path, query parameters and section", () => {
  const result = visit({ href: `${root}?campaign=test#calendar_workflow` });
  assert.deepEqual(result.redirects, [`${root}en/?campaign=test#calendar_workflow`]);
});

test("explicit English URLs never redirect to German", () => {
  const result = visit({ lang: "en", browser: ["de-DE"], href: `${root}en/` });
  assert.deepEqual(result.redirects, []);
  assert.equal(result.stored.get("month-atlas-language"), "en");
});

test("direct links to legal pages retain their language", () => {
  for (const lang of ["de", "en"]) {
    const result = visit({
      lang, page: "privacy", browser: [lang === "de" ? "en-US" : "de-DE"],
      href: `${root}${lang === "de" ? "datenschutz/" : "en/privacy/"}`,
    });
    assert.deepEqual(result.redirects, []);
  }
});

test("a manual German choice overrides English detection throughout the tab", () => {
  const english = visit({ lang: "en", href: `${root}en/` });
  assert.equal(english.click("de", root), root, "native link stays usable");
  const german = visit({ stored: english.stored });
  assert.deepEqual(german.redirects, []);
  assert.equal(german.stored.get("month-atlas-language"), "de");
});

test("a manual English choice overrides a German browser", () => {
  const german = visit({ browser: ["de"] });
  german.click("en", `${root}en/`);
  const revisit = visit({ browser: ["de"], stored: german.stored });
  assert.deepEqual(revisit.redirects, [`${root}en/`]);
});

test("each tab can start with its own browser-based choice", () => {
  const first = visit({ browser: ["de"] });
  first.click("en", `${root}en/`);
  assert.deepEqual(visit({ browser: ["de"] }).redirects, []);
});

test("invalid stored values do not replace browser detection", () => {
  const stored = new Map([["month-atlas-language", "invalid"]]);
  assert.deepEqual(visit({ browser: ["de"], stored }).redirects, []);
});

test("blocked session storage does not break detection or manual language links", () => {
  assert.deepEqual(visit({ blocked: true }).redirects, [`${root}en/`]);
  const english = visit({ lang: "en", href: `${root}en/`, blocked: true });
  const germanLink = english.click("de", root);
  assert.equal(germanLink, `${root}?lang=de`);
  assert.deepEqual(visit({ href: germanLink, blocked: true }).redirects, []);
});

test("an explicit URL selection takes priority over an older tab preference", () => {
  const stored = new Map([["month-atlas-language", "en"]]);
  assert.deepEqual(visit({ href: `${root}?lang=de`, stored }).redirects, []);
  assert.equal(stored.get("month-atlas-language"), "de");
});
