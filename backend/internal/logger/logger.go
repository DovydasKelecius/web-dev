package logger

import (
	"backend/internal/models"
	"fmt"
	"time"

	"gorm.io/gorm"
)

// Requirement: At least 5 different actions/errors must be logged
// 1. User Login (Action)
// 2. Asset Created (Action)
// 3. Ticket Deleted (Action)
// 4. DB Migration (Action)
// 5. Auth Failure (Error)

func Log(db *gorm.DB, level, source, message string, userID uint) {
	entry := models.LogEntry{
		Timestamp: time.Now(),
		Level:     level,
		Source:    source,
		Message:   message,
		UserID:    userID,
	}
	db.Create(&entry)
	fmt.Printf("[%s] %s: %s\n", level, source, message)
}
