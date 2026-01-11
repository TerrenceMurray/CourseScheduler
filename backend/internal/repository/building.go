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

var _ BuildingRepositoryInterface = (*BuildingRepository)(nil)

type BuildingRepositoryInterface interface {
	Create(ctx context.Context, building *models.Building) (*models.Building, error)
	CreateBatch(ctx context.Context, buildings []*models.Building) ([]*models.Building, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.Building, error)
	List(ctx context.Context) ([]models.Building, error) // TODO: Update to pointer
	Delete(ctx context.Context, id uuid.UUID) error
	Update(ctx context.Context, id uuid.UUID, updates *models.BuildingUpdate) (*models.Building, error)
}

type BuildingRepository struct {
	db     *sql.DB
	logger *zap.Logger
}

func NewBuildingRepository(db *sql.DB, logger *zap.Logger) BuildingRepositoryInterface {
	return &BuildingRepository{
		db:     db,
		logger: logger,
	}
}

func (b *BuildingRepository) Create(ctx context.Context, building *models.Building) (*models.Building, error) {
	// Validate input
	if building == nil {
		return nil, errors.New("building cannot be nil")
	}

	if err := building.Validate(); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	newBuilding := model.Buildings{
		ID:   uuid.New(),
		Name: building.Name,
	}

	insertStmt := table.Buildings.INSERT(
		table.Buildings.ID,
		table.Buildings.Name,
	).MODEL(newBuilding).RETURNING(table.Buildings.AllColumns)

	var dest model.Buildings
	err := insertStmt.QueryContext(ctx, database.GetExecutor(ctx, b.db), &dest)

	if err != nil {
		b.logger.Error("failed to insert building", zap.Error(err))
		return nil, fmt.Errorf("failed to insert building: %w", err)
	}

	return models.NewBuilding(dest.ID, dest.Name, dest.CreatedAt, dest.UpdatedAt), nil
}

func (b *BuildingRepository) CreateBatch(ctx context.Context, buildings []*models.Building) ([]*models.Building, error) {
	if len(buildings) < 1 {
		return nil, errors.New("at least one building is required")
	}

	tx, err := b.db.BeginTx(ctx, &sql.TxOptions{ReadOnly: false})
	if err != nil {
		b.logger.Error("failed begin transaction", zap.Error(err))
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}

	defer tx.Rollback()

	var newBuildings []*models.Building
	for _, building := range buildings {

		if building == nil {
			return nil, errors.New("building cannot be nil")
		}

		if err := building.Validate(); err != nil {
			return nil, fmt.Errorf("failed to create building: %w", err)
		}

		insertStmt := table.Buildings.
			INSERT(
				table.Buildings.ID,
				table.Buildings.Name,
			).
			MODEL(building).
			RETURNING(table.Buildings.AllColumns)

		var dest model.Buildings
		if err := insertStmt.QueryContext(ctx, tx, &dest); err != nil {
			b.logger.Error("failed to create building", zap.Error(err))
			return nil, fmt.Errorf("failed to create building: %w", err)
		}

		newBuildings = append(newBuildings, models.NewBuilding(dest.ID, dest.Name, dest.CreatedAt, dest.UpdatedAt))
	}

	if err := tx.Commit(); err != nil {
		b.logger.Error("failed to commit transaction", zap.Error(err))
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return newBuildings, nil
}

func (b *BuildingRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Building, error) {
	stmt := table.Buildings.
		SELECT(table.Buildings.AllColumns).
		WHERE(table.Buildings.ID.EQ(UUID(id)))

	var dest model.Buildings
	err := stmt.QueryContext(ctx, database.GetExecutor(ctx, b.db), &dest)

	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, ErrNotFound
		}
		b.logger.Error("failed to get building", zap.Error(err), zap.String("id", id.String()))
		return nil, fmt.Errorf("failed to get building: %w", err)
	}

	return models.NewBuilding(dest.ID, dest.Name, dest.CreatedAt, dest.UpdatedAt), nil
}

func (b *BuildingRepository) List(ctx context.Context) ([]models.Building, error) {
	stmt := table.Buildings.
		SELECT(table.Buildings.AllColumns).
		ORDER_BY(table.Buildings.Name.ASC())

	var dest []model.Buildings
	err := stmt.QueryContext(ctx, database.GetExecutor(ctx, b.db), &dest)

	if err != nil {
		b.logger.Error("failed to list buildings", zap.Error(err))
		return nil, fmt.Errorf("failed to list buildings: %w", err)
	}

	buildings := make([]models.Building, len(dest))
	for i, d := range dest {
		buildings[i] = models.Building{
			ID:        d.ID,
			Name:      d.Name,
			CreatedAt: d.CreatedAt,
			UpdatedAt: d.UpdatedAt,
		}
	}

	return buildings, nil
}

func (b *BuildingRepository) Delete(ctx context.Context, id uuid.UUID) error {
	deleteStmt := table.Buildings.
		DELETE().
		WHERE(
			table.Buildings.ID.EQ(UUID(id)),
		)

	result, err := deleteStmt.ExecContext(ctx, database.GetExecutor(ctx, b.db))

	if err != nil {
		b.logger.Error("failed to delete building", zap.Error(err))
		return fmt.Errorf("failed to delete building: %w", err)
	}

	rowAffected, err := result.RowsAffected()
	if err != nil {
		b.logger.Error("failed to delete building", zap.Error(err))
		return fmt.Errorf("failed to delete building: %w", err)
	}

	if rowAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func (b *BuildingRepository) Update(ctx context.Context, id uuid.UUID, updates *models.BuildingUpdate) (*models.Building, error) {
	if updates == nil {
		return nil, errors.New("updates cannot be nil")
	}

	if err := updates.Validate(); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	var columns ColumnList
	if updates.Name != nil {
		columns = append(columns, table.Buildings.Name)
	}

	if len(columns) == 0 {
		return nil, errors.New("no fields to update")
	}

	updateStmt := table.Buildings.
		UPDATE(columns).
		MODEL(updates).
		WHERE(table.Buildings.ID.EQ(UUID(id))).
		RETURNING(table.Buildings.AllColumns)

	var dest model.Buildings
	err := updateStmt.QueryContext(ctx, database.GetExecutor(ctx, b.db), &dest)

	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, ErrNotFound
		}
		b.logger.Error("failed to update building", zap.Error(err), zap.String("id", id.String()))
		return nil, fmt.Errorf("failed to update building: %w", err)
	}

	return models.NewBuilding(dest.ID, dest.Name, dest.CreatedAt, dest.UpdatedAt), nil
}
