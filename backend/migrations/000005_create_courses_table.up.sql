CREATE TABLE scheduler.courses (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    created_by UUID NOT NULL
);

-- Foreign key constraint
ALTER TABLE scheduler.courses ADD FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- Triggers
CREATE TRIGGER update_courses_timestamp
BEFORE UPDATE ON scheduler.courses
FOR EACH ROW
EXECUTE FUNCTION scheduler.update_timestamp();

CREATE TRIGGER set_courses_created_by
BEFORE INSERT ON scheduler.courses
FOR EACH ROW
EXECUTE FUNCTION scheduler.update_created_by();