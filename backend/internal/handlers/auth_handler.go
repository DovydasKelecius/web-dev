package handlers

import (
	"backend/internal/auth"
	"backend/internal/logger"
	"backend/internal/models"
	"encoding/json"
	"fmt"
	"net/http"

	"gorm.io/gorm"
)

type AuthHandler struct {
	DB *gorm.DB
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token  string `json:"token"`
	Role   string `json:"role"`
	UserID uint   `json:"user_id"`
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	var user models.User
	if err := h.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		logger.Log(h.DB, "WARN", "AuthHandler.Login", fmt.Sprintf("User not found: %s", req.Username), 0)
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	if !auth.CheckPassword(req.Password, user.PasswordHash) {
		logger.Log(h.DB, "WARN", "AuthHandler.Login", fmt.Sprintf("Failed login attempt for user: %s", req.Username), 0)
		http.Error(w, "Wrong password", http.StatusUnauthorized)
		return
	}

	token, err := auth.GenerateToken(&user)
	if err != nil {
		http.Error(w, "Token error", http.StatusInternalServerError)
		return
	}

	logger.Log(h.DB, "INFO", "AuthHandler.Login", fmt.Sprintf("User logged in: %s", user.Username), user.ID)

	json.NewEncoder(w).Encode(LoginResponse{
		Token:  token,
		Role:   user.Role,
		UserID: user.ID,
	})
}
