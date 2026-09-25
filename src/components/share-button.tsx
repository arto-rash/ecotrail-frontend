"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { useI18n } from "./i18n-provider";

export function ShareButton({ title }: { title: string }) {
  const { dict } = useI18n();
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Cancelled — fall through to copying.
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button type="button" onClick={share} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-ink-900 shadow-sm ring-1 ring-sand-200 transition hover:ring-sand-400">
      {copied ? <Check className="size-4 text-forest-600" /> : <Share2 className="size-4" />}
      {copied ? dict.common.linkCopied : dict.common.share}
    </button>
  );
}
