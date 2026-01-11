package service

import (
	"context"

	"github.com/TerrenceMurray/course-scheduler/internal/models"
	"github.com/TerrenceMurray/course-scheduler/internal/repository"
	"github.com/google/uuid"
)

var _ ScheduleServiceInterface = (*ScheduleService)(nil)

type ScheduleServiceInterface interface {
	Create(ctx context.Context, schedule *models.Schedule) (*models.Schedule, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.Schedule, error)
	GetByName(ctx context.Context, name string) (*models.Schedule, error)
	List(ctx context.Context) ([]*models.Schedule, error)
	ListArchived(ctx context.Context) ([]*models.Schedule, error)
	Delete(ctx context.Context, id uuid.UUID) error
	Update(ctx context.Context, id uuid.UUID, updates *models.ScheduleUpdate) (*models.Schedule, error)
	SetActive(ctx context.Context, id uuid.UUID) (*models.Schedule, error)
	Archive(ctx context.Context, id uuid.UUID) (*models.Schedule, error)
	Unarchive(ctx context.Context, id uuid.UUID) (*models.Schedule, error)
}

type ScheduleService struct {
	repo repository.ScheduleRepositoryInterface
}

func NewScheduleService(repo repository.ScheduleRepositoryInterface) *ScheduleService {
	return &ScheduleService{
		repo: repo,
	}
}

func (s *ScheduleService) Create(ctx context.Context, schedule *models.Schedule) (*models.Schedule, error) {
	return s.repo.Create(ctx, schedule)
}

func (s *ScheduleService) GetByID(ctx context.Context, id uuid.UUID) (*models.Schedule, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *ScheduleService) GetByName(ctx context.Context, name string) (*models.Schedule, error) {
	return s.repo.GetByName(ctx, name)
}

func (s *ScheduleService) List(ctx context.Context) ([]*models.Schedule, error) {
	return s.repo.List(ctx)
}

func (s *ScheduleService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

func (s *ScheduleService) Update(ctx context.Context, id uuid.UUID, updates *models.ScheduleUpdate) (*models.Schedule, error) {
	return s.repo.Update(ctx, id, updates)
}

func (s *ScheduleService) ListArchived(ctx context.Context) ([]*models.Schedule, error) {
	return s.repo.ListArchived(ctx)
}

func (s *ScheduleService) SetActive(ctx context.Context, id uuid.UUID) (*models.Schedule, error) {
	return s.repo.SetActive(ctx, id)
}

func (s *ScheduleService) Archive(ctx context.Context, id uuid.UUID) (*models.Schedule, error) {
	return s.repo.Archive(ctx, id)
}

func (s *ScheduleService) Unarchive(ctx context.Context, id uuid.UUID) (*models.Schedule, error) {
	return s.repo.Unarchive(ctx, id)
}
