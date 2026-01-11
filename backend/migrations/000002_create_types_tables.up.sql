CREATE TABLE scheduler.room_types (
    name VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    created_by UUID NOT NULL
);

-- Foreign key constraint
ALTER TABLE scheduler.room_types ADD FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- Triggers
CREATE TRIGGER update_room_types_timestamp
BEFORE UPDATE ON scheduler.room_types
FOR EACH ROW
EXECUTE FUNCTION scheduler.update_timestamp();

CREATE TRIGGER set_room_types_created_by
BEFORE INSERT ON scheduler.room_types
FOR EACH ROW
EXECUTE FUNCTION scheduler.update_created_by();

-- Types
CREATE TYPE scheduler.course_session_type AS ENUM ('lab', 'tutorial', 'lecture');