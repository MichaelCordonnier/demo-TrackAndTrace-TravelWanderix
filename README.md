🌍 WANDERIX - Travel PWA
========================

A modern travel-focused Progressive Web App (PWA) with full-stack architecture, real-time features, and modular scalability.

------------------------

🧱 PROJECT STRUCTURE
====================

Monorepo managed by Lerna:

- /packages/api          → Backend (NestJS, GraphQL, MongoDB)
- /packages/pwa          → Frontend (Vue PWA, TailwindCSS/UnoCSS)
- /tests                 → E2E tests (Playwright)
- /infrastructure        → Docker, NGINX, deployment configs

------------------------

⚙️ TECH STACK
=============

BACKEND (NestJS, GraphQL, MongoDB)
----------------------------------

- NestJS: Modular structure using GraphQLModule, TypeORM, etc.
- MongoDB: NoSQL storage, in-memory testing
- Firebase Auth: Handles secure user login
- Apollo Server: GraphQL API layer
- WebSockets: Real-time features (chat, updates)
- TypeORM: Integration with MongoDB
- Docker: Containerized backend environment

FRONTEND (Vue PWA, Tailwind, Firebase, Mapbox)
----------------------------------------------

- Vue.js PWA: Lightweight, fast, offline-capable
- UnoCSS / TailwindCSS: Utility-first styling
- Apollo Client: Data fetching via GraphQL
- Firebase: Authentication and real-time services
- Mapbox: Embedded interactive maps
- Playwright: End-to-end testing for UI features

------------------------

🔧 TOOLING & CONFIGURATION
==========================

- Lerna: Monorepo management → lerna.json
- Husky: Git pre-commit hooks → .husky/pre-commit
- Prettier: Code formatting → package.json
- NGINX: Reverse proxy + static files → infrastructure/nginx.conf
- Docker Compose:
  - Dev → docker-compose-dev.yml
  - Prod → docker-compose-production.yml
- i18n: Multi-language support → See i18n modules

------------------------

🧪 TESTING
==========

- Backend: In-memory MongoDB for unit/integration tests
- Frontend: Playwright for E2E UI tests
- Test files: Located in /tests

------------------------

✨ KEY FEATURES
===============

- Full GraphQL API (NestJS + Apollo)
- Firebase Authentication
- Real-time chat and updates (WebSockets)
- PWA support with Vue.js
- Interactive maps (Mapbox)
- End-to-end testing (Playwright)
- Full Docker support
- Internationalization (i18n)

------------------------

📦 SUMMARY
==========

WANDERIX is a modular, scalable travel application powered by a real-time full-stack architecture. It's built for growth with modern dev practices, containerization, and multilingual support.

🚚 TRACKANDTRACE
================

Trackandtrace is a modern microservices-based application emphasizing modularity, scalability, and containerization. Fully deployed on a **private OpenStack** infrastructure.

------------------------

📦 PROJECT STRUCTURE
====================

- /api                → Backend (C#, .NET Core, gRPC)
- /dashboard          → Frontend (React/Vue/Angular with Node.js)
- /db                 → Database scripts & schema
- /template           → Boilerplate code and reusable components
- /test               → Integration and E2E tests

------------------------

🔙 BACKEND (API)
================

- **Framework**: C# with .NET Core / ASP.NET Core
  → Project files: `api.csproj`, `Program.cs`
- **Configuration**: `appsettings.json`, `appsettings.Development.json`
- **Dependency Management**: Via `api.csproj`
- **Architecture**:
  - `Brokers/` → External services (APIs, DBs)
  - `Context/` → EF Core DB context
  - `Models/`  → Domain models
  - `Repo/`    → Repository pattern
  - `Services/`→ Business logic
- **gRPC Integration**:
  - Definitions: `Protos/`
  - Services: `GrpcServices/`
- **Dockerized**: `Dockerfile`, `.dockerignore`

------------------------

🖥 FRONTEND (DASHBOARD)
=======================

- **Framework**: JavaScript/TypeScript (React, Vue, or Angular)
- **Node Versioning**: `.nvmrc`
- **Formatting**: Prettier config in `.prettierrc.json`
- **Dockerized**: `Dockerfile`, `.dockerignore`
- **Entrypoint Script**: `entrypoint.sh`

------------------------

🛢 DATABASE (DB)
================

- **Scripts & Migrations**: Located in `/db/`
- **Database**: Relational (e.g. PostgreSQL) or NoSQL (e.g. MongoDB)
- **Schema Definitions**: Version-controlled

------------------------

📨 MESSAGE QUEUE
================

- **RabbitMQ**: Enables asynchronous, event-driven architecture
- **Integration**: Microservices communicate via message queues

------------------------

🐳 CONTAINERIZATION & ORCHESTRATION
===================================

- **Docker**: All major services are containerized
- **Docker Compose**: `compose.yaml` defines service orchestration

------------------------

🧪 TESTING & TEMPLATES
=======================

- **Tests**: Unit, integration, and end-to-end tests in `/test/`
- **Templates**: Boilerplate code and reusable configs in `/template/`

------------------------

🧰 SUMMARY OF TECHNOLOGIES
===========================

- **Backend**: C#, .NET Core / ASP.NET Core, gRPC
- **Frontend**: JavaScript/TypeScript, React/Vue/Angular
- **Database**: PostgreSQL, MySQL, or MongoDB
- **Message Queue**: RabbitMQ
- **Containerization**: Docker, Docker Compose
- **Testing**: Unit, integration, E2E
- **Code Quality**: Prettier

------------------------

✅ SUMMARY
==========

Trackandtrace is a production-ready microservices platform built with robust containerization, modular components, and a flexible deployment strategy on **OpenStack**. Designed for scalability, performance, and long-term maintainability.



