package integration_test

import (
	"context"
	"testing"

	"github.com/TerrenceMurray/course-scheduler/internal/models"
	"github.com/TerrenceMurray/course-scheduler/internal/repository"
	"github.com/TerrenceMurray/course-scheduler/internal/tests/utils"
	"github.com/stretchr/testify/suite"
)

type RoomTypeRepositorySuite struct {
	suite.Suite
	testDB *utils.TestDB
	repo   repository.RoomTypeRepositoryInterface
	ctx    context.Context
}

func (s *RoomTypeRepositorySuite) SetupSuite() {
	s.testDB = utils.NewTestDB(s.T())
	s.ctx = context.Background()
	s.repo = repository.NewRoomTypeRepository(s.testDB.DB, s.testDB.Logger)
}

func (s *RoomTypeRepositorySuite) TearDownTest() {
	s.testDB.Truncate("scheduler.room_types")
}

func (s *RoomTypeRepositorySuite) TearDownSuite() {
	s.testDB.Close()
}

// TestCreate
func (s *RoomTypeRepositorySuite) TestCreate_Success() {
	expected := models.NewRoomType("lecture_hall", nil, nil)

	actual, err := s.repo.Create(s.ctx, expected)

	s.Require().NoError(err)
	s.Require().NotNil(actual)
	s.Require().Equal(expected.Name, actual.Name)
	s.Require().NotNil(actual.CreatedAt)
}

func (s *RoomTypeRepositorySuite) TestCreate_ValidationError() {
	expected := models.NewRoomType(" ", nil, nil)

	actual, err := s.repo.Create(s.ctx, expected)

	s.Require().Error(err)
	s.Require().ErrorContains(err, "validation failed")
	s.Require().Nil(actual)
}

// TestCreateBatch
func (s *RoomTypeRepositorySuite) TestCreateBatch_Success() {
	expected := []*models.RoomType{
		models.NewRoomType("lecture_hall", nil, nil),
		models.NewRoomType("computer_lab", nil, nil),
	}

	actual, err := s.repo.CreateBatch(s.ctx, expected)

	s.Require().NoError(err)
	s.Require().NotNil(actual)
	s.Require().Len(actual, 2)
	for i, roomType := range expected {
		s.Require().Equal(roomType.Name, actual[i].Name)
	}
}

func (s *RoomTypeRepositorySuite) TestCreateBatch_RollbackOnError() {
	roomTypes := []*models.RoomType{
		models.NewRoomType("lecture_hall", nil, nil),
		models.NewRoomType("", nil, nil), // Invalid - empty name
	}

	_, createErr := s.repo.CreateBatch(s.ctx, roomTypes)

	// Verify batch failed
	s.Require().Error(createErr)

	// Verify no room types were persisted (transaction rolled back)
	list, listErr := s.repo.List(s.ctx)
	s.Require().NoError(listErr)
	s.Require().Len(list, 0)
}

func (s *RoomTypeRepositorySuite) TestCreateBatch_ValidationError() {
	roomTypes := []*models.RoomType{
		models.NewRoomType(" ", nil, nil), // Invalid
		models.NewRoomType("computer_lab", nil, nil),
	}

	actual, err := s.repo.CreateBatch(s.ctx, roomTypes)

	s.Require().Error(err)
	s.Require().ErrorContains(err, "validation failed")
	s.Require().Nil(actual)
}

// TestGetByName
func (s *RoomTypeRepositorySuite) TestGetByName_Success() {
	expected, _ := s.repo.Create(s.ctx, models.NewRoomType("lecture_hall", nil, nil))

	actual, err := s.repo.GetByName(s.ctx, expected.Name)

	s.Require().NoError(err)
	s.Require().Equal(expected.Name, actual.Name)
}

func (s *RoomTypeRepositorySuite) TestGetByName_NotFoundError() {
	_, err := s.repo.GetByName(s.ctx, "nonexistent_type")

	s.Require().Error(err)
	s.Require().ErrorIs(err, repository.ErrNotFound)
}

// TestList
func (s *RoomTypeRepositorySuite) TestList_Success() {
	// List orders by Name ASC
	expected1, _ := s.repo.Create(s.ctx, models.NewRoomType("computer_lab", nil, nil))
	expected2, _ := s.repo.Create(s.ctx, models.NewRoomType("lecture_hall", nil, nil))

	actual, err := s.repo.List(s.ctx)

	s.Require().NoError(err)
	s.Require().Len(actual, 2)
	s.Require().Equal(expected1.Name, actual[0].Name) // computer_lab comes first alphabetically
	s.Require().Equal(expected2.Name, actual[1].Name)
}

func (s *RoomTypeRepositorySuite) TestList_Empty() {
	actual, err := s.repo.List(s.ctx)

	s.Require().NoError(err)
	s.Require().NotNil(actual)
	s.Require().Len(actual, 0)
}

// TestDelete
func (s *RoomTypeRepositorySuite) TestDelete_Success() {
	roomType, _ := s.repo.Create(s.ctx, models.NewRoomType("lecture_hall", nil, nil))

	err := s.repo.Delete(s.ctx, roomType.Name)

	s.Require().NoError(err)

	// Verify it's deleted
	_, getErr := s.repo.GetByName(s.ctx, roomType.Name)
	s.Require().Error(getErr)
	s.Require().ErrorIs(getErr, repository.ErrNotFound)
}

func (s *RoomTypeRepositorySuite) TestDelete_NotFound() {
	err := s.repo.Delete(s.ctx, "nonexistent_type")

	s.Require().Error(err)
	s.Require().ErrorIs(err, repository.ErrNotFound)
}

// TestUpdate
func (s *RoomTypeRepositorySuite) TestUpdate_Success() {
	roomType, _ := s.repo.Create(s.ctx, models.NewRoomType("lecture_hall", nil, nil))

	newName := "large_lecture_hall"
	updates := &models.UpdateRoomType{
		Name: &newName,
	}

	actual, err := s.repo.Update(s.ctx, roomType.Name, updates)

	s.Require().NoError(err)
	s.Require().Equal(newName, actual.Name)
}

func (s *RoomTypeRepositorySuite) TestUpdate_NotFound() {
	newName := "updated_type"
	updates := &models.UpdateRoomType{
		Name: &newName,
	}

	_, err := s.repo.Update(s.ctx, "nonexistent_type", updates)

	s.Require().Error(err)
	s.Require().ErrorIs(err, repository.ErrNotFound)
}

func (s *RoomTypeRepositorySuite) TestUpdate_ValidationError() {
	roomType, _ := s.repo.Create(s.ctx, models.NewRoomType("lecture_hall", nil, nil))

	emptyName := " "
	updates := &models.UpdateRoomType{
		Name: &emptyName,
	}

	_, err := s.repo.Update(s.ctx, roomType.Name, updates)

	s.Require().Error(err)
	s.Require().ErrorContains(err, "validation failed")
}

// TestRoomTypeRepositorySuite
func TestRoomTypeRepositorySuite(t *testing.T) {
	suite.Run(t, new(RoomTypeRepositorySuite))
}
