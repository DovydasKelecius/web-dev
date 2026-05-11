package models

import (
	"time"

	"gorm.io/gorm"
)

// Requirement: Object 1 (Assets) - 100 records
type Asset struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Hostname    string         `gorm:"size:255;not null" json:"hostname"`
	IPAddress   string         `gorm:"size:45;not null" json:"ip_address"` // Supports IPv6
	AssetType   string         `gorm:"size:100;not null" json:"asset_type"` // e.g., Server, Workstation
	Criticality string         `gorm:"size:50;not null" json:"criticality"` // Low, Medium, High, Critical
	Owner       string         `gorm:"size:255;not null" json:"owner"`
	Location    string         `gorm:"size:255" json:"location"`
}

// Requirement: Object 2 (Tickets) - 10,000 records
type Ticket struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Title       string         `gorm:"size:255;not null" json:"title"`
	Description string         `gorm:"type:text;not null" json:"description"`
	Severity    string         `gorm:"size:50;not null" json:"severity"` // Low, Medium, High, Critical
	Status      string         `gorm:"size:50;not null;default:'Open'" json:"status"` // Open, In Progress, Resolved, Closed
	AssetID     uint           `json:"asset_id"`
	Asset       Asset          `gorm:"foreignKey:AssetID" json:"asset"`
	ReporterID  uint           `json:"reporter_id"`
	AssignerID  uint           `json:"assigner_id"`
	SolverID    uint           `json:"solver_id"`
	Comments    []Comment      `gorm:"foreignKey:TicketID" json:"comments"`
	History     []History      `gorm:"foreignKey:TicketID" json:"history"`
}

type Comment struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	TicketID  uint      `json:"ticket_id"`
	UserID    uint      `json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user"`
	Content   string    `gorm:"type:text;not null" json:"content"`
}

type History struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	TicketID  uint      `json:"ticket_id"`
	Action    string    `json:"action"` // e.g., "Status Changed to Resolved", "Comment Added"
	UserID    uint      `json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user"`
}

// Requirement: User Management
type User struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	CreatedAt    time.Time      `json:"created_at"`
	Username     string         `gorm:"size:100;uniqueIndex;not null" json:"username"`
	PasswordHash string         `gorm:"not null" json:"-"`
	Role         string         `gorm:"size:50;not null;default:'user'" json:"role"` // admin, user
}

// Requirement: Logging
type LogEntry struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Timestamp time.Time `gorm:"autoCreateTime" json:"timestamp"`
	Level     string    `json:"level"`   // INFO, ERROR, WARN
	Source    string    `json:"source"`  // Class/Method name
	Message   string    `json:"message"`
	UserID    uint      `json:"user_id"`
}
