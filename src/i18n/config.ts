export const locales = ["az", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "az";
export const LOCALE_COOKIE = "ecotrail-locale";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Prefix an app path with the locale: localePath("en", "/trails") → "/en/trails". */
export function localePath(locale: Locale, path = "/"): string {
  return `/${locale}${path === "/" ? "" : path}`;
}

/** Swap the locale in a pathname, keeping the rest: "/az/trails/x" → "/en/trails/x". */
export function switchLocalePath(pathname: string, locale: Locale): string {
  const rest = pathname.replace(/^\/(az|en)(?=\/|$)/, "");
  return localePath(locale, rest || "/");
}

/** Fill {placeholders} in a dictionary string. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}
