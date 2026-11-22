-- AlterTable: Rename defaultCurrency to default_currency preserving data
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'legal_entities' 
      AND column_name = 'defaultCurrency'
  ) THEN
    ALTER TABLE "legal_entities" RENAME COLUMN "defaultCurrency" TO "default_currency";
  END IF;
END $$;

-- AlterTable: Update default country to ISO 3166-1 alpha-2 'PK'
ALTER TABLE "legal_entities" ALTER COLUMN "country" SET DEFAULT 'PK';
