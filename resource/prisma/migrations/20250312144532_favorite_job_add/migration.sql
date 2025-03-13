-- CreateTable
CREATE TABLE "tb_favorite_jobs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_favorite_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_favorite_jobs_userId_jobId_key" ON "tb_favorite_jobs"("userId", "jobId");

-- AddForeignKey
ALTER TABLE "tb_favorite_jobs" ADD CONSTRAINT "tb_favorite_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tb_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_favorite_jobs" ADD CONSTRAINT "tb_favorite_jobs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "tb_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
