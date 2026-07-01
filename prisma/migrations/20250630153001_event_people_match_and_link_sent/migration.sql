-- Upgrade EventPeople from legacy `matched` text to matched_person_id + link_sent.
-- Idempotent: safe on databases created from the init migration.

ALTER TABLE "EventPeople" ADD COLUMN IF NOT EXISTS "matched_person_id" INTEGER;
ALTER TABLE "EventPeople" ADD COLUMN IF NOT EXISTS "link_sent" BOOLEAN NOT NULL DEFAULT false;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'EventPeople_matched_person_id_fkey'
  ) THEN
    ALTER TABLE "EventPeople"
      ADD CONSTRAINT "EventPeople_matched_person_id_fkey"
      FOREIGN KEY ("matched_person_id") REFERENCES "EventPeople"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "EventPeople" DROP COLUMN IF EXISTS "matched";
