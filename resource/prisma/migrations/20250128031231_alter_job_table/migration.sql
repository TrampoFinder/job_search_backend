/*
  Warnings:

  - The primary key for the `tb_jobs` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "tb_jobs" DROP CONSTRAINT "tb_jobs_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "tb_jobs_pkey" PRIMARY KEY ("id");
