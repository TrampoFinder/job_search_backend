-- DropForeignKey
ALTER TABLE "tb_job_application_processes" DROP CONSTRAINT "tb_job_application_processes_jobId_fkey";

-- DropForeignKey
ALTER TABLE "tb_job_application_processes" DROP CONSTRAINT "tb_job_application_processes_userId_fkey";

-- AddForeignKey
ALTER TABLE "tb_job_application_processes" ADD CONSTRAINT "tb_job_application_processes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tb_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_job_application_processes" ADD CONSTRAINT "tb_job_application_processes_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "tb_jobs"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
