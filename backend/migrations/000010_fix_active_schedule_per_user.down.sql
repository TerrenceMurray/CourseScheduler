-- Revert to global active schedule constraint

-- 1. Drop the per-user unique constraint
DROP INDEX IF EXISTS scheduler.idx_single_active_schedule_per_user;

-- 2. Recreate the global unique constraint
CREATE UNIQUE INDEX idx_single_active_schedule
ON scheduler.schedules(is_active)
WHERE is_active = TRUE;

-- 3. Revert the function to global behavior
CREATE OR REPLACE FUNCTION scheduler.deactivate_other_schedules()
RETURNS TRIGGER AS $$
BEGIN
    -- Deactivate all other schedules (global)
    UPDATE scheduler.schedules
    SET is_active = FALSE
    WHERE is_active = TRUE AND id <> NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
