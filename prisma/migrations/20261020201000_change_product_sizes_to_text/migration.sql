ALTER TABLE "Project"
ALTER COLUMN "sizes" TYPE TEXT[]
USING "sizes"::TEXT[];
