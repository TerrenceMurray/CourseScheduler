package models

import (
	"errors"
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
}

func NewRoom(
	id uuid.UUID,
	name string,
	_type string,
	building uuid.UUID,
	capacity int32,
	createdAt *time.Time,
) *Room {
	return &Room{
		ID:        id,
		Name:      name,
		Type:      _type,
		Building:  building,
		Capacity:  capacity,
		CreatedAt: createdAt,
	}
}

func (r *Room) Validate() error {
	if r.Name == "" {
		return errors.New("name is required")
	}

	if r.Type == "" {
		return errors.New("type is required")
	}

	if r.Capacity <= 0 {
		return errors.New("capacity must be greater than 0")
	}

	return nil
}
