package database

import (
	"backend/internal/config"
	"backend/internal/models"
	"fmt"
	"log"

	"math/rand"
	"time"

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
	err = db.AutoMigrate(&models.User{}, &models.Asset{}, &models.Ticket{}, &models.LogEntry{}, &models.Comment{}, &models.History{})
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
	rand.Seed(time.Now().UnixNano())

	// 1. Create Users
	pass, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)

	users := []models.User{
		{Username: "admin", PasswordHash: string(pass), Role: "admin"},
		{Username: "user1", PasswordHash: string(pass), Role: "user"},
		{Username: "user2", PasswordHash: string(pass), Role: "user"},
		{Username: "mgr1", PasswordHash: string(pass), Role: "admin"},
		{Username: "mgr2", PasswordHash: string(pass), Role: "admin"},
		{Username: "agent1", PasswordHash: string(pass), Role: "user"},
		{Username: "agent2", PasswordHash: string(pass), Role: "user"},
		{Username: "agent3", PasswordHash: string(pass), Role: "user"},
	}
	db.Create(&users)
	standardUser := users[1]

	// 2. Create 100 Assets
	assetTypes := []string{"Server", "Workstation", "Network Device", "Database", "Firewall"}
	criticalities := []string{"Low", "Medium", "High", "Critical"}
	locations := []string{"Data Center A", "HQ Office", "Branch 01", "Cloud-AWS", "Cloud-Azure"}

	assets := make([]models.Asset, 100)
	for i := 0; i < 100; i++ {
		assets[i] = models.Asset{
			Hostname:    fmt.Sprintf("node-%03d.cyberguard.internal", i),
			IPAddress:   fmt.Sprintf("10.50.%d.%d", rand.Intn(254), rand.Intn(254)),
			AssetType:   assetTypes[rand.Intn(len(assetTypes))],
			Criticality: criticalities[rand.Intn(len(criticalities))],
			Owner:       "Security Operations",
			Location:    locations[rand.Intn(len(locations))],
		}
	}
	db.Create(&assets)

	// 3. Create 10,000 Tickets
	titles := []string{
		"Unauthorized Access Attempt",
		"Malware Signature Detected",
		"Brute Force Attack on SSH",
		"Anomalous Outbound Traffic",
		"DDoS Mitigation Active",
		"Phishing Link Clicked",
		"Expired SSL Certificate",
		"Weak Cipher Suite Usage",
		"New Admin Account Created",
		"Database Injection Attempt",
	}
	descriptions := []string{
		"Multiple failed logins detected from external IP.",
		"Endpoint protection triggered on host.",
		"Traffic spike detected on port 443.",
		"Security baseline drift identified.",
		"Integrity check failed for system binary.",
	}
	severities := []string{"Low", "Medium", "High", "Critical"}
	statuses := []string{"Open", "In Progress", "Resolved"}

	for i := 0; i < 10; i++ {
		tickets := make([]models.Ticket, 1000)
		for j := 0; j < 1000; j++ {
			idx := i*1000 + j
			tickets[j] = models.Ticket{
				Title:       fmt.Sprintf("%s [#%d]", titles[rand.Intn(len(titles))], idx),
				Description: descriptions[rand.Intn(len(descriptions))],
				Severity:    severities[rand.Intn(len(severities))],
				Status:      statuses[rand.Intn(len(statuses))],
				AssetID:     uint(rand.Intn(100) + 1),
				ReporterID:  standardUser.ID,
			}
		}
		db.Create(&tickets)
	}

	fmt.Println("Seeding complete.")
}
