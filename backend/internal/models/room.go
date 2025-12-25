package models

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
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
	if strings.TrimSpace(r.Name) == "" {
		return errors.New("name is required")
	}

	if strings.TrimSpace(r.Type) == "" {
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
	if u.Name != nil && strings.TrimSpace(*u.Name) == "" {
		return errors.New("name cannot be empty")
	}

	if u.Type != nil && strings.TrimSpace(*u.Type) == "" {
		return errors.New("type cannot be empty")
	}

	if u.Capacity != nil && *u.Capacity <= 0 {
		return errors.New("capacity must be greater than 0")
	}

	return nil
}
