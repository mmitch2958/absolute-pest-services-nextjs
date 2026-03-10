-- Make employeeId nullable in job_logs for unassigned jobs
ALTER TABLE job_logs ALTER COLUMN employee_id DROP NOT NULL;

-- Add index for unassigned job queries
CREATE INDEX IF NOT EXISTS idx_job_logs_employee_id_null ON job_logs(employee_id) WHERE employee_id IS NULL;

-- Add scheduling columns to job_logs
ALTER TABLE job_logs ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE job_logs ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE job_logs ADD COLUMN IF NOT EXISTS scheduled_by INTEGER REFERENCES users(id);
ALTER TABLE job_logs ADD COLUMN IF NOT EXISTS scheduled_end_time TIMESTAMP;
ALTER TABLE job_logs ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;
ALTER TABLE job_logs ADD COLUMN IF NOT EXISTS cancelled_by INTEGER REFERENCES users(id);

-- Create job_schedule_logs audit table
CREATE TABLE IF NOT EXISTS job_schedule_logs (
  id SERIAL PRIMARY KEY,
  job_log_id INTEGER NOT NULL REFERENCES job_logs(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by INTEGER REFERENCES users(id),
  previous_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_job_schedule_logs_job_log_id ON job_schedule_logs(job_log_id);
