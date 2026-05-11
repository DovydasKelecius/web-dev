package database

import (
	"backend/internal/config"
	"backend/internal/models"
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitDB(cfg *config.Config) *gorm.DB {
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto Migration
	err = db.AutoMigrate(&models.User{}, &models.Asset{}, &models.Ticket{}, &models.LogEntry{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	if cfg.SeedData {
		Seed(db)
	}

	return db
}

func Seed(db *gorm.DB) {
	var count int64
	db.Model(&models.User{}).Count(&count)
	if count > 0 {
		return // Already seeded
	}

	fmt.Println("Seeding database...")

	// 1. Create Users
	adminPass, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	userPass, _ := bcrypt.GenerateFromPassword([]byte("user123"), bcrypt.DefaultCost)

	admin := models.User{Username: "admin", PasswordHash: string(adminPass), Role: "admin"}
	standardUser := models.User{Username: "user", PasswordHash: string(userPass), Role: "user"}
	db.Create(&admin)
	db.Create(&standardUser)

	// 2. Create 100 Assets (Requirement)
	assets := make([]models.Asset, 100)
	for i := 0; i < 100; i++ {
		assets[i] = models.Asset{
			Hostname:    fmt.Sprintf("srv-%03d.mif.vu.lt", i),
			IPAddress:   fmt.Sprintf("192.168.1.%d", i+1),
			AssetType:   "Server",
			Criticality: "High",
			Owner:       "IT Dept",
			Location:    "Data Center A",
		}
	}
	db.Create(&assets)

	// 3. Create 10,000 Tickets (Requirement)
	// Using chunks for performance
	for i := 0; i < 10; i++ {
		tickets := make([]models.Ticket, 1000)
		for j := 0; j < 1000; j++ {
			idx := i*1000 + j
			tickets[j] = models.Ticket{
				Title:       fmt.Sprintf("Security Alert #%d", idx),
				Description: "Automated scan detected vulnerability on host.",
				Severity:    "Medium",
				Status:      "Open",
				AssetID:     uint((idx % 100) + 1),
				ReporterID:  standardUser.ID,
			}
		}
		db.Create(&tickets)
	}

	fmt.Println("Seeding complete.")
}
