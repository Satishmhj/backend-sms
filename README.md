# School Management System (SMS) — Backend API

A RESTful backend API for managing a school's users (**admin**, **teacher**, **student** roles) and **report cards**, built with:

- [NestJS](https://nestjs.com/) (v11) — framework
- [MongoDB](https://www.mongodb.com/) — database (NoSQL) via [Mongoose](https://mongoosejs.com/)
- JWT — authentication & authorization
- [Swagger](https://swagger.io/) — interactive API docs

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Database Setup (MongoDB)](#database-setup-mongodb)
   - [Option A — Local MongoDB](#option-a--local-mongodb-recommended)
   - [Option B — MongoDB Atlas (cloud)](#option-b--mongodb-atlas-cloud)
   - [Option C — Docker](#option-c--docker)
6. [Environment Configuration](#environment-configuration)
7. [Installation](#installation)
8. [Running the Project](#running-the-project)
9. [Authentication & Authorization](#authentication--authorization)
10. [API Endpoints](#api-endpoints)
11. [Example Requests](#example-requests)
12. [Swagger API Docs](#swagger-api-docs)
13. [Available Scripts](#available-scripts)
14. [Troubleshooting](#troubleshooting)

---

## Features

- **Authentication**: User signup & login with JWT tokens (access token).
- **Three roles**: `admin`, `teacher`, `student`.
- **User management** (admin only): list, view details, update, delete users.
- **Report cards**: create (admin/teacher), list, view details, and print a formatted report card.
- **Role-based access control** through guards + decorators.
- **Password security**: passwords hashed with `bcrypt`.
- **Validation**: request bodies validated with `class-validator` (global `ValidationPipe`).
- **Swagger UI** with a Bearer token "Authorize" button.

---

## Tech Stack

| Layer        | Technology                      |
|--------------|---------------------------------|
| Framework    | NestJS 11 (Express platform)    |
| Language     | TypeScript (ES2023, nodenext)   |
| Database     | MongoDB (NoSQL)                 |
| ODM          | Mongoose (`@nestjs/mongoose`)   |
| Auth         | `@nestjs/jwt` (JWT)             |
| Validation   | `class-validator`, `class-transformer` |
| API docs     | `@nestjs/swagger` (Swagger UI)  |
| Config       | `@nestjs/config` (reads `.env`) |

---

## Project Structure

```
sms/
├── .env                     # Environment variables (gitignored)
├── package.json
├── tsconfig.json
├── src/
│   ├── main.ts              # Bootstrap: CORS, validation, Swagger, listen
│   ├── app.module.ts        # Root module — imports everything
│   ├── app.controller.ts    # Root GET / (hello world)
│   ├── app.service.ts
│   │
│   ├── database/
│   │   └── database.module.ts   # MongoDB connection (MongooseModule.forRootAsync)
│   │
│   ├── auth/
│   │   ├── auth.module.ts        # JWT registration, providers
│   │   ├── auth.controller.ts    # /auth/signup, /auth/login
│   │   ├── auth.service.ts       # signup + login logic
│   │   ├── dto/                  # login.dto, signup.dto
│   │   ├── guards/              # jwt-auth.guard, roles.guard
│   │   ├── decorators/         # roles.decorator, current-user.decorator
│   │   ├── types/              # authenticated-request.ts
│   │   └── Interfaces/         # auth.interface.ts
│   │
│   ├── user/
│   │   ├── user.module.ts
│   │   ├── user.controller.ts    # /users CRUD (admin only)
│   │   ├── user.service.ts
│   │   ├── schemas/user.schema.ts   # User document + roles enum
│   │   └── dto/update-user.dto.ts
│   │
│   └── report-card/
│       ├── report-card.module.ts
│       ├── report-card.controller.ts  # /report-cards
│       ├── report-card.service.ts     # grade calculation + print
│       ├── schemas/report-card.schema.ts
│       └── dto/create-report-card.dto.ts
```

---

## Prerequisites

- **Node.js** v18 or later (v20+ recommended)
- **npm** (comes with Node) — or **yarn** if you prefer
- A running **MongoDB** instance (local, Docker, or Atlas)

> **Note:** MongoDB is **not** installed on this machine right now. You must set one up — see the [Database Setup](#database-setup-mongodb) section below.

---

## Database Setup (MongoDB)

The app connects to MongoDB using the URI in `.env` → `MONGODB_URI`. Default is `mongodb://localhost:27017/sms`. Choose one option:

### Option A — Local MongoDB (Recommended)

**1. Install MongoDB Community Edition for Windows**

- Download from: https://www.mongodb.com/try/download/community
- Choose **MSI** installer and run it.
- Select "Install MongoDB as a Service" — this starts MongoDB automatically as a Windows service on port `27017`.

**2. Verify it's running**

```bash
# PowerShell — should show the MongoDB service as Running
Get-Service -Name "MongoDB"

# Or test the port
Test-NetConnection -ComputerName localhost -Port 27017
```

**3. Confirm the database**

Once installed, open a new shell and run:

```bash
mongosh
```

You should see a prompt. Type `exit` to leave. The default data directory is `C:\Program Files\MongoDB\Server\<version>\data\db` (usually auto-created).

### Option B — MongoDB Atlas (cloud)

1. Create a free cluster at https://www.mongodb.com/atlas
2. In Atlas, create a database user and allow network access.
3. Copy your connection string, e.g.:

```
mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/sms
```

4. Put it in `.env` (replace `sms` with your database name if desired).

### Option C — Docker

If you have Docker Desktop installed:

```bash
docker run -d --name sms-mongo -p 27017:27017 -v sms-mongo-data:/data/db mongo
```

This runs MongoDB on `localhost:27017` with persistent data in a Docker volume.

---

## Environment Configuration

Create a `.env` file in the project root (it's already gitignored). A `.env` file exists in the repo — update it with your values:

```env
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/sms

# Secret used to sign JWTs — CHANGE THIS IN PRODUCTION
JWT_SECRET=SECRET_KEY_FOR_LOCAL_DEV

# Token expiry (e.g. 18h, 7d, 900000)
JWT_EXPIRES_IN=18h

# HTTP port
PORT=3000
```

> ⚠️ For production, always use a strong, unique `JWT_SECRET` and never commit `.env` to version control.

---

## Installation

```bash
# From the project root (where package.json is)
npm install
```

If you get peer-dependency errors, you can use:

```bash
npm install --legacy-peer-deps
```

---

## Running the Project

Make sure MongoDB is running first (see [Database Setup](#database-setup-mongodb)).

```bash
# Development — watch mode (auto restarts on file changes) — RECOMMENDED
npm run start:dev

# Basic start (no watch)
npm run start

# Production build then run
npm run build
npm run start:prod
```

Once started, you'll see logs and the app listens on `http://localhost:3000`:

| Resource            | URL                              |
|---------------------|----------------------------------|
| API base            | `http://localhost:3000`          |
| Swagger UI          | `http://localhost:3000/api-docs` |
| Root hello world    | `http://localhost:3000/`         |

---

## Authentication & Authorization

Protected endpoints require a **JWT access token** sent as a Bearer token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### How to get a token

1. `POST /auth/login` with `{ "email": "...", "password": "..." }`.
2. The response contains `access_token` and the `user` object.
3. Send that token on protected requests (see example below).

### Role-based access

| Role      | Can access                                                                        |
|-----------|-----------------------------------------------------------------------------------|
| `admin`   | Everything: all user CRUD, create/list/view/print report cards                    |
| `teacher` | Create & view report cards (but **not** user management)                          |
| `student` | Only view/print **their own** report cards                                        |

---

## API Endpoints

Base URL: `http://localhost:3000`

### Authentication

| Method | Endpoint       | Auth | Roles         | Description                                   |
|--------|----------------|------|---------------|-----------------------------------------------|
| POST   | `/auth/signup` | No   | Anyone        | Register an admin, teacher or student user    |
| POST   | `/auth/login`  | No   | Anyone        | Login and get a JWT access token              |

### Users (admin only)

| Method | Endpoint     | Auth | Roles | Description                |
|--------|--------------|------|-------|----------------------------|
| GET    | `/users`     | Yes  | admin | List all users             |
| GET    | `/users/:id` | Yes  | admin | Get a user's details       |
| PATCH  | `/users/:id` | Yes  | admin | Update a user              |
| DELETE | `/users/:id` | Yes  | admin | Delete a user              |

### Report Cards

| Method | Endpoint                   | Auth | Roles       | Description                                           |
|--------|----------------------------|------|-------------|-------------------------------------------------------|
| POST   | `/report-cards`            | Yes  | admin/teacher | Create a report card for a student                  |
| GET    | `/report-cards`            | Yes  | all         | List report cards (students see only their own)       |
| GET    | `/report-cards/:id`        | Yes  | all         | Get a single report card (students: own only)         |
| GET    | `/report-cards/:id/print`  | Yes  | all         | Get a printable, formatted text report card           |

---

## Example Requests

### 1. Signup (register a user)

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Student One",
    "email": "student1@school.com",
    "password": "password123",
    "role": "student",
    "class": "10-A",
    "rollNumber": "101"
  }'
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "64b8f...",
    "name": "Student One",
    "email": "student1@school.com",
    "role": "student",
    "class": "10-A",
    "rollNumber": "101"
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student1@school.com", "password": "password123"}'
```

### 3. List all users (admin only)

```bash
curl http://localhost:3000/users \
  -H "Authorization: Bearer <admin-token>"
```

### 4. Create a report card (admin/teacher)

```bash
curl -X POST http://localhost:3000/report-cards \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "<student-user-id>",
    "className": "10-A",
    "term": "First Term",
    "academicYear": "2025-2026",
    "subjects": [
      { "name": "Mathematics", "marks": 85 },
      { "name": "English", "marks": 78 },
      { "name": "Science", "marks": 92 }
    ],
    "remarks": "Excellent performance!"
  }'
```

Grades are auto-calculated (A+ = 90+, A = 80+, B = 70+, C = 60+, D = 50+, F = below 50), along with `totalMarks` and `average`.

### 5. Print a report card

```bash
curl http://localhost:3000/report-cards/<id>/print \
  -H "Authorization: Bearer <token>"
```

Returns the full report card data **plus** a `text` field with a formatted, copy-paste-ready report.

---

## Swagger API Docs

Interactive documentation with a live "Try it out" UI:

```
http://localhost:3000/api-docs
```

**Using Swagger:**

1. Open the URL above.
2. Click **Authorize** (top right) and paste your JWT token (format: `<token>`), or sign up/login first.
3. Browse grouped sections: **Auth**, **Users**, **Report Cards**.
4. Click any endpoint → **Try it out** → fill in parameters → **Execute**.

> Endpoints without the lock icon (signup/login) are public. Endpoints showing a lock require a token.

---

## Available Scripts

| Command                 | Description                              |
|-------------------------|------------------------------------------|
| `npm run start:dev`     | Run in watch mode (recommended for dev)  |
| `npm run start`         | Run normally                             |
| `npm run start:prod`    | Run the compiled production build        |
| `npm run build`         | Compile TypeScript to `dist/`            |
| `npm run lint`          | Lint + auto-fix all source files         |
| `npm run format`        | Format all source files with Prettier    |
| `npm test`              | Run unit tests                           |
| `npm run test:e2e`      | Run end-to-end tests                     |
| `npm run test:cov`      | Run tests with coverage                  |
| `npm run test:watch`    | Run tests in watch mode                  |

---

## Troubleshooting

**Mongo connection error (e.g. `connect ECONNREFUSED 127.0.0.1:27017`)**
→ MongoDB isn't running. Start it (see [Database Setup](#database-setup-mongodb)) or fix `MONGODB_URI` in `.env`.

**401 Unauthorized on protected routes**
→ Token missing/expired. Login again and provide a valid `Bearer` token.

**403 Forbidden**
→ Your role doesn't allow that action (e.g. a student calling `/users`).

**`ERR_OSSL_EVP_UNSUPPORTED` or peer-dependency install errors**
→ Try `npm install --legacy-peer-deps` and use Node v18+.

**Port already in use (EADDRINUSE)**
→ Change `PORT` in `.env` or stop the process using port 3000.

---

## License

This is a private/unlicensed internal project.
