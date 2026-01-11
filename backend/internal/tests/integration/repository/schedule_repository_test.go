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

type ScheduleRepositorySuite struct {
	suite.Suite
	ctx    context.Context
	testDB *utils.TestDB
	repo   repository.ScheduleRepositoryInterface
}

func (s *ScheduleRepositorySuite) SetupSuite() {
	s.ctx = context.Background()
	s.testDB = utils.NewTestDB(s.T())
	s.repo = repository.NewScheduleRepository(s.testDB.DB, s.testDB.Logger)

	// Setup test user context for RLS and created_by trigger
	_, err := s.testDB.SetupTestUserContext()
	if err != nil {
		s.T().Fatalf("failed to setup test user context: %v", err)
	}
}

func (s *ScheduleRepositorySuite) TearDownSuite() {
	s.testDB.Close()
}

func (s *ScheduleRepositorySuite) TearDownTest() {
	s.testDB.Truncate("scheduler.schedules")
}

func (s *ScheduleRepositorySuite) createTestSchedule(name string) *models.Schedule {
	return models.NewSchedule(
		uuid.New(),
		name,
		[]models.ScheduledSession{
			{
				CourseID:  uuid.New(),
				RoomID:    uuid.New(),
				Day:       0, // Monday
				StartTime: 480, // 8:00 AM
				EndTime:   540, // 9:00 AM
			},
		},
		nil,
	)
}

// TestCreate
func (s *ScheduleRepositorySuite) TestCreate_Success() {
	expected := s.createTestSchedule("Fall 2025 Schedule")

	actual, err := s.repo.Create(s.ctx, expected)

	s.Require().NoError(err)
	s.Require().NotNil(actual)
	s.Require().Equal(expected.ID, actual.ID)
	s.Require().Equal(expected.Name, actual.Name)
	s.Require().Len(actual.Sessions, 1)
	s.Require().Equal(expected.Sessions[0].Day, actual.Sessions[0].Day)
	s.Require().Equal(expected.Sessions[0].StartTime, actual.Sessions[0].StartTime)
	s.Require().NotNil(actual.CreatedAt)
}

func (s *ScheduleRepositorySuite) TestCreate_ValidationError_EmptyName() {
	schedule := models.NewSchedule(
		uuid.New(),
		" ", // Invalid - empty name
		[]models.ScheduledSession{
			{CourseID: uuid.New(), RoomID: uuid.New(), Day: 0, StartTime: 480, EndTime: 540},
		},
		nil,
	)

	actual, err := s.repo.Create(s.ctx, schedule)

	s.Require().Error(err)
	s.Require().ErrorContains(err, "validation failed")
	s.Require().Nil(actual)
}

func (s *ScheduleRepositorySuite) TestCreate_ValidationError_EmptySessions() {
	schedule := models.NewSchedule(
		uuid.New(),
		"Fall 2025",
		[]models.ScheduledSession{}, // Invalid - no sessions
		nil,
	)

	actual, err := s.repo.Create(s.ctx, schedule)

	s.Require().Error(err)
	s.Require().ErrorContains(err, "validation failed")
	s.Require().Nil(actual)
}

func (s *ScheduleRepositorySuite) TestCreate_ValidationError_InvalidSession() {
	schedule := models.NewSchedule(
		uuid.New(),
		"Fall 2025",
		[]models.ScheduledSession{
			{CourseID: uuid.New(), RoomID: uuid.New(), Day: 7, StartTime: 480, EndTime: 540}, // Invalid day
		},
		nil,
	)

	actual, err := s.repo.Create(s.ctx, schedule)

	s.Require().Error(err)
	s.Require().ErrorContains(err, "validation failed")
	s.Require().Nil(actual)
}

// TestGetByID
func (s *ScheduleRepositorySuite) TestGetByID_Success() {
	expected, _ := s.repo.Create(s.ctx, s.createTestSchedule("Fall 2025"))

	actual, err := s.repo.GetByID(s.ctx, expected.ID)

	s.Require().NoError(err)
	s.Require().Equal(expected.ID, actual.ID)
	s.Require().Equal(expected.Name, actual.Name)
	s.Require().Len(actual.Sessions, 1)
}

func (s *ScheduleRepositorySuite) TestGetByID_NotFoundError() {
	_, err := s.repo.GetByID(s.ctx, uuid.New())

	s.Require().Error(err)
	s.Require().ErrorIs(err, repository.ErrNotFound)
}

// TestGetByName
func (s *ScheduleRepositorySuite) TestGetByName_Success() {
	expected, _ := s.repo.Create(s.ctx, s.createTestSchedule("Fall 2025"))

	actual, err := s.repo.GetByName(s.ctx, "Fall 2025")

	s.Require().NoError(err)
	s.Require().Equal(expected.ID, actual.ID)
	s.Require().Equal(expected.Name, actual.Name)
}

func (s *ScheduleRepositorySuite) TestGetByName_NotFoundError() {
	_, err := s.repo.GetByName(s.ctx, "nonexistent")

	s.Require().Error(err)
	s.Require().ErrorIs(err, repository.ErrNotFound)
}

// TestList
func (s *ScheduleRepositorySuite) TestList_Success() {
	// Creates are in alphabetical order by name
	expected1, _ := s.repo.Create(s.ctx, s.createTestSchedule("Fall 2025"))
	expected2, _ := s.repo.Create(s.ctx, s.createTestSchedule("Spring 2026"))

	actual, err := s.repo.List(s.ctx)

	s.Require().NoError(err)
	s.Require().Len(actual, 2)
	s.Require().Equal(expected1.ID, actual[0].ID) // Fall comes before Spring alphabetically
	s.Require().Equal(expected2.ID, actual[1].ID)
}

func (s *ScheduleRepositorySuite) TestList_Empty() {
	actual, err := s.repo.List(s.ctx)

	s.Require().NoError(err)
	s.Require().NotNil(actual)
	s.Require().Len(actual, 0)
}

// TestDelete
func (s *ScheduleRepositorySuite) TestDelete_Success() {
	schedule, _ := s.repo.Create(s.ctx, s.createTestSchedule("Fall 2025"))

	err := s.repo.Delete(s.ctx, schedule.ID)

	s.Require().NoError(err)

	// Verify it's deleted
	_, getErr := s.repo.GetByID(s.ctx, schedule.ID)
	s.Require().Error(getErr)
	s.Require().ErrorIs(getErr, repository.ErrNotFound)
}

func (s *ScheduleRepositorySuite) TestDelete_NotFound() {
	err := s.repo.Delete(s.ctx, uuid.New())

	s.Require().Error(err)
	s.Require().ErrorIs(err, repository.ErrNotFound)
}

// TestUpdate
func (s *ScheduleRepositorySuite) TestUpdate_Name_Success() {
	schedule, _ := s.repo.Create(s.ctx, s.createTestSchedule("Fall 2025"))

	newName := "Fall 2025 - Updated"
	updates := &models.ScheduleUpdate{
		Name: &newName,
	}

	actual, err := s.repo.Update(s.ctx, schedule.ID, updates)

	s.Require().NoError(err)
	s.Require().Equal(schedule.ID, actual.ID)
	s.Require().Equal(newName, actual.Name)
	s.Require().Len(actual.Sessions, 1) // Sessions unchanged
}

func (s *ScheduleRepositorySuite) TestUpdate_Sessions_Success() {
	schedule, _ := s.repo.Create(s.ctx, s.createTestSchedule("Fall 2025"))

	newSessions := []models.ScheduledSession{
		{CourseID: uuid.New(), RoomID: uuid.New(), Day: 1, StartTime: 600, EndTime: 660},
		{CourseID: uuid.New(), RoomID: uuid.New(), Day: 2, StartTime: 720, EndTime: 780},
	}
	updates := &models.ScheduleUpdate{
		Sessions: newSessions,
	}

	actual, err := s.repo.Update(s.ctx, schedule.ID, updates)

	s.Require().NoError(err)
	s.Require().Equal(schedule.ID, actual.ID)
	s.Require().Len(actual.Sessions, 2)
	s.Require().Equal(1, actual.Sessions[0].Day) // Tuesday
	s.Require().Equal(2, actual.Sessions[1].Day) // Wednesday
}

func (s *ScheduleRepositorySuite) TestUpdate_NotFound() {
	newName := "Updated"
	updates := &models.ScheduleUpdate{
		Name: &newName,
	}

	_, err := s.repo.Update(s.ctx, uuid.New(), updates)

	s.Require().Error(err)
	s.Require().ErrorIs(err, repository.ErrNotFound)
}

func (s *ScheduleRepositorySuite) TestUpdate_ValidationError() {
	schedule, _ := s.repo.Create(s.ctx, s.createTestSchedule("Fall 2025"))

	emptyName := " "
	updates := &models.ScheduleUpdate{
		Name: &emptyName,
	}

	_, err := s.repo.Update(s.ctx, schedule.ID, updates)

	s.Require().Error(err)
	s.Require().ErrorContains(err, "validation failed")
}

// TestScheduleRepositorySuite
func TestScheduleRepositorySuite(t *testing.T) {
	suite.Run(t, new(ScheduleRepositorySuite))
}
