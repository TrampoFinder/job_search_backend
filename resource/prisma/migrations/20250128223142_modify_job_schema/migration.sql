/*
  Warnings:

  - Added the required column `url` to the `tb_jobs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tb_jobs" ADD COLUMN     "url" TEXT NOT NULL;
