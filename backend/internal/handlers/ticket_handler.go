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
	status := r.URL.Query().Get("status")
	severity := r.URL.Query().Get("severity")
	searchID := r.URL.Query().Get("id")

	if page < 1 {
		page = 1
	}
	pageSize := 25

	tickets := []models.Ticket{}
	var total int64
	query := h.DB.Model(&models.Ticket{})

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if severity != "" {
		query = query.Where("severity = ?", severity)
	}
	if searchID != "" {
		query = query.Where("id = ?", searchID)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize

	query.Limit(pageSize).Offset(offset).Preload("Asset").Preload("Comments").Preload("Comments.User").Preload("History").Preload("History.User").Find(&tickets)

	lastPage := int(total / int64(pageSize))
	if total%int64(pageSize) != 0 || total == 0 {
		lastPage++
	}

	response := map[string]interface{}{
		"data":  tickets,
		"total": total,
		"page":  page,
		"last":  lastPage,
	}
	w.Header().Set("Content-Type", "application/json")
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

	var input map[string]interface{}
	json.NewDecoder(r.Body).Decode(&input)

	// Partial update using map to avoid zero-value issues with structs
	if err := h.DB.Model(&ticket).Updates(input).Error; err != nil {
		http.Error(w, "Update failed", http.StatusInternalServerError)
		return
	}

	// Record History if status changed
	if status, ok := input["status"].(string); ok {
		h.DB.Create(&models.History{
			TicketID: ticket.ID,
			Action:   fmt.Sprintf("Status changed to %s", status),
			UserID:   1,
		})
		// Requirement: When in progress, show as comment
		if status == "In Progress" {
			h.DB.Create(&models.Comment{
				TicketID: ticket.ID,
				UserID:   1, // System
				Content:  "System: Investigation started. Ticket moved to In Progress.",
			})
		}
	}

	// Record History if assigned
	if solverID, ok := input["solver_id"].(float64); ok {
		h.DB.Create(&models.History{
			TicketID: ticket.ID,
			Action:   fmt.Sprintf("Assigned to Agent %v", solverID),
			UserID:   1, // Should get from context
		})
	}

	logger.Log(h.DB, "INFO", "TicketHandler.Update", fmt.Sprintf("Ticket updated: ID %s", id), 0)
	h.DB.Preload("Asset").First(&ticket, id)
	json.NewEncoder(w).Encode(ticket)
}

func (h *TicketHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	h.DB.Delete(&models.Ticket{}, id)
	logger.Log(h.DB, "WARN", "TicketHandler.Delete", fmt.Sprintf("Ticket deleted: ID %s", id), 0)
	w.WriteHeader(http.StatusNoContent)
}
