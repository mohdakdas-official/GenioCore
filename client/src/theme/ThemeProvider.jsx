import { createContext, useLayoutEffect, useState } from "react";

export const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = "neuaspire-theme";

const VALID_THEMES = ["dark", "light", "system"];

const getInitialTheme = () => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (VALID_THEMES.includes(storedTheme)) {
    return storedTheme;
  }

  return "system";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useLayoutEffect(() => {
    const root = document.documentElement;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const resolvedTheme =
        theme === "system" ? (mediaQuery.matches ? "dark" : "light") : theme;

      root.classList.remove("light", "dark");

      root.classList.add(resolvedTheme);
    };

    applyTheme();

    localStorage.setItem(THEME_STORAGE_KEY, theme);

    if (theme !== "system") {
      return;
    }

    const handleSystemChange = () => {
      applyTheme();
    };

    mediaQuery.addEventListener("change", handleSystemChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
