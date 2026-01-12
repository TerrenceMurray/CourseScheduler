package models

import (
	"time"

	"github.com/TerrenceMurray/course-scheduler/internal/validation"
)

type RoomType struct {
	Name      string     `json:"name"`
	CreatedAt *time.Time `json:"created_at,omitempty"`
	UpdatedAt *time.Time `json:"updated_at,omitempty"`
}

func NewRoomType(
	name string,
	createdAt *time.Time,
	updatedAt *time.Time,
) *RoomType {
	return &RoomType{
		Name:      name,
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
	}
}

func (r *RoomType) Validate() error {
	return validation.ValidateName(r.Name, validation.MaxNameLength)
}

// UpdateRoomType represents partial update fields for a RoomType.
type UpdateRoomType struct {
	Name *string `json:"name,omitempty"`
}

func (u *UpdateRoomType) Validate() error {
	return validation.ValidateOptionalName(u.Name, validation.MaxNameLength)
}
