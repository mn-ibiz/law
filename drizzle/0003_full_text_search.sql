-- Full-Text Search: add tsvector columns and GIN indexes
-- These are GENERATED ALWAYS AS STORED columns, automatically maintained by PostgreSQL.

-- Add full-text search vector to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(file_name,''))) STORED;
CREATE INDEX IF NOT EXISTS documents_search_vector_idx ON documents USING GIN (search_vector);

-- Add full-text search vector to cases table
ALTER TABLE cases ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(case_number,'') || ' ' || coalesce(description,''))) STORED;
CREATE INDEX IF NOT EXISTS cases_search_vector_idx ON cases USING GIN (search_vector);
