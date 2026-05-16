-- Add percentage field for asset transaction outcomes
ALTER TABLE "Transaction" ADD COLUMN "assetOutcomePercentage" REAL NOT NULL DEFAULT 0;
