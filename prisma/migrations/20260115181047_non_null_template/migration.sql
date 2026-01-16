/*
  Warnings:

  - Made the column `emailTemplate` on table `reminders` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "reminders" ALTER COLUMN "emailTemplate" SET NOT NULL;
