ALTER TABLE "Project"
ALTER COLUMN "sizes" TYPE TEXT[]
USING ARRAY(
  SELECT unnest("sizes")::text
);
