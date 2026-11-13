export type Language = "de" | "en";
export type Page = "home" | "imprint" | "privacy";

const routes: Record<Page, Record<Language, string>> = {
  home: { de: "/", en: "/en/" },
  imprint: { de: "/impressum/", en: "/en/imprint/" },
  privacy: { de: "/datenschutz/", en: "/en/privacy/" },
};

export function sitePath(route: string) {
  return `${import.meta.env.BASE_URL.replace(/\/$/, "")}${route}`;
}

export function pagePath(page: Page, lang: Language) {
  return sitePath(routes[page][lang]);
}
