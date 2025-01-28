-- CreateEnum
CREATE TYPE "status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "tb_jobs" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "status" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tb_jobs_pkey" PRIMARY KEY ("id")
);
