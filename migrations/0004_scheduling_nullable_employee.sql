-- Make employeeId nullable in job_logs for unassigned jobs
ALTER TABLE job_logs ALTER COLUMN employee_id DROP NOT NULL;

-- Add index for unassigned job queries
CREATE INDEX IF NOT EXISTS idx_job_logs_employee_id_null ON job_logs(employee_id) WHERE employee_id IS NULL;
