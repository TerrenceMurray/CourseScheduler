-- Course sessions define the scheduling requirements for each course
-- e.g., "Calculus I needs 2 lectures (60 min) and 1 tutorial (45 min) per week"
CREATE TABLE scheduler.course_sessions (
    id UUID PRIMARY KEY,
    course_id UUID NOT NULL,
    required_room VARCHAR(255) NOT NULL,  -- room type needed (e.g., 'lecture_room', 'computer_lab')
    type scheduler.course_session_type NOT NULL,  -- 'lecture', 'lab', or 'tutorial'
    duration INT,  -- session length in minutes
    number_of_sessions INT,  -- how many times per week
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by UUID NOT NULL
);

-- Foreign key constraints
ALTER TABLE scheduler.course_sessions ADD FOREIGN KEY (required_room) REFERENCES scheduler.room_types(name);
ALTER TABLE scheduler.course_sessions ADD FOREIGN KEY (course_id) REFERENCES scheduler.courses(id);
ALTER TABLE scheduler.course_sessions ADD FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- Triggers
CREATE TRIGGER update_course_sessions_timestamp
BEFORE UPDATE ON scheduler.course_sessions
FOR EACH ROW
EXECUTE FUNCTION scheduler.update_timestamp();

CREATE TRIGGER set_course_sessions_created_by
BEFORE INSERT ON scheduler.course_sessions
FOR EACH ROW
EXECUTE FUNCTION scheduler.update_created_by();

-- Database catalog comments (viewable with \d+ in psql)
COMMENT ON TABLE scheduler.course_sessions IS 'Defines scheduling requirements for each course (e.g., "Calculus I needs 2 lectures and 1 tutorial per week")';
COMMENT ON COLUMN scheduler.course_sessions.required_room IS 'Room type needed (e.g., lecture_room, computer_lab)';
COMMENT ON COLUMN scheduler.course_sessions.type IS 'Session type: lecture, lab, or tutorial';
COMMENT ON COLUMN scheduler.course_sessions.duration IS 'Session length in minutes';
COMMENT ON COLUMN scheduler.course_sessions.number_of_sessions IS 'How many times per week this session occurs';

-- Schedules store the output of the scheduling algorithm
-- Sessions are stored as JSONB for flexible querying by course, room, or building
CREATE TABLE scheduler.schedules (
    id UUID PRIMARY KEY,
    name VARCHAR(255) UNIQUE,  -- e.g., "Fall 2025 Schedule"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sessions JSONB NOT NULL,
    -- sessions structure:
    -- [
    --     {
    --         "course_id": "uuid",
    --         "room_id": "uuid",
    --         "day": 0-6,  (0 = Monday, 6 = Sunday)
    --         "start_time": 480,  (minutes from midnight, e.g., 8:00 AM)
    --         "end_time": 540  (minutes from midnight, e.g., 9:00 AM)
    --     }, ...
    -- ]
    is_archived BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID NOT NULL
);

-- Foreign key constraint
ALTER TABLE scheduler.schedules ADD FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- Indexes for efficient querying
CREATE UNIQUE INDEX idx_is_active ON scheduler.schedules(is_active);

-- Database catalog comments
COMMENT ON TABLE scheduler.schedules IS 'Stores the output of the scheduling algorithm';
COMMENT ON COLUMN scheduler.schedules.name IS 'Schedule identifier (e.g., Fall 2025 Schedule)';
COMMENT ON COLUMN scheduler.schedules.sessions IS 'JSONB array: [{course_id, room_id, day (0-6), start_time (mins), end_time (mins)}, ...]';

-- Triggers
CREATE TRIGGER set_schedule_inactive
BEFORE INSERT ON scheduler.schedules
FOR EACH ROW
WHEN (NEW.is_active = TRUE)
EXECUTE FUNCTION scheduler.deactivate_other_schedules();

CREATE TRIGGER set_schedule_created_by
BEFORE INSERT ON scheduler.schedules
FOR EACH ROW
EXECUTE FUNCTION scheduler.update_created_by();