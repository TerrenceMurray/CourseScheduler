# Course Scheduler

Schedule university courses into rooms with conflict detection.

## About

A web application for scheduling university courses into available rooms while respecting constraints and preventing double-bookings. Built as a proof of concept for managing academic timetables.

## Features

- **Room Management** — Add rooms with type (lab, classroom, lecture hall), building, and capacity
- **Course Management** — Define courses with session types, durations, and weekly frequency
- **Conflict Detection** — Prevents double-booking rooms and validates room type requirements
- **Schedule Views** — View timetables by course, room, or building
- **Data Import** — Bulk import rooms and courses via CSV

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Go |
| Database | PostgreSQL (Supabase) |
| Frontend | React + Vite |

## Getting Started

### Prerequisites

- Go 1.21+
- Node.js 18+
- PostgreSQL (or [Supabase](https://supabase.com) free tier)
- [Task](https://taskfile.dev) — task runner
- [golang-migrate](https://github.com/golang-migrate/migrate) — database migrations
- [go-jet](https://github.com/go-jet/jet) — type-safe SQL query builder

### Install CLI Tools

```bash
# Task runner
go install github.com/go-task/task/v3/cmd/task@latest

# Database migrations
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Go-jet code generator
go install github.com/go-jet/jet/v2/cmd/jet@latest
```

### Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/course-scheduler.git
cd course-scheduler

# Create .env with your database URL
echo 'DATABASE_URL=postgres://user:pass@host:5432/dbname?sslmode=require' > .env

# Run migrations
task migrate-up

# Generate Go models from database
task jet-gen

# Run the backend
task run
```

### Available Commands

Run `task --list` to see all commands:

| Command | Description |
|---------|-------------|
| `task build` | Build backend binary to `bin/server` |
| `task run` | Run backend server |
| `task install` | Install/tidy Go dependencies |
| `task test-unit` | Run unit tests |
| `task schema-new <name>` | Create new migration files |
| `task migrate-up` | Apply all pending migrations |
| `task migrate-down` | Rollback last migration |
| `task jet-gen` | Generate Go models from database schema |

### Environment Variables

Create a `.env` file in the project root:

```bash
DATABASE_URL=postgres://user:password@host:port/database?sslmode=require
```

For Supabase, use the **pooler** connection string from Settings > Database.

## Project Structure

```
course-scheduler/
├── backend/
│   ├── cmd/server/       # Entry point
│   └── internal/
│       ├── models/       # Data models
│       ├── database/     # PostgreSQL operations
│       ├── handlers/     # HTTP handlers
│       └── scheduler/    # Scheduling algorithm
├── frontend/
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── views/        # Page views
│       └── api/          # API client
└── README.md
```

## Status

🚧 Work in progress

## License

MIT
