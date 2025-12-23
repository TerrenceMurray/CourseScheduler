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

type CourseRepositorySuite struct {
	suite.Suite
	repo   repository.CourseRepositoryInterface
	testDB *utils.TestDB
	ctx    context.Context
}

func (s *CourseRepositorySuite) SetupSuite() {
	s.testDB = utils.NewTestDB(s.T())
	s.repo = repository.NewCourseRepository(s.testDB.DB, s.testDB.Logger)
	s.ctx = context.Background()
}

func (s *CourseRepositorySuite) TearDownSuite() {
	s.testDB.Close()
}

func (s *CourseRepositorySuite) TearDownTest() {
	s.testDB.Truncate("scheduler.courses")
}

// TestCreate
func (s *CourseRepositorySuite) TestCreate_Success() {
	now := time.Now()

	expected := models.NewCourse(
		uuid.New(),
		"Introduction to Data Analytics",
		&now,
		nil,
	)

	actual, err := s.repo.Create(s.ctx, expected)

	s.Require().NoError(err)
	s.Require().Equal(expected.ID, actual.ID)
}

func (s *CourseRepositorySuite) TestCreate_ValidationError() {
	now := time.Now()

	expected := models.NewCourse(
		uuid.New(),
		" ",
		&now,
		nil,
	)

	_, err := s.repo.Create(s.ctx, expected)

	s.Require().Error(err)
	s.Require().ErrorContains(err, "validation failed:")
}

// TestDelete
func (s *CourseRepositorySuite) TestDelete_Success() {
	now := time.Now()
	course, _ := s.repo.Create(s.ctx, models.NewCourse(
		uuid.New(),
		"Introduction to Data Analytics",
		&now,
		nil,
	))

	err := s.repo.Delete(s.ctx, course.ID)

	s.Require().NoError(err)

	// Verify it's deleted
	_, getErr := s.repo.GetByID(s.ctx, course.ID)
	s.Require().Error(getErr)
}

func (s *CourseRepositorySuite) TestDelete_NotFound() {
	err := s.repo.Delete(s.ctx, uuid.New())

	s.Require().Error(err)
	s.Require().ErrorIs(err, repository.ErrNotFound)
}

// TestCreateBatch
func (s *CourseRepositorySuite) TestCreateBatch_Success() {
	now := time.Now()

	expected := []*models.Course{
		models.NewCourse(uuid.New(), "Course 1", &now, nil),
		models.NewCourse(uuid.New(), "Course 2", &now, nil),
	}

	actual, err := s.repo.CreateBatch(s.ctx, expected)

	s.Require().NoError(err)
	for i, actualCourse := range actual {
		s.Require().Equal(expected[i].ID, actualCourse.ID)
		s.Require().Equal(expected[i].Name, actualCourse.Name)
	}
}

func (s *CourseRepositorySuite) TestCreateBatch_ValidationError() {
	now := time.Now()

	expected := []*models.Course{
		models.NewCourse(uuid.New(), " ", &now, nil),
		models.NewCourse(uuid.New(), "Course 2", &now, nil),
	}

	_, err := s.repo.CreateBatch(s.ctx, expected)

	s.Require().NotNil(err)
	s.Require().Error(err)
	s.Require().ErrorContains(err, "validation failed:")
}

func (s *CourseRepositorySuite) TestCreateBatch_RollbackOnError() {
	now := time.Now()

	// First course is invalid (empty name), second is valid
	// Transaction should rollback, leaving no courses in DB
	courses := []*models.Course{
		models.NewCourse(uuid.New(), "Valid Course", &now, nil),
		models.NewCourse(uuid.New(), " ", &now, nil), // Invalid - will fail validation
	}

	_, createErr := s.repo.CreateBatch(s.ctx, courses)

	// Verify batch failed
	s.Require().Error(createErr)
	s.Require().ErrorContains(createErr, "validation failed:")

	// Verify no courses were persisted (transaction rolled back)
	actual, getErr := s.repo.List(s.ctx)
	s.Require().NoError(getErr)
	s.Require().Len(actual, 0)
}

// TestGetByID
func (s *CourseRepositorySuite) TestGetByID_Success() {
	now := time.Now()
	expected, _ := s.repo.Create(s.ctx, models.NewCourse(uuid.New(), "Introduction to Data Analytics", &now, nil))

	actual, err := s.repo.GetByID(s.ctx, expected.ID)

	s.Require().NoError(err)
	s.Require().Equal(expected.ID, actual.ID)
	s.Require().Equal(expected.Name, actual.Name)
}

func (s *CourseRepositorySuite) TestGetByID_NotFoundError() {
	_, err := s.repo.GetByID(s.ctx, uuid.New())

	s.Require().Error(err)
}

// TestList
func (s *CourseRepositorySuite) TestList_Success() {
	now := time.Now()
	// Note: List orders by Name ASC, so "Advanced" comes before "Introduction"
	expected1, _ := s.repo.Create(s.ctx, models.NewCourse(uuid.New(), "Advanced Data Analytics", &now, nil))
	expected2, _ := s.repo.Create(s.ctx, models.NewCourse(uuid.New(), "Introduction to Data Analytics", &now, nil))

	actual, err := s.repo.List(s.ctx)

	s.Require().NoError(err)
	s.Require().Len(actual, 2)
	s.Require().Equal(expected1.ID, actual[0].ID)
	s.Require().Equal(expected1.Name, actual[0].Name)
	s.Require().Equal(expected2.ID, actual[1].ID)
	s.Require().Equal(expected2.Name, actual[1].Name)
}

func (s *CourseRepositorySuite) TestList_Empty() {
	actual, err := s.repo.List(s.ctx)

	s.Require().NoError(err)
	s.Require().NotNil(actual)
	s.Require().Len(actual, 0)
}

// TestCourseRepositorySuite
func TestCourseRepositorySuite(t *testing.T) {
	suite.Run(t, new(CourseRepositorySuite))
}
