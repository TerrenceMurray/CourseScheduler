package models

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
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
	if strings.TrimSpace(b.Name) == "" {
		return errors.New("building name is required")
	}

	return nil
}

// BuildingUpdate represents partial update fields for a Building.
type BuildingUpdate struct {
	Name *string `json:"name,omitempty"`
}

func (u *BuildingUpdate) Validate() error {
	if u.Name != nil && strings.TrimSpace(*u.Name) == "" {
		return errors.New("name cannot be empty")
	}

	return nil
}
