package app

import "os"

type Config struct {
	Addr         string // :8080
	DatabaseURL  string // pg connection string
	JWTSecretKey string
	CORSOrigin   string // Allowed CORS origin
}

func LoadConfig() *Config {
	address := os.Getenv("BACKEND_ADDRESS")
	databaseURL := os.Getenv("DATABASE_URL")
	jwtSecretKey := os.Getenv("JWT_SECRET_KEY")
	corsOrigin := os.Getenv("CORS_ORIGIN")

	if address == "" {
		address = ":8080"
	}

	if databaseURL == "" {
		databaseURL = "postgres://localhost:5432/scheduler?sslmode=disable"
	}

	if corsOrigin == "" {
		corsOrigin = "http://localhost:5173"
	}

	return &Config{
		Addr:         address,
		DatabaseURL:  databaseURL,
		JWTSecretKey: jwtSecretKey,
		CORSOrigin:   corsOrigin,
	}
}
