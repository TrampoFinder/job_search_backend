CREATE VIEW "report_management"."tb_user_job_application_avg" AS
SELECT
  u.id AS "userId",
  (COALESCE(u."firstName", ''::text) || ' '::text) || COALESCE(u."lastName", ''::text) AS "fullName",
  avg(
    CASE
      WHEN jap.status = 'NOT_PROCESSING'::job_management.status_job_application_processes THEN 1
      ELSE 0
    END
  ) AS "notProcessing",
  avg(
    CASE
      WHEN jap.status = 'APPLIED'::job_management.status_job_application_processes THEN 1
      ELSE 0
    END
  ) AS applied,
  avg(
    CASE
      WHEN jap.status = 'IN_PROGRESS'::job_management.status_job_application_processes THEN 1
      ELSE 0
    END
  ) AS "inProgress",
  avg(
    CASE
      WHEN jap.status = 'APPROVED'::job_management.status_job_application_processes THEN 1
      ELSE 0
    END
  ) AS approved,
  avg(
    CASE
      WHEN jap.status = 'REJECTED'::job_management.status_job_application_processes THEN 1
      ELSE 0
    END
  ) AS rejected,
  avg(
    CASE
      WHEN jap.status = 'CLOSED'::job_management.status_job_application_processes THEN 1
      ELSE 0
    END
  ) AS closed
FROM "job_management"."tb_job_application_processes" jap
JOIN "identity"."tb_users" u ON u.id = jap."userId"
GROUP BY
  u.id,
  u."firstName",
  u."lastName";
