-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "reviewNote" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "reviewedAt" DATETIME;
ALTER TABLE "Transaction" ADD COLUMN "reviewedByAdminId" TEXT;

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "phone" TEXT,
    "address" TEXT,
    "membershipTier" TEXT NOT NULL DEFAULT 'Premium',
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "availableBalance" INTEGER NOT NULL DEFAULT 0,
    "totalInvested" INTEGER NOT NULL DEFAULT 0,
    "totalProfit" INTEGER NOT NULL DEFAULT 0,
    "monthlyProfit" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("address", "availableBalance", "createdAt", "email", "fullName", "id", "isVerified", "membershipTier", "monthlyProfit", "passwordHash", "phone", "totalInvested", "totalProfit", "updatedAt") SELECT "address", "availableBalance", "createdAt", "email", "fullName", "id", "isVerified", "membershipTier", "monthlyProfit", "passwordHash", "phone", "totalInvested", "totalProfit", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
