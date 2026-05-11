package main

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/handlers"
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
		var tCount, aCount int64
		db.Model(&models.Ticket{}).Count(&tCount)
		db.Model(&models.Asset{}).Count(&aCount)
		json.NewEncoder(w).Encode(map[string]int64{
			"tickets": tCount,
			"assets":  aCount,
		})
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
