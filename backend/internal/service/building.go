package service

import (
	"context"

	"github.com/TerrenceMurray/course-scheduler/internal/models"
	"github.com/TerrenceMurray/course-scheduler/internal/repository"
	"github.com/google/uuid"
)

var _ BuildingServiceInterface = (*BuildingService)(nil)

type BuildingServiceInterface interface {
	Create(ctx context.Context, building *models.Building) (*models.Building, error)
	CreateBatch(ctx context.Context, buildings []*models.Building) ([]*models.Building, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.Building, error)
	List(ctx context.Context) ([]models.Building, error)
	Delete(ctx context.Context, id uuid.UUID) error
	Update(ctx context.Context, id uuid.UUID, updates *models.BuildingUpdate) (*models.Building, error)
}

type BuildingService struct {
	repo repository.BuildingRepositoryInterface
}

func NewBuildingService(repo repository.BuildingRepositoryInterface) *BuildingService {
	return &BuildingService{
		repo: repo,
	}
}

func (s *BuildingService) Create(ctx context.Context, building *models.Building) (*models.Building, error) {
	return s.repo.Create(ctx, building)
}

func (s *BuildingService) CreateBatch(ctx context.Context, buildings []*models.Building) ([]*models.Building, error) {
	return s.repo.CreateBatch(ctx, buildings)
}

func (s *BuildingService) GetByID(ctx context.Context, id uuid.UUID) (*models.Building, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *BuildingService) List(ctx context.Context) ([]models.Building, error) {
	return s.repo.List(ctx)
}

func (s *BuildingService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

func (s *BuildingService) Update(ctx context.Context, id uuid.UUID, updates *models.BuildingUpdate) (*models.Building, error) {
	return s.repo.Update(ctx, id, updates)
}
