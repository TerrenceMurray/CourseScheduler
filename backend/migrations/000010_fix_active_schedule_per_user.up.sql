-- Fix unique active schedule constraint to be per-user (multi-tenant)
-- The previous index and trigger operated globally, preventing any user from having
-- an active schedule if another user already had one.

-- 1. Drop the old global unique constraint
DROP INDEX IF EXISTS scheduler.idx_single_active_schedule;

-- 2. Create new partial unique index that allows one active schedule per user
CREATE UNIQUE INDEX idx_single_active_schedule_per_user
ON scheduler.schedules(created_by)
WHERE is_active = TRUE;

-- 3. Update the deactivate function to only affect the current user's schedules
CREATE OR REPLACE FUNCTION scheduler.deactivate_other_schedules()
RETURNS TRIGGER AS $$
BEGIN
    -- Deactivate all other schedules for the same user
    UPDATE scheduler.schedules
    SET is_active = FALSE
    WHERE is_active = TRUE
    AND id <> NEW.id
    AND created_by = NEW.created_by;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
