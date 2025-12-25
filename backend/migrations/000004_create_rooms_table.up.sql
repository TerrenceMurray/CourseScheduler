
-- scheduler schema define in 000001_create_types_tables

CREATE TABLE scheduler.buildings (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NULL
);

CREATE TRIGGER update_buildings_timestamp
BEFORE UPDATE ON scheduler.buildings
FOR EACH ROW
EXECUTE FUNCTION scheduler.update_timestamp();

CREATE TABLE scheduler.rooms (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    building UUID NOT NULL,
    capacity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NULL
);

ALTER TABLE scheduler.rooms ADD FOREIGN KEY (type) REFERENCES scheduler.room_types(name);
ALTER TABLE scheduler.rooms ADD FOREIGN KEY (building) REFERENCES scheduler.buildings(id);

ALTER TABLE scheduler.rooms 
ADD CONSTRAINT CHK_RoomCapacity CHECK (capacity>0);

CREATE TRIGGER update_rooms_timestamp
BEFORE UPDATE ON scheduler.rooms
FOR EACH ROW
EXECUTE FUNCTION scheduler.update_timestamp();