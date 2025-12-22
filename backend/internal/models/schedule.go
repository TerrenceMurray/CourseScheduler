package models

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

// ScheduledSession represents a single scheduled session within a schedule
type ScheduledSession struct {
	CourseID  uuid.UUID `json:"course_id"`
	RoomID    uuid.UUID `json:"room_id"`
	Day       int       `json:"day"`        // 0-6 (0 = Monday, 6 = Sunday)
	StartTime int       `json:"start_time"` // minutes from midnight
	EndTime   int       `json:"end_time"`   // minutes from midnight
}

// Schedule represents a complete schedule with all sessions
type Schedule struct {
	ID        uuid.UUID          `json:"id"`
	Name      string             `json:"name"`
	Sessions  []ScheduledSession `json:"sessions"`
	CreatedAt *time.Time         `json:"created_at,omitempty"`
}

func NewSchedule(
	id uuid.UUID,
	name string,
	sessions []ScheduledSession,
	createdAt *time.Time,
) *Schedule {
	return &Schedule{
		ID:        id,
		Name:      name,
		Sessions:  sessions,
		CreatedAt: createdAt,
	}
}

func (s *Schedule) Validate() error {
	if s.Name == "" {
		return errors.New("schedule name is required")
	}

	if len(s.Sessions) == 0 {
		return errors.New("schedule must have at least one session")
	}

	for _, session := range s.Sessions {
		if err := session.Validate(); err != nil {
			return err
		}
	}

	return nil
}

func (ss *ScheduledSession) Validate() error {
	if ss.Day < 0 || ss.Day > 6 {
		return errors.New("day must be between 0 and 6")
	}

	if ss.StartTime < 0 || ss.StartTime >= 1440 {
		return errors.New("start_time must be between 0 and 1439 minutes")
	}

	if ss.EndTime < 0 || ss.EndTime >= 1440 {
		return errors.New("end_time must be between 0 and 1439 minutes")
	}

	if ss.EndTime <= ss.StartTime {
		return errors.New("end_time must be after start_time")
	}

	return nil
}
