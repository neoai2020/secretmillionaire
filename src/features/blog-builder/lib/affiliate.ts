import type { ArmedLink } from "../types";

function trackUrl(postId: string, target: string): string {
  return `/api/blog/track-click?post=${encodeURIComponent(postId)}&to=${encodeURIComponent(target)}`;
}

export function renderCtaButton(label: string, href: string): string {
  return `<div class="sms-affiliate-cta" style="margin:2rem 0;text-align:center;">
  <a href="${href}" target="_blank" rel="nofollow sponsored noopener"
    style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#45A29E,#2d7a76);color:#0B0C10;font-weight:700;border-radius:12px;text-decoration:none;box-shadow:0 0 24px rgba(69,162,158,0.35);">
    ${label}
  </a>
</div>`;
}

export function renderBanner(link: ArmedLink, href: string): string {
  return `<aside class="sms-affiliate-banner" style="margin:2rem 0;padding:1.5rem;border:1px solid rgba(212,175,55,0.3);background:rgba(212,175,55,0.08);border-radius:12px;">
  <p style="margin:0 0 0.75rem;font-size:0.75rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#b8860b;">Recommended for Initiates</p>
  <p style="margin:0 0 1rem;color:#333;line-height:1.6;">Discover <strong>${link.label}</strong> — our top pick for this territory.</p>
  <a href="${href}" target="_blank" rel="nofollow sponsored noopener" style="color:#45A29E;font-weight:700;">Check Today's Price →</a>
</aside>`;
}

export function renderComparisonTable(links: ArmedLink[], postId: string): string {
  if (links.length === 0) return "";
  const rows = links
    .map(
      (l) => `<tr>
      <td style="padding:12px;border-bottom:1px solid #eee;">${l.label}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;text-align:center;">
        <a href="${trackUrl(postId, l.url)}" target="_blank" rel="nofollow sponsored noopener" style="color:#45A29E;font-weight:600;">View Offer</a>
      </td>
    </tr>`
    )
    .join("");
  return `<table class="sms-comparison" style="width:100%;border-collapse:collapse;margin:2rem 0;font-size:0.95rem;">
    <thead><tr style="background:#f8f9fa;">
      <th style="padding:12px;text-align:left;">Pick</th>
      <th style="padding:12px;text-align:center;">Link</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export function weaveAffiliateLinks(
  html: string,
  links: ArmedLink[],
  postId: string
): string {
  if (links.length === 0) return html;

  const primary = links[0];
  const tracked = trackUrl(postId, primary.url);

  let out = html;
  const mid = Math.floor(out.length / 2);
  const banner = renderBanner(primary, tracked);
  const cta = renderCtaButton("Get Instant Access", tracked);
  const table = renderComparisonTable(links, postId);

  if (out.includes("</p>")) {
    const parts = out.split("</p>");
    const insertAt = Math.min(Math.floor(parts.length / 2), parts.length - 1);
    parts[insertAt] = `${parts[insertAt]}</p>${banner}`;
    out = parts.join("</p>");
  } else {
    out = `${banner}${out}`;
  }

  out = `${out}${cta}${table}`;
  return out;
}
