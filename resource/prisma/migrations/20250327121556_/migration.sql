/*
  Warnings:

  - You are about to drop the `tb_user_job_application_avg` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "identity"."tb_users" ADD COLUMN     "recoveryCode" TEXT,
ADD COLUMN     "recoveryCodeExpiredAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "report_management"."tb_user_job_application_avg";
