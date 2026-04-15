-- Adds per-user ownership columns for existing PostgreSQL databases deployed before owner_id.
-- Skips when tables are missing (fresh DB: Hibernate creates schema) or columns already exist.

DO $body$
DECLARE
  cname text;
BEGIN
  -- CATEGORIES -------------------------------------------------------------
  IF to_regclass('public.categories') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'owner_id'
     ) THEN

    ALTER TABLE categories ADD COLUMN owner_id UUID;

    UPDATE categories c
    SET owner_id = sub.author_id
    FROM (
      SELECT p.category_id AS cid, MIN(p.author_id) AS author_id
      FROM posts p
      GROUP BY p.category_id
    ) sub
    WHERE c.id = sub.cid;

    UPDATE categories c
    SET owner_id = (SELECT u.id FROM users u ORDER BY u.created_at ASC NULLS LAST LIMIT 1)
    WHERE c.owner_id IS NULL;

    ALTER TABLE categories ALTER COLUMN owner_id SET NOT NULL;

    -- Drop legacy single-column UNIQUE on name (constraint name differs by Hibernate / PG version)
    SELECT con.conname INTO cname
    FROM pg_constraint con
    INNER JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'categories'
      AND con.contype = 'u'
      AND array_length(con.conkey, 1) = 1
      AND EXISTS (
        SELECT 1 FROM pg_attribute a
        WHERE a.attrelid = con.conrelid
          AND a.attnum = con.conkey[1]
          AND a.attname = 'name'
      )
    LIMIT 1;

    IF cname IS NOT NULL THEN
      EXECUTE format('ALTER TABLE categories DROP CONSTRAINT %I', cname);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_categories_owner') THEN
      ALTER TABLE categories
        ADD CONSTRAINT fk_categories_owner FOREIGN KEY (owner_id) REFERENCES users (id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_categories_owner_name') THEN
      ALTER TABLE categories
        ADD CONSTRAINT uk_categories_owner_name UNIQUE (owner_id, name);
    END IF;
  END IF;

  -- TAGS --------------------------------------------------------------------
  IF to_regclass('public.tags') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'tags' AND column_name = 'owner_id'
     ) THEN

    ALTER TABLE tags ADD COLUMN owner_id UUID;

    UPDATE tags t
    SET owner_id = sub.author_id
    FROM (
      SELECT pt.tag_id AS tid, MIN(p.author_id) AS author_id
      FROM post_tags pt
      INNER JOIN posts p ON p.id = pt.post_id
      GROUP BY pt.tag_id
    ) sub
    WHERE t.id = sub.tid;

    UPDATE tags t
    SET owner_id = (SELECT u.id FROM users u ORDER BY u.created_at ASC NULLS LAST LIMIT 1)
    WHERE t.owner_id IS NULL;

    ALTER TABLE tags ALTER COLUMN owner_id SET NOT NULL;

    cname := NULL;
    SELECT con.conname INTO cname
    FROM pg_constraint con
    INNER JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'tags'
      AND con.contype = 'u'
      AND array_length(con.conkey, 1) = 1
      AND EXISTS (
        SELECT 1 FROM pg_attribute a
        WHERE a.attrelid = con.conrelid
          AND a.attnum = con.conkey[1]
          AND a.attname = 'name'
      )
    LIMIT 1;

    IF cname IS NOT NULL THEN
      EXECUTE format('ALTER TABLE tags DROP CONSTRAINT %I', cname);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tags_owner') THEN
      ALTER TABLE tags
        ADD CONSTRAINT fk_tags_owner FOREIGN KEY (owner_id) REFERENCES users (id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_tags_owner_name') THEN
      ALTER TABLE tags
        ADD CONSTRAINT uk_tags_owner_name UNIQUE (owner_id, name);
    END IF;
  END IF;
END
$body$;
