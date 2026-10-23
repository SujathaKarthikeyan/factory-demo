import { describe, expect, it } from "vitest";
import {
  THEME_STORAGE_KEY,
  parseTheme,
  persistTheme,
  readStoredTheme,
  resolveTheme,
  themeInitScript,
  type ThemeStorage,
} from "./theme";

function memoryStorage(initial: Record<string, string> = {}): ThemeStorage & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

const throwingStorage: ThemeStorage = {
  getItem: () => {
    throw new Error("storage disabled");
  },
  setItem: () => {
    throw new Error("storage disabled");
  },
};

describe("theme resolution", () => {
  it("follows the system preference when nothing is stored", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });

  it("lets a stored explicit choice override the system preference", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("ignores invalid stored values", () => {
    expect(parseTheme("sepia")).toBeNull();
    expect(parseTheme("")).toBeNull();
    expect(parseTheme(null)).toBeNull();
    expect(readStoredTheme(memoryStorage({ [THEME_STORAGE_KEY]: "DARK" }))).toBeNull();
    expect(resolveTheme(readStoredTheme(memoryStorage({ [THEME_STORAGE_KEY]: "sepia" })), true)).toBe("dark");
  });
});

describe("theme persistence", () => {
  it("persists an explicit choice and reads it back", () => {
    const storage = memoryStorage();
    persistTheme(storage, "dark");
    expect(storage.data[THEME_STORAGE_KEY]).toBe("dark");
    expect(readStoredTheme(storage)).toBe("dark");
    expect(resolveTheme(readStoredTheme(storage), false)).toBe("dark");
  });

  it("treats unavailable storage as no stored choice", () => {
    expect(readStoredTheme(null)).toBeNull();
    expect(readStoredTheme(throwingStorage)).toBeNull();
    expect(() => persistTheme(throwingStorage, "light")).not.toThrow();
  });
});

describe("pre-paint theme script", () => {
  function runScript(stored: string | null, prefersDark: boolean, storageThrows = false) {
    const root = { dataset: {} as Record<string, string>, style: {} as Record<string, string> };
    const localStorage = storageThrows ? throwingStorage : memoryStorage(stored === null ? {} : { [THEME_STORAGE_KEY]: stored });
    const matchMedia = (query: string) => ({ matches: query === "(prefers-color-scheme: dark)" && prefersDark });
    new Function("document", "localStorage", "matchMedia", themeInitScript)({ documentElement: root }, localStorage, matchMedia);
    return root;
  }

  it("applies the same resolution as resolveTheme before first paint", () => {
    for (const stored of [null, "light", "dark", "sepia"]) {
      for (const prefersDark of [true, false]) {
        const root = runScript(stored, prefersDark);
        const expected = resolveTheme(parseTheme(stored), prefersDark);
        expect(root.dataset.theme).toBe(expected);
        expect(root.style.colorScheme).toBe(expected);
      }
    }
  });

  it("falls back to the system preference when storage throws", () => {
    expect(runScript(null, true, true).dataset.theme).toBe("dark");
  });
});
