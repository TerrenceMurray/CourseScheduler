package middleware

import (
	"net/http"
	"sync"
	"time"
)

// RateLimiter implements a token bucket rate limiter per client IP.
type RateLimiter struct {
	visitors map[string]*visitor
	mu       sync.RWMutex
	rate     int           // tokens added per interval
	burst    int           // maximum tokens (bucket size)
	interval time.Duration // how often to add tokens
	cleanup  time.Duration // how long before removing inactive visitors
}

type visitor struct {
	tokens     int
	lastAccess time.Time
	mu         sync.Mutex
}

// NewRateLimiter creates a new rate limiter.
// rate: number of requests allowed per interval
// burst: maximum burst size (bucket capacity)
// interval: time period for the rate (e.g., time.Second for requests/second)
func NewRateLimiter(rate, burst int, interval time.Duration) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*visitor),
		rate:     rate,
		burst:    burst,
		interval: interval,
		cleanup:  5 * time.Minute,
	}

	// Start background cleanup goroutine
	go rl.cleanupLoop()

	return rl
}

// cleanupLoop removes stale visitor entries periodically.
func (rl *RateLimiter) cleanupLoop() {
	ticker := time.NewTicker(rl.cleanup)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		for ip, v := range rl.visitors {
			v.mu.Lock()
			if time.Since(v.lastAccess) > rl.cleanup {
				delete(rl.visitors, ip)
			}
			v.mu.Unlock()
		}
		rl.mu.Unlock()
	}
}

// getVisitor retrieves or creates a visitor for the given IP.
func (rl *RateLimiter) getVisitor(ip string) *visitor {
	rl.mu.RLock()
	v, exists := rl.visitors[ip]
	rl.mu.RUnlock()

	if exists {
		return v
	}

	rl.mu.Lock()
	defer rl.mu.Unlock()

	// Double-check after acquiring write lock
	if v, exists = rl.visitors[ip]; exists {
		return v
	}

	v = &visitor{
		tokens:     rl.burst,
		lastAccess: time.Now(),
	}
	rl.visitors[ip] = v
	return v
}

// Allow checks if a request from the given IP should be allowed.
func (rl *RateLimiter) Allow(ip string) bool {
	v := rl.getVisitor(ip)

	v.mu.Lock()
	defer v.mu.Unlock()

	now := time.Now()
	elapsed := now.Sub(v.lastAccess)
	v.lastAccess = now

	// Add tokens based on elapsed time
	tokensToAdd := int(elapsed / rl.interval) * rl.rate
	v.tokens += tokensToAdd
	if v.tokens > rl.burst {
		v.tokens = rl.burst
	}

	// Check if request is allowed
	if v.tokens > 0 {
		v.tokens--
		return true
	}

	return false
}

// RateLimit creates middleware that limits requests per IP.
// Example: RateLimit(100, 200, time.Second) allows 100 req/s with burst of 200.
func RateLimit(rate, burst int, interval time.Duration) func(http.Handler) http.Handler {
	limiter := NewRateLimiter(rate, burst, interval)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get client IP (consider X-Forwarded-For for proxied requests)
			ip := r.RemoteAddr
			if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
				ip = forwarded
			}

			if !limiter.Allow(ip) {
				w.Header().Set("Retry-After", "1")
				http.Error(w, "rate limit exceeded", http.StatusTooManyRequests)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
