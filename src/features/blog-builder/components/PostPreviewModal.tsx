"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, Pencil, Save, Loader2 } from "lucide-react";
import type { BlogPost } from "../types";

interface PostPreviewModalProps {
  postId: string | null;
  onClose: () => void;
  onSaved?: (post: BlogPost) => void;
}

export function PostPreviewModal({ postId, onClose, onSaved }: PostPreviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [draft, setDraft] = useState({
    title: "",
    excerpt: "",
    meta_description: "",
    html: "",
  });

  const loadPost = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog/posts/${id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load post");
      const loaded = data.post as BlogPost;
      setPost(loaded);
      setDraft({
        title: loaded.title,
        excerpt: loaded.excerpt ?? "",
        meta_description: loaded.meta_description ?? "",
        html: loaded.html,
      });
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (postId) void loadPost(postId);
    else {
      setPost(null);
      setError(null);
      setEditing(false);
    }
  }, [postId, loadPost]);

  const save = async () => {
    if (!postId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          excerpt: draft.excerpt || null,
          meta_description: draft.meta_description || null,
          html: draft.html,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      const updated = data.post as BlogPost;
      setPost(updated);
      setEditing(false);
      onSaved?.(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {postId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="post-preview-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Close preview"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="relative z-10 flex flex-col w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[88vh] rounded-t-2xl sm:rounded-2xl border border-accent/30 glass-surface shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-white/10 glass-tile rounded-none">
              <div className="flex items-center gap-2 min-w-0">
                <Eye size={18} className="text-accent shrink-0" />
                <p
                  id="post-preview-title"
                  className="text-sm font-semibold text-text-heading truncate"
                >
                  {editing ? "Edit article" : "Article preview"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!loading && post && !editing && (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-text-on-accent bg-accent-muted hover:opacity-90"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                )}
                {editing && (
                  <button
                    type="button"
                    onClick={save}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-text-on-accent bg-accent hover:opacity-90 disabled:opacity-60"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-heading hover:bg-white/5"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {loading && (
                <p className="text-sm text-text-muted animate-pulse py-8 text-center">Loading from server...</p>
              )}

              {error && (
                <p className="text-sm text-red-400/90 rounded-lg border border-red-500/30 bg-red-500/10 p-3 mb-4">
                  {error}
                </p>
              )}

              {!loading && post && !editing && (
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-accent-muted mb-1">Title</p>
                    <h2 className="brand-font text-xl text-text-heading">{post.title}</h2>
                  </div>
                  {post.excerpt && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Excerpt</p>
                      <p className="text-sm text-text-secondary">{post.excerpt}</p>
                    </div>
                  )}
                  {post.meta_description && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Meta description</p>
                      <p className="text-xs text-text-muted">{post.meta_description}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Content</p>
                    <div
                      className="sms-post-preview glass-tile p-4 sm:p-5"
                      dangerouslySetInnerHTML={{ __html: post.html }}
                    />
                  </div>
                </div>
              )}

              {!loading && post && editing && (
                <div className="flex flex-col gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-widest text-accent-muted">Title</span>
                    <input
                      value={draft.title}
                      onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                      className="input-base w-full"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-widest text-text-muted">Excerpt</span>
                    <textarea
                      value={draft.excerpt}
                      onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
                      rows={2}
                      className="input-base w-full resize-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-widest text-text-muted">Meta description</span>
                    <textarea
                      value={draft.meta_description}
                      onChange={(e) => setDraft((d) => ({ ...d, meta_description: e.target.value }))}
                      rows={2}
                      className="input-base w-full resize-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-widest text-text-muted">HTML body</span>
                    <textarea
                      value={draft.html}
                      onChange={(e) => setDraft((d) => ({ ...d, html: e.target.value }))}
                      rows={14}
                      className="input-base w-full text-xs font-mono resize-none"
                    />
                  </label>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
