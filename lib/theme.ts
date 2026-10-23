export type Theme = "light" | "dark";

export type ThemeStorage = Pick<Storage, "getItem" | "setItem">;

export const THEME_STORAGE_KEY = "reel-good-theme";

export function parseTheme(value: unknown): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}

export function resolveTheme(stored: Theme | null, prefersDark: boolean): Theme {
  return stored ?? (prefersDark ? "dark" : "light");
}

// Storage can be missing or throw (private windows, blocked site data); treat that as no choice.
export function readStoredTheme(storage: ThemeStorage | null): Theme | null {
  try {
    return parseTheme(storage?.getItem(THEME_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function persistTheme(storage: ThemeStorage | null, theme: Theme): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The choice still applies for this page view.
  }
}

// Runs inline in <head> before first paint so a reload never flashes the wrong theme.
// Mirrors resolveTheme; lib/theme.test.ts checks the two agree.
export const themeInitScript = `(function () {
  var stored = null;
  try { stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)}); } catch (e) {}
  var theme = stored === "light" || stored === "dark"
    ? stored
    : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  var root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
})();`;
