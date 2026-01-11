package utils

import (
	"context"
	"database/sql"
	"fmt"
	"path/filepath"
	"runtime"
	"testing"
	"time"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/google/uuid"
	_ "github.com/lib/pq"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
	"go.uber.org/zap"
)

type TestDB struct {
	DB        *sql.DB
	Logger    *zap.Logger
	ctx       context.Context
	container *postgres.PostgresContainer
}

func NewTestDB(t *testing.T) *TestDB {
	ctx := context.Background()

	// Get absolute path to migrations directory
	_, currentFile, _, _ := runtime.Caller(0)
	migrationsDir := filepath.Join(filepath.Dir(currentFile), "..", "..", "..", "migrations")

	pgContainer, err := postgres.Run(ctx,
		"postgres:16-alpine",
		postgres.WithDatabase("testdb"),
		postgres.WithUsername("test"),
		postgres.WithPassword("test"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(30*time.Second),
		),
	)

	if err != nil {
		t.Fatalf("failed to start postgres container: %v", err)
	}

	connStr, err := pgContainer.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		t.Fatalf("failed to get connection string: %v", err)
	}

	// Create Supabase-like structures required by migrations
	// (auth schema, users table, authenticated role)
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		t.Fatalf("failed to connect to test database: %v", err)
	}

	setupSQL := `
		-- Create auth schema and users table (mimics Supabase)
		CREATE SCHEMA IF NOT EXISTS auth;
		CREATE TABLE IF NOT EXISTS auth.users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			email VARCHAR(255)
		);

		-- Create authenticated role (mimics Supabase)
		DO $$
		BEGIN
			IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
				CREATE ROLE authenticated NOLOGIN;
			END IF;
		END
		$$;
	`
	if _, err := db.Exec(setupSQL); err != nil {
		t.Fatalf("failed to setup test auth schema: %v", err)
	}
	db.Close()

	// Run migrations
	m, err := migrate.New(
		"file://"+migrationsDir,
		connStr,
	)
	if err != nil {
		t.Fatalf("failed to create migrate instance: %v", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		t.Fatalf("failed to run migrations: %v", err)
	}

	db, err = sql.Open("postgres", connStr)
	if err != nil {
		t.Fatalf("failed to connect to test database: %v", err)
	}

	return &TestDB{
		DB:        db,
		Logger:    zap.NewNop(),
		ctx:       ctx,
		container: pgContainer,
	}
}

func (t *TestDB) Close() {
	if t.DB != nil {
		t.DB.Close()
	}

	if t.container != nil {
		t.container.Terminate(t.ctx)
	}
}

func (t *TestDB) Truncate(tables ...string) {
	for _, table := range tables {
		t.DB.ExecContext(t.ctx, fmt.Sprintf("TRUNCATE TABLE %s CASCADE", table))
	}
}

// CreateTestUser creates a test user in auth.users and returns the user ID.
// This is needed for tests that require a valid created_by foreign key.
func (t *TestDB) CreateTestUser() (uuid.UUID, error) {
	var id uuid.UUID
	err := t.DB.QueryRowContext(t.ctx, `
		INSERT INTO auth.users (id, email)
		VALUES (gen_random_uuid(), 'test@example.com')
		RETURNING id
	`).Scan(&id)
	return id, err
}

// SetUserContext sets the app.current_user_id GUC variable for the current session.
// This is required for triggers that use current_setting('app.current_user_id').
func (t *TestDB) SetUserContext(userID uuid.UUID) error {
	_, err := t.DB.ExecContext(t.ctx, "SELECT set_config('app.current_user_id', $1, false)", userID.String())
	return err
}

// SetupTestUserContext creates a test user and sets it as the current user context.
// Returns the user ID for use in tests.
func (t *TestDB) SetupTestUserContext() (uuid.UUID, error) {
	userID, err := t.CreateTestUser()
	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to create test user: %w", err)
	}
	if err := t.SetUserContext(userID); err != nil {
		return uuid.Nil, fmt.Errorf("failed to set user context: %w", err)
	}
	return userID, nil
}
