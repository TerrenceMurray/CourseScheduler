package service

import (
	"context"

	"github.com/TerrenceMurray/course-scheduler/internal/models"
	"github.com/TerrenceMurray/course-scheduler/internal/repository"
	"github.com/google/uuid"
)

var _ RoomServiceInterface = (*RoomService)(nil)

type RoomServiceInterface interface {
	Create(ctx context.Context, room *models.Room) (*models.Room, error)
	CreateBatch(ctx context.Context, rooms []*models.Room) ([]*models.Room, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.Room, error)
	List(ctx context.Context) ([]*models.Room, error)
	Delete(ctx context.Context, id uuid.UUID) error
	Update(ctx context.Context, id uuid.UUID, updates *models.RoomUpdate) (*models.Room, error)
}

type RoomService struct {
	repo repository.RoomRepositoryInterface
}

func NewRoomService(repo repository.RoomRepositoryInterface) *RoomService {
	return &RoomService{
		repo: repo,
	}
}

func (s *RoomService) Create(ctx context.Context, room *models.Room) (*models.Room, error) {
	return s.repo.Create(ctx, room)
}

func (s *RoomService) CreateBatch(ctx context.Context, rooms []*models.Room) ([]*models.Room, error) {
	return s.repo.CreateBatch(ctx, rooms)
}

func (s *RoomService) GetByID(ctx context.Context, id uuid.UUID) (*models.Room, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *RoomService) List(ctx context.Context) ([]*models.Room, error) {
	return s.repo.List(ctx)
}

func (s *RoomService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

func (s *RoomService) Update(ctx context.Context, id uuid.UUID, updates *models.RoomUpdate) (*models.Room, error) {
	return s.repo.Update(ctx, id, updates)
}
