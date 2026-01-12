package validation

import (
	"errors"
	"fmt"
	"strings"
	"unicode/utf8"
)

// String length limits for security
const (
	MaxNameLength        = 255
	MaxDescriptionLength = 2000
	MaxRoomNameLength    = 100
	MinNameLength        = 1
)

// ErrNameTooLong is returned when a name exceeds the maximum length.
var ErrNameTooLong = errors.New("name exceeds maximum length")

// ErrNameTooShort is returned when a name is empty or only whitespace.
var ErrNameTooShort = errors.New("name is required and cannot be empty")

// ErrDescriptionTooLong is returned when a description exceeds the maximum length.
var ErrDescriptionTooLong = errors.New("description exceeds maximum length")

// ValidateName validates a name field with length constraints.
func ValidateName(name string, maxLen int) error {
	trimmed := strings.TrimSpace(name)
	if trimmed == "" {
		return ErrNameTooShort
	}
	if utf8.RuneCountInString(trimmed) > maxLen {
		return fmt.Errorf("%w: maximum %d characters allowed", ErrNameTooLong, maxLen)
	}
	return nil
}

// ValidateOptionalName validates an optional name field (for updates).
func ValidateOptionalName(name *string, maxLen int) error {
	if name == nil {
		return nil
	}
	return ValidateName(*name, maxLen)
}

// ValidateDescription validates a description field with length constraints.
func ValidateDescription(desc string, maxLen int) error {
	if utf8.RuneCountInString(desc) > maxLen {
		return fmt.Errorf("%w: maximum %d characters allowed", ErrDescriptionTooLong, maxLen)
	}
	return nil
}

// ValidateOptionalDescription validates an optional description field.
func ValidateOptionalDescription(desc *string, maxLen int) error {
	if desc == nil {
		return nil
	}
	return ValidateDescription(*desc, maxLen)
}

// SanitizeString trims whitespace and normalizes a string.
func SanitizeString(s string) string {
	return strings.TrimSpace(s)
}
