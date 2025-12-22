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

// TestGetByID
func (s *CourseRepositorySuite) TestGetByID_Success() {
	now := time.Now()
	expected := models.NewCourse(uuid.New(), "Introduction to Data Analytics", &now, nil)
	s.repo.Create(s.ctx, expected)

	actual, err := s.repo.GetByID(s.ctx, expected.ID)

	s.Require().NoError(err)
	s.Require().Equal(expected, actual)
}

func (s *CourseRepositorySuite) TestGetByID_NotFoundError() {
	_, err := s.repo.GetByID(s.ctx, uuid.New())

	s.Require().Error(err)
	s.Require().ErrorContains(err, "failed to get course by id: ")
} 

// TestList
func (s *CourseRepositorySuite) TestList_Success() {
	now := time.Now()
	expected1 := models.NewCourse(uuid.New(), "Introduction to Data Analytics", &now, nil)
	expected2 := models.NewCourse(uuid.New(), "Advanced Data Analytics", &now, nil)

	s.repo.Create(s.ctx, expected1)
	s.repo.Create(s.ctx, expected2)

	actual, err := s.repo.List(s.ctx)

	s.Require().NoError(err)
	s.Require().Equal(expected1, actual[0])
	s.Require().Equal(expected2, actual[1])
}

func (s *CourseRepositorySuite) TestList_Empty() {
	actual, err := s.repo.List(s.ctx)

	s.Require().NoError(err)
	s.Require().NotNil(actual)
	s.Require().Equal(0, len(actual))
}

// TestCourseRepositorySuite
func TestCourseRepositorySuite(t *testing.T) {
	suite.Run(t, new(CourseRepositorySuite))
}
