package middleware

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const UserIDKey contextKey = "user_id"
const UserEmailKey contextKey = "user_email"

func AuthMiddleware(jwtSecret string) func(http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				log.Println("Auth: No Authorization header")
				http.Error(w, "unauthorized: missing authorization header", http.StatusUnauthorized)
				return
			}

			tokenString := strings.TrimPrefix(authHeader, "Bearer ")

			// Parse token with validation options for Supabase JWTs
			token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
				// Validate signing method
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
				}
				return []byte(jwtSecret), nil
			})

			if err != nil {
				log.Printf("Auth: Token parse error: %v", err)
				http.Error(w, "unauthorized: invalid token", http.StatusUnauthorized)
				return
			}

			if !token.Valid {
				log.Println("Auth: Token is not valid")
				http.Error(w, "unauthorized: token not valid", http.StatusUnauthorized)
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				log.Println("Auth: Could not parse claims")
				http.Error(w, "unauthorized: invalid claims", http.StatusUnauthorized)
				return
			}

			// Extract user info from Supabase JWT claims
			userID, ok := claims["sub"].(string)
			if !ok {
				log.Println("Auth: Missing 'sub' claim")
				http.Error(w, "unauthorized: missing user id", http.StatusUnauthorized)
				return
			}

			email, _ := claims["email"].(string) // Email is optional

			// Add request context
			ctx := context.WithValue(r.Context(), UserIDKey, userID)
			ctx = context.WithValue(ctx, UserEmailKey, email)

			h.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetUserID retrieves the user ID from the request context
func GetUserID(ctx context.Context) string {
	if id, ok := ctx.Value(UserIDKey).(string); ok {
		return id
	}
	return ""
}

// GetUserEmail retrieves the user email from the request context
func GetUserEmail(ctx context.Context) string {
	if email, ok := ctx.Value(UserEmailKey).(string); ok {
		return email
	}
	return ""
}
