package service_test

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/TerrenceMurray/course-scheduler/internal/models"
	"github.com/TerrenceMurray/course-scheduler/internal/scheduler"
	"github.com/TerrenceMurray/course-scheduler/internal/service"
	"github.com/TerrenceMurray/course-scheduler/internal/tests/unit/service/mocks"
)

func TestSchedulerService_Generate(t *testing.T) {
	ctx := context.Background()

	roomID := uuid.New()
	courseID := uuid.New()
	sessionID := uuid.New()

	rooms := []*models.Room{
		{ID: roomID, Name: "Room 101", Type: "lecture_room", Capacity: 100},
	}
	courses := []models.Course{
		{ID: courseID, Name: "CS 101"},
	}
	sessions := []*models.CourseSession{
		{ID: sessionID, CourseID: courseID, RequiredRoom: "lecture_room", Type: "lecture", Duration: ptr(int32(60)), NumberOfSessions: ptr(int32(1))},
	}

	scheduledSessions := []*models.ScheduledSession{
		{CourseID: courseID, RoomID: roomID, Day: 0, StartTime: 480, EndTime: 540},
	}

	t.Run("success", func(t *testing.T) {
		mockScheduler := &mocks.MockScheduler{
			GenerateFunc: func(input *scheduler.Input) (*scheduler.Output, error) {
				return &scheduler.Output{
					ScheduledSessions: scheduledSessions,
					Failures:          []*scheduler.FailedSession{},
				}, nil
			},
		}

		mockRoomRepo := &mocks.MockRoomRepository{
			ListFunc: func(ctx context.Context) ([]*models.Room, error) {
				return rooms, nil
			},
		}

		mockCourseRepo := &mocks.MockCourseRepository{
			ListFunc: func(ctx context.Context) ([]models.Course, error) {
				return courses, nil
			},
		}

		mockSessionRepo := &mocks.MockCourseSessionRepository{
			ListFunc: func(ctx context.Context) ([]*models.CourseSession, error) {
				return sessions, nil
			},
		}

		mockScheduleRepo := &mocks.MockScheduleRepository{}

		svc := service.NewSchedulerService(mockScheduler, mockScheduleRepo, mockRoomRepo, mockCourseRepo, mockSessionRepo)
		output, err := svc.Generate(ctx, nil)

		require.NoError(t, err)
		assert.Len(t, output.ScheduledSessions, 1)
		assert.Empty(t, output.Failures)
	})

	t.Run("error fetching rooms", func(t *testing.T) {
		mockScheduler := &mocks.MockScheduler{}

		mockRoomRepo := &mocks.MockRoomRepository{
			ListFunc: func(ctx context.Context) ([]*models.Room, error) {
				return nil, errors.New("database error")
			},
		}

		mockCourseRepo := &mocks.MockCourseRepository{}
		mockSessionRepo := &mocks.MockCourseSessionRepository{}
		mockScheduleRepo := &mocks.MockScheduleRepository{}

		svc := service.NewSchedulerService(mockScheduler, mockScheduleRepo, mockRoomRepo, mockCourseRepo, mockSessionRepo)
		output, err := svc.Generate(ctx, nil)

		require.Error(t, err)
		assert.Nil(t, output)
		assert.Contains(t, err.Error(), "failed to fetch rooms")
	})

	t.Run("error fetching courses", func(t *testing.T) {
		mockScheduler := &mocks.MockScheduler{}

		mockRoomRepo := &mocks.MockRoomRepository{
			ListFunc: func(ctx context.Context) ([]*models.Room, error) {
				return rooms, nil
			},
		}

		mockCourseRepo := &mocks.MockCourseRepository{
			ListFunc: func(ctx context.Context) ([]models.Course, error) {
				return nil, errors.New("database error")
			},
		}

		mockSessionRepo := &mocks.MockCourseSessionRepository{}
		mockScheduleRepo := &mocks.MockScheduleRepository{}

		svc := service.NewSchedulerService(mockScheduler, mockScheduleRepo, mockRoomRepo, mockCourseRepo, mockSessionRepo)
		output, err := svc.Generate(ctx, nil)

		require.Error(t, err)
		assert.Nil(t, output)
		assert.Contains(t, err.Error(), "failed to fetch courses")
	})

	t.Run("error fetching sessions", func(t *testing.T) {
		mockScheduler := &mocks.MockScheduler{}

		mockRoomRepo := &mocks.MockRoomRepository{
			ListFunc: func(ctx context.Context) ([]*models.Room, error) {
				return rooms, nil
			},
		}

		mockCourseRepo := &mocks.MockCourseRepository{
			ListFunc: func(ctx context.Context) ([]models.Course, error) {
				return courses, nil
			},
		}

		mockSessionRepo := &mocks.MockCourseSessionRepository{
			ListFunc: func(ctx context.Context) ([]*models.CourseSession, error) {
				return nil, errors.New("database error")
			},
		}

		mockScheduleRepo := &mocks.MockScheduleRepository{}

		svc := service.NewSchedulerService(mockScheduler, mockScheduleRepo, mockRoomRepo, mockCourseRepo, mockSessionRepo)
		output, err := svc.Generate(ctx, nil)

		require.Error(t, err)
		assert.Nil(t, output)
		assert.Contains(t, err.Error(), "failed to fetch sessions")
	})

	t.Run("scheduler error", func(t *testing.T) {
		mockScheduler := &mocks.MockScheduler{
			GenerateFunc: func(input *scheduler.Input) (*scheduler.Output, error) {
				return nil, errors.New("scheduling failed")
			},
		}

		mockRoomRepo := &mocks.MockRoomRepository{
			ListFunc: func(ctx context.Context) ([]*models.Room, error) {
				return rooms, nil
			},
		}

		mockCourseRepo := &mocks.MockCourseRepository{
			ListFunc: func(ctx context.Context) ([]models.Course, error) {
				return courses, nil
			},
		}

		mockSessionRepo := &mocks.MockCourseSessionRepository{
			ListFunc: func(ctx context.Context) ([]*models.CourseSession, error) {
				return sessions, nil
			},
		}

		mockScheduleRepo := &mocks.MockScheduleRepository{}

		svc := service.NewSchedulerService(mockScheduler, mockScheduleRepo, mockRoomRepo, mockCourseRepo, mockSessionRepo)
		output, err := svc.Generate(ctx, nil)

		require.Error(t, err)
		assert.Nil(t, output)
	})
}

func TestSchedulerService_GenerateAndSave(t *testing.T) {
	ctx := context.Background()

	roomID := uuid.New()
	courseID := uuid.New()
	sessionID := uuid.New()

	rooms := []*models.Room{
		{ID: roomID, Name: "Room 101", Type: "lecture_room", Capacity: 100},
	}
	courses := []models.Course{
		{ID: courseID, Name: "CS 101"},
	}
	sessions := []*models.CourseSession{
		{ID: sessionID, CourseID: courseID, RequiredRoom: "lecture_room", Type: "lecture", Duration: ptr(int32(60)), NumberOfSessions: ptr(int32(1))},
	}

	scheduledSessions := []*models.ScheduledSession{
		{CourseID: courseID, RoomID: roomID, Day: 0, StartTime: 480, EndTime: 540},
	}

	t.Run("success", func(t *testing.T) {
		mockScheduler := &mocks.MockScheduler{
			GenerateFunc: func(input *scheduler.Input) (*scheduler.Output, error) {
				return &scheduler.Output{
					ScheduledSessions: scheduledSessions,
					Failures:          []*scheduler.FailedSession{},
				}, nil
			},
		}

		mockRoomRepo := &mocks.MockRoomRepository{
			ListFunc: func(ctx context.Context) ([]*models.Room, error) {
				return rooms, nil
			},
		}

		mockCourseRepo := &mocks.MockCourseRepository{
			ListFunc: func(ctx context.Context) ([]models.Course, error) {
				return courses, nil
			},
		}

		mockSessionRepo := &mocks.MockCourseSessionRepository{
			ListFunc: func(ctx context.Context) ([]*models.CourseSession, error) {
				return sessions, nil
			},
		}

		mockScheduleRepo := &mocks.MockScheduleRepository{
			CreateFunc: func(ctx context.Context, s *models.Schedule) (*models.Schedule, error) {
				assert.Equal(t, "Fall 2025", s.Name)
				assert.Len(t, s.Sessions, 1)
				return s, nil
			},
		}

		svc := service.NewSchedulerService(mockScheduler, mockScheduleRepo, mockRoomRepo, mockCourseRepo, mockSessionRepo)
		schedule, output, err := svc.GenerateAndSave(ctx, "Fall 2025", nil)

		require.NoError(t, err)
		assert.NotNil(t, schedule)
		assert.Equal(t, "Fall 2025", schedule.Name)
		assert.Len(t, schedule.Sessions, 1)
		assert.Len(t, output.ScheduledSessions, 1)
		assert.Empty(t, output.Failures)
	})

	t.Run("generate error", func(t *testing.T) {
		mockScheduler := &mocks.MockScheduler{
			GenerateFunc: func(input *scheduler.Input) (*scheduler.Output, error) {
				return nil, errors.New("scheduling failed")
			},
		}

		mockRoomRepo := &mocks.MockRoomRepository{
			ListFunc: func(ctx context.Context) ([]*models.Room, error) {
				return rooms, nil
			},
		}

		mockCourseRepo := &mocks.MockCourseRepository{
			ListFunc: func(ctx context.Context) ([]models.Course, error) {
				return courses, nil
			},
		}

		mockSessionRepo := &mocks.MockCourseSessionRepository{
			ListFunc: func(ctx context.Context) ([]*models.CourseSession, error) {
				return sessions, nil
			},
		}

		mockScheduleRepo := &mocks.MockScheduleRepository{}

		svc := service.NewSchedulerService(mockScheduler, mockScheduleRepo, mockRoomRepo, mockCourseRepo, mockSessionRepo)
		schedule, output, err := svc.GenerateAndSave(ctx, "Fall 2025", nil)

		require.Error(t, err)
		assert.Nil(t, schedule)
		assert.Nil(t, output)
		assert.Contains(t, err.Error(), "failed to generate schedule")
	})

	t.Run("save error returns output", func(t *testing.T) {
		mockScheduler := &mocks.MockScheduler{
			GenerateFunc: func(input *scheduler.Input) (*scheduler.Output, error) {
				return &scheduler.Output{
					ScheduledSessions: scheduledSessions,
					Failures:          []*scheduler.FailedSession{},
				}, nil
			},
		}

		mockRoomRepo := &mocks.MockRoomRepository{
			ListFunc: func(ctx context.Context) ([]*models.Room, error) {
				return rooms, nil
			},
		}

		mockCourseRepo := &mocks.MockCourseRepository{
			ListFunc: func(ctx context.Context) ([]models.Course, error) {
				return courses, nil
			},
		}

		mockSessionRepo := &mocks.MockCourseSessionRepository{
			ListFunc: func(ctx context.Context) ([]*models.CourseSession, error) {
				return sessions, nil
			},
		}

		mockScheduleRepo := &mocks.MockScheduleRepository{
			CreateFunc: func(ctx context.Context, s *models.Schedule) (*models.Schedule, error) {
				return nil, errors.New("database error")
			},
		}

		svc := service.NewSchedulerService(mockScheduler, mockScheduleRepo, mockRoomRepo, mockCourseRepo, mockSessionRepo)
		schedule, output, err := svc.GenerateAndSave(ctx, "Fall 2025", nil)

		require.Error(t, err)
		assert.Nil(t, schedule)
		// Output is still returned even if save fails
		assert.NotNil(t, output)
		assert.Len(t, output.ScheduledSessions, 1)
		assert.Contains(t, err.Error(), "failed to save schedule")
	})

	t.Run("with config", func(t *testing.T) {
		config := &scheduler.Config{
			OperatingHours:          scheduler.TimeRange{Start: 480, End: 1260},
			OperatingDays:           []scheduler.Day{scheduler.Monday, scheduler.Tuesday},
			MinBreakBetweenSessions: 15,
			PreferredSlotDuration:   60,
		}

		mockScheduler := &mocks.MockScheduler{
			GenerateFunc: func(input *scheduler.Input) (*scheduler.Output, error) {
				// Verify config is passed through
				assert.Equal(t, config, input.Config)
				return &scheduler.Output{
					ScheduledSessions: scheduledSessions,
					Failures:          []*scheduler.FailedSession{},
				}, nil
			},
		}

		mockRoomRepo := &mocks.MockRoomRepository{
			ListFunc: func(ctx context.Context) ([]*models.Room, error) {
				return rooms, nil
			},
		}

		mockCourseRepo := &mocks.MockCourseRepository{
			ListFunc: func(ctx context.Context) ([]models.Course, error) {
				return courses, nil
			},
		}

		mockSessionRepo := &mocks.MockCourseSessionRepository{
			ListFunc: func(ctx context.Context) ([]*models.CourseSession, error) {
				return sessions, nil
			},
		}

		mockScheduleRepo := &mocks.MockScheduleRepository{
			CreateFunc: func(ctx context.Context, s *models.Schedule) (*models.Schedule, error) {
				return s, nil
			},
		}

		svc := service.NewSchedulerService(mockScheduler, mockScheduleRepo, mockRoomRepo, mockCourseRepo, mockSessionRepo)
		schedule, output, err := svc.GenerateAndSave(ctx, "Fall 2025", config)

		require.NoError(t, err)
		assert.NotNil(t, schedule)
		assert.NotNil(t, output)
	})

	t.Run("with failures", func(t *testing.T) {
		failedSession := &models.CourseSession{
			ID:       uuid.New(),
			CourseID: courseID,
			Type:     "lab",
		}

		mockScheduler := &mocks.MockScheduler{
			GenerateFunc: func(input *scheduler.Input) (*scheduler.Output, error) {
				return &scheduler.Output{
					ScheduledSessions: scheduledSessions,
					Failures: []*scheduler.FailedSession{
						{CourseSession: failedSession, Reason: "no available slot"},
					},
				}, nil
			},
		}

		mockRoomRepo := &mocks.MockRoomRepository{
			ListFunc: func(ctx context.Context) ([]*models.Room, error) {
				return rooms, nil
			},
		}

		mockCourseRepo := &mocks.MockCourseRepository{
			ListFunc: func(ctx context.Context) ([]models.Course, error) {
				return courses, nil
			},
		}

		mockSessionRepo := &mocks.MockCourseSessionRepository{
			ListFunc: func(ctx context.Context) ([]*models.CourseSession, error) {
				return sessions, nil
			},
		}

		mockScheduleRepo := &mocks.MockScheduleRepository{
			CreateFunc: func(ctx context.Context, s *models.Schedule) (*models.Schedule, error) {
				return s, nil
			},
		}

		svc := service.NewSchedulerService(mockScheduler, mockScheduleRepo, mockRoomRepo, mockCourseRepo, mockSessionRepo)
		schedule, output, err := svc.GenerateAndSave(ctx, "Fall 2025", nil)

		require.NoError(t, err)
		assert.NotNil(t, schedule)
		assert.Len(t, output.ScheduledSessions, 1)
		assert.Len(t, output.Failures, 1)
		assert.Equal(t, "no available slot", output.Failures[0].Reason)
	})
}
