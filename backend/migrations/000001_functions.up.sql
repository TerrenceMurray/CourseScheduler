CREATE OR REPLACE FUNCTION scheduler.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION scheduler.deactivate_other_schedules()
RETURNS TRIGGER AS $$
BEGIN
    -- Deactivate all other schedules when a new active schedule is inserted
    UPDATE scheduler.schedules
    SET is_active = FALSE
    WHERE is_active = TRUE AND id <> NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION scheduler.update_created_by()
RETURNS TRIGGER AS $$
BEGIN 
    NEW.created_by = current_setting('app.current_user_id')::UUID;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;