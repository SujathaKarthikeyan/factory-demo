"use client";

import { useSyncExternalStore } from "react";
import { parseTheme, persistTheme, type Theme } from "@/lib/theme";

// The pre-paint script in app/layout.tsx owns the initial value of <html data-theme>.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const getSnapshot = () => parseTheme(document.documentElement.dataset.theme);
const getServerSnapshot = () => null;

function storage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const next: Theme = theme === "dark" ? "light" : "dark";

  function toggle() {
    const root = document.documentElement;
    root.dataset.theme = next;
    root.style.colorScheme = next;
    persistTheme(storage(), next);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      disabled={theme === null}
      aria-label={theme === null ? "Theme" : `Switch to ${next} theme`}
      title={theme === null ? undefined : `Switch to ${next} theme`}
    >
      <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
    </button>
  );
}
