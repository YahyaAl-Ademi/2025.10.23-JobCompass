-- Add language column to jobs for English/Dutch filtering.
-- Run this before backfilling or ingesting new jobs with language.

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS language character varying(50);

COMMENT ON COLUMN jobs.language IS 'Detected language of job description: English or Dutch';
