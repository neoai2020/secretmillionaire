"use client";

import Link from "next/link";
import { Clock, Star, Shield, Headphones, Mail, ExternalLink } from "lucide-react";
import { support } from "@/config/support.config";

const STAT_ICONS = {
  clock: Clock,
  star: Star,
  shield: Shield,
} as const;

export default function SupportPage() {
  const contactHref = support.contactUrl || `mailto:${support.email}`;

  return (
    <div className="page-stack w-full page-container">
      <div className="flex flex-col gap-2 sm:gap-3">
        <h1 className="brand-font text-2xl sm:text-3xl lg:text-4xl text-text-primary tracking-tight">
          {support.pageTitle}
        </h1>
        <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
          {support.pageSubtitle}
        </p>
      </div>

      <div className="card-base flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <Headphones className="text-accent" size={22} />
          </div>
          <div className="min-w-0">
            <h2 className="brand-font text-lg sm:text-xl text-text-primary mb-1">{support.headline}</h2>
            <p className="text-sm text-text-secondary leading-relaxed">{support.subcopy}</p>
          </div>
        </div>

        <a href={contactHref} className="btn-primary w-full sm:w-fit">
          <Mail size={18} />
          {support.ctaLabel}
        </a>

        <p className="text-sm text-text-muted">
          Or email us directly:{" "}
          <a href={contactHref} className="text-accent hover:underline break-all">
            {support.email}
          </a>
        </p>

        <ul className="grid gap-3 sm:grid-cols-3">
          {support.stats.map((stat) => {
            const Icon = STAT_ICONS[stat.icon as keyof typeof STAT_ICONS] ?? Star;
            return (
              <li
                key={stat.label}
                className="flex items-start gap-2 rounded-lg border border-border-dim bg-page/50 p-3 text-sm text-text-secondary"
              >
                <Icon size={16} className="shrink-0 mt-0.5 text-accent" />
                <span>
                  {stat.label}{" "}
                  {"highlight" in stat && stat.highlight ? (
                    <span className={stat.highlightClass ?? "text-accent"}>{stat.highlight}</span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>

        {support.helpCenterUrl ? (
          <Link
            href={support.helpCenterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
          >
            Visit help center
            <ExternalLink size={14} />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
