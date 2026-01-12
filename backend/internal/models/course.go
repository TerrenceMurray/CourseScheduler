package models

import (
	"time"

	"github.com/google/uuid"

	"github.com/TerrenceMurray/course-scheduler/internal/validation"
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
	return validation.ValidateName(c.Name, validation.MaxNameLength)
}

// CourseUpdate represents partial update fields for a course.
type CourseUpdate struct {
	Name *string `json:"name,omitempty"`
}

func (u *CourseUpdate) Validate() error {
	return validation.ValidateOptionalName(u.Name, validation.MaxNameLength)
}
