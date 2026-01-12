package models

import (
	"time"

	"github.com/google/uuid"

	"github.com/TerrenceMurray/course-scheduler/internal/validation"
)

type Building struct {
	ID        uuid.UUID  `json:"id"`
	Name      string     `json:"name"`
	CreatedAt *time.Time `json:"created_at,omitempty"`
	UpdatedAt *time.Time `json:"updated_at,omitempty"`
}

func NewBuilding(id uuid.UUID, name string, createdAt *time.Time, updatedAt *time.Time) *Building {
	return &Building{
		ID:        id,
		Name:      name,
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
	}
}

func (b *Building) Validate() error {
	return validation.ValidateName(b.Name, validation.MaxNameLength)
}

// BuildingUpdate represents partial update fields for a Building.
type BuildingUpdate struct {
	Name *string `json:"name,omitempty"`
}

func (u *BuildingUpdate) Validate() error {
	return validation.ValidateOptionalName(u.Name, validation.MaxNameLength)
}
