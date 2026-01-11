-- Revert to the original (incorrect) unique index
DROP INDEX IF EXISTS scheduler.idx_single_active_schedule;

-- Drop the update trigger
DROP TRIGGER IF EXISTS set_schedule_inactive_on_update ON scheduler.schedules;

-- Recreate the original unique index (note: this may fail if multiple inactive schedules exist)
CREATE UNIQUE INDEX idx_is_active ON scheduler.schedules(is_active);
