/*
  Warnings:

  - Added the required column `location` to the `tb_jobs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "role_user" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "status_job_application_processes" AS ENUM ('NOT_PROCESSING', 'APPLIED', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'CLOSED');

-- AlterTable
ALTER TABLE "tb_jobs" ADD COLUMN     "location" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "tb_users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "salt" TEXT NOT NULL,
    "role" "role_user" NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tb_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_job_application_processes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "status" "status_job_application_processes",

    CONSTRAINT "tb_job_application_processes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_users_email_key" ON "tb_users"("email");
