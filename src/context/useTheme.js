import { useEffect, useState } from "react";

const STORAGE_KEY = "fourthings-theme";

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// CSS keys off document.documentElement's data-theme attribute (see the
// [data-theme="dark"] overrides in index.css), so any component using this
// hook drives the theme globally regardless of who called it.
export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return [theme, setTheme];
}
