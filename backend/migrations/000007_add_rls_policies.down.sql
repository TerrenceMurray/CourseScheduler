-- Drop all RLS policies and disable RLS on tables

-- Drop Room Types policies
DROP POLICY IF EXISTS room_types_select_policy ON scheduler.room_types;
DROP POLICY IF EXISTS room_types_insert_policy ON scheduler.room_types;
DROP POLICY IF EXISTS room_types_update_policy ON scheduler.room_types;
DROP POLICY IF EXISTS room_types_delete_policy ON scheduler.room_types;

-- Drop Buildings policies
DROP POLICY IF EXISTS buildings_select_policy ON scheduler.buildings;
DROP POLICY IF EXISTS buildings_insert_policy ON scheduler.buildings;
DROP POLICY IF EXISTS buildings_update_policy ON scheduler.buildings;
DROP POLICY IF EXISTS buildings_delete_policy ON scheduler.buildings;

-- Drop Rooms policies
DROP POLICY IF EXISTS rooms_select_policy ON scheduler.rooms;
DROP POLICY IF EXISTS rooms_insert_policy ON scheduler.rooms;
DROP POLICY IF EXISTS rooms_update_policy ON scheduler.rooms;
DROP POLICY IF EXISTS rooms_delete_policy ON scheduler.rooms;

-- Drop Courses policies
DROP POLICY IF EXISTS courses_select_policy ON scheduler.courses;
DROP POLICY IF EXISTS courses_insert_policy ON scheduler.courses;
DROP POLICY IF EXISTS courses_update_policy ON scheduler.courses;
DROP POLICY IF EXISTS courses_delete_policy ON scheduler.courses;

-- Drop Course Sessions policies
DROP POLICY IF EXISTS course_sessions_select_policy ON scheduler.course_sessions;
DROP POLICY IF EXISTS course_sessions_insert_policy ON scheduler.course_sessions;
DROP POLICY IF EXISTS course_sessions_update_policy ON scheduler.course_sessions;
DROP POLICY IF EXISTS course_sessions_delete_policy ON scheduler.course_sessions;

-- Drop Schedules policies
DROP POLICY IF EXISTS schedules_select_policy ON scheduler.schedules;
DROP POLICY IF EXISTS schedules_insert_policy ON scheduler.schedules;
DROP POLICY IF EXISTS schedules_update_policy ON scheduler.schedules;
DROP POLICY IF EXISTS schedules_delete_policy ON scheduler.schedules;

-- Disable RLS on all tables
ALTER TABLE scheduler.room_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduler.buildings DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduler.rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduler.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduler.course_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduler.schedules DISABLE ROW LEVEL SECURITY;
