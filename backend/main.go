package main

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/handlers"
	"backend/internal/logger"
	"backend/internal/models"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Initialize database
	db := database.InitDB(cfg)

	// Auth Handlers
	authH := &handlers.AuthHandler{DB: db}
	assetH := &handlers.AssetHandler{DB: db}
	ticketH := &handlers.TicketHandler{DB: db}
	logH := &handlers.LogHandler{DB: db}

	// Routes
	http.HandleFunc("/api/login", authH.Login)
	http.HandleFunc("/api/stats", func(w http.ResponseWriter, r *http.Request) {
		var tCount, aCount, openC, progC, resC int64
		db.Model(&models.Ticket{}).Count(&tCount)
		db.Model(&models.Asset{}).Count(&aCount)
		db.Model(&models.Ticket{}).Where("status = ?", "Open").Count(&openC)
		db.Model(&models.Ticket{}).Where("status = ?", "In Progress").Count(&progC)
		db.Model(&models.Ticket{}).Where("status = ?", "Resolved").Count(&resC)
		
		json.NewEncoder(w).Encode(map[string]int64{
			"tickets":     tCount,
			"assets":      aCount,
			"open":        openC,
			"in_progress": progC,
			"resolved":    resC,
		})
	})

	// Comment Route
	http.HandleFunc("/api/comments/create", func(w http.ResponseWriter, r *http.Request) {
		var comment models.Comment
		json.NewDecoder(r.Body).Decode(&comment)
		db.Create(&comment)
		
		// Log History
		db.Create(&models.History{
			TicketID: comment.TicketID,
			Action:   "Comment Added",
			UserID:   comment.UserID,
		})

		// Requirement: Detailed Log for audit
		var user models.User
		db.First(&user, comment.UserID)
		logger.Log(db, "INFO", "CommentHandler", fmt.Sprintf("User %s added comment to Ticket #%d", user.Username, comment.TicketID), comment.UserID)

		db.Preload("User").First(&comment, comment.ID)
		json.NewEncoder(w).Encode(comment)
	})

	// Admin Routes (Should be middleware protected in full impl, but adding here)
	http.HandleFunc("/api/logs", logH.List)

	// Asset Routes
	http.HandleFunc("/api/assets", assetH.List)           // GET
	http.HandleFunc("/api/assets/create", assetH.Create) // POST
	http.HandleFunc("/api/assets/update", assetH.Update) // PUT?id=x
	http.HandleFunc("/api/assets/delete", assetH.Delete) // DELETE?id=x

	// Ticket Routes
	http.HandleFunc("/api/tickets", ticketH.List)           // GET?page=x
	http.HandleFunc("/api/tickets/create", ticketH.Create) // POST
	http.HandleFunc("/api/tickets/update", ticketH.Update) // PUT?id=x
	http.HandleFunc("/api/tickets/delete", ticketH.Delete) // DELETE?id=x

	http.HandleFunc("/api/hello", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "CyberGuard Backend is running! BaseURL: %s", cfg.BaseURL)
	})

	fmt.Printf("Server starting on port %s...\n", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, nil))
}
