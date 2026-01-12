package middleware

import (
	"net/http"
)

// MaxBodySize limits the size of request bodies.
// This helps prevent denial-of-service attacks via large payloads.
func MaxBodySize(maxBytes int64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Skip body size check for methods that typically don't have bodies
			if r.Method == http.MethodGet || r.Method == http.MethodHead || r.Method == http.MethodOptions {
				next.ServeHTTP(w, r)
				return
			}

			// Limit request body size
			r.Body = http.MaxBytesReader(w, r.Body, maxBytes)

			next.ServeHTTP(w, r)
		})
	}
}

// Default body size limits
const (
	// DefaultMaxBodySize is 1MB - suitable for most JSON API requests
	DefaultMaxBodySize = 1 << 20 // 1 MB

	// SmallMaxBodySize is 64KB - for simple form submissions
	SmallMaxBodySize = 64 << 10 // 64 KB

	// LargeMaxBodySize is 10MB - for file uploads if needed
	LargeMaxBodySize = 10 << 20 // 10 MB
)
