# Course Scheduler

Schedule university courses into rooms with conflict detection.

## About

A web application for scheduling university courses into available rooms while respecting constraints and preventing double-bookings. Built as a proof of concept for managing academic timetables.

## Features

- **Room Management** — Add rooms with type (lab, classroom, lecture hall), building, and capacity
- **Course Management** — Define courses with session types, durations, and weekly frequency
- **Automatic Scheduling** — Greedy algorithm assigns sessions to rooms based on availability
- **Conflict Detection** — Prevents double-booking rooms and validates room type requirements
- **Schedule Views** — View timetables by course, room, or building
- **Data Import** — Bulk import rooms and courses via CSV

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Go + Chi router |
| Database | PostgreSQL (Supabase) |
| ORM | Go-Jet (type-safe SQL) |
| Frontend | React + Vite |

## API Endpoints

| Resource | Endpoints |
|----------|-----------|
| Buildings | `GET/POST /api/v1/buildings`, `GET/PUT/DELETE /api/v1/buildings/{id}` |
| Courses | `GET/POST /api/v1/courses`, `GET/PUT/DELETE /api/v1/courses/{id}` |
| Sessions | `GET/POST /api/v1/sessions`, `GET/PUT/DELETE /api/v1/sessions/{id}` |
| Rooms | `GET/POST /api/v1/rooms`, `GET/PUT/DELETE /api/v1/rooms/{id}` |
| Room Types | `GET/POST /api/v1/room-types`, `GET/PUT/DELETE /api/v1/room-types/{name}` |
| Schedules | `GET/POST /api/v1/schedules`, `GET/PUT/DELETE /api/v1/schedules/{id}` |
| Scheduler | `POST /api/v1/scheduler/generate`, `POST /api/v1/scheduler/generate-and-save` |

## Getting Started

### Prerequisites

- Go 1.22+
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

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://localhost:5432/scheduler?sslmode=disable` |
| `BACKEND_ADDRESS` | Server listen address | `:8080` |

For Supabase, use the **pooler** connection string from Settings > Database.

## Project Structure

```
course-scheduler/
├── .github/workflows/    # CI/CD
│   └── test.yml          # Test workflow
├── backend/
│   ├── cmd/server/       # Entry point
│   └── internal/
│       ├── app/          # Application bootstrap
│       ├── handlers/     # HTTP handlers
│       ├── models/       # Domain models
│       ├── repository/   # Data access layer
│       ├── service/      # Business logic
│       ├── scheduler/    # Scheduling algorithm
│       │   └── greedy/   # Greedy scheduler implementation
│       └── tests/        # Unit & integration tests
├── frontend/
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── views/        # Page views
│       └── api/          # API client
└── README.md
```

## Architecture

```
HTTP Request
     │
     ▼
┌─────────────┐
│  Handlers   │  Parse request, validate input, return JSON
└─────────────┘
     │
     ▼
┌─────────────┐
│  Services   │  Business logic, orchestration
└─────────────┘
     │
     ▼
┌─────────────┐
│ Repositories│  Database operations (Go-Jet)
└─────────────┘
     │
     ▼
┌─────────────┐
│ PostgreSQL  │
└─────────────┘
```

## Scheduling Algorithm

The scheduler uses a **greedy algorithm** to assign course sessions to rooms:

1. **Weight courses** by total session time (longer courses scheduled first)
2. **Sort days** by available capacity for the required room type
3. **Find first available slot** that fits the session duration
4. **Spread sessions** across different days for the same course
5. **Track failures** for sessions that couldn't be scheduled

Configuration options:
- `OperatingHours` — Start/end time (default: 8AM-9PM)
- `OperatingDays` — Which days to schedule (default: Mon-Fri)
- `MinBreakBetweenSessions` — Gap between sessions (for travel time)
- `PreferredSlotDuration` — Align to hourly slots

## Status

🚧 Work in progress

## License

MIT
