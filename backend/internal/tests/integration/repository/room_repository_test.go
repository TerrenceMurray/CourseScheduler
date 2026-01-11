package integration_test

import (
	"context"
	"testing"
	"time"

	"github.com/TerrenceMurray/course-scheduler/internal/models"
	"github.com/TerrenceMurray/course-scheduler/internal/repository"
	"github.com/TerrenceMurray/course-scheduler/internal/tests/utils"
	"github.com/google/uuid"
	"github.com/stretchr/testify/suite"
)

type RoomRepositorySuite struct {
	suite.Suite
	ctx          context.Context
	testDB       *utils.TestDB
	repo         repository.RoomRepositoryInterface
	buildingRepo repository.BuildingRepositoryInterface
	roomTypeRepo repository.RoomTypeRepositoryInterface
	testBuilding *models.Building
	testRoomType *models.RoomType
}

func (s *RoomRepositorySuite) SetupSuite() {
	s.ctx = context.Background()
	s.testDB = utils.NewTestDB(s.T())
	s.repo = repository.NewRoomRepository(s.testDB.DB, s.testDB.Logger)
	s.buildingRepo = repository.NewBuildingRepository(s.testDB.DB, s.testDB.Logger)
	s.roomTypeRepo = repository.NewRoomTypeRepository(s.testDB.DB, s.testDB.Logger)

	// Setup test user context for RLS and created_by trigger
	_, err := s.testDB.SetupTestUserContext()
	if err != nil {
		s.T().Fatalf("failed to setup test user context: %v", err)
	}
}

func (s *RoomRepositorySuite) SetupTest() {
	// Create a fresh building before each test
	building, err := s.buildingRepo.Create(s.ctx, models.NewBuilding(uuid.New(), "Test Building", nil, nil))
	s.Require().NoError(err)
	s.testBuilding = building

	// Create a fresh room type before each test
	roomType, err := s.roomTypeRepo.Create(s.ctx, models.NewRoomType("lecture_room", nil, nil))
	s.Require().NoError(err)
	s.testRoomType = roomType
}

func (s *RoomRepositorySuite) TearDownSuite() {
	s.testDB.Close()
}

func (s *RoomRepositorySuite) TearDownTest() {
	s.testDB.Truncate("scheduler.rooms")
	s.testDB.Truncate("scheduler.buildings")
	s.testDB.Truncate("scheduler.room_types")
}

// TestCreate
func (s *RoomRepositorySuite) TestCreate_Success() {
	now := time.Now()
	expected := models.NewRoom(uuid.New(), "FST 113", s.testRoomType.Name, s.testBuilding.ID, int32(50), &now, nil)

	actual, err := s.repo.Create(s.ctx, expected)

	s.Require().NoError(err)
	s.Require().NotNil(actual)
	s.Require().Equal(expected.ID, actual.ID)
	s.Require().Equal(expected.Name, actual.Name)
	s.Require().Equal(expected.Type, actual.Type)
	s.Require().Equal(expected.Building, actual.Building)
	s.Require().Equal(expected.Capacity, actual.Capacity)
}

func (s *RoomRepositorySuite) TestCreate_ValidationError() {
	now := time.Now()
	expected := models.NewRoom(uuid.New(), " ", s.testRoomType.Name, s.testBuilding.ID, int32(50), &now, nil)

	actual, err := s.repo.Create(s.ctx, expected)

	s.Require().Error(err)
	s.Require().ErrorContains(err, "validation failed")
	s.Require().Nil(actual)
}

// TestCreateBatch
func (s *RoomRepositorySuite) TestCreateBatch_Success() {
	now := time.Now()
	expected := []*models.Room{
		models.NewRoom(uuid.New(), "FST 113", s.testRoomType.Name, s.testBuilding.ID, int32(50), &now, nil),
		models.NewRoom(uuid.New(), "FST 114", s.testRoomType.Name, s.testBuilding.ID, int32(50), &now, nil),
	}

	actual, err := s.repo.CreateBatch(s.ctx, expected)

	s.Require().NoError(err)
	s.Require().NotNil(actual)
	s.Require().Equal(2, len(actual))
	for i, room := range expected {
		s.Require().Equal(room.ID, actual[i].ID)
		s.Require().Equal(room.Name, actual[i].Name)
		s.Require().Equal(room.Type, actual[i].Type)
		s.Require().Equal(room.Building, actual[i].Building)
		s.Require().Equal(room.Capacity, actual[i].Capacity)
	}
}

func (s *RoomRepositorySuite) TestCreateBatch_RollbackOnError() {
	now := time.Now()
	rooms := []*models.Room{
		models.NewRoom(uuid.New(), "FST 113", s.testRoomType.Name, s.testBuilding.ID, int32(50), &now, nil),
		models.NewRoom(uuid.New(), "", s.testRoomType.Name, s.testBuilding.ID, int32(50), &now, nil), // Invalid - empty name
	}

	_, createErr := s.repo.CreateBatch(s.ctx, rooms)

	// Verify batch failed
	s.Require().Error(createErr)

	// Verify no rooms were persisted (transaction rolled back)
	list, listErr := s.repo.List(s.ctx)
	s.Require().NoError(listErr)
	s.Require().Len(list, 0)
}

func (s *RoomRepositorySuite) TestCreateBatch_ValidationError() {
	now := time.Now()
	rooms := []*models.Room{
		models.NewRoom(uuid.New(), " ", s.testRoomType.Name, s.testBuilding.ID, int32(50), &now, nil), // Invalid
		models.NewRoom(uuid.New(), "FST 114", s.testRoomType.Name, s.testBuilding.ID, int32(50), &now, nil),
	}

	actual, err := s.repo.CreateBatch(s.ctx, rooms)

	s.Require().Error(err)
	s.Require().ErrorContains(err, "validation failed")
	s.Require().Nil(actual)
}

// TestDelete
func (s *RoomRepositorySuite) TestDelete_Success() {
	now := time.Now()
	room, _ := s.repo.Create(s.ctx, models.NewRoom(uuid.New(), "FST 113", s.testRoomType.Name, s.testBuilding.ID, int32(50), &now, nil))

	err := s.repo.Delete(s.ctx, room.ID)

	s.Require().NoError(err)

	// Verify it's deleted
	_, getErr := s.repo.GetByID(s.ctx, room.ID)
	s.Require().Error(getErr)
	s.Require().ErrorIs(getErr, repository.ErrNotFound)
}

func (s *RoomRepositorySuite) TestDelete_NotFound() {
	err := s.repo.Delete(s.ctx, uuid.New())

	s.Require().Error(err)
	s.Require().ErrorIs(err, repository.ErrNotFound)
}

// TestGetByID
func (s *RoomRepositorySuite) TestGetByID_Success() {
	now := time.Now()
	expected, _ := s.repo.Create(s.ctx, models.NewRoom(uuid.New(), "FST 113", s.testRoomType.Name, s.testBuilding.ID, int32(50), &now, nil))

	actual, err := s.repo.GetByID(s.ctx, expected.ID)

	s.Require().NoError(err)
	s.Require().Equal(expected.ID, actual.ID)
	s.Require().Equal(expected.Name, actual.Name)
	s.Require().Equal(expected.Type, actual.Type)
	s.Require().Equal(expected.Building, actual.Building)
	s.Require().Equal(expected.Capacity, actual.Capacity)
}

func (s *RoomRepositorySuite) TestGetByID_NotFoundError() {
	_, err := s.repo.GetByID(s.ctx, uuid.New())

	s.Require().Error(err)
	s.Require().ErrorIs(err, repository.ErrNotFound)
}

// TestList
func (s *RoomRepositorySuite) TestList_Success() {
	now := time.Now()
	// List orders by Name ASC
	expected1, _ := s.repo.Create(s.ctx, models.NewRoom(uuid.New(), "FST 113", s.testRoomType.Name, s.testBuilding.ID, int32(50), &now, nil))
	expected2, _ := s.repo.Create(s.ctx, models.NewRoom(uuid.New(), "FST 114", s.testRoomType.Name, s.testBuilding.ID, int32(30), &now, nil))

	actual, err := s.repo.List(s.ctx)

	s.Require().NoError(err)
	s.Require().Len(actual, 2)
	s.Require().Equal(expected1.ID, actual[0].ID)
	s.Require().Equal(expected1.Name, actual[0].Name)
	s.Require().Equal(expected2.ID, actual[1].ID)
	s.Require().Equal(expected2.Name, actual[1].Name)
}

func (s *RoomRepositorySuite) TestList_Empty() {
	actual, err := s.repo.List(s.ctx)

	s.Require().NoError(err)
	s.Require().NotNil(actual)
	s.Require().Len(actual, 0)
}

// TestUpdate
func (s *RoomRepositorySuite) TestUpdate_Success() {
	now := time.Now()
	room, _ := s.repo.Create(s.ctx, models.NewRoom(uuid.New(), "FST 113", s.testRoomType.Name, s.testBuilding.ID, int32(50), &now, nil))

	newName := "FST 114"
	newCapacity := int32(100)
	updates := &models.RoomUpdate{
		Name:     &newName,
		Capacity: &newCapacity,
	}

	actual, err := s.repo.Update(s.ctx, room.ID, updates)

	s.Require().NoError(err)
	s.Require().Equal(room.ID, actual.ID)
	s.Require().Equal(newName, actual.Name)
	s.Require().Equal(newCapacity, actual.Capacity)
	s.Require().Equal(room.Type, actual.Type) // Unchanged
}

func (s *RoomRepositorySuite) TestUpdate_NotFound() {
	newName := "FST 114"
	updates := &models.RoomUpdate{
		Name: &newName,
	}

	_, err := s.repo.Update(s.ctx, uuid.New(), updates)

	s.Require().Error(err)
	s.Require().ErrorIs(err, repository.ErrNotFound)
}

func (s *RoomRepositorySuite) TestUpdate_ValidationError() {
	now := time.Now()
	room, _ := s.repo.Create(s.ctx, models.NewRoom(uuid.New(), "FST 113", s.testRoomType.Name, s.testBuilding.ID, int32(50), &now, nil))

	emptyName := " "
	updates := &models.RoomUpdate{
		Name: &emptyName,
	}

	_, err := s.repo.Update(s.ctx, room.ID, updates)

	s.Require().Error(err)
	s.Require().ErrorContains(err, "validation failed")
}

// TestRepositorySuite
func TestRepositorySuite(t *testing.T) {
	suite.Run(t, new(RoomRepositorySuite))
}
