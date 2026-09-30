"use client";

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { Locale, translate } from "@/lib/translations";

const STORAGE_KEY = "dukasmart-language";
const localeListeners = new Set<() => void>();

function subscribeToLocale(listener: () => void) {
  localeListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    localeListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getStoredLocale(initialLocale: Locale, hasSavedLocale: boolean): Locale {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "sw") return saved;
  } catch {
    // Fall back to the server-provided locale when browser storage is unavailable.
  }
  if (!hasSavedLocale && navigator.language.toLowerCase().startsWith("sw")) return "sw";
  return initialLocale;
}

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (text: string) => string;
};
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLocale,
  hasSavedLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
  hasSavedLocale: boolean;
}) {
  const locale = useSyncExternalStore(
    subscribeToLocale,
    () => getStoredLocale(initialLocale, hasSavedLocale),
    () => initialLocale,
  );

  useEffect(() => {
    document.documentElement.lang = locale === "sw" ? "sw-TZ" : "en-TZ";
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    document.documentElement.lang = nextLocale === "sw" ? "sw-TZ" : "en-TZ";
    try {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    } catch {
      // Keep the selection for this session if browser storage is blocked.
    }
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${STORAGE_KEY}=${nextLocale}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
    localeListeners.forEach((listener) => listener());
  }, []);

  const t = useCallback((text: string) => translate(text, locale), [locale]);
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}

const translatedAttributes = ["aria-label", "alt", "title", "placeholder", "label", "sub", "hint", "intro", "description"] as const;

function translateNode(node: ReactNode, t: (text: string) => string): ReactNode {
  if (typeof node === "string") return t(node);
  if (typeof node === "number" || node === null || node === undefined || typeof node === "boolean") return node;
  if (Array.isArray(node)) return Children.map(node, (child) => translateNode(child, t));
  if (!isValidElement<Record<string, unknown>>(node)) return node;

  const props: Record<string, unknown> = {};
  for (const attribute of translatedAttributes) {
    const value = node.props[attribute];
    if (typeof value === "string") props[attribute] = t(value);
  }
  if ("children" in node.props) {
    props.children = translateNode(node.props.children as ReactNode, t);
  }
  return cloneElement(node, props);
}

export function LocalizedContent({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  return <>{translateNode(children, t)}</>;
}

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();
  return (
    <label className="inline-flex items-center gap-2 text-sm font-medium" aria-label={t("Choose language")}>
      <span className="sr-only">{t("Language")}</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand"
        aria-label={t("Choose language")}
      >
        <option value="en">English</option>
        <option value="sw">Kiswahili</option>
      </select>
    </label>
  );
}
