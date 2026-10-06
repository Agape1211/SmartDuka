"use client";

import { useLanguage } from "@/components/LanguageProvider";

const supportNumber = "255616234063";

export function WhatsAppSupportLink() {
  const { locale, t } = useLanguage();
  const message = locale === "sw"
    ? "Habari DukaSmart, nahitaji msaada kuhusu shughuli za biashara yangu."
    : "Hello DukaSmart, I need help with my business operations.";
  const href = `https://wa.me/${supportNumber}?text=${encodeURIComponent(message)}`;
  const feedbackSubject = encodeURIComponent("DukaSmart product feedback");
  const feedbackBody = encodeURIComponent(locale === "sw"
    ? "Habari DukaSmart, ningependa kutoa maoni kuhusu bidhaa.\n\nMaoni yangu:\n\nNatumia DukaSmart kama:"
    : "Hello DukaSmart, I would like to share product feedback.\n\nMy feedback:\n\nI use DukaSmart as:");

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2 md:bottom-6 md:right-6">
      <a
        href={`mailto:support.dukasmart12@gmail.com?subject=${feedbackSubject}&body=${feedbackBody}`}
        aria-label={t("Email feedback")}
        title={t("Email feedback")}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-lg ring-1 ring-black/5 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-slate-100 text-xs font-bold">@</span>
        <span>{t("Email feedback")}</span>
      </a>
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