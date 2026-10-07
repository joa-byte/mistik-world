-- Add storefront fields used by the Readymag product widget.
ALTER TABLE "Project"
ADD COLUMN "price" INTEGER,
ADD COLUMN "sizes" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[];
