package models

import (
	"errors"
	"time"

	"github.com/google/uuid"

	"github.com/TerrenceMurray/course-scheduler/internal/validation"
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
	ID         uuid.UUID          `json:"id"`
	Name       string             `json:"name"`
	Sessions   []ScheduledSession `json:"sessions"`
	IsActive   bool               `json:"is_active"`
	IsArchived bool               `json:"is_archived"`
	CreatedAt  *time.Time         `json:"created_at,omitempty"`
}

// MaxScheduleSessions limits the number of sessions to prevent DoS
const MaxScheduleSessions = 10000

func NewSchedule(
	id uuid.UUID,
	name string,
	sessions []ScheduledSession,
	createdAt *time.Time,
) *Schedule {
	return &Schedule{
		ID:         id,
		Name:       name,
		Sessions:   sessions,
		IsActive:   false,
		IsArchived: false,
		CreatedAt:  createdAt,
	}
}

func (s *Schedule) Validate() error {
	if err := validation.ValidateName(s.Name, validation.MaxNameLength); err != nil {
		return err
	}

	if len(s.Sessions) == 0 {
		return errors.New("schedule must have at least one session")
	}

	if len(s.Sessions) > MaxScheduleSessions {
		return errors.New("schedule exceeds maximum number of sessions")
	}

	for _, session := range s.Sessions {
		if err := session.Validate(); err != nil {
			return err
		}
	}

	return nil
}

// ScheduleUpdate represents partial update fields for a Schedule.
type ScheduleUpdate struct {
	Name       *string            `json:"name,omitempty"`
	Sessions   []ScheduledSession `json:"sessions,omitempty"`
	IsActive   *bool              `json:"is_active,omitempty"`
	IsArchived *bool              `json:"is_archived,omitempty"`
}

func (u *ScheduleUpdate) Validate() error {
	if err := validation.ValidateOptionalName(u.Name, validation.MaxNameLength); err != nil {
		return err
	}

	if u.Sessions != nil {
		if len(u.Sessions) == 0 {
			return errors.New("sessions cannot be empty")
		}
		if len(u.Sessions) > MaxScheduleSessions {
			return errors.New("schedule exceeds maximum number of sessions")
		}
		for _, session := range u.Sessions {
			if err := session.Validate(); err != nil {
				return err
			}
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
