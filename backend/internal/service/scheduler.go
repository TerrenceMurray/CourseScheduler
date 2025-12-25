package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"

	"github.com/TerrenceMurray/course-scheduler/internal/models"
	"github.com/TerrenceMurray/course-scheduler/internal/repository"
	"github.com/TerrenceMurray/course-scheduler/internal/scheduler"
)

var _ SchedulerServiceInterface = (*SchedulerService)(nil)

type SchedulerServiceInterface interface {
	GenerateAndSave(ctx context.Context, name string, config *scheduler.Config) (*models.Schedule, *scheduler.Output, error)
	Generate(ctx context.Context, config *scheduler.Config) (*scheduler.Output, error)
}

type SchedulerService struct {
	scheduler   scheduler.Scheduler
	scheduleRepo repository.ScheduleRepositoryInterface
	roomRepo     repository.RoomRepositoryInterface
	courseRepo   repository.CourseRepositoryInterface
	sessionRepo  repository.CourseSessionRepositoryInterface
}

func NewSchedulerService(
	sched scheduler.Scheduler,
	scheduleRepo repository.ScheduleRepositoryInterface,
	roomRepo repository.RoomRepositoryInterface,
	courseRepo repository.CourseRepositoryInterface,
	sessionRepo repository.CourseSessionRepositoryInterface,
) *SchedulerService {
	return &SchedulerService{
		scheduler:    sched,
		scheduleRepo: scheduleRepo,
		roomRepo:     roomRepo,
		courseRepo:   courseRepo,
		sessionRepo:  sessionRepo,
	}
}

// Generate creates a schedule without persisting it
func (s *SchedulerService) Generate(ctx context.Context, config *scheduler.Config) (*scheduler.Output, error) {
	input, err := s.buildInput(ctx, config)
	if err != nil {
		return nil, err
	}

	return s.scheduler.Generate(input)
}

// GenerateAndSave creates a schedule and persists it to the database
func (s *SchedulerService) GenerateAndSave(ctx context.Context, name string, config *scheduler.Config) (*models.Schedule, *scheduler.Output, error) {
	output, err := s.Generate(ctx, config)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to generate schedule: %w", err)
	}

	// Convert scheduled sessions to model format
	sessions := make([]models.ScheduledSession, len(output.ScheduledSessions))
	for i, ss := range output.ScheduledSessions {
		sessions[i] = models.ScheduledSession{
			CourseID:  ss.CourseID,
			RoomID:    ss.RoomID,
			Day:       ss.Day,
			StartTime: ss.StartTime,
			EndTime:   ss.EndTime,
		}
	}

	schedule := models.NewSchedule(uuid.New(), name, sessions, nil)

	saved, err := s.scheduleRepo.Create(ctx, schedule)
	if err != nil {
		return nil, output, fmt.Errorf("failed to save schedule: %w", err)
	}

	return saved, output, nil
}

// buildInput fetches all required data and builds scheduler input
func (s *SchedulerService) buildInput(ctx context.Context, config *scheduler.Config) (*scheduler.Input, error) {
	rooms, err := s.roomRepo.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch rooms: %w", err)
	}

	coursesVal, err := s.courseRepo.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch courses: %w", err)
	}

	// Convert []models.Course to []*models.Course
	courses := make([]*models.Course, len(coursesVal))
	for i := range coursesVal {
		courses[i] = &coursesVal[i]
	}

	sessions, err := s.sessionRepo.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch sessions: %w", err)
	}

	return &scheduler.Input{
		Config:         config,
		Rooms:          rooms,
		Courses:        courses,
		CourseSessions: sessions,
	}, nil
}
