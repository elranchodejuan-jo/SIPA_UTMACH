export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'nutriweb-theme';
const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';
const THEME_COLORS: Record<Theme, string> = {
  light: '#143B63',
  dark: '#07141F',
};

let initialized = false;
let hasExplicitPreference = false;

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark';
}

function getSystemTheme(): Theme {
  return window.matchMedia(SYSTEM_DARK_QUERY).matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

function updateToggle(theme: Theme): void {
  const toggle = document.getElementById('theme-toggle') as HTMLButtonElement | null;
  const label = document.getElementById('theme-toggle-label');
  const moonIcon = document.getElementById('theme-icon-moon');
  const sunIcon = document.getElementById('theme-icon-sun');

  if (!toggle || !label || !moonIcon || !sunIcon) return;

  const darkModeActive = theme === 'dark';
  const actionLabel = darkModeActive ? 'Modo claro' : 'Modo oscuro';
  const accessibleLabel = darkModeActive ? 'Activar modo claro' : 'Activar modo oscuro';

  toggle.setAttribute('aria-checked', String(darkModeActive));
  toggle.setAttribute('aria-label', accessibleLabel);
  toggle.title = accessibleLabel;
  label.textContent = actionLabel;
  moonIcon.hidden = darkModeActive;
  sunIcon.hidden = !darkModeActive;
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  themeColor?.setAttribute('content', THEME_COLORS[theme]);

  updateToggle(theme);
}

function saveTheme(theme: Theme): void {
  hasExplicitPreference = true;

  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // The selection remains active for this page when storage is unavailable.
  }
}

function getCurrentTheme(): Theme {
  const current = document.documentElement.dataset.theme ?? null;
  return isTheme(current) ? current : getSystemTheme();
}

export function initTheme(): void {
  if (initialized) return;
  initialized = true;

  const storedTheme = getStoredTheme();
  hasExplicitPreference = storedTheme !== null;
  applyTheme(storedTheme ?? getSystemTheme());

  const toggle = document.getElementById('theme-toggle') as HTMLButtonElement | null;
  toggle?.addEventListener('click', () => {
    const nextTheme: Theme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    saveTheme(nextTheme);
  });

  const systemPreference = window.matchMedia(SYSTEM_DARK_QUERY);
  systemPreference.addEventListener('change', (event: MediaQueryListEvent) => {
    if (!hasExplicitPreference) {
      applyTheme(event.matches ? 'dark' : 'light');
    }
  });

  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;

    if (isTheme(event.newValue)) {
      hasExplicitPreference = true;
      applyTheme(event.newValue);
      return;
    }

    hasExplicitPreference = false;
    applyTheme(getSystemTheme());
  });
}
