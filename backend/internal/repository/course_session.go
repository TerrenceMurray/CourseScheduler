package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/TerrenceMurray/course-scheduler/internal/database"
	"github.com/TerrenceMurray/course-scheduler/internal/database/postgres/scheduler/model"
	"github.com/TerrenceMurray/course-scheduler/internal/database/postgres/scheduler/table"
	"github.com/TerrenceMurray/course-scheduler/internal/models"
	. "github.com/go-jet/jet/v2/postgres"
	"github.com/go-jet/jet/v2/qrm"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

var _ CourseSessionRepositoryInterface = (*CourseSessionRepository)(nil)

type CourseSessionRepositoryInterface interface {
	Create(ctx context.Context, session *models.CourseSession) (*models.CourseSession, error)
	CreateBatch(ctx context.Context, sessions []*models.CourseSession) ([]*models.CourseSession, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.CourseSession, error)
	GetByCourseID(ctx context.Context, courseID uuid.UUID) ([]*models.CourseSession, error)
	List(ctx context.Context) ([]*models.CourseSession, error)
	Delete(ctx context.Context, id uuid.UUID) error
	Update(ctx context.Context, id uuid.UUID, updates *models.CourseSessionUpdate) (*models.CourseSession, error)
}

type CourseSessionRepository struct {
	db     *sql.DB
	logger *zap.Logger
}

func NewCourseSessionRepository(db *sql.DB, logger *zap.Logger) *CourseSessionRepository {
	return &CourseSessionRepository{
		db:     db,
		logger: logger,
	}
}

func (r *CourseSessionRepository) Create(ctx context.Context, session *models.CourseSession) (*models.CourseSession, error) {
	if session == nil {
		return nil, errors.New("session cannot be nil")
	}

	if err := session.Validate(); err != nil {
		r.logger.Error("validation failed", zap.Error(err))
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	insertStmt := table.CourseSessions.
		INSERT(
			table.CourseSessions.ID,
			table.CourseSessions.CourseID,
			table.CourseSessions.RequiredRoom,
			table.CourseSessions.Type,
			table.CourseSessions.Duration,
			table.CourseSessions.NumberOfSessions,
		).
		MODEL(session).
		RETURNING(table.CourseSessions.AllColumns)

	var dest model.CourseSessions
	if err := insertStmt.QueryContext(ctx, database.GetExecutor(ctx, r.db), &dest); err != nil {
		r.logger.Error("failed to create course session", zap.Error(err))
		return nil, fmt.Errorf("failed to create course session: %w", err)
	}

	return models.NewCourseSession(
		dest.ID,
		dest.CourseID,
		dest.RequiredRoom,
		string(dest.Type),
		dest.Duration,
		dest.NumberOfSessions,
		dest.CreatedAt,
		dest.UpdatedAt,
	), nil
}

func (r *CourseSessionRepository) CreateBatch(ctx context.Context, sessions []*models.CourseSession) ([]*models.CourseSession, error) {
	if len(sessions) < 1 {
		return nil, errors.New("at least one session is required")
	}

	tx, err := r.db.BeginTx(ctx, &sql.TxOptions{ReadOnly: false})
	if err != nil {
		r.logger.Error("failed to begin transaction", zap.Error(err))
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}

	defer tx.Rollback()

	var newSessions []*models.CourseSession
	for _, session := range sessions {
		if session == nil {
			return nil, errors.New("session cannot be nil")
		}

		if err := session.Validate(); err != nil {
			return nil, fmt.Errorf("validation failed: %w", err)
		}

		insertStmt := table.CourseSessions.
			INSERT(
				table.CourseSessions.ID,
				table.CourseSessions.CourseID,
				table.CourseSessions.RequiredRoom,
				table.CourseSessions.Type,
				table.CourseSessions.Duration,
				table.CourseSessions.NumberOfSessions,
			).
			MODEL(session).
			RETURNING(table.CourseSessions.AllColumns)

		var dest model.CourseSessions
		if err := insertStmt.QueryContext(ctx, tx, &dest); err != nil {
			r.logger.Error("failed to create course session", zap.Error(err))
			return nil, fmt.Errorf("failed to create course session: %w", err)
		}

		newSessions = append(newSessions, models.NewCourseSession(
			dest.ID,
			dest.CourseID,
			dest.RequiredRoom,
			string(dest.Type),
			dest.Duration,
			dest.NumberOfSessions,
			dest.CreatedAt,
			dest.UpdatedAt,
		))
	}

	if err := tx.Commit(); err != nil {
		r.logger.Error("failed to commit transaction", zap.Error(err))
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return newSessions, nil
}

func (r *CourseSessionRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.CourseSession, error) {
	stmt := table.CourseSessions.
		SELECT(table.CourseSessions.AllColumns).
		WHERE(table.CourseSessions.ID.EQ(UUID(id)))

	var dest model.CourseSessions
	err := stmt.QueryContext(ctx, database.GetExecutor(ctx, r.db), &dest)

	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, ErrNotFound
		}
		r.logger.Error("failed to get course session", zap.Error(err), zap.String("id", id.String()))
		return nil, fmt.Errorf("failed to get course session: %w", err)
	}

	return models.NewCourseSession(
		dest.ID,
		dest.CourseID,
		dest.RequiredRoom,
		string(dest.Type),
		dest.Duration,
		dest.NumberOfSessions,
		dest.CreatedAt,
		dest.UpdatedAt,
	), nil
}

func (r *CourseSessionRepository) GetByCourseID(ctx context.Context, courseID uuid.UUID) ([]*models.CourseSession, error) {
	stmt := table.CourseSessions.
		SELECT(table.CourseSessions.AllColumns).
		WHERE(table.CourseSessions.CourseID.EQ(UUID(courseID))).
		ORDER_BY(table.CourseSessions.Type.ASC())

	var dest []model.CourseSessions
	err := stmt.QueryContext(ctx, database.GetExecutor(ctx, r.db), &dest)

	if err != nil {
		r.logger.Error("failed to get course sessions by course id", zap.Error(err), zap.String("course_id", courseID.String()))
		return nil, fmt.Errorf("failed to get course sessions: %w", err)
	}

	sessions := make([]*models.CourseSession, len(dest))
	for i, d := range dest {
		sessions[i] = models.NewCourseSession(
			d.ID,
			d.CourseID,
			d.RequiredRoom,
			string(d.Type),
			d.Duration,
			d.NumberOfSessions,
			d.CreatedAt,
			d.UpdatedAt,
		)
	}

	return sessions, nil
}

func (r *CourseSessionRepository) List(ctx context.Context) ([]*models.CourseSession, error) {
	stmt := table.CourseSessions.
		SELECT(table.CourseSessions.AllColumns).
		ORDER_BY(table.CourseSessions.CourseID.ASC(), table.CourseSessions.Type.ASC())

	var dest []model.CourseSessions
	err := stmt.QueryContext(ctx, database.GetExecutor(ctx, r.db), &dest)

	if err != nil {
		r.logger.Error("failed to list course sessions", zap.Error(err))
		return nil, fmt.Errorf("failed to list course sessions: %w", err)
	}

	sessions := make([]*models.CourseSession, len(dest))
	for i, d := range dest {
		sessions[i] = models.NewCourseSession(
			d.ID,
			d.CourseID,
			d.RequiredRoom,
			string(d.Type),
			d.Duration,
			d.NumberOfSessions,
			d.CreatedAt,
			d.UpdatedAt,
		)
	}

	return sessions, nil
}

func (r *CourseSessionRepository) Delete(ctx context.Context, id uuid.UUID) error {
	deleteStmt := table.CourseSessions.
		DELETE().
		WHERE(table.CourseSessions.ID.EQ(UUID(id)))

	result, err := deleteStmt.ExecContext(ctx, r.db)
	if err != nil {
		r.logger.Error("failed to delete course session", zap.Error(err))
		return fmt.Errorf("failed to delete course session: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		r.logger.Error("failed to get rows affected", zap.Error(err))
		return fmt.Errorf("failed to delete course session: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func (r *CourseSessionRepository) Update(ctx context.Context, id uuid.UUID, updates *models.CourseSessionUpdate) (*models.CourseSession, error) {
	if updates == nil {
		return nil, errors.New("updates cannot be nil")
	}

	if err := updates.Validate(); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	var columns ColumnList
	if updates.RequiredRoom != nil {
		columns = append(columns, table.CourseSessions.RequiredRoom)
	}
	if updates.Type != nil {
		columns = append(columns, table.CourseSessions.Type)
	}
	if updates.Duration != nil {
		columns = append(columns, table.CourseSessions.Duration)
	}
	if updates.NumberOfSessions != nil {
		columns = append(columns, table.CourseSessions.NumberOfSessions)
	}

	if len(columns) == 0 {
		return nil, errors.New("no fields to update")
	}

	updateStmt := table.CourseSessions.
		UPDATE(columns).
		MODEL(updates).
		WHERE(table.CourseSessions.ID.EQ(UUID(id))).
		RETURNING(table.CourseSessions.AllColumns)

	var dest model.CourseSessions
	err := updateStmt.QueryContext(ctx, database.GetExecutor(ctx, r.db), &dest)

	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, ErrNotFound
		}
		r.logger.Error("failed to update course session", zap.Error(err), zap.String("id", id.String()))
		return nil, fmt.Errorf("failed to update course session: %w", err)
	}

	return models.NewCourseSession(
		dest.ID,
		dest.CourseID,
		dest.RequiredRoom,
		string(dest.Type),
		dest.Duration,
		dest.NumberOfSessions,
		dest.CreatedAt,
		dest.UpdatedAt,
	), nil
}
