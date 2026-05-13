# CyberGuard Ticketing System

CyberGuard is a full-stack cybersecurity incident management platform designed for tracking and resolving security incidents efficiently.

## Core Features

- **Incident Tracking**: Create, assign, and resolve security incidents.
- **Role-Based Access Control**:
  - **Admin**: Full access, including audit logs and user management.
  - **Agents**: Investigate, update status, and resolve assigned tickets.
  - **Users**: Report new security incidents.
- **Audit Trails**: Track status changes and severity updates with detailed history.
- **Asset Management**: Catalog and monitor network assets.

## Tech Stack

- **Backend**: Go 1.21 with GORM.
- **Frontend**: React 18, Vite, TypeScript, Bootstrap 5.
- **Database**: PostgreSQL.
- **Infrastructure**: Docker Compose with host networking.

## Setup & Running

### Prerequisites
- Docker & Docker Compose installed.

### Commands

1. **Start the stack**:
   ```bash
   docker-compose up --build
   ```

2. **Access the application**:
   - Navigate to `http://localhost:3000` in your browser.

3. **Database Reset** (if seeding issues occur):
   ```bash
   docker-compose down
   docker volume rm web_dev_postgres_data
   docker-compose up --build
   ```

## Default Credentials

All accounts use the password: `password`

| Username | Role |
| :--- | :--- |
| `admin` | Admin |
| `user1` | User |
| `user2` | User |
| `agent1` | Agent |
| `agent2` | Agent |
| `agent3` | Agent |
