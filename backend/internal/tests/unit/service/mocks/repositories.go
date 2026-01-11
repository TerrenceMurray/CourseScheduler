package mocks

import (
	"context"

	"github.com/TerrenceMurray/course-scheduler/internal/models"
	"github.com/TerrenceMurray/course-scheduler/internal/repository"
	"github.com/google/uuid"
)

// MockBuildingRepository is a mock implementation of BuildingRepositoryInterface
type MockBuildingRepository struct {
	CreateFunc      func(ctx context.Context, building *models.Building) (*models.Building, error)
	CreateBatchFunc func(ctx context.Context, buildings []*models.Building) ([]*models.Building, error)
	GetByIDFunc     func(ctx context.Context, id uuid.UUID) (*models.Building, error)
	ListFunc        func(ctx context.Context) ([]models.Building, error)
	DeleteFunc      func(ctx context.Context, id uuid.UUID) error
	UpdateFunc      func(ctx context.Context, id uuid.UUID, updates *models.BuildingUpdate) (*models.Building, error)
}

var _ repository.BuildingRepositoryInterface = (*MockBuildingRepository)(nil)

func (m *MockBuildingRepository) Create(ctx context.Context, building *models.Building) (*models.Building, error) {
	return m.CreateFunc(ctx, building)
}

func (m *MockBuildingRepository) CreateBatch(ctx context.Context, buildings []*models.Building) ([]*models.Building, error) {
	return m.CreateBatchFunc(ctx, buildings)
}

func (m *MockBuildingRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Building, error) {
	return m.GetByIDFunc(ctx, id)
}

func (m *MockBuildingRepository) List(ctx context.Context) ([]models.Building, error) {
	return m.ListFunc(ctx)
}

func (m *MockBuildingRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return m.DeleteFunc(ctx, id)
}

func (m *MockBuildingRepository) Update(ctx context.Context, id uuid.UUID, updates *models.BuildingUpdate) (*models.Building, error) {
	return m.UpdateFunc(ctx, id, updates)
}

// MockCourseRepository is a mock implementation of CourseRepositoryInterface
type MockCourseRepository struct {
	CreateFunc      func(ctx context.Context, course *models.Course) (*models.Course, error)
	CreateBatchFunc func(ctx context.Context, courses []*models.Course) ([]*models.Course, error)
	GetByIDFunc     func(ctx context.Context, id uuid.UUID) (*models.Course, error)
	ListFunc        func(ctx context.Context) ([]models.Course, error)
	DeleteFunc      func(ctx context.Context, id uuid.UUID) error
	UpdateFunc      func(ctx context.Context, id uuid.UUID, updates *models.CourseUpdate) (*models.Course, error)
}

var _ repository.CourseRepositoryInterface = (*MockCourseRepository)(nil)

func (m *MockCourseRepository) Create(ctx context.Context, course *models.Course) (*models.Course, error) {
	return m.CreateFunc(ctx, course)
}

func (m *MockCourseRepository) CreateBatch(ctx context.Context, courses []*models.Course) ([]*models.Course, error) {
	return m.CreateBatchFunc(ctx, courses)
}

func (m *MockCourseRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Course, error) {
	return m.GetByIDFunc(ctx, id)
}

func (m *MockCourseRepository) List(ctx context.Context) ([]models.Course, error) {
	return m.ListFunc(ctx)
}

func (m *MockCourseRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return m.DeleteFunc(ctx, id)
}

func (m *MockCourseRepository) Update(ctx context.Context, id uuid.UUID, updates *models.CourseUpdate) (*models.Course, error) {
	return m.UpdateFunc(ctx, id, updates)
}

// MockCourseSessionRepository is a mock implementation of CourseSessionRepositoryInterface
type MockCourseSessionRepository struct {
	CreateFunc        func(ctx context.Context, session *models.CourseSession) (*models.CourseSession, error)
	CreateBatchFunc   func(ctx context.Context, sessions []*models.CourseSession) ([]*models.CourseSession, error)
	GetByIDFunc       func(ctx context.Context, id uuid.UUID) (*models.CourseSession, error)
	GetByCourseIDFunc func(ctx context.Context, courseID uuid.UUID) ([]*models.CourseSession, error)
	ListFunc          func(ctx context.Context) ([]*models.CourseSession, error)
	DeleteFunc        func(ctx context.Context, id uuid.UUID) error
	UpdateFunc        func(ctx context.Context, id uuid.UUID, updates *models.CourseSessionUpdate) (*models.CourseSession, error)
}

var _ repository.CourseSessionRepositoryInterface = (*MockCourseSessionRepository)(nil)

func (m *MockCourseSessionRepository) Create(ctx context.Context, session *models.CourseSession) (*models.CourseSession, error) {
	return m.CreateFunc(ctx, session)
}

func (m *MockCourseSessionRepository) CreateBatch(ctx context.Context, sessions []*models.CourseSession) ([]*models.CourseSession, error) {
	return m.CreateBatchFunc(ctx, sessions)
}

func (m *MockCourseSessionRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.CourseSession, error) {
	return m.GetByIDFunc(ctx, id)
}

func (m *MockCourseSessionRepository) GetByCourseID(ctx context.Context, courseID uuid.UUID) ([]*models.CourseSession, error) {
	return m.GetByCourseIDFunc(ctx, courseID)
}

func (m *MockCourseSessionRepository) List(ctx context.Context) ([]*models.CourseSession, error) {
	return m.ListFunc(ctx)
}

func (m *MockCourseSessionRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return m.DeleteFunc(ctx, id)
}

func (m *MockCourseSessionRepository) Update(ctx context.Context, id uuid.UUID, updates *models.CourseSessionUpdate) (*models.CourseSession, error) {
	return m.UpdateFunc(ctx, id, updates)
}

// MockRoomRepository is a mock implementation of RoomRepositoryInterface
type MockRoomRepository struct {
	CreateFunc      func(ctx context.Context, room *models.Room) (*models.Room, error)
	CreateBatchFunc func(ctx context.Context, rooms []*models.Room) ([]*models.Room, error)
	GetByIDFunc     func(ctx context.Context, id uuid.UUID) (*models.Room, error)
	ListFunc        func(ctx context.Context) ([]*models.Room, error)
	DeleteFunc      func(ctx context.Context, id uuid.UUID) error
	UpdateFunc      func(ctx context.Context, id uuid.UUID, updates *models.RoomUpdate) (*models.Room, error)
}

var _ repository.RoomRepositoryInterface = (*MockRoomRepository)(nil)

func (m *MockRoomRepository) Create(ctx context.Context, room *models.Room) (*models.Room, error) {
	return m.CreateFunc(ctx, room)
}

func (m *MockRoomRepository) CreateBatch(ctx context.Context, rooms []*models.Room) ([]*models.Room, error) {
	return m.CreateBatchFunc(ctx, rooms)
}

func (m *MockRoomRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Room, error) {
	return m.GetByIDFunc(ctx, id)
}

func (m *MockRoomRepository) List(ctx context.Context) ([]*models.Room, error) {
	return m.ListFunc(ctx)
}

func (m *MockRoomRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return m.DeleteFunc(ctx, id)
}

func (m *MockRoomRepository) Update(ctx context.Context, id uuid.UUID, updates *models.RoomUpdate) (*models.Room, error) {
	return m.UpdateFunc(ctx, id, updates)
}

// MockRoomTypeRepository is a mock implementation of RoomTypeRepositoryInterface
type MockRoomTypeRepository struct {
	CreateFunc      func(ctx context.Context, roomType *models.RoomType) (*models.RoomType, error)
	CreateBatchFunc func(ctx context.Context, roomTypes []*models.RoomType) ([]*models.RoomType, error)
	GetByNameFunc   func(ctx context.Context, name string) (*models.RoomType, error)
	ListFunc        func(ctx context.Context) ([]*models.RoomType, error)
	DeleteFunc      func(ctx context.Context, name string) error
	UpdateFunc      func(ctx context.Context, name string, updates *models.UpdateRoomType) (*models.RoomType, error)
}

var _ repository.RoomTypeRepositoryInterface = (*MockRoomTypeRepository)(nil)

func (m *MockRoomTypeRepository) Create(ctx context.Context, roomType *models.RoomType) (*models.RoomType, error) {
	return m.CreateFunc(ctx, roomType)
}

func (m *MockRoomTypeRepository) CreateBatch(ctx context.Context, roomTypes []*models.RoomType) ([]*models.RoomType, error) {
	return m.CreateBatchFunc(ctx, roomTypes)
}

func (m *MockRoomTypeRepository) GetByName(ctx context.Context, name string) (*models.RoomType, error) {
	return m.GetByNameFunc(ctx, name)
}

func (m *MockRoomTypeRepository) List(ctx context.Context) ([]*models.RoomType, error) {
	return m.ListFunc(ctx)
}

func (m *MockRoomTypeRepository) Delete(ctx context.Context, name string) error {
	return m.DeleteFunc(ctx, name)
}

func (m *MockRoomTypeRepository) Update(ctx context.Context, name string, updates *models.UpdateRoomType) (*models.RoomType, error) {
	return m.UpdateFunc(ctx, name, updates)
}

// MockScheduleRepository is a mock implementation of ScheduleRepositoryInterface
type MockScheduleRepository struct {
	CreateFunc       func(ctx context.Context, schedule *models.Schedule) (*models.Schedule, error)
	GetByIDFunc      func(ctx context.Context, id uuid.UUID) (*models.Schedule, error)
	GetByNameFunc    func(ctx context.Context, name string) (*models.Schedule, error)
	ListFunc         func(ctx context.Context) ([]*models.Schedule, error)
	ListArchivedFunc func(ctx context.Context) ([]*models.Schedule, error)
	DeleteFunc       func(ctx context.Context, id uuid.UUID) error
	UpdateFunc       func(ctx context.Context, id uuid.UUID, updates *models.ScheduleUpdate) (*models.Schedule, error)
	SetActiveFunc    func(ctx context.Context, id uuid.UUID) (*models.Schedule, error)
	ArchiveFunc      func(ctx context.Context, id uuid.UUID) (*models.Schedule, error)
	UnarchiveFunc    func(ctx context.Context, id uuid.UUID) (*models.Schedule, error)
}

var _ repository.ScheduleRepositoryInterface = (*MockScheduleRepository)(nil)

func (m *MockScheduleRepository) Create(ctx context.Context, schedule *models.Schedule) (*models.Schedule, error) {
	return m.CreateFunc(ctx, schedule)
}

func (m *MockScheduleRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Schedule, error) {
	return m.GetByIDFunc(ctx, id)
}

func (m *MockScheduleRepository) GetByName(ctx context.Context, name string) (*models.Schedule, error) {
	return m.GetByNameFunc(ctx, name)
}

func (m *MockScheduleRepository) List(ctx context.Context) ([]*models.Schedule, error) {
	return m.ListFunc(ctx)
}

func (m *MockScheduleRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return m.DeleteFunc(ctx, id)
}

func (m *MockScheduleRepository) Update(ctx context.Context, id uuid.UUID, updates *models.ScheduleUpdate) (*models.Schedule, error) {
	return m.UpdateFunc(ctx, id, updates)
}

func (m *MockScheduleRepository) ListArchived(ctx context.Context) ([]*models.Schedule, error) {
	return m.ListArchivedFunc(ctx)
}

func (m *MockScheduleRepository) SetActive(ctx context.Context, id uuid.UUID) (*models.Schedule, error) {
	return m.SetActiveFunc(ctx, id)
}

func (m *MockScheduleRepository) Archive(ctx context.Context, id uuid.UUID) (*models.Schedule, error) {
	return m.ArchiveFunc(ctx, id)
}

func (m *MockScheduleRepository) Unarchive(ctx context.Context, id uuid.UUID) (*models.Schedule, error) {
	return m.UnarchiveFunc(ctx, id)
}
