-- CreateTable/Alter for asset transaction outcomes
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "assetId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "fee" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "destinationType" TEXT,
    "destinationName" TEXT,
    "accountNumber" TEXT,
    "accountName" TEXT,
    "proofImageUrl" TEXT,
    "metadataJson" TEXT,
    "reviewedByAdminId" TEXT,
    "reviewedAt" DATETIME,
    "reviewNote" TEXT,
    "assetOutcomeType" TEXT,
    "assetOutcomeAmount" INTEGER NOT NULL DEFAULT 0,
    "assetOutcomeNote" TEXT,
    "assetOutcomeSettledByAdminId" TEXT,
    "assetOutcomeSettledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transaction_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_Transaction" (
    "id","userId","assetId","type","title","amount","fee","status","paymentMethod","destinationType","destinationName","accountNumber","accountName","proofImageUrl","metadataJson","reviewedByAdminId","reviewedAt","reviewNote","createdAt","updatedAt"
)
SELECT
    "id","userId","assetId","type","title","amount","fee","status","paymentMethod","destinationType","destinationName","accountNumber","accountName","proofImageUrl","metadataJson","reviewedByAdminId","reviewedAt","reviewNote","createdAt","updatedAt"
FROM "Transaction";

DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
