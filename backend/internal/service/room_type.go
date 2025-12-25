package service

import (
	"context"

	"github.com/TerrenceMurray/course-scheduler/internal/models"
	"github.com/TerrenceMurray/course-scheduler/internal/repository"
)

var _ RoomTypeServiceInterface = (*RoomTypeService)(nil)

type RoomTypeServiceInterface interface {
	Create(ctx context.Context, roomType *models.RoomType) (*models.RoomType, error)
	CreateBatch(ctx context.Context, roomTypes []*models.RoomType) ([]*models.RoomType, error)
	GetByName(ctx context.Context, name string) (*models.RoomType, error)
	List(ctx context.Context) ([]*models.RoomType, error)
	Delete(ctx context.Context, name string) error
	Update(ctx context.Context, name string, updates *models.UpdateRoomType) (*models.RoomType, error)
}

type RoomTypeService struct {
	repo repository.RoomTypeRepositoryInterface
}

func NewRoomTypeService(repo repository.RoomTypeRepositoryInterface) *RoomTypeService {
	return &RoomTypeService{
		repo: repo,
	}
}

func (s *RoomTypeService) Create(ctx context.Context, roomType *models.RoomType) (*models.RoomType, error) {
	return s.repo.Create(ctx, roomType)
}

func (s *RoomTypeService) CreateBatch(ctx context.Context, roomTypes []*models.RoomType) ([]*models.RoomType, error) {
	return s.repo.CreateBatch(ctx, roomTypes)
}

func (s *RoomTypeService) GetByName(ctx context.Context, name string) (*models.RoomType, error) {
	return s.repo.GetByName(ctx, name)
}

func (s *RoomTypeService) List(ctx context.Context) ([]*models.RoomType, error) {
	return s.repo.List(ctx)
}

func (s *RoomTypeService) Delete(ctx context.Context, name string) error {
	return s.repo.Delete(ctx, name)
}

func (s *RoomTypeService) Update(ctx context.Context, name string, updates *models.UpdateRoomType) (*models.RoomType, error) {
	return s.repo.Update(ctx, name, updates)
}
