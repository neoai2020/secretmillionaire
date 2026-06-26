import type { Metadata } from "next";
import Link from "next/link";
import { createPublicSupabaseClient } from "@/lib/supabase-public";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ siteSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteSlug } = await params;
  const supabase = createPublicSupabaseClient();
  const { data: site } = await supabase
    .from("sites")
    .select("title, tagline, hobby")
    .eq("slug", siteSlug)
    .eq("status", "live")
    .maybeSingle();

  if (!site) return { title: "Not found" };

  return {
    title: site.title,
    description: site.tagline ?? `Expert guides and tips about ${site.hobby}`,
    openGraph: { title: site.title, description: site.tagline ?? undefined },
  };
}

export default async function SiteHomePage({ params }: Props) {
  const { siteSlug } = await params;
  const supabase = createPublicSupabaseClient();

  const { data: site } = await supabase
    .from("sites")
    .select("*")
    .eq("slug", siteSlug)
    .eq("status", "live")
    .maybeSingle();

  if (!site) notFound();

  const { data: posts } = await supabase
    .from("posts")
    .select("title, slug, excerpt, is_pillar, created_at")
    .eq("site_id", site.id)
    .eq("status", "live")
    .order("is_pillar", { ascending: false })
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a]">
      <header className="border-b border-[#eee] bg-white">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#45A29E] mb-2">
            {site.hobby}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#111] tracking-tight">{site.title}</h1>
          {site.tagline && <p className="mt-3 text-[#555] text-lg">{site.tagline}</p>}
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-6">
        {(posts ?? []).map((post) => (
          <article
            key={post.slug}
            className="rounded-xl border border-[#eee] bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            {post.is_pillar && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#b8860b]">
                Pillar guide
              </span>
            )}
            <h2 className="text-xl font-bold mt-1">
              <Link href={`/sites/${siteSlug}/${post.slug}`} className="hover:text-[#45A29E]">
                {post.title}
              </Link>
            </h2>
            {post.excerpt && <p className="mt-2 text-[#555] text-sm leading-relaxed">{post.excerpt}</p>}
            <Link
              href={`/sites/${siteSlug}/${post.slug}`}
              className="inline-block mt-3 text-sm font-semibold text-[#45A29E]"
            >
              Read more →
            </Link>
          </article>
        ))}
      </main>
      <footer className="border-t border-[#eee] py-8 text-center text-xs text-[#999]">
        © {new Date().getFullYear()} {site.title}
      </footer>
    </div>
  );
}
