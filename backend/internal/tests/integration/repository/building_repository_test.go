package integration_test

import (
	"context"
	"testing"

	"github.com/TerrenceMurray/course-scheduler/internal/models"
	"github.com/TerrenceMurray/course-scheduler/internal/repository"
	"github.com/TerrenceMurray/course-scheduler/internal/tests/utils"
	"github.com/google/uuid"
	"github.com/stretchr/testify/suite"
)

type BuildingRepositorySuite struct {
	suite.Suite
	testDB *utils.TestDB
	repo   repository.BuildingRepositoryInterface
	ctx    context.Context
}

func (s *BuildingRepositorySuite) SetupSuite() {
	s.testDB = utils.NewTestDB(s.T())
	s.repo = repository.NewBuildingRepository(s.testDB.DB, s.testDB.Logger)
	s.ctx = context.Background()

	// Setup test user context for RLS and created_by trigger
	_, err := s.testDB.SetupTestUserContext()
	if err != nil {
		s.T().Fatalf("failed to setup test user context: %v", err)
	}
}

func (s *BuildingRepositorySuite) TearDownSuite() {
	s.testDB.Close()
}

func (s *BuildingRepositorySuite) TearDownTest() {
	s.testDB.Truncate("scheduler.buildings")
}

// TestCreateBuilding
func (s *BuildingRepositorySuite) TestCreateBuilding_Success() {
	expected := &models.Building{
		ID:   uuid.New(),
		Name: "Natural Science",
	}

	actual, err := s.repo.Create(s.ctx, expected)

	s.Require().NoError(err)
	s.Require().Equal(expected.Name, actual.Name)
}

func (s *BuildingRepositorySuite) TestCreateBuilding_ValidationError() {
	testBuilding := &models.Building{
		ID:   uuid.New(),
		Name: "",
	}

	_, err := s.repo.Create(s.ctx, testBuilding)

	s.Require().Error(err)
}

// TestGetByID
func (s *BuildingRepositorySuite) TestGetByID_Success() {
	expected, err := s.repo.Create(s.ctx, models.NewBuilding(uuid.New(), "Building 1", nil, nil))

	actual, err := s.repo.GetByID(s.ctx, expected.ID)

	s.Require().NoError(err)
	s.Require().Equal(expected.ID, actual.ID)
	s.Require().Equal(expected.Name, actual.Name)
}

func (s *BuildingRepositorySuite) TestGetByID_NotFoundError() {
	_, err := s.repo.GetByID(s.ctx, uuid.New())

	s.Require().Error(err)
	s.Require().ErrorIs(err, repository.ErrNotFound)
}

// TestList
func (s *BuildingRepositorySuite) TestList_Success() {
	expected1, _ := s.repo.Create(s.ctx, models.NewBuilding(uuid.New(), "Building 1", nil, nil))
	expected2, _ := s.repo.Create(s.ctx, models.NewBuilding(uuid.New(), "Building 2", nil, nil))

	actual, err := s.repo.List(s.ctx)

	s.Require().NoError(err)
	s.Require().Equal(expected1.ID, actual[0].ID)
	s.Require().Equal(expected2.ID, actual[1].ID)
}

func (s *BuildingRepositorySuite) TestList_Empty() {
	actual, err := s.repo.List(s.ctx)

	s.Require().NoError(err)
	s.Require().Equal(0, len(actual))
}

// TestCreateBatch

func (s *BuildingRepositorySuite) TestCreateBatch_Success() {
	expected := []*models.Building{
		models.NewBuilding(uuid.New(), "Building 1", nil, nil),
		models.NewBuilding(uuid.New(), "Building 2", nil, nil),
	}

	actual, err := s.repo.CreateBatch(s.ctx, expected)

	s.Require().NoError(err)
	s.Require().Equal(2, len(actual))
	s.Require().NotNil(actual)
	for i, building := range expected {
		s.Require().Equal(building.ID, actual[i].ID)
		s.Require().Equal(building.Name, actual[i].Name)
	}
}

func (s *BuildingRepositorySuite) TestCreateBatch_ValidationError() {
	expected := []*models.Building{
		models.NewBuilding(uuid.New(), " ", nil, nil),
		models.NewBuilding(uuid.New(), "Building 2", nil, nil),
	}

	actual, err := s.repo.CreateBatch(s.ctx, expected)

	s.Require().Error(err)
	s.Require().ErrorContains(err, "failed to create building")
	s.Require().Nil(actual)
}

func (s *BuildingRepositorySuite) TestCreateBatch_RollbackOnError() {
	buildings := []*models.Building{
		models.NewBuilding(uuid.New(), "Building 1", nil, nil),
		models.NewBuilding(uuid.New(), " ", nil, nil),
	}

	_, createErr := s.repo.CreateBatch(s.ctx, buildings)

	actual, getErr := s.repo.List(s.ctx)

	s.Require().Error(createErr)
	s.Require().NoError(getErr)
	s.Require().Equal(0, len(actual))
}

// TestDelete
func (s *BuildingRepositorySuite) TestDelete_Success() {
	building, createErr := s.repo.Create(s.ctx, models.NewBuilding(uuid.New(), "Building 1", nil, nil))

	err := s.repo.Delete(s.ctx, building.ID)

	actual, getErr := s.repo.List(s.ctx)

	s.Require().NoError(createErr)
	s.Require().NoError(getErr)
	s.Require().NoError(err)
	s.Require().NotNil(actual)
	s.Require().Equal(0, len(actual))
}

func (s *BuildingRepositorySuite) TestDelete_NotFound() {
	err := s.repo.Delete(s.ctx, uuid.New())

	s.Require().Error(err)
	s.Require().ErrorIs(err, repository.ErrNotFound)
}

// TestUpdate
func (s *BuildingRepositorySuite) TestUpdate_Success() {
	building, _ := s.repo.Create(s.ctx, models.NewBuilding(uuid.New(), "Building 1", nil, nil))

	newName := "Updated Building"
	updates := &models.BuildingUpdate{
		Name: &newName,
	}

	actual, err := s.repo.Update(s.ctx, building.ID, updates)

	s.Require().NoError(err)
	s.Require().Equal(building.ID, actual.ID)
	s.Require().Equal(newName, actual.Name)
}

func (s *BuildingRepositorySuite) TestUpdate_NotFound() {
	newName := "Updated Building"
	updates := &models.BuildingUpdate{
		Name: &newName,
	}

	_, err := s.repo.Update(s.ctx, uuid.New(), updates)

	s.Require().Error(err)
	s.Require().ErrorIs(err, repository.ErrNotFound)
}

func (s *BuildingRepositorySuite) TestUpdate_ValidationError() {
	building, _ := s.repo.Create(s.ctx, models.NewBuilding(uuid.New(), "Building 1", nil, nil))

	emptyName := " "
	updates := &models.BuildingUpdate{
		Name: &emptyName,
	}

	_, err := s.repo.Update(s.ctx, building.ID, updates)

	s.Require().Error(err)
	s.Require().ErrorContains(err, "validation failed")
}

// TestBuildingRepositorySuite
func TestBuildingRepositorySuite(t *testing.T) {
	suite.Run(t, new(BuildingRepositorySuite))
}
