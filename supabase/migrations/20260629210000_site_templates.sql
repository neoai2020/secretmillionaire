-- Shared "done-for-you" template sites for the Recurring Wealth "Get Website" flow.
-- A template site (is_template = true) holds pre-generated articles for a product;
-- the Get Website action clones it into a member's own site with their affiliate link.

ALTER TABLE public.sites
    ADD COLUMN IF NOT EXISTS is_template boolean NOT NULL DEFAULT false;

ALTER TABLE public.sites
    ADD COLUMN IF NOT EXISTS template_key text;

-- Fast lookup of a product's template (only templates carry a key).
CREATE INDEX IF NOT EXISTS sites_template_key_idx
    ON public.sites (template_key)
    WHERE is_template = true;
