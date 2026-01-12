-- Revert unique constraints changes

-- 1. course_sessions: Drop unique constraint and composite foreign key
ALTER TABLE scheduler.course_sessions DROP CONSTRAINT IF EXISTS course_sessions_unique;
ALTER TABLE scheduler.course_sessions DROP CONSTRAINT IF EXISTS course_sessions_required_room_created_by_fkey;

-- 2. schedules: Revert to UNIQUE(name) only
ALTER TABLE scheduler.schedules DROP CONSTRAINT IF EXISTS schedules_name_created_by_unique;
ALTER TABLE scheduler.schedules ADD CONSTRAINT schedules_name_key UNIQUE (name);

-- 3. courses: Drop unique constraint
ALTER TABLE scheduler.courses DROP CONSTRAINT IF EXISTS courses_name_created_by_unique;

-- 4. rooms: Drop unique constraint and revert foreign key
ALTER TABLE scheduler.rooms DROP CONSTRAINT IF EXISTS rooms_name_building_created_by_unique;
ALTER TABLE scheduler.rooms DROP CONSTRAINT IF EXISTS rooms_type_created_by_fkey;

-- 5. buildings: Drop unique constraint
ALTER TABLE scheduler.buildings DROP CONSTRAINT IF EXISTS buildings_name_created_by_unique;

-- 6. room_types: Revert to simple primary key
-- This may fail if there are duplicate names across users
ALTER TABLE scheduler.room_types DROP CONSTRAINT room_types_pkey;
ALTER TABLE scheduler.room_types ADD PRIMARY KEY (name);

-- Re-add original foreign keys
ALTER TABLE scheduler.rooms
    ADD CONSTRAINT rooms_type_fkey
    FOREIGN KEY (type) REFERENCES scheduler.room_types(name);

ALTER TABLE scheduler.course_sessions
    ADD CONSTRAINT course_sessions_required_room_fkey
    FOREIGN KEY (required_room) REFERENCES scheduler.room_types(name);
