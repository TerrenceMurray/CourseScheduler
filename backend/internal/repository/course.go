package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/TerrenceMurray/course-scheduler/internal/database/postgres/scheduler/model"
	"github.com/TerrenceMurray/course-scheduler/internal/database/postgres/scheduler/table"
	"github.com/TerrenceMurray/course-scheduler/internal/models"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

var _ CourseRepositoryInterface = (*CourseRepository)(nil)

type CourseRepositoryInterface interface {
	Create(ctx context.Context, course *models.Course) (*models.Course, error)
	CreateBatch(ctx context.Context, courses []models.Course) ([]models.Course, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.Course, error)
	List(ctx context.Context) ([]models.Course, error)
}

type CourseRepository struct {
	db     *sql.DB
	logger *zap.Logger
}

func NewCourseRepository(db *sql.DB, logger *zap.Logger) CourseRepositoryInterface {
	return &CourseRepository{
		db:     db,
		logger: logger,
	}
}

func (c *CourseRepository) Create(ctx context.Context, course *models.Course) (*models.Course, error) {
	if course == nil {
		return nil, errors.New("course cannot be nil")
	}

	if err := course.Validate(); err != nil {
		return nil, fmt.Errorf("validation failed: %v", err)
	}

	insertStmt := table.Courses.
		INSERT(
			table.Courses.AllColumns,
		).
		MODEL(course).
		RETURNING(table.Courses.AllColumns)

	var dest model.Courses
	err := insertStmt.QueryContext(ctx, c.db, &dest)

	if err != nil {
		c.logger.Error("failed to create course", zap.Error(err))
		return nil, fmt.Errorf("failed to create course: %w", err)
	}

	return models.NewCourse(dest.ID, dest.Name, dest.CreatedAt, dest.UpdatedAt), nil
}

func (c *CourseRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Course, error) {
	return nil, nil
}

func (c *CourseRepository) List(ctx context.Context) ([]models.Course, error) {
	return nil, nil
}
