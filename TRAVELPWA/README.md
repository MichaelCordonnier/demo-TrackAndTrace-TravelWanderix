# About This Project

This project was created as a final project for a Fullstack Development MCT. We built it using the following technologies:

### Backend:

- MongoDB
- Docker
- Firebase Authentication (FireAuth)
- NestJS
- Apollo
- GraphQL
- WebSockets

### Frontend:

- Vue
- UnoCSS/TailwindCSS
- GraphQL
- WebSocket
- Playwright

# What Is Really Nice About This Project?

Honestly, we need to be realistic this project can always be improved. But here are some of the features we like and that are part of this project:

First off, we have a robust backend. For some, this may be small, but at the time of writing, this was a pretty big one for us. We use validation, rate limiting, CORS, GraphQL, very detailed error handling, complex relations, FireAuth, WebSockets, subscriptions, and more. The challenge with this project was that we made the backend a bit too big for the time we had. As a result, we had less time for the frontend. Still, the frontend is in decent shape.

We focused primarily on other aspects of the design, which means some more exotic screen sizes may require additional adjustments in the future. While the red line through our design has room for enhancement, we’re proud of what we’ve achieved. This project provides us with a valuable opportunity to grow, explore, and improve, which was the core goal from the start.

# Before You Run

Make sure you have the correct `.env` files for each step. We’ve provided `.env.example` files in the relevant folders for your convenience.

# How to Run

1. Clone the repository.
2. Create a Firebase project and get the config.
3. npm install -y
4. npx nestjs-command seed:database:complete
5. npm run dev
6. Go the projected url

## i18n Export

For internationalization (i18n):

1. Create credentials on Google (Create credentials > Create OAuth client ID > Choose Desktop App).
2. Save the credentials as `credentials.json` in `packages/pwa/src/utils/`.
3. Run `npx tsx src/sheets.ts` in the terminal.

## Frontend

1. Change the `.env.example` files to `.env` and `.env.production.local`, then add the config values.

```env
VITE_FIREBASE_apiKey=
VITE_FIREBASE_authDomain=
VITE_FIREBASE_projectId=
VITE_FIREBASE_storageBucket=
VITE_FIREBASE_messagingSenderId=
VITE_FIREBASE_appId=
VITE_BACKEND_URL=
```

## API - Backend

1. Change the `.env.example` and `.env.production.example` files to `.env` and `.env.production.local`, then add the config values.

### .env Example

```env
GOOGLE_APPLICATION_CREDENTIALS=
URL_FRONTEND=localhost:5173
DB_HOST=mongodb
DB_PORT=27028
DB_NAME=api
MAIL_HOST=
APP_NAME=Wanderix
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_PORT=
DEFAULT_MAIL_FROM=info@example.com
WS_PORT=3004
NODE_ENV=dev
```

### .env.production.local

- Without the `GOOGLE_APPLICATION_CREDENTIALS`
- With the CLI path

```env
VITE_FIREBASE_apiKey=
VITE_FIREBASE_authDomain=
VITE_FIREBASE_projectId=
VITE_FIREBASE_storageBucket=
VITE_FIREBASE_messagingSenderId=
VITE_FIREBASE_appId=
VITE_BACKEND_URL=
VITE_MAPBOX_TOKEN=
BASE_URL="http://localhost:5173/"
```

## Seeding the Database

1. Seed your database with the data in the `seed` folder.
2. Navigate to the `packages/api` directory and run the seed scripts. Start by running the full seeding:

```bash
npx nestjs-command seed:database:complete
```

If there is an issue with your data, try removing the database directly in MongoDB Compass. If that doesn't work, you can send us a private message.

We’ve made it so that when you run the complete database seed, it seeds everything. Keep in mind that this process can be quite heavy and may take some time.

## Compose File

To run Docker Compose:

```bash
docker compose -f "infrastructure/docker-compose-production.yml" up -d --build
```

There is a known issue where MongoDB may sometimes not be included in the Docker file. If that happens, try removing your `package.json` and `node_modules`. This can be a potential fix. After doing so, you will need to remove these again to run your dev version locally. This is a known issue, most likely related to a versioning issue with npm.

## Testing

We have multiple tests written for this project.

### Backend Tests

- **Unit Tests**: Make sure you are in the `api` folder and run:

```bash
npm run test
```

### E2E Tests

- **E2E Tests**: Make sure you are in the `api` folder and run (When you run this, your dev production should not be running):

```bash
npm run test:e2e
```

### Frontend E2E Testing

We also have E2E testing in our frontend to test the login logic and chat functionality.

1. Start the Firebase Emulator:

```bash
npx firebase-tools emulators:start
```

2. Run the local dev build with the emulator as fireauth replacement:

```bash
npm run dev:emulate
```

3. Run the code with:

```bash
npx playwright test --ui
```

4. For development, if you want to write your own tests with Playwright:

```bash
npx playwright codegen
```
