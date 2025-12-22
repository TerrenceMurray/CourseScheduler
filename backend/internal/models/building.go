package models

import (
	"errors"

	"github.com/google/uuid"
)

type Building struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

func NewBuilding(id uuid.UUID, name string) *Building {
	return &Building{
		ID:   id,
		Name: name,
	}
}

func (b *Building) Validate() error {
	if b.Name == "" {
		return errors.New("building name is required")
	}

	return nil
}
