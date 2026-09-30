# DeskFlow — Client Request Desk

DeskFlow is a modern, multi-tenant SaaS application designed to help service companies manage customer requests, track activity history, and convert qualified requests into actionable work items.

---

## 1. Project Overview

DeskFlow provides an end-to-end workflow solution for service-based businesses. Customers submit inbound service requests, which team members evaluate, filter, track through activity timelines, and convert into work items upon qualification—all with strict, multi-tenant workspace isolation.

---

## 2. Key Features

* **Explicit Workspace Authentication**: Multi-tenant login and registration requiring users to select their verified workspace.
* **Request Lifecycle Management**: Full CRUD operations for customer requests with status tracking (`NEW`, `QUALIFIED`, `CLOSED`).
* **Work Item Conversion**: Atomic conversion of `QUALIFIED` requests into internal Work Items with status tracking and duplicate protection.
* **Audit & Activity Timeline**: Automatic activity logging for request creation, status modifications, details updates, and work item conversions.
* **Strict Workspace Isolation**: Tenant boundaries enforced at the database query layer via JWT tokens bound to database-backed workspace IDs.
* **Modern SaaS UI**: Responsive interface built with modern typography, glassmorphism visual elements, status filters, interactive modals, and real-time toast feedback.

---

## 3. Tech Stack

### Frontend
* **Core & Framework**: React 19, TypeScript, React Router DOM v7
* **Build Tool & Styling**: Vite, Vanilla CSS Design System, Lucide React Icons
* **Testing**: Vitest, React Testing Library, jsdom

### Backend
* **Runtime & API Framework**: Node.js, Express 5, TypeScript (`tsx`)
* **Database & ORM**: PostgreSQL (`pg` connection pool), raw SQL queries with parameterized inputs
* **Authentication & Validation**: JWT (JSON Web Tokens), `bcryptjs` password hashing, Zod schema validation
* **Testing**: Vitest, Supertest

---

## 4. Project Structure

```text
Client_request_Desk/
├── backend/
│   ├── src/
│   │   ├── config/         # Environment & JWT configuration
│   │   ├── controllers/    # Auth, Requests, and Workspaces controllers
│   │   ├── db/             # PostgreSQL database pool, DDL schema, and seed scripts
│   │   ├── middleware/     # Authentication & error handling middleware
│   │   ├── routes/         # Express API routes (/api/auth, /api/requests, /api/workspaces)
│   │   ├── services/       # Activity logging service
│   │   ├── tests/          # Integration & unit test suites
│   │   ├── types/          # TypeScript interfaces & Zod validation schemas
│   │   ├── app.ts          # Express app definition
│   │   └── server.ts       # Backend entry point
│   ├── .env.example        # Environment variable template
│   ├── package.json        # Backend dependencies & npm scripts
│   └── tsconfig.json       # TypeScript configuration
├── frontend/
│   ├── src/
│   │   ├── assets/         # Static assets and brand graphic SVGs
│   │   ├── components/     # Reusable UI components (Sidebar, Tables, Modals, Badges)
│   │   ├── hooks/          # Custom React hooks (useRequests)
│   │   ├── pages/          # Login, Register, Dashboard, Requests, Details & Form pages
│   │   ├── services/       # API client service layer
│   │   ├── types/          # Shared frontend type declarations
│   │   ├── App.tsx         # Route configuration
│   │   └── index.css       # Core design system CSS tokens & utilities
│   ├── .env.example        # Frontend environment variable template
│   ├── package.json        # Frontend dependencies & scripts
│   └── vite.config.ts      # Vite build configuration
├── .gitignore              # Repository gitignore rules
└── README.md               # Project documentation
```

---

## 5. Setup & Installation

### Prerequisites
* **Node.js**: v18.x or later
* **npm**: v9.x or later
* **PostgreSQL**: Local or remote PostgreSQL instance running on port 5432

### Step-by-Step Installation

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd Client_request_Desk
   ```

2. **Install Dependencies**:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

---

## 6. Environment Variables

### Backend Configuration (`backend/.env`)
Create a `.env` file in the `backend/` directory by copying `.env.example`:

```bash
cp backend/.env.example backend/.env
```

```env
PORT=5000
JWT_SECRET=your_jwt_secret_here
PGHOST=localhost
PGPORT=5432
PGDATABASE=client_request_desk
PGUSER=postgres
PGPASSWORD=your_password
```

### Frontend Configuration (`frontend/.env`)
Create a `.env` file in the `frontend/` directory by copying `.env.example`:

```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 7. Database Setup, Migration & Seeding

1. **Create the PostgreSQL Database**:
   ```sql
   CREATE DATABASE client_request_desk;
   ```

2. **Run Schema Migrations**:
   ```bash
   cd backend
   npm run migrate
   ```

3. **Seed Initial Data**:
   ```bash
   npm run seed
   ```

---

## 8. Running the Application

### Development Mode

* **Start Backend Server** (runs on port 5000):
  ```bash
  cd backend
  npm run dev
  ```

* **Start Frontend Server** (runs on port 5173):
  ```bash
  cd frontend
  npm run dev
  ```

---

## 9. Testing & Production Builds

### Running Tests

* **Backend Tests** (29 integration & isolation tests):
  ```bash
  cd backend
  npm test
  ```

* **Frontend Tests**:
  ```bash
  cd frontend
  npm test
  ```

### Production Build & Execution

* **Build & Start Backend**:
  ```bash
  cd backend
  npm run build
  npm start
  ```

* **Build & Preview Frontend**:
  ```bash
  cd frontend
  npm run build
  npm run preview
  ```

---

## 10. API Endpoint Summary

### Public Routes
* `GET /api/workspaces` — Fetch available public workspaces (`[{ id, name }]`)
* `POST /api/auth/register` — Register a new member user for a selected workspace
* `POST /api/auth/login` — Authenticate user credentials against selected workspace

### Protected Routes (Requires `Bearer <JWT_TOKEN>`)
* `GET /api/auth/me` — Fetch authenticated user profile and workspace context
* `GET /api/requests` — List customer requests for user's workspace (supports `?status=` filter)
* `GET /api/requests/:id` — Fetch single request details (enforces workspace check)
* `POST /api/requests` — Create a new customer request in user's workspace
* `PUT /api/requests/:id` — Update existing request in user's workspace
* `GET /api/requests/:id/activities` — Fetch audit activity log for request
* `POST /api/requests/:id/work-item` — Convert `QUALIFIED` request into a Work Item

---

## 11. Workspace Isolation & Security Approach

1. **Explicit Selection**: Users select their workspace on Login and Register forms; client-specified workspace IDs are cross-referenced with database records during authentication.
2. **Untrusted Client Inputs**: After login, the backend completely ignores any `workspaceId` passed in body parameters or query strings for data mutation endpoints.
3. **JWT Workspace Binding**: Upon login, the user's verified database `workspace_id` is embedded inside the signed JWT.
4. **Query-Level Multi-Tenancy**: All SQL queries filtering requests, work items, and activities enforce `WHERE workspace_id = $1` using `req.user.workspaceId` extracted from the verified JWT. Cross-workspace operations return `404 Not Found`.
5. **Secure Password Hashing**: Passwords are saved as `bcrypt` hashes (10 rounds). Plaintext passwords and hashes are excluded from API payloads.

---

## 12. Key Architecture Decisions & Trade-Offs

* **PostgreSQL over SQLite**: Migrated to PostgreSQL to support relational integrity, transaction concurrency (`BEGIN`/`COMMIT`), atomic operations, and enterprise SQL standards.
* **Parameterized SQL over Heavy ORMs**: Utilized node-postgres (`pg`) directly for transparent, efficient, and precise SQL execution with zero ORM abstraction overhead.
* **Component-Level Styling**: Used Vanilla CSS with a centralized token design system (`index.css`) for high visual quality, smooth micro-interactions, zero runtime dependency overhead, and exact design consistency.

---

## 13. Assumptions & Future Improvements

### Current Assumptions
* Workspaces are created via seed/administrative onboarding.
* Users belong to a single primary workspace.

### Planned Future Improvements
* Multi-workspace membership per user with workspace switching.
* Role-based access control (RBAC) expansions (`ADMIN`, `MANAGER`, `MEMBER`).
* Email notification webhooks on request status change.

---

## 14. AI Tools Used & Code Review Process

* **AI Coding Assistance**: Google Antigravity AI pair programming assistant was utilized for UI refactoring, database schema migration design, test suite setup, and document auditing.
* **Human Verification & Review**: All AI-generated code, SQL queries, TypeScript types, and test assertions were manually reviewed, verified against project requirements, and validated via full test suite executions (`vitest`) and production compilation (`tsc` / `vite build`).

---

## 15. Demo Credentials

The database comes pre-seeded with the following demo accounts for testing:

* **Workspace 1: BrightPath Solutions** (`ws-1`)
  * **Email**: `aarav@brightpath.demo`
  * **Password**: `password123`
  * **Role**: MEMBER

* **Workspace 2: NovaWorks Consulting** (`ws-2`)
  * **Email**: `ananya@novaworks.demo`
  * **Password**: `password123`
  * **Role**: MEMBER
