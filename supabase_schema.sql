-- Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID -- For future auth
);

-- Create analysis_results table
CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create generated_replies table
CREATE TABLE IF NOT EXISTS generated_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create keyword_variations table
CREATE TABLE IF NOT EXISTS keyword_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_keyword TEXT NOT NULL,
  variations JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (simplified for now since using anon key for prototype)
ALTER TABLE keyword_variations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select" ON search_history FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON search_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon select" ON analysis_results FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON analysis_results FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon select" ON generated_replies FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON generated_replies FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon select" ON keyword_variations FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON keyword_variations FOR INSERT WITH CHECK (true);
