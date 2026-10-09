"use client";

import { useLanguage } from "@/components/LanguageProvider";

const supportNumber = "255616234063";

export function WhatsAppSupportLink() {
  const { locale, t } = useLanguage();
  const message = locale === "sw"
    ? "Habari DukaSmart, nahitaji msaada kuhusu shughuli za biashara yangu."
    : "Hello DukaSmart, I need help with my business operations.";
  const href = `https://wa.me/${supportNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2 md:bottom-6 md:right-6">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("WhatsApp support")}
        title={t("WhatsApp support")}
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#25d366] px-4 py-2.5 text-sm font-semibold text-[#073b24] shadow-lg ring-1 ring-black/10 transition-colors hover:bg-[#1fbd5b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075e54] focus-visible:ring-offset-2"
      >
        <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-white/30 text-[10px] font-extrabold">WA</span>
        <span>{t("WhatsApp support")}</span>
      </a>
    </div>
  );
}