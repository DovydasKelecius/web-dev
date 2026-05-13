package handlers

import (
	"backend/internal/models"
	"encoding/json"
	"net/http"

	"gorm.io/gorm"
)

type LogHandler struct {
	DB *gorm.DB
}

func (h *LogHandler) List(w http.ResponseWriter, r *http.Request) {
	logs := []models.LogEntry{}
	h.DB.Order("timestamp desc").Limit(100).Find(&logs)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(logs)
}
