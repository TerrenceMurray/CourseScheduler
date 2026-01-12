# Course Scheduler

A full-stack web application for scheduling university courses into rooms with conflict detection.

## About

Course Scheduler helps academic institutions manage their timetables by automatically assigning course sessions to available rooms while respecting constraints and preventing double-bookings. Built as a portfolio project demonstrating modern web development practices.

**[Live Demo](https://scheduler.terrencemurray.work)** · **[Source Code](https://github.com/TerrenceMurray/CourseScheduler)**

## Features

- **Room Management** — Add rooms with type (lab, classroom, lecture hall), building, and capacity
- **Course Management** — Define courses with session types, durations, and weekly frequency
- **Automatic Scheduling** — Greedy algorithm assigns sessions to rooms based on availability
- **Conflict Detection** — Prevents double-booking rooms and validates room type requirements
- **Schedule Views** — View timetables by course, room, or building
- **Data Import** — Bulk import rooms and courses via CSV
- **Modern UI** — Responsive dashboard with dark mode support

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TanStack Router | File-based routing with SSR |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Component library |
| TypeScript | Type safety |
| Vite | Build tool |

### Backend

| Technology | Purpose |
|------------|---------|
| Go | API server |
| Chi | HTTP router |
| PostgreSQL | Database |
| SQLc | Type-safe SQL |
| golang-migrate | Database migrations |

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
- [sqlc](https://sqlc.dev) — type-safe SQL code generator

### Install CLI Tools

```bash
# Task runner
go install github.com/go-task/task/v3/cmd/task@latest

# Database migrations
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# SQLc code generator
go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
```

### Setup

```bash
# Clone the repo
git clone https://github.com/TerrenceMurray/CourseScheduler.git
cd CourseScheduler

# Create .env with your database URL
echo 'DATABASE_URL=postgres://user:pass@host:5432/dbname?sslmode=require' > .env

# Run migrations
task migrate-up

# Generate Go models from database
task sqlc-gen

# Run the backend
task run
```

### Frontend Development

```bash
cd frontend

# Install dependencies
pnpm install

# Start dev server
pnpm dev
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
| `task sqlc-gen` | Generate Go models from SQL queries |

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
│       ├── routes/       # File-based routing (TanStack Router)
│       ├── components/   # Reusable UI components
│       └── lib/          # Utilities
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
│ Repositories│  Database operations (SQLc)
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

## Screenshots

The application features a modern, responsive UI with:
- Dashboard with scheduling overview
- Timetable views (week, room, course)
- Course and room management tables
- Schedule generation wizard
- Dark/light mode support

## License

MIT
