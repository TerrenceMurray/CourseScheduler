package models

import (
	"errors"
	"time"

	"github.com/google/uuid"

	"github.com/TerrenceMurray/course-scheduler/internal/validation"
)

type Room struct {
	ID        uuid.UUID  `json:"id"`
	Name      string     `json:"name"`
	Type      string     `json:"type"`
	Building  uuid.UUID  `json:"building_id"`
	Capacity  int32      `json:"capacity"`
	CreatedAt *time.Time `json:"created_at,omitempty"`
	UpdatedAt *time.Time `json:"updated_at,omitempty"`
}

func NewRoom(
	id uuid.UUID,
	name string,
	roomType string,
	building uuid.UUID,
	capacity int32,
	createdAt *time.Time,
	updatedAt *time.Time,
) *Room {
	return &Room{
		ID:        id,
		Name:      name,
		Type:      roomType,
		Building:  building,
		Capacity:  capacity,
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
	}
}

func (r *Room) Validate() error {
	if err := validation.ValidateName(r.Name, validation.MaxRoomNameLength); err != nil {
		return err
	}

	if err := validation.ValidateName(r.Type, validation.MaxNameLength); err != nil {
		return errors.New("type is required")
	}

	if r.Capacity <= 0 {
		return errors.New("capacity must be greater than 0")
	}

	return nil
}

// RoomUpdate represents partial update fields for a Room.
type RoomUpdate struct {
	Name     *string    `json:"name,omitempty"`
	Type     *string    `json:"type,omitempty"`
	Building *uuid.UUID `json:"building,omitempty"`
	Capacity *int32     `json:"capacity,omitempty"`
}

func (u *RoomUpdate) Validate() error {
	if err := validation.ValidateOptionalName(u.Name, validation.MaxRoomNameLength); err != nil {
		return err
	}

	if err := validation.ValidateOptionalName(u.Type, validation.MaxNameLength); err != nil {
		return errors.New("type cannot be empty")
	}

	if u.Capacity != nil && *u.Capacity <= 0 {
		return errors.New("capacity must be greater than 0")
	}

	return nil
}
