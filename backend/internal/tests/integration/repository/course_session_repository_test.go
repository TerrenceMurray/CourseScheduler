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

type CourseSessionRepositorySuite struct {
	suite.Suite
	ctx          context.Context
	testDB       *utils.TestDB
	repo         repository.CourseSessionRepositoryInterface
	courseRepo   repository.CourseRepositoryInterface
	roomTypeRepo repository.RoomTypeRepositoryInterface
	testCourse   *models.Course
	testRoomType *models.RoomType
}

func (s *CourseSessionRepositorySuite) SetupSuite() {
	s.ctx = context.Background()
	s.testDB = utils.NewTestDB(s.T())
	s.repo = repository.NewCourseSessionRepository(s.testDB.DB, s.testDB.Logger)
	s.courseRepo = repository.NewCourseRepository(s.testDB.DB, s.testDB.Logger)
	s.roomTypeRepo = repository.NewRoomTypeRepository(s.testDB.DB, s.testDB.Logger)

	// Setup test user context for RLS and created_by trigger
	_, err := s.testDB.SetupTestUserContext()
	if err != nil {
		s.T().Fatalf("failed to setup test user context: %v", err)
	}
}

func (s *CourseSessionRepositorySuite) SetupTest() {
	// Create a fresh course before each test
	course, err := s.courseRepo.Create(s.ctx, models.NewCourse(uuid.New(), "Test Course", nil, nil))
	s.Require().NoError(err)
	s.testCourse = course

	// Create a fresh room type before each test
	roomType, err := s.roomTypeRepo.Create(s.ctx, models.NewRoomType("lecture_room", nil, nil))
	s.Require().NoError(err)
	s.testRoomType = roomType
}

func (s *CourseSessionRepositorySuite) TearDownSuite() {
	s.testDB.Close()
}

func (s *CourseSessionRepositorySuite) TearDownTest() {
	s.testDB.Truncate("scheduler.course_sessions")
	s.testDB.Truncate("scheduler.courses")
	s.testDB.Truncate("scheduler.room_types")
}

func (s *CourseSessionRepositorySuite) createTestSession() *models.CourseSession {
	duration := int32(60)
	numSessions := int32(2)
	return models.NewCourseSession(
		uuid.New(),
		s.testCourse.ID,
		s.testRoomType.Name,
		"lecture",
		&duration,
		&numSessions,
		nil,
		nil,
	)
}

// TestCreate
func (s *CourseSessionRepositorySuite) TestCreate_Success() {
	expected := s.createTestSession()

	actual, err := s.repo.Create(s.ctx, expected)

	s.Require().NoError(err)
	s.Require().NotNil(actual)
	s.Require().Equal(expected.ID, actual.ID)
	s.Require().Equal(expected.CourseID, actual.CourseID)
	s.Require().Equal(expected.RequiredRoom, actual.RequiredRoom)
	s.Require().Equal(expected.Type, actual.Type)
	s.Require().Equal(*expected.Duration, *actual.Duration)
	s.Require().Equal(*expected.NumberOfSessions, *actual.NumberOfSessions)
	s.Require().NotNil(actual.CreatedAt)
}

func (s *CourseSessionRepositorySuite) TestCreate_ValidationError() {
	duration := int32(60)
	numSessions := int32(2)
	session := models.NewCourseSession(
		uuid.New(),
		s.testCourse.ID,
		" ", // Invalid - empty required room
		"lecture",
		&duration,
		&numSessions,
		nil,
		nil,
	)

	actual, err := s.repo.Create(s.ctx, session)

	s.Require().Error(err)
	s.Require().ErrorContains(err, "validation failed")
	s.Require().Nil(actual)
}

// TestCreateBatch
func (s *CourseSessionRepositorySuite) TestCreateBatch_Success() {
	duration1 := int32(60)
	numSessions1 := int32(2)
	duration2 := int32(90)
	numSessions2 := int32(1)

	expected := []*models.CourseSession{
		models.NewCourseSession(uuid.New(), s.testCourse.ID, s.testRoomType.Name, "lecture", &duration1, &numSessions1, nil, nil),
		models.NewCourseSession(uuid.New(), s.testCourse.ID, s.testRoomType.Name, "tutorial", &duration2, &numSessions2, nil, nil),
	}

	actual, err := s.repo.CreateBatch(s.ctx, expected)

	s.Require().NoError(err)
	s.Require().NotNil(actual)
	s.Require().Len(actual, 2)
	for i, session := range expected {
		s.Require().Equal(session.ID, actual[i].ID)
		s.Require().Equal(session.Type, actual[i].Type)
	}
}

func (s *CourseSessionRepositorySuite) TestCreateBatch_RollbackOnError() {
	duration := int32(60)
	numSessions := int32(2)

	sessions := []*models.CourseSession{
		models.NewCourseSession(uuid.New(), s.testCourse.ID, s.testRoomType.Name, "lecture", &duration, &numSessions, nil, nil),
		models.NewCourseSession(uuid.New(), s.testCourse.ID, "", "lecture", &duration, &numSessions, nil, nil), // Invalid - empty required room
	}

	_, createErr := s.repo.CreateBatch(s.ctx, sessions)

	// Verify batch failed
	s.Require().Error(createErr)

	// Verify no sessions were persisted (transaction rolled back)
	list, listErr := s.repo.List(s.ctx)
	s.Require().NoError(listErr)
	s.Require().Len(list, 0)
}

func (s *CourseSessionRepositorySuite) TestCreateBatch_ValidationError() {
	duration := int32(60)
	numSessions := int32(2)

	sessions := []*models.CourseSession{
		models.NewCourseSession(uuid.New(), s.testCourse.ID, " ", "lecture", &duration, &numSessions, nil, nil), // Invalid
		models.NewCourseSession(uuid.New(), s.testCourse.ID, s.testRoomType.Name, "lecture", &duration, &numSessions, nil, nil),
	}

	actual, err := s.repo.CreateBatch(s.ctx, sessions)

	s.Require().Error(err)
	s.Require().ErrorContains(err, "validation failed")
	s.Require().Nil(actual)
}

// TestGetByID
func (s *CourseSessionRepositorySuite) TestGetByID_Success() {
	expected, _ := s.repo.Create(s.ctx, s.createTestSession())

	actual, err := s.repo.GetByID(s.ctx, expected.ID)

	s.Require().NoError(err)
	s.Require().Equal(expected.ID, actual.ID)
	s.Require().Equal(expected.CourseID, actual.CourseID)
	s.Require().Equal(expected.Type, actual.Type)
}

func (s *CourseSessionRepositorySuite) TestGetByID_NotFoundError() {
	_, err := s.repo.GetByID(s.ctx, uuid.New())

	s.Require().Error(err)
	s.Require().ErrorIs(err, repository.ErrNotFound)
}

// TestGetByCourseID
func (s *CourseSessionRepositorySuite) TestGetByCourseID_Success() {
	duration := int32(60)
	numSessions := int32(2)

	// Note: PostgreSQL enums are ordered by definition position, not alphabetically
	// The enum is defined as: ('lab', 'tutorial', 'lecture')
	// So order is: lab (0) < tutorial (1) < lecture (2)
	session1, _ := s.repo.Create(s.ctx, models.NewCourseSession(uuid.New(), s.testCourse.ID, s.testRoomType.Name, "lab", &duration, &numSessions, nil, nil))
	session2, _ := s.repo.Create(s.ctx, models.NewCourseSession(uuid.New(), s.testCourse.ID, s.testRoomType.Name, "tutorial", &duration, &numSessions, nil, nil))

	actual, err := s.repo.GetByCourseID(s.ctx, s.testCourse.ID)

	s.Require().NoError(err)
	s.Require().Len(actual, 2)
	// Ordered by type ASC (enum position order: lab < tutorial < lecture)
	s.Require().Equal(session1.ID, actual[0].ID) // lab
	s.Require().Equal(session2.ID, actual[1].ID) // tutorial
}

func (s *CourseSessionRepositorySuite) TestGetByCourseID_Empty() {
	actual, err := s.repo.GetByCourseID(s.ctx, uuid.New())

	s.Require().NoError(err)
	s.Require().NotNil(actual)
	s.Require().Len(actual, 0)
}

// TestList
func (s *CourseSessionRepositorySuite) TestList_Success() {
	session1, _ := s.repo.Create(s.ctx, s.createTestSession())
	session2, _ := s.repo.Create(s.ctx, s.createTestSession())

	actual, err := s.repo.List(s.ctx)

	s.Require().NoError(err)
	s.Require().Len(actual, 2)
	s.Require().Equal(session1.ID, actual[0].ID)
	s.Require().Equal(session2.ID, actual[1].ID)
}

func (s *CourseSessionRepositorySuite) TestList_Empty() {
	actual, err := s.repo.List(s.ctx)

	s.Require().NoError(err)
	s.Require().NotNil(actual)
	s.Require().Len(actual, 0)
}

// TestDelete
func (s *CourseSessionRepositorySuite) TestDelete_Success() {
	session, _ := s.repo.Create(s.ctx, s.createTestSession())

	err := s.repo.Delete(s.ctx, session.ID)

	s.Require().NoError(err)

	// Verify it's deleted
	_, getErr := s.repo.GetByID(s.ctx, session.ID)
	s.Require().Error(getErr)
	s.Require().ErrorIs(getErr, repository.ErrNotFound)
}

func (s *CourseSessionRepositorySuite) TestDelete_NotFound() {
	err := s.repo.Delete(s.ctx, uuid.New())

	s.Require().Error(err)
	s.Require().ErrorIs(err, repository.ErrNotFound)
}

// TestUpdate
func (s *CourseSessionRepositorySuite) TestUpdate_Success() {
	session, _ := s.repo.Create(s.ctx, s.createTestSession())

	newDuration := int32(90)
	newType := "tutorial"
	updates := &models.CourseSessionUpdate{
		Duration: &newDuration,
		Type:     &newType,
	}

	actual, err := s.repo.Update(s.ctx, session.ID, updates)

	s.Require().NoError(err)
	s.Require().Equal(session.ID, actual.ID)
	s.Require().Equal(newDuration, *actual.Duration)
	s.Require().Equal(newType, actual.Type)
	s.Require().Equal(session.CourseID, actual.CourseID) // Unchanged
}

func (s *CourseSessionRepositorySuite) TestUpdate_NotFound() {
	newDuration := int32(90)
	updates := &models.CourseSessionUpdate{
		Duration: &newDuration,
	}

	_, err := s.repo.Update(s.ctx, uuid.New(), updates)

	s.Require().Error(err)
	s.Require().ErrorIs(err, repository.ErrNotFound)
}

func (s *CourseSessionRepositorySuite) TestUpdate_ValidationError() {
	session, _ := s.repo.Create(s.ctx, s.createTestSession())

	emptyRoom := " "
	updates := &models.CourseSessionUpdate{
		RequiredRoom: &emptyRoom,
	}

	_, err := s.repo.Update(s.ctx, session.ID, updates)

	s.Require().Error(err)
	s.Require().ErrorContains(err, "validation failed")
}

// TestCourseSessionRepositorySuite
func TestCourseSessionRepositorySuite(t *testing.T) {
	suite.Run(t, new(CourseSessionRepositorySuite))
}
