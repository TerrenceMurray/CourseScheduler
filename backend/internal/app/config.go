package app

import "os"

type Config struct {
	Addr         string // :8080
	DatabaseURL  string // pg connection string
	JWTSecretKey string //
}

func LoadConfig() *Config {
	address := os.Getenv("BACKEND_ADDRESS")
	databaseURL := os.Getenv("DATABASE_URL")
	jwtSecretKey := os.Getenv("JWT_SECRET_KEY")

	if address == "" {
		address = ":8080"
	}

	if databaseURL == "" {
		databaseURL = "postgres://localhost:5432/scheduler?sslmode=disable"
	}

	if jwtSecretKey == "" {

	}

	return &Config{
		Addr:         address,
		DatabaseURL:  databaseURL,
		JWTSecretKey: jwtSecretKey,
	}
}
