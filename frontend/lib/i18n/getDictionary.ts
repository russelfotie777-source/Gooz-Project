import type { Locale } from "./config";
import frDict, { type Dictionary } from "./dictionaries/fr";
import enDict from "./dictionaries/en";

// Server-side counterpart to I18nProvider's own DICTIONARIES map (which is
// client-only — see its comment) — for generateMetadata functions, which
// run on the server and have no access to the client I18nProvider context,
// but the dictionary modules themselves are plain data, safe to import here
// too.
const DICTIONARIES: Record<Locale, Dictionary> = { fr: frDict, en: enDict };

export function getDictionary(lang: Locale): Dictionary {
  return DICTIONARIES[lang];
}
