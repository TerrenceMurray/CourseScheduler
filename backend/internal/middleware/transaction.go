package middleware

import (
	"context"
	"database/sql"
	"net/http"
)

const TxKey contextKey = "db_tx"

func TransactionMiddleware(db *sql.DB) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tx, err := db.BeginTx(r.Context(), nil)
			if err != nil {
				http.Error(w, "failed to begin transaction", http.StatusInternalServerError)
				return
			}

			userID := GetUserID(r.Context())
			if userID != "" {
				// Switch to authenticated role so RLS policies apply
				// Superusers bypass RLS, so we need to use a non-superuser role
				_, err = tx.ExecContext(r.Context(), "SET LOCAL ROLE authenticated")
				if err != nil {
					tx.Rollback()
					http.Error(w, "failed to set role", http.StatusInternalServerError)
					return
				}

				// Use set_config() instead of SET LOCAL for custom GUC variables
				// Third parameter (is_local) = true means it only applies to current transaction
				_, err = tx.ExecContext(r.Context(), "SELECT set_config('app.current_user_id', $1, true)", userID)
				if err != nil {
					tx.Rollback()
					http.Error(w, "failed to set user context", http.StatusInternalServerError)
					return
				}
			}

			ctx := context.WithValue(r.Context(), TxKey, tx)
			
			// Wrap response writer to capture status code
			rw := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}
			
			next.ServeHTTP(rw, r.WithContext(ctx))

			// Commit on success (2xx), rollback otherwise
			if rw.statusCode >= 200 && rw.statusCode < 300 {
				tx.Commit()
			} else {
				tx.Rollback()
			}
		})
	}
}

type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

// GetTx retrieves the transaction from context, returns nil if not present
func GetTx(ctx context.Context) *sql.Tx {
	if tx, ok := ctx.Value(TxKey).(*sql.Tx); ok {
		return tx
	}
	return nil
}
