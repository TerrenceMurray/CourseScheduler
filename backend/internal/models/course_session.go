package models

import (
	"errors"
	"fmt"

	"github.com/google/uuid"
)

var validSessionTypes = map[string]bool{
	"lecture":  true,
	"lab":      true,
	"tutorial": true,
}

type CourseSession struct {
	ID               uuid.UUID `json:"id"`
	CourseID         uuid.UUID `json:"course_id"`
	RequiredRoom     string    `json:"required_room"`
	Type             string    `json:"type"` // enum.course_session_type
	Duration         *int32    `json:"duration"`
	NumberOfSessions *int32    `json:"number_of_sessions"`
}

func NewCourseSession(
	id uuid.UUID,
	courseID uuid.UUID,
	requiredRoom string,
	sessionType string,
	duration *int32,
	numberOfSessions *int32,
) *CourseSession {
	return &CourseSession{
		ID:               id,
		CourseID:         courseID,
		RequiredRoom:     requiredRoom,
		Type:             sessionType,
		Duration:         duration,
		NumberOfSessions: numberOfSessions,
	}
}

func (c *CourseSession) Validate() error {
	if !validSessionTypes[c.Type] {
		return fmt.Errorf("invalid session type: %s", c.Type)
	}

	if c.Duration == nil {
		return errors.New("duration is required")
	}

	if c.NumberOfSessions == nil {
		return errors.New("number of sessions is required")
	}

	if *c.NumberOfSessions <= 0 {
		return errors.New("number of sessions must be greater than 0 (> 0)")
	}

	return nil
}
