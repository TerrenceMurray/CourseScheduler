package service_test

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/TerrenceMurray/course-scheduler/internal/models"
	"github.com/TerrenceMurray/course-scheduler/internal/service"
	"github.com/TerrenceMurray/course-scheduler/internal/tests/unit/service/mocks"
)

func TestScheduleService_Create(t *testing.T) {
	ctx := context.Background()
	schedule := &models.Schedule{
		ID:   uuid.New(),
		Name: "Fall 2025",
		Sessions: []models.ScheduledSession{
			{CourseID: uuid.New(), RoomID: uuid.New(), Day: 0, StartTime: 480, EndTime: 540},
		},
	}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockScheduleRepository{
			CreateFunc: func(ctx context.Context, s *models.Schedule) (*models.Schedule, error) {
				return schedule, nil
			},
		}

		svc := service.NewScheduleService(mockRepo)
		result, err := svc.Create(ctx, schedule)

		require.NoError(t, err)
		assert.Equal(t, schedule.ID, result.ID)
		assert.Equal(t, schedule.Name, result.Name)
	})

	t.Run("error", func(t *testing.T) {
		mockRepo := &mocks.MockScheduleRepository{
			CreateFunc: func(ctx context.Context, s *models.Schedule) (*models.Schedule, error) {
				return nil, errors.New("database error")
			},
		}

		svc := service.NewScheduleService(mockRepo)
		result, err := svc.Create(ctx, schedule)

		require.Error(t, err)
		assert.Nil(t, result)
	})
}

func TestScheduleService_GetByID(t *testing.T) {
	ctx := context.Background()
	id := uuid.New()
	schedule := &models.Schedule{ID: id, Name: "Fall 2025"}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockScheduleRepository{
			GetByIDFunc: func(ctx context.Context, reqID uuid.UUID) (*models.Schedule, error) {
				assert.Equal(t, id, reqID)
				return schedule, nil
			},
		}

		svc := service.NewScheduleService(mockRepo)
		result, err := svc.GetByID(ctx, id)

		require.NoError(t, err)
		assert.Equal(t, schedule.ID, result.ID)
	})

	t.Run("not found", func(t *testing.T) {
		mockRepo := &mocks.MockScheduleRepository{
			GetByIDFunc: func(ctx context.Context, reqID uuid.UUID) (*models.Schedule, error) {
				return nil, errors.New("not found")
			},
		}

		svc := service.NewScheduleService(mockRepo)
		result, err := svc.GetByID(ctx, id)

		require.Error(t, err)
		assert.Nil(t, result)
	})
}

func TestScheduleService_GetByName(t *testing.T) {
	ctx := context.Background()
	name := "Fall 2025"
	schedule := &models.Schedule{ID: uuid.New(), Name: name}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockScheduleRepository{
			GetByNameFunc: func(ctx context.Context, reqName string) (*models.Schedule, error) {
				assert.Equal(t, name, reqName)
				return schedule, nil
			},
		}

		svc := service.NewScheduleService(mockRepo)
		result, err := svc.GetByName(ctx, name)

		require.NoError(t, err)
		assert.Equal(t, schedule.Name, result.Name)
	})

	t.Run("not found", func(t *testing.T) {
		mockRepo := &mocks.MockScheduleRepository{
			GetByNameFunc: func(ctx context.Context, reqName string) (*models.Schedule, error) {
				return nil, errors.New("not found")
			},
		}

		svc := service.NewScheduleService(mockRepo)
		result, err := svc.GetByName(ctx, name)

		require.Error(t, err)
		assert.Nil(t, result)
	})
}

func TestScheduleService_List(t *testing.T) {
	ctx := context.Background()
	schedules := []*models.Schedule{
		{ID: uuid.New(), Name: "Fall 2025"},
		{ID: uuid.New(), Name: "Spring 2026"},
	}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockScheduleRepository{
			ListFunc: func(ctx context.Context) ([]*models.Schedule, error) {
				return schedules, nil
			},
		}

		svc := service.NewScheduleService(mockRepo)
		result, err := svc.List(ctx)

		require.NoError(t, err)
		assert.Len(t, result, 2)
	})
}

func TestScheduleService_Delete(t *testing.T) {
	ctx := context.Background()
	id := uuid.New()

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockScheduleRepository{
			DeleteFunc: func(ctx context.Context, reqID uuid.UUID) error {
				assert.Equal(t, id, reqID)
				return nil
			},
		}

		svc := service.NewScheduleService(mockRepo)
		err := svc.Delete(ctx, id)

		require.NoError(t, err)
	})
}

func TestScheduleService_Update(t *testing.T) {
	ctx := context.Background()
	id := uuid.New()
	newName := "Updated Schedule"
	updates := &models.ScheduleUpdate{Name: &newName}
	updated := &models.Schedule{ID: id, Name: newName}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockScheduleRepository{
			UpdateFunc: func(ctx context.Context, reqID uuid.UUID, u *models.ScheduleUpdate) (*models.Schedule, error) {
				assert.Equal(t, id, reqID)
				return updated, nil
			},
		}

		svc := service.NewScheduleService(mockRepo)
		result, err := svc.Update(ctx, id, updates)

		require.NoError(t, err)
		assert.Equal(t, newName, result.Name)
	})
}
