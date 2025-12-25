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

var _ RoomRepositoryInterface = (*RoomRepository)(nil)

type RoomRepositoryInterface interface {
	Create(ctx context.Context, room *models.Room) (*models.Room, error)
	CreateBatch(ctx context.Context, rooms []*models.Room) ([]*models.Room, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.Room, error)
	List(ctx context.Context) ([]*models.Room, error)
	Delete(ctx context.Context, id uuid.UUID) error
	Update(ctx context.Context, id uuid.UUID, updates *models.RoomUpdate) (*models.Room, error)
}

type RoomRepository struct {
	db     *sql.DB
	logger *zap.Logger
}

func NewRoomRepository(db *sql.DB, logger *zap.Logger) *RoomRepository {
	return &RoomRepository{
		db:     db,
		logger: logger,
	}
}

func (r *RoomRepository) Create(ctx context.Context, room *models.Room) (*models.Room, error) {
	if room == nil {
		return nil, errors.New("room cannot be nil")
	}

	if err := room.Validate(); err != nil {
		r.logger.Error("validation failed", zap.Error(err))
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	createStmt := table.Rooms.
		INSERT(
			table.Rooms.AllColumns.Except(table.Rooms.UpdatedAt),
		).
		MODEL(room).
		RETURNING(table.Rooms.AllColumns)

	var dest model.Rooms
	if err := createStmt.QueryContext(ctx, r.db, &dest); err != nil {
		r.logger.Error("failed to create room", zap.Error(err))
		return nil, fmt.Errorf("failed to create room: %w", err)
	}

	return models.NewRoom(dest.ID, dest.Name, dest.Type, dest.Building, dest.Capacity, dest.CreatedAt, dest.UpdatedAt), nil
}

func (r *RoomRepository) CreateBatch(ctx context.Context, rooms []*models.Room) ([]*models.Room, error) {
	if len(rooms) < 1 {
		return nil, errors.New("at least one room is required")
	}

	tx, err := r.db.BeginTx(ctx, &sql.TxOptions{ReadOnly: false})
	if err != nil {
		r.logger.Error("failed to begin transaction", zap.Error(err))
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}

	defer tx.Rollback()

	var newRooms []*models.Room
	for _, room := range rooms {
		if room == nil {
			return nil, errors.New("room cannot be nil")
		}

		if err := room.Validate(); err != nil {
			return nil, fmt.Errorf("validation failed: %w", err)
		}

		insertStmt := table.Rooms.
			INSERT(table.Rooms.AllColumns.Except(table.Rooms.UpdatedAt)).
			MODEL(room).
			RETURNING(table.Rooms.AllColumns)

		var dest model.Rooms
		if err := insertStmt.QueryContext(ctx, tx, &dest); err != nil {
			r.logger.Error("failed to create room", zap.Error(err))
			return nil, fmt.Errorf("failed to create room: %w", err)
		}

		newRooms = append(newRooms, models.NewRoom(dest.ID, dest.Name, dest.Type, dest.Building, dest.Capacity, dest.CreatedAt, dest.UpdatedAt))
	}

	if err := tx.Commit(); err != nil {
		r.logger.Error("failed to commit transaction", zap.Error(err))
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return newRooms, nil
}

func (r *RoomRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Room, error) {
	stmt := table.Rooms.
		SELECT(table.Rooms.AllColumns).
		WHERE(table.Rooms.ID.EQ(UUID(id)))

	var dest model.Rooms
	err := stmt.QueryContext(ctx, r.db, &dest)

	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, ErrNotFound
		}
		r.logger.Error("failed to get room", zap.Error(err), zap.String("id", id.String()))
		return nil, fmt.Errorf("failed to get room: %w", err)
	}

	return models.NewRoom(dest.ID, dest.Name, dest.Type, dest.Building, dest.Capacity, dest.CreatedAt, dest.UpdatedAt), nil
}

func (r *RoomRepository) List(ctx context.Context) ([]*models.Room, error) {
	stmt := table.Rooms.
		SELECT(table.Rooms.AllColumns).
		ORDER_BY(table.Rooms.Name.ASC())

	var dest []model.Rooms
	err := stmt.QueryContext(ctx, r.db, &dest)

	if err != nil {
		r.logger.Error("failed to list rooms", zap.Error(err))
		return nil, fmt.Errorf("failed to list rooms: %w", err)
	}

	rooms := make([]*models.Room, len(dest))
	for i, d := range dest {
		rooms[i] = models.NewRoom(d.ID, d.Name, d.Type, d.Building, d.Capacity, d.CreatedAt, d.UpdatedAt)
	}

	return rooms, nil
}

func (r *RoomRepository) Delete(ctx context.Context, id uuid.UUID) error {
	deleteStmt := table.Rooms.
		DELETE().
		WHERE(table.Rooms.ID.EQ(UUID(id)))

	result, err := deleteStmt.ExecContext(ctx, r.db)
	if err != nil {
		r.logger.Error("failed to delete room", zap.Error(err))
		return fmt.Errorf("failed to delete room: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		r.logger.Error("failed to get rows affected", zap.Error(err))
		return fmt.Errorf("failed to delete room: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func (r *RoomRepository) Update(ctx context.Context, id uuid.UUID, updates *models.RoomUpdate) (*models.Room, error) {
	if updates == nil {
		return nil, errors.New("updates cannot be nil")
	}

	if err := updates.Validate(); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	var columns ColumnList
	if updates.Name != nil {
		columns = append(columns, table.Rooms.Name)
	}
	if updates.Type != nil {
		columns = append(columns, table.Rooms.Type)
	}
	if updates.Building != nil {
		columns = append(columns, table.Rooms.Building)
	}
	if updates.Capacity != nil {
		columns = append(columns, table.Rooms.Capacity)
	}

	if len(columns) == 0 {
		return nil, errors.New("no fields to update")
	}

	updateStmt := table.Rooms.
		UPDATE(columns).
		MODEL(updates).
		WHERE(table.Rooms.ID.EQ(UUID(id))).
		RETURNING(table.Rooms.AllColumns)

	var dest model.Rooms
	err := updateStmt.QueryContext(ctx, r.db, &dest)

	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, ErrNotFound
		}
		r.logger.Error("failed to update room", zap.Error(err), zap.String("id", id.String()))
		return nil, fmt.Errorf("failed to update room: %w", err)
	}

	return models.NewRoom(dest.ID, dest.Name, dest.Type, dest.Building, dest.Capacity, dest.CreatedAt, dest.UpdatedAt), nil
}
