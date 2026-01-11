-- Fix the unique index on is_active to be a partial index
-- The previous index prevented having multiple inactive schedules
DROP INDEX IF EXISTS scheduler.idx_is_active;

-- Create partial unique index that only constrains TRUE values
-- This allows multiple inactive schedules but only one active schedule
CREATE UNIQUE INDEX idx_single_active_schedule ON scheduler.schedules(is_active) WHERE is_active = TRUE;

-- Add trigger for UPDATE operations to deactivate other schedules
-- when setting a schedule to active
CREATE TRIGGER set_schedule_inactive_on_update
BEFORE UPDATE ON scheduler.schedules
FOR EACH ROW
WHEN (NEW.is_active = TRUE AND OLD.is_active = FALSE)
EXECUTE FUNCTION scheduler.deactivate_other_schedules();
