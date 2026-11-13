/* Progressive language selection. URLs and native links work without this script. */
(() => {
  const { lang, dataset } = document.documentElement;
  const key = "month-atlas-language";
  const valid = (value) => value === "de" || value === "en";
  const remember = (value) => {
    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  };
  let saved;
  try {
    saved = sessionStorage.getItem(key);
  } catch {
    // Browsers may disable storage; language links still work.
  }
  const explicit = new URL(location.href).searchParams.get("lang");
  const browser = navigator.languages?.[0] || navigator.language || "";
  const preferred = valid(explicit) ? explicit : valid(saved) ? saved : /^de(?:-|$)/i.test(browser) ? "de" : "en";

  // Detect only on the unprefixed home page, never on explicit language deep links.
  if (dataset.page === "home" && lang === "de" && preferred === "en") {
    remember("en");
    const target = new URL(dataset.homeEn, location.href);
    target.search = location.search;
    target.hash = location.hash;
    location.replace(target.href);
    return;
  }
  remember(lang);

  document.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("a[data-language]") : null;
    if (!link || !valid(link.dataset.language)) return;
    if (!remember(link.dataset.language)) {
      // Preserve explicit choices even when sessionStorage is blocked.
      const target = new URL(link.href);
      target.searchParams.set("lang", link.dataset.language);
      link.href = target.href;
    }
  });
})();
