-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "identity";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "job_management";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "report_management";

-- CreateEnum
CREATE TYPE "job_management"."status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "identity"."role_user" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "job_management"."status_job_application_processes" AS ENUM ('NOT_PROCESSING', 'APPLIED', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'CLOSED');

-- CreateTable
CREATE TABLE "job_management"."tb_jobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "status" "job_management"."status" NOT NULL,
    "url" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tb_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."tb_users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "salt" TEXT NOT NULL,
    "role" "identity"."role_user" NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tb_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_management"."tb_job_application_processes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "status" "job_management"."status_job_application_processes",

    CONSTRAINT "tb_job_application_processes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_management"."tb_favorite_jobs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tb_favorite_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_users_email_key" ON "identity"."tb_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tb_favorite_jobs_userId_jobId_key" ON "job_management"."tb_favorite_jobs"("userId", "jobId");

-- AddForeignKey
ALTER TABLE "job_management"."tb_job_application_processes" ADD CONSTRAINT "tb_job_application_processes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."tb_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_management"."tb_job_application_processes" ADD CONSTRAINT "tb_job_application_processes_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job_management"."tb_jobs"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_management"."tb_favorite_jobs" ADD CONSTRAINT "tb_favorite_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."tb_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_management"."tb_favorite_jobs" ADD CONSTRAINT "tb_favorite_jobs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job_management"."tb_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
