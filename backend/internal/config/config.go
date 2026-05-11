package config

import (
	"os"
)

type Config struct {
	BaseURL     string // Requirement: must use it
	DatabaseURL string
	Port        string
	Environment string
	LogLevel    string
	SeedData    bool
}

func LoadConfig() *Config {
	return &Config{
		BaseURL:     getEnv("BASE_URL", "http://localhost"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://user:password@127.0.0.1:5432/dbname?sslmode=disable"),
		Port:        getEnv("PORT", "8080"),
		Environment: getEnv("ENV", "development"),
		LogLevel:    getEnv("LOG_LEVEL", "debug"),
		SeedData:    getEnv("SEED_DATA", "true") == "true",
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
