-- Enable Row-Level Security on all user-owned tables
-- Users can only see and modify their own data based on created_by column

-- Enable RLS on all tables
ALTER TABLE scheduler.room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduler.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduler.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduler.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduler.course_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduler.schedules ENABLE ROW LEVEL SECURITY;

-- Room Types policies
CREATE POLICY room_types_select_policy ON scheduler.room_types
    FOR SELECT
    USING (created_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY room_types_insert_policy ON scheduler.room_types
    FOR INSERT
    WITH CHECK (created_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY room_types_update_policy ON scheduler.room_types
    FOR UPDATE
    USING (created_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY room_types_delete_policy ON scheduler.room_types
    FOR DELETE
    USING (created_by = current_setting('app.current_user_id')::UUID);

-- Buildings policies
CREATE POLICY buildings_select_policy ON scheduler.buildings
    FOR SELECT
    USING (created_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY buildings_insert_policy ON scheduler.buildings
    FOR INSERT
    WITH CHECK (created_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY buildings_update_policy ON scheduler.buildings
    FOR UPDATE
    USING (created_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY buildings_delete_policy ON scheduler.buildings
    FOR DELETE
    USING (created_by = current_setting('app.current_user_id')::UUID);

-- Rooms policies
CREATE POLICY rooms_select_policy ON scheduler.rooms
    FOR SELECT
    USING (created_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY rooms_insert_policy ON scheduler.rooms
    FOR INSERT
    WITH CHECK (created_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY rooms_update_policy ON scheduler.rooms
    FOR UPDATE
    USING (created_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY rooms_delete_policy ON scheduler.rooms
    FOR DELETE
    USING (created_by = current_setting('app.current_user_id')::UUID);

-- Courses policies
CREATE POLICY courses_select_policy ON scheduler.courses
    FOR SELECT
    USING (created_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY courses_insert_policy ON scheduler.courses
    FOR INSERT
    WITH CHECK (created_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY courses_update_policy ON scheduler.courses
    FOR UPDATE
    USING (created_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY courses_delete_policy ON scheduler.courses
    FOR DELETE
    USING (created_by = current_setting('app.current_user_id')::UUID);

-- Course Sessions policies
CREATE POLICY course_sessions_select_policy ON scheduler.course_sessions
    FOR SELECT
    USING (created_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY course_sessions_insert_policy ON scheduler.course_sessions
    FOR INSERT
    WITH CHECK (created_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY course_sessions_update_policy ON scheduler.course_sessions
    FOR UPDATE
    USING (created_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY course_sessions_delete_policy ON scheduler.course_sessions
    FOR DELETE
    USING (created_by = current_setting('app.current_user_id')::UUID);

-- Schedules policies
CREATE POLICY schedules_select_policy ON scheduler.schedules
    FOR SELECT
    USING (created_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY schedules_insert_policy ON scheduler.schedules
    FOR INSERT
    WITH CHECK (created_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY schedules_update_policy ON scheduler.schedules
    FOR UPDATE
    USING (created_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY schedules_delete_policy ON scheduler.schedules
    FOR DELETE
    USING (created_by = current_setting('app.current_user_id')::UUID);
