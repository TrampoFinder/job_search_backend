-- CreateTable
CREATE TABLE "report_management"."tb_user_job_application_avg" (
    "userId" TEXT NOT NULL,
    "fullName" TEXT,
    "notProcessing" DECIMAL NOT NULL,
    "applied" DECIMAL NOT NULL,
    "inProgress" DECIMAL NOT NULL,
    "approved" DECIMAL NOT NULL,
    "rejected" DECIMAL NOT NULL,
    "closed" DECIMAL NOT NULL,

    CONSTRAINT "tb_user_job_application_avg_pkey" PRIMARY KEY ("userId")
);
