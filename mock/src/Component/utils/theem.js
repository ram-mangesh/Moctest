// src/utils/theme.js
export const toggleTheme = () => {
  const html = document.documentElement;
  const isDark = html.classList.contains("dark");

  if (isDark) {
    html.classList.remove("dark");
    localStorage.setItem("theme", "light");
  } else {
    html.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }
};

export const loadTheme = () => {
  // Don't add dark class by default
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
  }
};