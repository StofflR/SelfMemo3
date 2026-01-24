-- AlterTable
ALTER TABLE "reminders" ADD COLUMN     "additionalUserIds" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "defaultTimezone" TEXT DEFAULT 'Etc/GMT';
