SELECT
  u.id AS "userId",
  (
    (COALESCE(u."firstName", '' :: text) || ' ' :: text) || COALESCE(u."lastName", '' :: text)
  ) AS "fullName",
  avg(
    CASE
      WHEN (
        jap.status = 'NOT_PROCESSING' :: status_job_application_processes
      ) THEN 1
      ELSE 0
    END
  ) AS "notProcessing",
  avg(
    CASE
      WHEN (
        jap.status = 'APPLIED' :: status_job_application_processes
      ) THEN 1
      ELSE 0
    END
  ) AS applied,
  avg(
    CASE
      WHEN (
        jap.status = 'IN_PROGRESS' :: status_job_application_processes
      ) THEN 1
      ELSE 0
    END
  ) AS "inProgress",
  avg(
    CASE
      WHEN (
        jap.status = 'APPROVED' :: status_job_application_processes
      ) THEN 1
      ELSE 0
    END
  ) AS approved,
  avg(
    CASE
      WHEN (
        jap.status = 'REJECTED' :: status_job_application_processes
      ) THEN 1
      ELSE 0
    END
  ) AS rejected,
  avg(
    CASE
      WHEN (
        jap.status = 'CLOSED' :: status_job_application_processes
      ) THEN 1
      ELSE 0
    END
  ) AS closed
FROM
  (
    tb_job_application_processes jap
    JOIN tb_users u ON ((u.id = jap."userId"))
  )
GROUP BY
  u.id,
  u."firstName",
  u."lastName";