"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useLanguage } from "@/components/LanguageProvider";

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
}

function subscribeToInstallState(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const displayMode = window.matchMedia("(display-mode: standalone)");
  displayMode.addEventListener("change", onChange);
  window.addEventListener("appinstalled", onChange);
  return () => {
    displayMode.removeEventListener("change", onChange);
    window.removeEventListener("appinstalled", onChange);
  };
}

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppButton({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const isStandalone = useSyncExternalStore(subscribeToInstallState, isStandaloneMode, () => false);
  const shouldHideInstallButton = isInstalled || isStandalone;
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const handleInstalled = () => {
      setIsInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (!showInstructions) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowInstructions(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showInstructions]);

  async function handleInstall() {
    if (!promptEvent) {
      setShowInstructions(true);
      return;
    }

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") setIsInstalled(true);
      setPromptEvent(null);
    } catch {
      setShowInstructions(true);
    }
  }

  if (shouldHideInstallButton) return null;

  return (
    <>
      <button
        type="button"
        onClick={handleInstall}
        className={compact
          ? "shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-medium text-brand hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          : "w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-left text-sm text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"}
      >
        <span aria-hidden="true" className="mr-2">↓</span>{t("Install DukaSmart")}
      </button>

      {showInstructions && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 sm:items-center"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowInstructions(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-dialog-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-xl"
          >
            <h2 id="install-dialog-title" className="text-lg font-semibold">{t("Install DukaSmart")}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{t("Add DukaSmart to your home screen from your browser menu for quick access.")}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t("On iPhone or iPad, tap Share, then Add to Home Screen. On Android, open the browser menu and choose Install app or Add to Home screen.")}</p>
            <button
              type="button"
              autoFocus
              onClick={() => setShowInstructions(false)}
              className="mt-5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              {t("Close")}
            </button>
          </section>
        </div>
      )}
    </>
  );
}
