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

func TestBuildingService_Create(t *testing.T) {
	ctx := context.Background()
	building := &models.Building{ID: uuid.New(), Name: "Science Building"}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockBuildingRepository{
			CreateFunc: func(ctx context.Context, b *models.Building) (*models.Building, error) {
				return building, nil
			},
		}

		svc := service.NewBuildingService(mockRepo)
		result, err := svc.Create(ctx, building)

		require.NoError(t, err)
		assert.Equal(t, building.ID, result.ID)
		assert.Equal(t, building.Name, result.Name)
	})

	t.Run("error", func(t *testing.T) {
		mockRepo := &mocks.MockBuildingRepository{
			CreateFunc: func(ctx context.Context, b *models.Building) (*models.Building, error) {
				return nil, errors.New("database error")
			},
		}

		svc := service.NewBuildingService(mockRepo)
		result, err := svc.Create(ctx, building)

		require.Error(t, err)
		assert.Nil(t, result)
	})
}

func TestBuildingService_CreateBatch(t *testing.T) {
	ctx := context.Background()
	buildings := []*models.Building{
		{ID: uuid.New(), Name: "Building A"},
		{ID: uuid.New(), Name: "Building B"},
	}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockBuildingRepository{
			CreateBatchFunc: func(ctx context.Context, b []*models.Building) ([]*models.Building, error) {
				return buildings, nil
			},
		}

		svc := service.NewBuildingService(mockRepo)
		result, err := svc.CreateBatch(ctx, buildings)

		require.NoError(t, err)
		assert.Len(t, result, 2)
	})

	t.Run("error", func(t *testing.T) {
		mockRepo := &mocks.MockBuildingRepository{
			CreateBatchFunc: func(ctx context.Context, b []*models.Building) ([]*models.Building, error) {
				return nil, errors.New("database error")
			},
		}

		svc := service.NewBuildingService(mockRepo)
		result, err := svc.CreateBatch(ctx, buildings)

		require.Error(t, err)
		assert.Nil(t, result)
	})
}

func TestBuildingService_GetByID(t *testing.T) {
	ctx := context.Background()
	id := uuid.New()
	building := &models.Building{ID: id, Name: "Science Building"}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockBuildingRepository{
			GetByIDFunc: func(ctx context.Context, reqID uuid.UUID) (*models.Building, error) {
				assert.Equal(t, id, reqID)
				return building, nil
			},
		}

		svc := service.NewBuildingService(mockRepo)
		result, err := svc.GetByID(ctx, id)

		require.NoError(t, err)
		assert.Equal(t, building.ID, result.ID)
	})

	t.Run("not found", func(t *testing.T) {
		mockRepo := &mocks.MockBuildingRepository{
			GetByIDFunc: func(ctx context.Context, reqID uuid.UUID) (*models.Building, error) {
				return nil, errors.New("not found")
			},
		}

		svc := service.NewBuildingService(mockRepo)
		result, err := svc.GetByID(ctx, id)

		require.Error(t, err)
		assert.Nil(t, result)
	})
}

func TestBuildingService_List(t *testing.T) {
	ctx := context.Background()
	buildings := []models.Building{
		{ID: uuid.New(), Name: "Building A"},
		{ID: uuid.New(), Name: "Building B"},
	}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockBuildingRepository{
			ListFunc: func(ctx context.Context) ([]models.Building, error) {
				return buildings, nil
			},
		}

		svc := service.NewBuildingService(mockRepo)
		result, err := svc.List(ctx)

		require.NoError(t, err)
		assert.Len(t, result, 2)
	})

	t.Run("empty list", func(t *testing.T) {
		mockRepo := &mocks.MockBuildingRepository{
			ListFunc: func(ctx context.Context) ([]models.Building, error) {
				return []models.Building{}, nil
			},
		}

		svc := service.NewBuildingService(mockRepo)
		result, err := svc.List(ctx)

		require.NoError(t, err)
		assert.Empty(t, result)
	})
}

func TestBuildingService_Delete(t *testing.T) {
	ctx := context.Background()
	id := uuid.New()

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockBuildingRepository{
			DeleteFunc: func(ctx context.Context, reqID uuid.UUID) error {
				assert.Equal(t, id, reqID)
				return nil
			},
		}

		svc := service.NewBuildingService(mockRepo)
		err := svc.Delete(ctx, id)

		require.NoError(t, err)
	})

	t.Run("not found", func(t *testing.T) {
		mockRepo := &mocks.MockBuildingRepository{
			DeleteFunc: func(ctx context.Context, reqID uuid.UUID) error {
				return errors.New("not found")
			},
		}

		svc := service.NewBuildingService(mockRepo)
		err := svc.Delete(ctx, id)

		require.Error(t, err)
	})
}

func TestBuildingService_Update(t *testing.T) {
	ctx := context.Background()
	id := uuid.New()
	newName := "Updated Building"
	updates := &models.BuildingUpdate{Name: &newName}
	updated := &models.Building{ID: id, Name: newName}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockBuildingRepository{
			UpdateFunc: func(ctx context.Context, reqID uuid.UUID, u *models.BuildingUpdate) (*models.Building, error) {
				assert.Equal(t, id, reqID)
				return updated, nil
			},
		}

		svc := service.NewBuildingService(mockRepo)
		result, err := svc.Update(ctx, id, updates)

		require.NoError(t, err)
		assert.Equal(t, newName, result.Name)
	})

	t.Run("not found", func(t *testing.T) {
		mockRepo := &mocks.MockBuildingRepository{
			UpdateFunc: func(ctx context.Context, reqID uuid.UUID, u *models.BuildingUpdate) (*models.Building, error) {
				return nil, errors.New("not found")
			},
		}

		svc := service.NewBuildingService(mockRepo)
		result, err := svc.Update(ctx, id, updates)

		require.Error(t, err)
		assert.Nil(t, result)
	})
}
