package app

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	_ "github.com/lib/pq"
	"go.uber.org/zap"

	"github.com/TerrenceMurray/course-scheduler/internal/repository"
	"github.com/TerrenceMurray/course-scheduler/internal/scheduler/greedy"
	"github.com/TerrenceMurray/course-scheduler/internal/scheduler/greedy/weight"
	"github.com/TerrenceMurray/course-scheduler/internal/service"
)

type App struct {
	Config *Config
	DB     *sql.DB
	Router chi.Router
	Logger *zap.Logger

	// Services
	BuildingService      service.BuildingServiceInterface
	CourseService        service.CourseServiceInterface
	CourseSessionService service.CourseSessionServiceInterface
	RoomService          service.RoomServiceInterface
	RoomTypeService      service.RoomTypeServiceInterface
	ScheduleService      service.ScheduleServiceInterface
	SchedulerService     service.SchedulerServiceInterface
}

// New initializes the application with all dependencies
func New(cfg *Config) (*App, error) {
	// Initialize logger
	logger, err := zap.NewProduction()
	if err != nil {
		return nil, fmt.Errorf("failed to create logger: %w", err)
	}

	// Connect to database
	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Initialize repositories
	buildingRepo := repository.NewBuildingRepository(db, logger)
	courseRepo := repository.NewCourseRepository(db, logger)
	courseSessionRepo := repository.NewCourseSessionRepository(db, logger)
	roomRepo := repository.NewRoomRepository(db, logger)
	roomTypeRepo := repository.NewRoomTypeRepository(db, logger)
	scheduleRepo := repository.NewScheduleRepository(db, logger)

	// Initialize services
	buildingService := service.NewBuildingService(buildingRepo)
	courseService := service.NewCourseService(courseRepo)
	courseSessionService := service.NewCourseSessionService(courseSessionRepo)
	roomService := service.NewRoomService(roomRepo)
	roomTypeService := service.NewRoomTypeService(roomTypeRepo)
	scheduleService := service.NewScheduleService(scheduleRepo)

	// Initialize scheduler
	weightStrategy := &weight.TotalTimeWeight{}
	scheduler := greedy.NewGreedyScheduler(weightStrategy)
	schedulerService := service.NewSchedulerService(scheduler, scheduleRepo, roomRepo, courseRepo, courseSessionRepo)

	// Initialize router
	router := chi.NewRouter()
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)
	router.Use(middleware.RequestID)

	app := &App{
		Config:               cfg,
		DB:                   db,
		Router:               router,
		Logger:               logger,
		BuildingService:      buildingService,
		CourseService:        courseService,
		CourseSessionService: courseSessionService,
		RoomService:          roomService,
		RoomTypeService:      roomTypeService,
		ScheduleService:      scheduleService,
		SchedulerService:     schedulerService,
	}

	app.setupRoutes()

	return app, nil
}

// Run starts the HTTP server
func (a *App) Run() error {
	return http.ListenAndServe(a.Config.Addr, a.Router)
}

// Close cleans up resources
func (a *App) Close() error {
	if a.Logger != nil {
		a.Logger.Sync()
	}
	if a.DB != nil {
		return a.DB.Close()
	}
	return nil
}
