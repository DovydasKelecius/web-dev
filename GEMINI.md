# Project Overview
This project is a full-stack monorepo featuring a **Go** backend, a **React (TypeScript)** frontend, and a **PostgreSQL** database, all orchestrated with **Docker Compose**. A dedicated **Nginx** container acts as a reverse proxy, routing traffic to the appropriate services.

## Architecture & Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Nginx (for serving static files).
- **Backend**: Go 1.21, `net/http` for API, `lib/pq` for PostgreSQL connection.
- **Database**: PostgreSQL 15.
- **Proxy**: Nginx (External gateway).
- **Infrastructure**: Docker with multi-stage Alpine-based builds.

## Networking Note
The project uses **Host Networking** (`network_mode: host`) for all services and builds (`network: host`). This was implemented to resolve specific environment-level bridge networking issues. Services communicate via `localhost` on the following ports:
- **Nginx Proxy**: 80 (Main entry point)
- **Frontend**: 3000
- **Backend**: 8080
- **PostgreSQL**: 5432

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
