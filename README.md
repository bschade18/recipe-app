# Recipe App

A mobile-first recipe app for saving, viewing, and managing recipes.

This project is also a learning project focused on building a full-stack application with a React Native frontend, Node.js backend, PostgreSQL database, and eventually cloud infrastructure.

## Tech Stack

### Mobile

- React Native
- Expo
- Expo Router
- TypeScript
- TanStack Query

### API

- Node.js
- Fastify
- TypeScript
- PostgreSQL
- `pg`
- `node-pg-migrate`

### Local Development

- Docker
- Docker Compose

## Project Structure

```text
recipe-app/
├── apps/
│   ├── mobile/   # Expo / React Native app
│   └── api/      # Fastify API
├── docker-compose.yml
└── README.md
```

## Current Features

- Create recipes manually
- View recipe list
- View recipe details
- Edit recipes
- Delete recipes
- Ingredients and ordered recipe steps
- PostgreSQL persistence
- Runtime API validation
- Client-side server-state management with TanStack Query

## Running Locally

### 1. Start PostgreSQL

From the project root:

```bash
docker compose up -d
```

### 2. Start the API

```bash
cd apps/api
npm install
npm run migrate:up
npm run dev
```

The API runs at:

```text
http://localhost:3000
```

### 3. Start the mobile app

In another terminal:

```bash
cd apps/mobile
npm install
npm start
```

Then open the app in an iOS Simulator, Android emulator, or Expo Go.

## Database

Local PostgreSQL runs in Docker.

Database schema changes are managed through migrations using `node-pg-migrate`.

To create a migration:

```bash
npm run migrate:create -- migration-name
```

To run migrations:

```bash
npm run migrate:up
```

## API

Current endpoints:

```text
GET    /health
GET    /recipes
GET    /recipes/:id
POST   /recipes
PATCH  /recipes/:id
DELETE /recipes/:id
```

## Roadmap

Planned features include:

- Recipe search and favorites
- URL-based recipe import
- Recipe import from photos / cookbooks
- Shared recipe libraries
- Authentication
- Meal planning
- Grocery list generation
- Cloud deployment
