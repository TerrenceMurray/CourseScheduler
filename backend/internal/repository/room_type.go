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
	"go.uber.org/zap"
)

var _ RoomTypeRepositoryInterface = (*RoomTypeRepository)(nil)

type RoomTypeRepositoryInterface interface {
	Create(ctx context.Context, roomType *models.RoomType) (*models.RoomType, error)
	CreateBatch(ctx context.Context, roomTypes []*models.RoomType) ([]*models.RoomType, error)
	Delete(ctx context.Context, name string) error
	Update(ctx context.Context, name string, updates *models.UpdateRoomType) (*models.RoomType, error)
	GetByName(ctx context.Context, name string) (*models.RoomType, error)
	List(ctx context.Context) ([]*models.RoomType, error)
}

type RoomTypeRepository struct {
	db     *sql.DB
	logger *zap.Logger
}

func NewRoomTypeRepository(db *sql.DB, logger *zap.Logger) *RoomTypeRepository {
	return &RoomTypeRepository{
		db:     db,
		logger: logger,
	}
}

func (r *RoomTypeRepository) Create(ctx context.Context, roomType *models.RoomType) (*models.RoomType, error) {
	if roomType == nil {
		return nil, errors.New("roomType cannot be nil")
	}

	if err := roomType.Validate(); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	insertStmt := table.RoomTypes.
		INSERT(table.RoomTypes.Name).
		MODEL(roomType).
		RETURNING(table.RoomTypes.AllColumns)

	var dest model.RoomTypes
	if err := insertStmt.QueryContext(ctx, r.db, &dest); err != nil {
		r.logger.Error("failed to create room type", zap.Error(err))
		return nil, fmt.Errorf("failed to create room type: %w", err)
	}

	return models.NewRoomType(dest.Name, dest.CreatedAt, dest.UpdatedAt), nil
}

func (r *RoomTypeRepository) CreateBatch(ctx context.Context, roomTypes []*models.RoomType) ([]*models.RoomType, error) {
	if roomTypes == nil {
		return nil, errors.New("roomTypes is required")
	}

	if len(roomTypes) == 0 {
		return nil, errors.New("roomTypes must have at least 1")
	}

	tx, err := r.db.BeginTx(ctx, &sql.TxOptions{ReadOnly: false})
	if err != nil {
		r.logger.Error("failed to begin transaction", zap.Error(err))
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}

	defer tx.Rollback()

	var newRoomTypes []*models.RoomType
	for _, roomType := range roomTypes {

		if err := roomType.Validate(); err != nil {
			r.logger.Error("validation failed", zap.Error(err))
			return nil, fmt.Errorf("validation failed: %w", err)
		}

		insertStmt := table.RoomTypes.
			INSERT(
				table.RoomTypes.AllColumns.Except(table.RoomTypes.UpdatedAt),
			).
			MODEL(roomType).
			RETURNING(table.RoomTypes.AllColumns)

		var dest model.RoomTypes
		if err := insertStmt.QueryContext(ctx, tx, &dest); err != nil {
			r.logger.Error("failed to create room type", zap.Error(err))
			return nil, fmt.Errorf("failed to create room type: %w", err)
		}

		newRoomTypes = append(newRoomTypes, models.NewRoomType(dest.Name, dest.CreatedAt, dest.UpdatedAt))
	}

	if err := tx.Commit(); err != nil {
		r.logger.Error("failed to close transaction", zap.Error(err))
		return nil, fmt.Errorf("failed to close transaction: %w", err)
	}

	return newRoomTypes, nil
}

func (r *RoomTypeRepository) Delete(ctx context.Context, name string) error {
	deleteStmt := table.RoomTypes.
		DELETE().
		WHERE(table.RoomTypes.Name.EQ(String(name)))

	result, err := deleteStmt.ExecContext(ctx, r.db)
	if err != nil {
		r.logger.Error("failed to delete room type", zap.Error(err))
		return fmt.Errorf("failed to delete room type: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		r.logger.Error("failed to get rows affected", zap.Error(err))
		return fmt.Errorf("failed to delete room type: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func (r *RoomTypeRepository) Update(ctx context.Context, name string, updates *models.UpdateRoomType) (*models.RoomType, error) {
	if updates == nil {
		return nil, errors.New("updates cannot be nil")
	}

	if err := updates.Validate(); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	var columns ColumnList
	if updates.Name != nil {
		columns = append(columns, table.RoomTypes.Name)
	}

	if len(columns) == 0 {
		return nil, errors.New("no fields to update")
	}

	updateStmt := table.RoomTypes.
		UPDATE(columns).
		MODEL(updates).
		WHERE(table.RoomTypes.Name.EQ(String(name))).
		RETURNING(table.RoomTypes.AllColumns)

	var dest model.RoomTypes
	err := updateStmt.QueryContext(ctx, r.db, &dest)

	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, ErrNotFound
		}
		r.logger.Error("failed to update room type", zap.Error(err), zap.String("name", name))
		return nil, fmt.Errorf("failed to update room type: %w", err)
	}

	return models.NewRoomType(dest.Name, dest.CreatedAt, dest.UpdatedAt), nil
}

func (r *RoomTypeRepository) GetByName(ctx context.Context, name string) (*models.RoomType, error) {
	stmt := table.RoomTypes.
		SELECT(table.RoomTypes.AllColumns).
		WHERE(table.RoomTypes.Name.EQ(String(name)))

	var dest model.RoomTypes
	err := stmt.QueryContext(ctx, r.db, &dest)

	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, ErrNotFound
		}
		r.logger.Error("failed to get room type", zap.Error(err), zap.String("name", name))
		return nil, fmt.Errorf("failed to get room type: %w", err)
	}

	return models.NewRoomType(dest.Name, dest.CreatedAt, dest.UpdatedAt), nil
}

func (r *RoomTypeRepository) List(ctx context.Context) ([]*models.RoomType, error) {
	stmt := table.RoomTypes.
		SELECT(table.RoomTypes.AllColumns).
		ORDER_BY(table.RoomTypes.Name.ASC())

	var dest []model.RoomTypes
	err := stmt.QueryContext(ctx, r.db, &dest)

	if err != nil {
		r.logger.Error("failed to list room types", zap.Error(err))
		return nil, fmt.Errorf("failed to list room types: %w", err)
	}

	roomTypes := make([]*models.RoomType, len(dest))
	for i, d := range dest {
		roomTypes[i] = models.NewRoomType(d.Name, d.CreatedAt, d.UpdatedAt)
	}

	return roomTypes, nil
}
