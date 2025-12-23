package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/TerrenceMurray/course-scheduler/internal/database/postgres/scheduler/model"
	"github.com/TerrenceMurray/course-scheduler/internal/database/postgres/scheduler/table"
	"github.com/TerrenceMurray/course-scheduler/internal/models"
	. "github.com/go-jet/jet/v2/postgres"
	"github.com/go-jet/jet/v2/qrm"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

var _ CourseRepositoryInterface = (*CourseRepository)(nil)

type CourseRepositoryInterface interface {
	Create(ctx context.Context, course *models.Course) (*models.Course, error)
	CreateBatch(ctx context.Context, courses []*models.Course) ([]*models.Course, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.Course, error)
	List(ctx context.Context) ([]models.Course, error)
	Delete(ctx context.Context, id uuid.UUID) error
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
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	insertStmt := table.Courses.
		INSERT(table.Courses.AllColumns).
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

func (c *CourseRepository) Delete(ctx context.Context, id uuid.UUID) error {
	deleteStmt := table.Courses.DELETE().WHERE(
		table.Courses.ID.EQ(UUID(id)),
	)

	result, err := deleteStmt.ExecContext(ctx, c.db)

	if err != nil {
		c.logger.Error("failed to delete course", zap.Error(err))
		return fmt.Errorf("failed to delete course: %w", err)
	}

	rowAffected, err := result.RowsAffected()
	if err != nil {
		c.logger.Error("failed to delete course", zap.Error(err))
		return fmt.Errorf("failed to delete course: %w", err)
	}

	if rowAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func (c *CourseRepository) CreateBatch(ctx context.Context, courses []*models.Course) ([]*models.Course, error) {
	if len(courses) < 1 {
		return nil, errors.New("courses must have at least 1")
	}

	tx, err := c.db.BeginTx(ctx, nil)
	if err != nil {
		c.logger.Error("failed to begin transaction", zap.Error(err))
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	var newCourses []*models.Course
	for _, course := range courses {
		if course == nil {
			return nil, errors.New("course cannot be nil")
		}

		if err := course.Validate(); err != nil {
			return nil, fmt.Errorf("validation failed: %w", err)
		}

		insertStmt := table.Courses.
			INSERT(table.Courses.AllColumns).
			MODEL(course).
			RETURNING(table.Courses.AllColumns)

		var dest model.Courses
		if err := insertStmt.QueryContext(ctx, tx, &dest); err != nil {
			c.logger.Error("failed to create batch courses", zap.Error(err))
			return nil, fmt.Errorf("failed to create batch courses: %w", err)
		}

		newCourses = append(newCourses, models.NewCourse(dest.ID, dest.Name, dest.CreatedAt, dest.UpdatedAt))
	}

	if err := tx.Commit(); err != nil {
		c.logger.Error("failed to commit transaction", zap.Error(err))
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return newCourses, nil
}

func (c *CourseRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Course, error) {
	stmt := table.Courses.
		SELECT(table.Courses.AllColumns).
		WHERE(table.Courses.ID.EQ(UUID(id)))

	var dest model.Courses
	err := stmt.QueryContext(ctx, c.db, &dest)

	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, ErrNotFound
		}
		c.logger.Error("failed to get course by id", zap.Error(err), zap.String("id", id.String()))
		return nil, fmt.Errorf("failed to get course by id: %w", err)
	}

	return models.NewCourse(dest.ID, dest.Name, dest.CreatedAt, dest.UpdatedAt), nil
}

func (c *CourseRepository) List(ctx context.Context) ([]models.Course, error) {
	stmt := table.Courses.
		SELECT(table.Courses.AllColumns).
		ORDER_BY(table.Courses.Name.ASC())

	var dest []model.Courses
	err := stmt.QueryContext(ctx, c.db, &dest)

	if err != nil {
		c.logger.Error("failed to list courses", zap.Error(err))
		return nil, fmt.Errorf("failed to list courses: %w", err)
	}

	courses := make([]models.Course, len(dest))
	for i, d := range dest {
		courses[i] = models.Course{
			ID:        d.ID,
			Name:      d.Name,
			CreatedAt: d.CreatedAt,
			UpdatedAt: d.UpdatedAt,
		}
	}

	return courses, nil
}
