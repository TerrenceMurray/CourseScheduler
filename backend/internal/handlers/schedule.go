package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/TerrenceMurray/course-scheduler/internal/models"
	"github.com/TerrenceMurray/course-scheduler/internal/repository"
	"github.com/TerrenceMurray/course-scheduler/internal/service"
)

type ScheduleHandler struct {
	service service.ScheduleServiceInterface
}

func NewScheduleHandler(s service.ScheduleServiceInterface) *ScheduleHandler {
	return &ScheduleHandler{service: s}
}

func (h *ScheduleHandler) List(w http.ResponseWriter, r *http.Request) {
	schedules, err := h.service.List(r.Context())
	if err != nil {
		Error(w, http.StatusInternalServerError, "failed to list schedules")
		return
	}
	JSON(w, http.StatusOK, schedules)
}

func (h *ScheduleHandler) Create(w http.ResponseWriter, r *http.Request) {
	var schedule models.Schedule
	if err := json.NewDecoder(r.Body).Decode(&schedule); err != nil {
		Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	schedule.ID = uuid.New()

	created, err := h.service.Create(r.Context(), &schedule)
	if err != nil {
		Error(w, http.StatusInternalServerError, "failed to create schedule")
		return
	}
	JSON(w, http.StatusCreated, created)
}

func (h *ScheduleHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		Error(w, http.StatusBadRequest, "invalid id")
		return
	}

	schedule, err := h.service.GetByID(r.Context(), id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			Error(w, http.StatusNotFound, "schedule not found")
			return
		}
		Error(w, http.StatusInternalServerError, "failed to get schedule")
		return
	}
	JSON(w, http.StatusOK, schedule)
}

func (h *ScheduleHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		Error(w, http.StatusBadRequest, "invalid id")
		return
	}

	var updates models.ScheduleUpdate
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	updated, err := h.service.Update(r.Context(), id, &updates)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			Error(w, http.StatusNotFound, "schedule not found")
			return
		}
		Error(w, http.StatusInternalServerError, "failed to update schedule")
		return
	}
	JSON(w, http.StatusOK, updated)
}

func (h *ScheduleHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		Error(w, http.StatusBadRequest, "invalid id")
		return
	}

	if err := h.service.Delete(r.Context(), id); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			Error(w, http.StatusNotFound, "schedule not found")
			return
		}
		Error(w, http.StatusInternalServerError, "failed to delete schedule")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *ScheduleHandler) ListArchived(w http.ResponseWriter, r *http.Request) {
	schedules, err := h.service.ListArchived(r.Context())
	if err != nil {
		Error(w, http.StatusInternalServerError, "failed to list archived schedules")
		return
	}
	JSON(w, http.StatusOK, schedules)
}

func (h *ScheduleHandler) SetActive(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		Error(w, http.StatusBadRequest, "invalid id")
		return
	}

	schedule, err := h.service.SetActive(r.Context(), id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			Error(w, http.StatusNotFound, "schedule not found")
			return
		}
		Error(w, http.StatusInternalServerError, "failed to set active schedule")
		return
	}
	JSON(w, http.StatusOK, schedule)
}

func (h *ScheduleHandler) Archive(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		Error(w, http.StatusBadRequest, "invalid id")
		return
	}

	schedule, err := h.service.Archive(r.Context(), id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			Error(w, http.StatusNotFound, "schedule not found")
			return
		}
		Error(w, http.StatusInternalServerError, "failed to archive schedule")
		return
	}
	JSON(w, http.StatusOK, schedule)
}

func (h *ScheduleHandler) Unarchive(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		Error(w, http.StatusBadRequest, "invalid id")
		return
	}

	schedule, err := h.service.Unarchive(r.Context(), id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			Error(w, http.StatusNotFound, "schedule not found")
			return
		}
		Error(w, http.StatusInternalServerError, "failed to unarchive schedule")
		return
	}
	JSON(w, http.StatusOK, schedule)
}
