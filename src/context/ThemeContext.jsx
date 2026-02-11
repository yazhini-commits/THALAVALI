import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export default function ThemeProvider({ children }) {

  /* ---------------- INITIAL THEME DETECTION ---------------- */

  const getInitialTheme = () => {
    const saved = localStorage.getItem("theme");

    // user manually selected before
    if (saved === "dark") return true;
    if (saved === "light") return false;

    // otherwise follow system theme
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [dark, setDark] = useState(getInitialTheme);
  const [advancedMode, setAdvancedMode] = useState(() => {
    return localStorage.getItem("advancedMode") === "true";
  });

  /* ---------------- APPLY DARK MODE (IMPORTANT) ---------------- */

  useEffect(() => {
    const root = document.documentElement; // <html>

    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  /* ---------------- APPLY ADVANCED MODE ---------------- */

  useEffect(() => {
    const root = document.documentElement;

    if (advancedMode) {
      root.classList.add("advanced");
      localStorage.setItem("advancedMode", "true");
    } else {
      root.classList.remove("advanced");
      localStorage.setItem("advancedMode", "false");
    }
  }, [advancedMode]);

  /* ---------------- LISTEN SYSTEM THEME CHANGE ---------------- */

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = (e) => {
      if (!localStorage.getItem("theme")) {
        setDark(e.matches);
      }
    };

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  /* ---------------- PROVIDER ---------------- */

  return (
    <ThemeContext.Provider
      value={{
        dark,
        setDark,
        advancedMode,
        setAdvancedMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
