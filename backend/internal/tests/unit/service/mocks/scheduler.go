package mocks

import (
	"github.com/TerrenceMurray/course-scheduler/internal/scheduler"
)

// MockScheduler is a mock implementation of scheduler.Scheduler
type MockScheduler struct {
	GenerateFunc func(input *scheduler.Input) (*scheduler.Output, error)
}

var _ scheduler.Scheduler = (*MockScheduler)(nil)

func (m *MockScheduler) Generate(input *scheduler.Input) (*scheduler.Output, error) {
	return m.GenerateFunc(input)
}
