-- AddForeignKey
ALTER TABLE "tb_job_application_processes" ADD CONSTRAINT "tb_job_application_processes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tb_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_job_application_processes" ADD CONSTRAINT "tb_job_application_processes_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "tb_jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
