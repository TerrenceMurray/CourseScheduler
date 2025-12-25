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

func ptr[T any](v T) *T { return &v }

func TestCourseSessionService_Create(t *testing.T) {
	ctx := context.Background()
	session := &models.CourseSession{
		ID:               uuid.New(),
		CourseID:         uuid.New(),
		RequiredRoom:     "lecture_room",
		Type:             "lecture",
		Duration:         ptr(int32(60)),
		NumberOfSessions: ptr(int32(2)),
	}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockCourseSessionRepository{
			CreateFunc: func(ctx context.Context, s *models.CourseSession) (*models.CourseSession, error) {
				return session, nil
			},
		}

		svc := service.NewCourseSessionService(mockRepo)
		result, err := svc.Create(ctx, session)

		require.NoError(t, err)
		assert.Equal(t, session.ID, result.ID)
	})

	t.Run("error", func(t *testing.T) {
		mockRepo := &mocks.MockCourseSessionRepository{
			CreateFunc: func(ctx context.Context, s *models.CourseSession) (*models.CourseSession, error) {
				return nil, errors.New("database error")
			},
		}

		svc := service.NewCourseSessionService(mockRepo)
		result, err := svc.Create(ctx, session)

		require.Error(t, err)
		assert.Nil(t, result)
	})
}

func TestCourseSessionService_CreateBatch(t *testing.T) {
	ctx := context.Background()
	sessions := []*models.CourseSession{
		{ID: uuid.New(), CourseID: uuid.New(), RequiredRoom: "lecture_room", Type: "lecture", Duration: ptr(int32(60)), NumberOfSessions: ptr(int32(2))},
		{ID: uuid.New(), CourseID: uuid.New(), RequiredRoom: "lab", Type: "lab", Duration: ptr(int32(120)), NumberOfSessions: ptr(int32(1))},
	}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockCourseSessionRepository{
			CreateBatchFunc: func(ctx context.Context, s []*models.CourseSession) ([]*models.CourseSession, error) {
				return sessions, nil
			},
		}

		svc := service.NewCourseSessionService(mockRepo)
		result, err := svc.CreateBatch(ctx, sessions)

		require.NoError(t, err)
		assert.Len(t, result, 2)
	})
}

func TestCourseSessionService_GetByID(t *testing.T) {
	ctx := context.Background()
	id := uuid.New()
	session := &models.CourseSession{ID: id, CourseID: uuid.New(), RequiredRoom: "lecture_room", Type: "lecture"}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockCourseSessionRepository{
			GetByIDFunc: func(ctx context.Context, reqID uuid.UUID) (*models.CourseSession, error) {
				return session, nil
			},
		}

		svc := service.NewCourseSessionService(mockRepo)
		result, err := svc.GetByID(ctx, id)

		require.NoError(t, err)
		assert.Equal(t, session.ID, result.ID)
	})

	t.Run("not found", func(t *testing.T) {
		mockRepo := &mocks.MockCourseSessionRepository{
			GetByIDFunc: func(ctx context.Context, reqID uuid.UUID) (*models.CourseSession, error) {
				return nil, errors.New("not found")
			},
		}

		svc := service.NewCourseSessionService(mockRepo)
		result, err := svc.GetByID(ctx, id)

		require.Error(t, err)
		assert.Nil(t, result)
	})
}

func TestCourseSessionService_GetByCourseID(t *testing.T) {
	ctx := context.Background()
	courseID := uuid.New()
	sessions := []*models.CourseSession{
		{ID: uuid.New(), CourseID: courseID, RequiredRoom: "lecture_room", Type: "lecture"},
		{ID: uuid.New(), CourseID: courseID, RequiredRoom: "lab", Type: "lab"},
	}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockCourseSessionRepository{
			GetByCourseIDFunc: func(ctx context.Context, reqID uuid.UUID) ([]*models.CourseSession, error) {
				assert.Equal(t, courseID, reqID)
				return sessions, nil
			},
		}

		svc := service.NewCourseSessionService(mockRepo)
		result, err := svc.GetByCourseID(ctx, courseID)

		require.NoError(t, err)
		assert.Len(t, result, 2)
	})

	t.Run("empty", func(t *testing.T) {
		mockRepo := &mocks.MockCourseSessionRepository{
			GetByCourseIDFunc: func(ctx context.Context, reqID uuid.UUID) ([]*models.CourseSession, error) {
				return []*models.CourseSession{}, nil
			},
		}

		svc := service.NewCourseSessionService(mockRepo)
		result, err := svc.GetByCourseID(ctx, courseID)

		require.NoError(t, err)
		assert.Empty(t, result)
	})
}

func TestCourseSessionService_List(t *testing.T) {
	ctx := context.Background()
	sessions := []*models.CourseSession{
		{ID: uuid.New(), CourseID: uuid.New(), RequiredRoom: "lecture_room", Type: "lecture"},
	}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockCourseSessionRepository{
			ListFunc: func(ctx context.Context) ([]*models.CourseSession, error) {
				return sessions, nil
			},
		}

		svc := service.NewCourseSessionService(mockRepo)
		result, err := svc.List(ctx)

		require.NoError(t, err)
		assert.Len(t, result, 1)
	})
}

func TestCourseSessionService_Delete(t *testing.T) {
	ctx := context.Background()
	id := uuid.New()

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockCourseSessionRepository{
			DeleteFunc: func(ctx context.Context, reqID uuid.UUID) error {
				return nil
			},
		}

		svc := service.NewCourseSessionService(mockRepo)
		err := svc.Delete(ctx, id)

		require.NoError(t, err)
	})
}

func TestCourseSessionService_Update(t *testing.T) {
	ctx := context.Background()
	id := uuid.New()
	newDuration := int32(90)
	updates := &models.CourseSessionUpdate{Duration: &newDuration}
	updated := &models.CourseSession{ID: id, Duration: &newDuration}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockCourseSessionRepository{
			UpdateFunc: func(ctx context.Context, reqID uuid.UUID, u *models.CourseSessionUpdate) (*models.CourseSession, error) {
				return updated, nil
			},
		}

		svc := service.NewCourseSessionService(mockRepo)
		result, err := svc.Update(ctx, id, updates)

		require.NoError(t, err)
		assert.Equal(t, newDuration, *result.Duration)
	})
}
