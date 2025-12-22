package models

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type Course struct {
	ID        uuid.UUID  `json:"id"`
	Name      string     `json:"name"`
	CreatedAt *time.Time `json:"created_at,omitempty"`
	UpdatedAt *time.Time `json:"updated_at,omitempty"`
}

func NewCourse(
	id uuid.UUID,
	name string,
	createdAt *time.Time,
	updatedAt *time.Time,
) *Course {
	return &Course{
		ID:        id,
		Name:      name,
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
	}
}

func (c *Course) Validate() error {
	if c.Name == "" {
		return errors.New("name is required")
	}

	return nil
}
