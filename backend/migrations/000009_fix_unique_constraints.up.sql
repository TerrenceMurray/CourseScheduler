-- Fix unique constraints to include created_by for multi-tenant support
-- This allows different users to have items with the same name

-- 1. room_types: Change primary key from name to (name, created_by)
-- First drop ALL dependent foreign keys
ALTER TABLE scheduler.rooms DROP CONSTRAINT IF EXISTS rooms_type_fkey;
ALTER TABLE scheduler.course_sessions DROP CONSTRAINT IF EXISTS course_sessions_required_room_fkey;

-- Drop old primary key and add new composite one
ALTER TABLE scheduler.room_types DROP CONSTRAINT room_types_pkey;
ALTER TABLE scheduler.room_types ADD PRIMARY KEY (name, created_by);

-- Re-add foreign keys (now reference composite key)
-- rooms.type + rooms.created_by must reference room_types(name, created_by)
ALTER TABLE scheduler.rooms
    ADD CONSTRAINT rooms_type_created_by_fkey
    FOREIGN KEY (type, created_by) REFERENCES scheduler.room_types(name, created_by);

-- course_sessions.required_room + created_by must reference room_types(name, created_by)
ALTER TABLE scheduler.course_sessions
    ADD CONSTRAINT course_sessions_required_room_created_by_fkey
    FOREIGN KEY (required_room, created_by) REFERENCES scheduler.room_types(name, created_by);

-- 2. buildings: Add unique constraint on (name, created_by)
ALTER TABLE scheduler.buildings
    ADD CONSTRAINT buildings_name_created_by_unique UNIQUE (name, created_by);

-- 3. rooms: Add unique constraint on (name, building, created_by)
ALTER TABLE scheduler.rooms
    ADD CONSTRAINT rooms_name_building_created_by_unique UNIQUE (name, building, created_by);

-- 4. courses: Add unique constraint on (name, created_by)
ALTER TABLE scheduler.courses
    ADD CONSTRAINT courses_name_created_by_unique UNIQUE (name, created_by);

-- 5. schedules: Replace UNIQUE(name) with UNIQUE(name, created_by)
ALTER TABLE scheduler.schedules DROP CONSTRAINT IF EXISTS schedules_name_key;
ALTER TABLE scheduler.schedules
    ADD CONSTRAINT schedules_name_created_by_unique UNIQUE (name, created_by);

-- 6. course_sessions: Add unique constraint to prevent duplicate session definitions
ALTER TABLE scheduler.course_sessions
    ADD CONSTRAINT course_sessions_unique UNIQUE (course_id, type, created_by);
