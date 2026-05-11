package handlers

import (
	"backend/internal/logger"
	"backend/internal/models"
	"backend/internal/validator"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"gorm.io/gorm"
)

type TicketHandler struct {
	DB *gorm.DB
}

// Requirement: Pagination (>25 items)
func (h *TicketHandler) List(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}
	pageSize := 25

	var tickets []models.Ticket
	var total int64
	h.DB.Model(&models.Ticket{}).Count(&total)

	offset := (page - 1) * pageSize

	h.DB.Limit(pageSize).Offset(offset).Preload("Asset").Find(&tickets)

	response := map[string]interface{}{
		"data":  tickets,
		"total": total,
		"page":  page,
		"last":  (total / int64(pageSize)) + 1,
	}
	json.NewEncoder(w).Encode(response)
}

func (h *TicketHandler) Create(w http.ResponseWriter, r *http.Request) {
	var ticket models.Ticket
	json.NewDecoder(r.Body).Decode(&ticket)

	if errs := validator.ValidateTicket(ticket.Title, ticket.Severity, ticket.Status); errs != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		json.NewEncoder(w).Encode(errs)
		return
	}

	h.DB.Create(&ticket)
	logger.Log(h.DB, "INFO", "TicketHandler.Create", fmt.Sprintf("Ticket created: %s", ticket.Title), 0)
	json.NewEncoder(w).Encode(ticket)
}

func (h *TicketHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	var ticket models.Ticket
	if err := h.DB.First(&ticket, id).Error; err != nil {
		http.Error(w, "Ticket not found", http.StatusNotFound)
		return
	}

	var input models.Ticket
	json.NewDecoder(r.Body).Decode(&input)

	if errs := validator.ValidateTicket(input.Title, input.Severity, input.Status); errs != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		json.NewEncoder(w).Encode(errs)
		return
	}

	h.DB.Model(&ticket).Updates(input)
	logger.Log(h.DB, "INFO", "TicketHandler.Update", fmt.Sprintf("Ticket updated: ID %s", id), 0)
	json.NewEncoder(w).Encode(ticket)
}

func (h *TicketHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	h.DB.Delete(&models.Ticket{}, id)
	logger.Log(h.DB, "WARN", "TicketHandler.Delete", fmt.Sprintf("Ticket deleted: ID %s", id), 0)
	w.WriteHeader(http.StatusNoContent)
}
