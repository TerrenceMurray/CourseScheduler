package models

import (
	"errors"
	"strings"
	"time"
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
	if strings.TrimSpace(r.Name) == "" {
		return errors.New("name is required")
	}

	return nil
}

// UpdateRoomType
type UpdateRoomType struct {
	Name *string `json:"name,omitempty"`
}

func (u *UpdateRoomType) Validate() error {
	if u.Name != nil && strings.TrimSpace(*u.Name) == "" {
		return errors.New("name cannot be empty")
	}

	return nil
}
