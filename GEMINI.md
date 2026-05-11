# Project Overview: CyberGuard Ticketing System
Full-stack monorepo for cybersecurity incident management.
**Language**: English
**Tech Stack**: Go (Backend), React (Frontend), PostgreSQL (Database), Nginx (Proxy), Bootstrap (CSS).

## Core Requirements (Academic)
- **Objects**: 
  - `Tickets` (10,000 records)
  - `Assets` (100 records)
- **User Management**: 
  - Roles: `Admin`, `User`
  - Encrypted passwords, Login/Logout.
- **Validation**: 
  - 8+ Backend validators (type/pattern checks).
  - Errors mapped to frontend fields.
- **Logging**: 
  - 5+ action/error types stored in DB/Files.
- **UI/UX**: 
  - Bootstrap CSS (10+ property groups).
  - Common header/footer pattern.
  - Pagination for lists (>25 items).
- **Configuration**: `base_url`, `routes`, `autoload`, `database`, `seeds`.

## Architecture
- **Frontend**: React 18 + Vite + Bootstrap 5.
- **Backend**: Go 1.21 + GORM (ORM) + net/http.
- **Infrastructure**: Docker Compose (Host Networking).
- **Ports**: Nginx: 80, Frontend: 3000, Backend: 8080, DB: 5432.

## Implementation Tracking
See [ROADMAP.md](./ROADMAP.md) for detailed task list and academic requirement compliance.

---

## Building and Running

### Prerequisites
- Docker
- Docker Compose

### Commands
- **Start the entire stack**:
  ```bash
  docker-compose up --build
  ```
- **Stop the stack**:
  ```bash
  docker-compose down
  ```
- **View logs**:
  ```bash
  docker-compose logs -f
  ```

---

## Development Conventions

### Backend
- **Location**: `/backend`
- **Dependency Management**: Uses Go modules. Run `go mod tidy` if adding new packages.
- **Dockerfile**: Multi-stage build. The first stage builds the binary using `golang:alpine`, and the second stage runs it in a minimal `alpine` image.

### Frontend
- **Location**: `/frontend`
- **Framework**: Vite-based React application with TypeScript.
- **Dockerfile**: Multi-stage build. Build stage uses `node:alpine` to generate static assets, which are then served by `nginx:alpine` in the final stage.
- **Proxying**: The frontend's internal Nginx is configured to proxy `/api` requests to `localhost:8080`.

### Nginx Proxy
- **Location**: `/nginx`
- **Responsibility**: Routes external traffic. `/` goes to the frontend (port 3000), and `/api` goes to the backend (port 8080).

### Database
- **Connection**: Managed via the `DATABASE_URL` environment variable in `docker-compose.yml`.
- **Initialization**: Postgres data is persisted in a Docker volume named `postgres_data`.
