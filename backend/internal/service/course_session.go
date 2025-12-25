package service

import (
	"context"

	"github.com/TerrenceMurray/course-scheduler/internal/models"
	"github.com/TerrenceMurray/course-scheduler/internal/repository"
	"github.com/google/uuid"
)

var _ CourseSessionServiceInterface = (*CourseSessionService)(nil)

type CourseSessionServiceInterface interface {
	Create(ctx context.Context, session *models.CourseSession) (*models.CourseSession, error)
	CreateBatch(ctx context.Context, sessions []*models.CourseSession) ([]*models.CourseSession, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.CourseSession, error)
	GetByCourseID(ctx context.Context, courseID uuid.UUID) ([]*models.CourseSession, error)
	List(ctx context.Context) ([]*models.CourseSession, error)
	Delete(ctx context.Context, id uuid.UUID) error
	Update(ctx context.Context, id uuid.UUID, updates *models.CourseSessionUpdate) (*models.CourseSession, error)
}

type CourseSessionService struct {
	repo repository.CourseSessionRepositoryInterface
}

func NewCourseSessionService(repo repository.CourseSessionRepositoryInterface) *CourseSessionService {
	return &CourseSessionService{
		repo: repo,
	}
}

func (s *CourseSessionService) Create(ctx context.Context, session *models.CourseSession) (*models.CourseSession, error) {
	return s.repo.Create(ctx, session)
}

func (s *CourseSessionService) CreateBatch(ctx context.Context, sessions []*models.CourseSession) ([]*models.CourseSession, error) {
	return s.repo.CreateBatch(ctx, sessions)
}

func (s *CourseSessionService) GetByID(ctx context.Context, id uuid.UUID) (*models.CourseSession, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *CourseSessionService) GetByCourseID(ctx context.Context, courseID uuid.UUID) ([]*models.CourseSession, error) {
	return s.repo.GetByCourseID(ctx, courseID)
}

func (s *CourseSessionService) List(ctx context.Context) ([]*models.CourseSession, error) {
	return s.repo.List(ctx)
}

func (s *CourseSessionService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

func (s *CourseSessionService) Update(ctx context.Context, id uuid.UUID, updates *models.CourseSessionUpdate) (*models.CourseSession, error) {
	return s.repo.Update(ctx, id, updates)
}
