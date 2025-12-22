package models

import (
	"errors"
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
	if r.Name == "" {
		return errors.New("name is required")
	}

	return nil
}
