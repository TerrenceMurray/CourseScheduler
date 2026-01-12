package app

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/TerrenceMurray/course-scheduler/internal/handlers"
	"github.com/TerrenceMurray/course-scheduler/internal/middleware"
)

// setupRoutes registers all routes on the router
func (a *App) setupRoutes() {
	// Initialize handlers
	buildingHandler := handlers.NewBuildingHandler(a.BuildingService)
	courseHandler := handlers.NewCourseHandler(a.CourseService)
	courseSessionHandler := handlers.NewCourseSessionHandler(a.CourseSessionService)
	roomHandler := handlers.NewRoomHandler(a.RoomService)
	roomTypeHandler := handlers.NewRoomTypeHandler(a.RoomTypeService)
	scheduleHandler := handlers.NewScheduleHandler(a.ScheduleService)
	schedulerHandler := handlers.NewSchedulerHandler(a.SchedulerService)

	// Health check endpoint (no auth required)
	a.Router.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	a.Router.Route("/api/v1", func(r chi.Router) {

		// Protected Routes
		r.Group(func(r chi.Router) {
			r.Use(middleware.AuthMiddleware(a.Config.JWTSecretKey, a.Logger))
			r.Use(middleware.TransactionMiddleware(a.DB))

			// Buildings
			r.Route("/buildings", func(r chi.Router) {
				r.Get("/", buildingHandler.List)
				r.Post("/", buildingHandler.Create)
				r.Get("/{id}", buildingHandler.GetByID)
				r.Put("/{id}", buildingHandler.Update)
				r.Delete("/{id}", buildingHandler.Delete)
			})

			// Courses
			r.Route("/courses", func(r chi.Router) {
				r.Get("/", courseHandler.List)
				r.Post("/", courseHandler.Create)
				r.Get("/{id}", courseHandler.GetByID)
				r.Put("/{id}", courseHandler.Update)
				r.Delete("/{id}", courseHandler.Delete)
				r.Get("/{id}/sessions", courseSessionHandler.GetByCourseID)
			})

			// Course Sessions
			r.Route("/sessions", func(r chi.Router) {
				r.Get("/", courseSessionHandler.List)
				r.Post("/", courseSessionHandler.Create)
				r.Get("/{id}", courseSessionHandler.GetByID)
				r.Put("/{id}", courseSessionHandler.Update)
				r.Delete("/{id}", courseSessionHandler.Delete)
			})

			// Rooms
			r.Route("/rooms", func(r chi.Router) {
				r.Get("/", roomHandler.List)
				r.Post("/", roomHandler.Create)
				r.Get("/{id}", roomHandler.GetByID)
				r.Put("/{id}", roomHandler.Update)
				r.Delete("/{id}", roomHandler.Delete)
			})

			// Room Types
			r.Route("/room-types", func(r chi.Router) {
				r.Get("/", roomTypeHandler.List)
				r.Post("/", roomTypeHandler.Create)
				r.Get("/{name}", roomTypeHandler.GetByName)
				r.Put("/{name}", roomTypeHandler.Update)
				r.Delete("/{name}", roomTypeHandler.Delete)
			})

			// Schedules
			r.Route("/schedules", func(r chi.Router) {
				r.Get("/", scheduleHandler.List)
				r.Get("/archived", scheduleHandler.ListArchived)
				r.Post("/", scheduleHandler.Create)
				r.Get("/{id}", scheduleHandler.GetByID)
				r.Put("/{id}", scheduleHandler.Update)
				r.Delete("/{id}", scheduleHandler.Delete)
				r.Post("/{id}/set-active", scheduleHandler.SetActive)
				r.Post("/{id}/archive", scheduleHandler.Archive)
				r.Post("/{id}/unarchive", scheduleHandler.Unarchive)
			})

			// Scheduler
			r.Route("/scheduler", func(r chi.Router) {
				r.Post("/generate", schedulerHandler.Generate)
				r.Post("/generate-and-save", schedulerHandler.GenerateAndSave)
			})
		})
	})
}
