/*
  Warnings:

  - You are about to drop the column `description` on the `tb_jobs` table. All the data in the column will be lost.
  - Added the required column `company` to the `tb_jobs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tb_jobs" DROP COLUMN "description",
ADD COLUMN     "company" TEXT NOT NULL;
