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

func TestRoomService_Create(t *testing.T) {
	ctx := context.Background()
	room := &models.Room{ID: uuid.New(), Name: "Room 101", Type: "lecture_room", Building: uuid.New(), Capacity: 100}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockRoomRepository{
			CreateFunc: func(ctx context.Context, r *models.Room) (*models.Room, error) {
				return room, nil
			},
		}

		svc := service.NewRoomService(mockRepo)
		result, err := svc.Create(ctx, room)

		require.NoError(t, err)
		assert.Equal(t, room.ID, result.ID)
		assert.Equal(t, room.Name, result.Name)
	})

	t.Run("error", func(t *testing.T) {
		mockRepo := &mocks.MockRoomRepository{
			CreateFunc: func(ctx context.Context, r *models.Room) (*models.Room, error) {
				return nil, errors.New("database error")
			},
		}

		svc := service.NewRoomService(mockRepo)
		result, err := svc.Create(ctx, room)

		require.Error(t, err)
		assert.Nil(t, result)
	})
}

func TestRoomService_CreateBatch(t *testing.T) {
	ctx := context.Background()
	rooms := []*models.Room{
		{ID: uuid.New(), Name: "Room A", Type: "lecture_room", Building: uuid.New(), Capacity: 50},
		{ID: uuid.New(), Name: "Room B", Type: "lab", Building: uuid.New(), Capacity: 30},
	}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockRoomRepository{
			CreateBatchFunc: func(ctx context.Context, r []*models.Room) ([]*models.Room, error) {
				return rooms, nil
			},
		}

		svc := service.NewRoomService(mockRepo)
		result, err := svc.CreateBatch(ctx, rooms)

		require.NoError(t, err)
		assert.Len(t, result, 2)
	})
}

func TestRoomService_GetByID(t *testing.T) {
	ctx := context.Background()
	id := uuid.New()
	room := &models.Room{ID: id, Name: "Room 101", Type: "lecture_room"}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockRoomRepository{
			GetByIDFunc: func(ctx context.Context, reqID uuid.UUID) (*models.Room, error) {
				return room, nil
			},
		}

		svc := service.NewRoomService(mockRepo)
		result, err := svc.GetByID(ctx, id)

		require.NoError(t, err)
		assert.Equal(t, room.ID, result.ID)
	})

	t.Run("not found", func(t *testing.T) {
		mockRepo := &mocks.MockRoomRepository{
			GetByIDFunc: func(ctx context.Context, reqID uuid.UUID) (*models.Room, error) {
				return nil, errors.New("not found")
			},
		}

		svc := service.NewRoomService(mockRepo)
		result, err := svc.GetByID(ctx, id)

		require.Error(t, err)
		assert.Nil(t, result)
	})
}

func TestRoomService_List(t *testing.T) {
	ctx := context.Background()
	rooms := []*models.Room{
		{ID: uuid.New(), Name: "Room A", Type: "lecture_room"},
		{ID: uuid.New(), Name: "Room B", Type: "lab"},
	}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockRoomRepository{
			ListFunc: func(ctx context.Context) ([]*models.Room, error) {
				return rooms, nil
			},
		}

		svc := service.NewRoomService(mockRepo)
		result, err := svc.List(ctx)

		require.NoError(t, err)
		assert.Len(t, result, 2)
	})
}

func TestRoomService_Delete(t *testing.T) {
	ctx := context.Background()
	id := uuid.New()

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockRoomRepository{
			DeleteFunc: func(ctx context.Context, reqID uuid.UUID) error {
				return nil
			},
		}

		svc := service.NewRoomService(mockRepo)
		err := svc.Delete(ctx, id)

		require.NoError(t, err)
	})
}

func TestRoomService_Update(t *testing.T) {
	ctx := context.Background()
	id := uuid.New()
	newName := "Updated Room"
	updates := &models.RoomUpdate{Name: &newName}
	updated := &models.Room{ID: id, Name: newName}

	t.Run("success", func(t *testing.T) {
		mockRepo := &mocks.MockRoomRepository{
			UpdateFunc: func(ctx context.Context, reqID uuid.UUID, u *models.RoomUpdate) (*models.Room, error) {
				return updated, nil
			},
		}

		svc := service.NewRoomService(mockRepo)
		result, err := svc.Update(ctx, id, updates)

		require.NoError(t, err)
		assert.Equal(t, newName, result.Name)
	})
}
