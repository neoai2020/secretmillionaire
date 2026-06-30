export interface ArmedLink {
  label: string;
  url: string;
  network: "digistore" | "other";
}

export interface BlogSite {
  id: string;
  user_id: string;
  hobby: string;
  territory?: string | null;
  title: string;
  tagline: string | null;
  slug: string;
  theme: string;
  armed_links: ArmedLink[];
  status: "draft" | "live";
  created_at: string;
  is_template?: boolean;
  template_key?: string | null;
}

export interface BlogPost {
  id: string;
  site_id: string;
  user_id: string;
  title: string;
  slug: string;
  html: string;
  excerpt: string | null;
  meta_description: string | null;
  image_url: string | null;
  image_alt: string | null;
  is_pillar: boolean;
  status: "draft" | "scheduled" | "live";
  publish_at: string | null;
  views: number;
  created_at: string;
}

export type ContentTier = "deploy" | "full";

export interface GeneratedPostContent {
  title: string;
  excerpt: string;
  metaDescription: string;
  html: string;
}

export type ArticleAngle =
  | "pillar-guide"
  | "best-picks"
  | "mistakes"
  | "budget"
  | "pro-tips"
  | "worth-it"
  | "beginners";

export interface ClusterTopic {
  title: string;
  slug: string;
  isPillar: boolean;
  angle?: ArticleAngle;
}

export type PostSlotStatus = "queued" | "generating" | "complete" | "error";

export interface PostSlotState {
  topic: ClusterTopic;
  status: PostSlotStatus;
  progress: number;
  post?: BlogPost;
  error?: string;
}

export interface GenerationQuota {
  limit: number | null;
  usedToday: number;
  remaining: number | null;
  unlimited?: boolean;
}
