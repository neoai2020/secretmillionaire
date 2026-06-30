-- Cached affiliate offer page scrapes (shared by URL, 7-day TTL in app code).
CREATE TABLE IF NOT EXISTS affiliate_scrape_cache (
  url_key text PRIMARY KEY,
  source_url text NOT NULL,
  scraped_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  context text NOT NULL DEFAULT '',
  fetched_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_scrape_cache_fetched_at
  ON affiliate_scrape_cache (fetched_at DESC);

ALTER TABLE affiliate_scrape_cache ENABLE ROW LEVEL SECURITY;

-- Service role only (API routes use service role for cache read/write).
CREATE POLICY affiliate_scrape_cache_service ON affiliate_scrape_cache
  FOR ALL
  USING (false)
  WITH CHECK (false);
