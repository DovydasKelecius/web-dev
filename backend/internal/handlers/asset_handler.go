package handlers

import (
	"backend/internal/logger"
	"backend/internal/models"
	"backend/internal/validator"
	"encoding/json"
	"fmt"
	"net/http"

	"gorm.io/gorm"
)

type AssetHandler struct {
	DB *gorm.DB
}

func (h *AssetHandler) List(w http.ResponseWriter, r *http.Request) {
	hostname := r.URL.Query().Get("hostname")
	assets := []models.Asset{}
	query := h.DB.Model(&models.Asset{})

	if hostname != "" {
		query = query.Where("hostname ILIKE ?", "%"+hostname+"%")
	}

	query.Find(&assets)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(assets)
}

func (h *AssetHandler) Create(w http.ResponseWriter, r *http.Request) {
	var asset models.Asset
	if err := json.NewDecoder(r.Body).Decode(&asset); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if errs := validator.ValidateAsset(asset.Hostname, asset.IPAddress, asset.AssetType, asset.Criticality); errs != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		json.NewEncoder(w).Encode(errs)
		return
	}

	if err := h.DB.Create(&asset).Error; err != nil {
		http.Error(w, "DB Error", http.StatusInternalServerError)
		return
	}

	logger.Log(h.DB, "INFO", "AssetHandler.Create", fmt.Sprintf("Asset registered: %s", asset.Hostname), 0)
	json.NewEncoder(w).Encode(asset)
}

func (h *AssetHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	var asset models.Asset
	if err := h.DB.First(&asset, id).Error; err != nil {
		http.Error(w, "Asset not found", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(asset)
}

func (h *AssetHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	var asset models.Asset
	if err := h.DB.First(&asset, id).Error; err != nil {
		http.Error(w, "Asset not found", http.StatusNotFound)
		return
	}

	var input models.Asset
	json.NewDecoder(r.Body).Decode(&input)

	if errs := validator.ValidateAsset(input.Hostname, input.IPAddress, input.AssetType, input.Criticality); errs != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		json.NewEncoder(w).Encode(errs)
		return
	}

	h.DB.Model(&asset).Updates(input)
	json.NewEncoder(w).Encode(asset)
}

func (h *AssetHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	h.DB.Delete(&models.Asset{}, id)
	logger.Log(h.DB, "WARN", "AssetHandler.Delete", fmt.Sprintf("Asset deleted: ID %s", id), 0)
	w.WriteHeader(http.StatusNoContent)
}
