package service

import (
	"context"

	"github.com/TerrenceMurray/course-scheduler/internal/models"
	"github.com/TerrenceMurray/course-scheduler/internal/repository"
	"github.com/google/uuid"
)

var _ CourseServiceInterface = (*CourseService)(nil)

type CourseServiceInterface interface {
	Create(ctx context.Context, course *models.Course) (*models.Course, error)
	CreateBatch(ctx context.Context, courses []*models.Course) ([]*models.Course, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.Course, error)
	List(ctx context.Context) ([]models.Course, error)
	Delete(ctx context.Context, id uuid.UUID) error
	Update(ctx context.Context, id uuid.UUID, updates *models.CourseUpdate) (*models.Course, error)
}

type CourseService struct {
	repo repository.CourseRepositoryInterface
}

func NewCourseService(repo repository.CourseRepositoryInterface) *CourseService {
	return &CourseService{
		repo: repo,
	}
}

func (s *CourseService) Create(ctx context.Context, course *models.Course) (*models.Course, error) {
	return s.repo.Create(ctx, course)
}

func (s *CourseService) CreateBatch(ctx context.Context, courses []*models.Course) ([]*models.Course, error) {
	return s.repo.CreateBatch(ctx, courses)
}

func (s *CourseService) GetByID(ctx context.Context, id uuid.UUID) (*models.Course, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *CourseService) List(ctx context.Context) ([]models.Course, error) {
	return s.repo.List(ctx)
}

func (s *CourseService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

func (s *CourseService) Update(ctx context.Context, id uuid.UUID, updates *models.CourseUpdate) (*models.Course, error) {
	return s.repo.Update(ctx, id, updates)
}
