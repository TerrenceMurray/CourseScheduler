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

func TestCourseService_Create(t *testing.T) {
	ctx := context.Background()
	course := &models.Course{ID: uuid.New(), Name: "Computer Science 101"}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockCourseRepository{
			CreateFunc: func(ctx context.Context, c *models.Course) (*models.Course, error) {
				return course, nil
			},
		}

		svc := service.NewCourseService(mockRepo)
		result, err := svc.Create(ctx, course)

		require.NoError(t, err)
		assert.Equal(t, course.ID, result.ID)
		assert.Equal(t, course.Name, result.Name)
	})

	t.Run("error", func(t *testing.T) {
		mockRepo := &mocks.MockCourseRepository{
			CreateFunc: func(ctx context.Context, c *models.Course) (*models.Course, error) {
				return nil, errors.New("database error")
			},
		}

		svc := service.NewCourseService(mockRepo)
		result, err := svc.Create(ctx, course)

		require.Error(t, err)
		assert.Nil(t, result)
	})
}

func TestCourseService_CreateBatch(t *testing.T) {
	ctx := context.Background()
	courses := []*models.Course{
		{ID: uuid.New(), Name: "Course A"},
		{ID: uuid.New(), Name: "Course B"},
	}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockCourseRepository{
			CreateBatchFunc: func(ctx context.Context, c []*models.Course) ([]*models.Course, error) {
				return courses, nil
			},
		}

		svc := service.NewCourseService(mockRepo)
		result, err := svc.CreateBatch(ctx, courses)

		require.NoError(t, err)
		assert.Len(t, result, 2)
	})
}

func TestCourseService_GetByID(t *testing.T) {
	ctx := context.Background()
	id := uuid.New()
	course := &models.Course{ID: id, Name: "Computer Science 101"}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockCourseRepository{
			GetByIDFunc: func(ctx context.Context, reqID uuid.UUID) (*models.Course, error) {
				return course, nil
			},
		}

		svc := service.NewCourseService(mockRepo)
		result, err := svc.GetByID(ctx, id)

		require.NoError(t, err)
		assert.Equal(t, course.ID, result.ID)
	})

	t.Run("not found", func(t *testing.T) {
		mockRepo := &mocks.MockCourseRepository{
			GetByIDFunc: func(ctx context.Context, reqID uuid.UUID) (*models.Course, error) {
				return nil, errors.New("not found")
			},
		}

		svc := service.NewCourseService(mockRepo)
		result, err := svc.GetByID(ctx, id)

		require.Error(t, err)
		assert.Nil(t, result)
	})
}

func TestCourseService_List(t *testing.T) {
	ctx := context.Background()
	courses := []models.Course{
		{ID: uuid.New(), Name: "Course A"},
		{ID: uuid.New(), Name: "Course B"},
	}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockCourseRepository{
			ListFunc: func(ctx context.Context) ([]models.Course, error) {
				return courses, nil
			},
		}

		svc := service.NewCourseService(mockRepo)
		result, err := svc.List(ctx)

		require.NoError(t, err)
		assert.Len(t, result, 2)
	})
}

func TestCourseService_Delete(t *testing.T) {
	ctx := context.Background()
	id := uuid.New()

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockCourseRepository{
			DeleteFunc: func(ctx context.Context, reqID uuid.UUID) error {
				return nil
			},
		}

		svc := service.NewCourseService(mockRepo)
		err := svc.Delete(ctx, id)

		require.NoError(t, err)
	})
}

func TestCourseService_Update(t *testing.T) {
	ctx := context.Background()
	id := uuid.New()
	newName := "Updated Course"
	updates := &models.CourseUpdate{Name: &newName}
	updated := &models.Course{ID: id, Name: newName}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockCourseRepository{
			UpdateFunc: func(ctx context.Context, reqID uuid.UUID, u *models.CourseUpdate) (*models.Course, error) {
				return updated, nil
			},
		}

		svc := service.NewCourseService(mockRepo)
		result, err := svc.Update(ctx, id, updates)

		require.NoError(t, err)
		assert.Equal(t, newName, result.Name)
	})
}
