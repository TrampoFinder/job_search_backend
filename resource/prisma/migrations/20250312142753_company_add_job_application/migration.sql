/*
  Warnings:

  - Added the required column `company` to the `tb_job_application_processes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tb_job_application_processes" ADD COLUMN     "company" TEXT NOT NULL;
