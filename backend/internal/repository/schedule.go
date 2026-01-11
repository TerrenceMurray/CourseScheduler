package repository

import (
	"context"
	"database/sql"
	"encoding/json"
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

var _ ScheduleRepositoryInterface = (*ScheduleRepository)(nil)

type ScheduleRepositoryInterface interface {
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

type ScheduleRepository struct {
	db     *sql.DB
	logger *zap.Logger
}

func NewScheduleRepository(db *sql.DB, logger *zap.Logger) *ScheduleRepository {
	return &ScheduleRepository{
		db:     db,
		logger: logger,
	}
}

// scheduleDBModel is used for inserting/updating with JSONB sessions
type scheduleDBModel struct {
	ID        uuid.UUID `sql:"primary_key"`
	Name      string
	Sessions  string // JSONB as string
}

func (r *ScheduleRepository) Create(ctx context.Context, schedule *models.Schedule) (*models.Schedule, error) {
	if schedule == nil {
		return nil, errors.New("schedule cannot be nil")
	}

	if err := schedule.Validate(); err != nil {
		r.logger.Error("validation failed", zap.Error(err))
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Serialize sessions to JSON
	sessionsJSON, err := json.Marshal(schedule.Sessions)
	if err != nil {
		r.logger.Error("failed to marshal sessions", zap.Error(err))
		return nil, fmt.Errorf("failed to marshal sessions: %w", err)
	}

	dbModel := scheduleDBModel{
		ID:       schedule.ID,
		Name:     schedule.Name,
		Sessions: string(sessionsJSON),
	}

	insertStmt := table.Schedules.
		INSERT(table.Schedules.ID, table.Schedules.Name, table.Schedules.Sessions).
		MODEL(dbModel).
		RETURNING(table.Schedules.AllColumns)

	var dest model.Schedules
	if err := insertStmt.QueryContext(ctx, database.GetExecutor(ctx, r.db), &dest); err != nil {
		r.logger.Error("failed to create schedule", zap.Error(err))
		return nil, fmt.Errorf("failed to create schedule: %w", err)
	}

	return r.destToSchedule(&dest)
}

func (r *ScheduleRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Schedule, error) {
	stmt := table.Schedules.
		SELECT(table.Schedules.AllColumns).
		WHERE(table.Schedules.ID.EQ(UUID(id)))

	var dest model.Schedules
	err := stmt.QueryContext(ctx, database.GetExecutor(ctx, r.db), &dest)

	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, ErrNotFound
		}
		r.logger.Error("failed to get schedule", zap.Error(err), zap.String("id", id.String()))
		return nil, fmt.Errorf("failed to get schedule: %w", err)
	}

	return r.destToSchedule(&dest)
}

func (r *ScheduleRepository) GetByName(ctx context.Context, name string) (*models.Schedule, error) {
	stmt := table.Schedules.
		SELECT(table.Schedules.AllColumns).
		WHERE(table.Schedules.Name.EQ(String(name)))

	var dest model.Schedules
	err := stmt.QueryContext(ctx, database.GetExecutor(ctx, r.db), &dest)

	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, ErrNotFound
		}
		r.logger.Error("failed to get schedule by name", zap.Error(err), zap.String("name", name))
		return nil, fmt.Errorf("failed to get schedule: %w", err)
	}

	return r.destToSchedule(&dest)
}

func (r *ScheduleRepository) List(ctx context.Context) ([]*models.Schedule, error) {
	stmt := table.Schedules.
		SELECT(table.Schedules.AllColumns).
		WHERE(table.Schedules.IsArchived.EQ(Bool(false))).
		ORDER_BY(table.Schedules.IsActive.DESC(), table.Schedules.Name.ASC())

	var dest []model.Schedules
	err := stmt.QueryContext(ctx, database.GetExecutor(ctx, r.db), &dest)

	if err != nil {
		r.logger.Error("failed to list schedules", zap.Error(err))
		return nil, fmt.Errorf("failed to list schedules: %w", err)
	}

	schedules := make([]*models.Schedule, len(dest))
	for i := range dest {
		schedule, err := r.destToSchedule(&dest[i])
		if err != nil {
			return nil, err
		}
		schedules[i] = schedule
	}

	return schedules, nil
}

func (r *ScheduleRepository) Delete(ctx context.Context, id uuid.UUID) error {
	deleteStmt := table.Schedules.
		DELETE().
		WHERE(table.Schedules.ID.EQ(UUID(id)))

	result, err := deleteStmt.ExecContext(ctx, r.db)
	if err != nil {
		r.logger.Error("failed to delete schedule", zap.Error(err))
		return fmt.Errorf("failed to delete schedule: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		r.logger.Error("failed to get rows affected", zap.Error(err))
		return fmt.Errorf("failed to delete schedule: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func (r *ScheduleRepository) Update(ctx context.Context, id uuid.UUID, updates *models.ScheduleUpdate) (*models.Schedule, error) {
	if updates == nil {
		return nil, errors.New("updates cannot be nil")
	}

	if err := updates.Validate(); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	var columns ColumnList
	updateModel := struct {
		Name       *string `json:"name,omitempty"`
		Sessions   *string `json:"sessions,omitempty"`
		IsActive   *bool   `json:"is_active,omitempty"`
		IsArchived *bool   `json:"is_archived,omitempty"`
	}{}

	if updates.Name != nil {
		columns = append(columns, table.Schedules.Name)
		updateModel.Name = updates.Name
	}
	if updates.Sessions != nil {
		columns = append(columns, table.Schedules.Sessions)
		sessionsJSON, err := json.Marshal(updates.Sessions)
		if err != nil {
			r.logger.Error("failed to marshal sessions", zap.Error(err))
			return nil, fmt.Errorf("failed to marshal sessions: %w", err)
		}
		sessionsStr := string(sessionsJSON)
		updateModel.Sessions = &sessionsStr
	}
	if updates.IsActive != nil {
		columns = append(columns, table.Schedules.IsActive)
		updateModel.IsActive = updates.IsActive
	}
	if updates.IsArchived != nil {
		columns = append(columns, table.Schedules.IsArchived)
		updateModel.IsArchived = updates.IsArchived
	}

	if len(columns) == 0 {
		return nil, errors.New("no fields to update")
	}

	updateStmt := table.Schedules.
		UPDATE(columns).
		MODEL(updateModel).
		WHERE(table.Schedules.ID.EQ(UUID(id))).
		RETURNING(table.Schedules.AllColumns)

	var dest model.Schedules
	err := updateStmt.QueryContext(ctx, database.GetExecutor(ctx, r.db), &dest)

	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, ErrNotFound
		}
		r.logger.Error("failed to update schedule", zap.Error(err), zap.String("id", id.String()))
		return nil, fmt.Errorf("failed to update schedule: %w", err)
	}

	return r.destToSchedule(&dest)
}

// destToSchedule converts a database model to a domain model
func (r *ScheduleRepository) destToSchedule(dest *model.Schedules) (*models.Schedule, error) {
	var sessions []models.ScheduledSession
	if err := json.Unmarshal([]byte(dest.Sessions), &sessions); err != nil {
		r.logger.Error("failed to unmarshal sessions", zap.Error(err))
		return nil, fmt.Errorf("failed to unmarshal sessions: %w", err)
	}

	name := ""
	if dest.Name != nil {
		name = *dest.Name
	}

	schedule := models.NewSchedule(dest.ID, name, sessions, dest.CreatedAt)

	// Set is_active and is_archived from database
	if dest.IsActive != nil {
		schedule.IsActive = *dest.IsActive
	}
	if dest.IsArchived != nil {
		schedule.IsArchived = *dest.IsArchived
	}

	return schedule, nil
}

// ListArchived returns all archived schedules
func (r *ScheduleRepository) ListArchived(ctx context.Context) ([]*models.Schedule, error) {
	stmt := table.Schedules.
		SELECT(table.Schedules.AllColumns).
		WHERE(table.Schedules.IsArchived.EQ(Bool(true))).
		ORDER_BY(table.Schedules.Name.ASC())

	var dest []model.Schedules
	err := stmt.QueryContext(ctx, database.GetExecutor(ctx, r.db), &dest)

	if err != nil {
		r.logger.Error("failed to list archived schedules", zap.Error(err))
		return nil, fmt.Errorf("failed to list archived schedules: %w", err)
	}

	schedules := make([]*models.Schedule, len(dest))
	for i := range dest {
		schedule, err := r.destToSchedule(&dest[i])
		if err != nil {
			return nil, err
		}
		schedules[i] = schedule
	}

	return schedules, nil
}

// SetActive sets a schedule as active and deactivates all other schedules
func (r *ScheduleRepository) SetActive(ctx context.Context, id uuid.UUID) (*models.Schedule, error) {
	// First, deactivate all schedules
	deactivateStmt := table.Schedules.
		UPDATE(table.Schedules.IsActive).
		SET(table.Schedules.IsActive.SET(Bool(false))).
		WHERE(table.Schedules.IsActive.EQ(Bool(true)))

	_, err := deactivateStmt.ExecContext(ctx, database.GetExecutor(ctx, r.db))
	if err != nil {
		r.logger.Error("failed to deactivate schedules", zap.Error(err))
		return nil, fmt.Errorf("failed to deactivate schedules: %w", err)
	}

	// Then activate the specified schedule
	activateStmt := table.Schedules.
		UPDATE(table.Schedules.IsActive).
		SET(table.Schedules.IsActive.SET(Bool(true))).
		WHERE(table.Schedules.ID.EQ(UUID(id))).
		RETURNING(table.Schedules.AllColumns)

	var dest model.Schedules
	err = activateStmt.QueryContext(ctx, database.GetExecutor(ctx, r.db), &dest)

	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, ErrNotFound
		}
		r.logger.Error("failed to activate schedule", zap.Error(err), zap.String("id", id.String()))
		return nil, fmt.Errorf("failed to activate schedule: %w", err)
	}

	return r.destToSchedule(&dest)
}

// Archive marks a schedule as archived
func (r *ScheduleRepository) Archive(ctx context.Context, id uuid.UUID) (*models.Schedule, error) {
	updateStmt := table.Schedules.
		UPDATE(table.Schedules.IsArchived, table.Schedules.IsActive).
		SET(
			table.Schedules.IsArchived.SET(Bool(true)),
			table.Schedules.IsActive.SET(Bool(false)),
		).
		WHERE(table.Schedules.ID.EQ(UUID(id))).
		RETURNING(table.Schedules.AllColumns)

	var dest model.Schedules
	err := updateStmt.QueryContext(ctx, database.GetExecutor(ctx, r.db), &dest)

	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, ErrNotFound
		}
		r.logger.Error("failed to archive schedule", zap.Error(err), zap.String("id", id.String()))
		return nil, fmt.Errorf("failed to archive schedule: %w", err)
	}

	return r.destToSchedule(&dest)
}

// Unarchive restores a schedule from archived state
func (r *ScheduleRepository) Unarchive(ctx context.Context, id uuid.UUID) (*models.Schedule, error) {
	updateStmt := table.Schedules.
		UPDATE(table.Schedules.IsArchived).
		SET(table.Schedules.IsArchived.SET(Bool(false))).
		WHERE(table.Schedules.ID.EQ(UUID(id))).
		RETURNING(table.Schedules.AllColumns)

	var dest model.Schedules
	err := updateStmt.QueryContext(ctx, database.GetExecutor(ctx, r.db), &dest)

	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, ErrNotFound
		}
		r.logger.Error("failed to unarchive schedule", zap.Error(err), zap.String("id", id.String()))
		return nil, fmt.Errorf("failed to unarchive schedule: %w", err)
	}

	return r.destToSchedule(&dest)
}
