package service_test

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/TerrenceMurray/course-scheduler/internal/models"
	"github.com/TerrenceMurray/course-scheduler/internal/service"
	"github.com/TerrenceMurray/course-scheduler/internal/tests/unit/service/mocks"
)

func TestRoomTypeService_Create(t *testing.T) {
	ctx := context.Background()
	roomType := &models.RoomType{Name: "lecture_room"}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockRoomTypeRepository{
			CreateFunc: func(ctx context.Context, rt *models.RoomType) (*models.RoomType, error) {
				return roomType, nil
			},
		}

		svc := service.NewRoomTypeService(mockRepo)
		result, err := svc.Create(ctx, roomType)

		require.NoError(t, err)
		assert.Equal(t, roomType.Name, result.Name)
	})

	t.Run("error", func(t *testing.T) {
		mockRepo := &mocks.MockRoomTypeRepository{
			CreateFunc: func(ctx context.Context, rt *models.RoomType) (*models.RoomType, error) {
				return nil, errors.New("database error")
			},
		}

		svc := service.NewRoomTypeService(mockRepo)
		result, err := svc.Create(ctx, roomType)

		require.Error(t, err)
		assert.Nil(t, result)
	})
}

func TestRoomTypeService_CreateBatch(t *testing.T) {
	ctx := context.Background()
	roomTypes := []*models.RoomType{
		{Name: "lecture_room"},
		{Name: "lab"},
	}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockRoomTypeRepository{
			CreateBatchFunc: func(ctx context.Context, rt []*models.RoomType) ([]*models.RoomType, error) {
				return roomTypes, nil
			},
		}

		svc := service.NewRoomTypeService(mockRepo)
		result, err := svc.CreateBatch(ctx, roomTypes)

		require.NoError(t, err)
		assert.Len(t, result, 2)
	})
}

func TestRoomTypeService_GetByName(t *testing.T) {
	ctx := context.Background()
	name := "lecture_room"
	roomType := &models.RoomType{Name: name}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockRoomTypeRepository{
			GetByNameFunc: func(ctx context.Context, reqName string) (*models.RoomType, error) {
				assert.Equal(t, name, reqName)
				return roomType, nil
			},
		}

		svc := service.NewRoomTypeService(mockRepo)
		result, err := svc.GetByName(ctx, name)

		require.NoError(t, err)
		assert.Equal(t, roomType.Name, result.Name)
	})

	t.Run("not found", func(t *testing.T) {
		mockRepo := &mocks.MockRoomTypeRepository{
			GetByNameFunc: func(ctx context.Context, reqName string) (*models.RoomType, error) {
				return nil, errors.New("not found")
			},
		}

		svc := service.NewRoomTypeService(mockRepo)
		result, err := svc.GetByName(ctx, name)

		require.Error(t, err)
		assert.Nil(t, result)
	})
}

func TestRoomTypeService_List(t *testing.T) {
	ctx := context.Background()
	roomTypes := []*models.RoomType{
		{Name: "lecture_room"},
		{Name: "lab"},
	}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockRoomTypeRepository{
			ListFunc: func(ctx context.Context) ([]*models.RoomType, error) {
				return roomTypes, nil
			},
		}

		svc := service.NewRoomTypeService(mockRepo)
		result, err := svc.List(ctx)

		require.NoError(t, err)
		assert.Len(t, result, 2)
	})
}

func TestRoomTypeService_Delete(t *testing.T) {
	ctx := context.Background()
	name := "lecture_room"

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockRoomTypeRepository{
			DeleteFunc: func(ctx context.Context, reqName string) error {
				assert.Equal(t, name, reqName)
				return nil
			},
		}

		svc := service.NewRoomTypeService(mockRepo)
		err := svc.Delete(ctx, name)

		require.NoError(t, err)
	})
}

func TestRoomTypeService_Update(t *testing.T) {
	ctx := context.Background()
	name := "lecture_room"
	newName := "updated_room"
	updates := &models.UpdateRoomType{Name: &newName}
	updated := &models.RoomType{Name: newName}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockRoomTypeRepository{
			UpdateFunc: func(ctx context.Context, reqName string, u *models.UpdateRoomType) (*models.RoomType, error) {
				assert.Equal(t, name, reqName)
				return updated, nil
			},
		}

		svc := service.NewRoomTypeService(mockRepo)
		result, err := svc.Update(ctx, name, updates)

		require.NoError(t, err)
		assert.Equal(t, newName, result.Name)
	})
}
