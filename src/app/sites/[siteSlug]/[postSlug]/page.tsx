import type { Metadata } from "next";
import Link from "next/link";
import { createPublicSupabaseClient } from "@/lib/supabase-public";
import { buildArticleJsonLd } from "@/features/blog-builder/lib/seo";
import { getAppUrl } from "@/lib/brand-vars";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ siteSlug: string; postSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteSlug, postSlug } = await params;
  const supabase = createPublicSupabaseClient();

  const { data: site } = await supabase
    .from("sites")
    .select("id, slug")
    .eq("slug", siteSlug)
    .eq("status", "live")
    .maybeSingle();

  if (!site) return { title: "Not found" };

  const { data: post } = await supabase
    .from("posts")
    .select("title, meta_description, excerpt, image_url")
    .eq("site_id", site.id)
    .eq("slug", postSlug)
    .eq("status", "live")
    .maybeSingle();

  if (!post) return { title: "Not found" };

  const base = process.env.NEXT_PUBLIC_APP_URL || getAppUrl();
  const url = `${base}/sites/${siteSlug}/${postSlug}`;

  return {
    title: post.title,
    description: post.meta_description ?? post.excerpt ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.meta_description ?? post.excerpt ?? undefined,
      url,
      images: post.image_url ? [{ url: post.image_url }] : undefined,
      type: "article",
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { siteSlug, postSlug } = await params;
  const supabase = createPublicSupabaseClient();

  const { data: site } = await supabase
    .from("sites")
    .select("id, title, slug, hobby")
    .eq("slug", siteSlug)
    .eq("status", "live")
    .maybeSingle();

  if (!site) notFound();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("site_id", site.id)
    .eq("slug", postSlug)
    .eq("status", "live")
    .maybeSingle();

  if (!post) notFound();

  await supabase.rpc("increment_post_views", { post_id: post.id });

  const base = process.env.NEXT_PUBLIC_APP_URL || getAppUrl();
  const url = `${base}/sites/${siteSlug}/${postSlug}`;
  const jsonLd = buildArticleJsonLd({
    title: post.title,
    description: post.meta_description ?? post.excerpt ?? post.title,
    url,
    imageUrl: post.image_url,
    datePublished: post.publish_at ?? post.created_at,
    dateModified: post.created_at,
  });

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="border-b border-[#eee] bg-white">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link
            href={`/sites/${siteSlug}`}
            className="text-sm text-[#45A29E] font-medium hover:underline"
          >
            ← {site.title}
          </Link>
          <h1 className="text-2xl sm:text-4xl font-bold text-[#111] mt-4 leading-tight">
            {post.title}
          </h1>
          <p className="text-sm text-[#888] mt-2">{site.hobby}</p>
        </div>
      </header>
      <article className="max-w-3xl mx-auto px-4 py-10">
        <div
          className="blog-content leading-relaxed text-[#333] [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:pl-6 [&_li]:mb-2"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </article>
      <footer className="border-t border-[#eee] py-8 text-center text-xs text-[#999]">
        <Link href={`/sites/${siteSlug}`} className="text-[#45A29E] hover:underline">
          More on {site.hobby}
        </Link>
      </footer>
    </div>
  );
}
