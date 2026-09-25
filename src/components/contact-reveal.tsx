"use client";

import { useState } from "react";
import { AtSign, Globe, LoaderCircle, Mail, MessageCircle, Phone, Send } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { api } from "@/lib/api";
import type { ContactChannel, GuideContact } from "@/lib/types";

/** Contact details stay off the page until the visitor asks for them. */
export function ContactReveal({ slug, channels }: { slug: string; channels: ContactChannel[] }) {
  const { locale, dict } = useI18n();
  const g = dict.guides;
  const [contact, setContact] = useState<GuideContact | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  async function reveal() {
    setState("loading");
    try {
      const res = await api<{ data: GuideContact }>(`guides/${encodeURIComponent(slug)}/contact?lang=${locale}`, { method: "POST" });
      setContact(res.data);
      setState("idle");
    } catch {
      setState("error");
    }
  }

  if (!channels.length) return null;

  if (!contact) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={reveal}
          disabled={state === "loading"}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-forest-800 px-4 py-3 text-sm font-bold text-sand-50 transition hover:bg-forest-900 disabled:opacity-60"
        >
          {state === "loading" ? <LoaderCircle className="size-4 animate-spin" /> : <Phone className="size-4" />}
          {g.showContact}
        </button>
        {state === "error" && <p className="text-xs font-semibold text-pomegranate-600">{g.contactError}</p>}
      </div>
    );
  }

  const rows = [
    contact.phone && { icon: Phone, label: g.call, value: contact.phone, href: `tel:${contact.phone.replace(/[^\d+]/g, "")}` },
    contact.whatsapp_url && { icon: MessageCircle, label: g.whatsappLabel, value: contact.whatsapp, href: contact.whatsapp_url },
    contact.email && { icon: Mail, label: g.emailLabel, value: contact.email, href: `mailto:${contact.email}` },
    contact.website && { icon: Globe, label: g.websiteLabel, value: contact.website.replace(/^https?:\/\//, ""), href: contact.website },
    contact.instagram_url && { icon: AtSign, label: g.instagramLabel, value: contact.instagram, href: contact.instagram_url },
    contact.telegram_url && { icon: Send, label: g.telegramLabel, value: contact.telegram, href: contact.telegram_url },
  ].filter(Boolean) as { icon: typeof AtSign; label: string; value: string | null; href: string }[];

  return (
    <div className="space-y-2">
      <ul className="divide-y divide-sand-200 overflow-hidden rounded-2xl ring-1 ring-sand-200">
        {rows.map(({ icon: Icon, label, value, href }) => (
          <li key={label}>
            <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="flex items-center gap-3 bg-white px-4 py-3 transition hover:bg-sand-50">
              <Icon className="size-4 shrink-0 text-forest-700" />
              <span className="min-w-0">
                <span className="block text-[0.65rem] font-bold tracking-[0.14em] text-ink-500 uppercase">{label}</span>
                <span className="block truncate text-sm font-semibold text-ink-900">{value}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-500">{contact.is_sample ? g.contactSampleNote : g.contactHint}</p>
    </div>
  );
}
