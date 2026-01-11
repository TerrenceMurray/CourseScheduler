package database

import (
	"context"
	"database/sql"

	"github.com/go-jet/jet/v2/qrm"

	"github.com/TerrenceMurray/course-scheduler/internal/middleware"
)

type Executor interface {
	ExecContext(ctx context.Context, query string, args ...any) (sql.Result, error)
	QueryContext(ctx context.Context, query string, args ...any) (*sql.Rows, error)
	QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
}

// GetExecutor returns the transaction from context if present, otherwise returns the fallback DB.
// This allows repositories to automatically use the request's transaction when available.
func GetExecutor(ctx context.Context, fallback *sql.DB) qrm.DB {
	if tx := middleware.GetTx(ctx); tx != nil {
		return tx
	}
	return fallback
}
