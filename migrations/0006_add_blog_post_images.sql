CREATE TABLE IF NOT EXISTS blog_post_images (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  section_heading TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS blog_post_images_post_order_idx
  ON blog_post_images (post_id, sort_order);