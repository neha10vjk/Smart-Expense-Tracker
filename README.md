
# Smart Expense Tracker

This project now works as both:

- a Vite React web app
- a Capacitor mobile app shell for Android, with iOS-ready config

The original design source is available at:
https://www.figma.com/design/taDfxlgJHKTFzzINyY9RO7/Smart-Expense-Tracker-UI

## Web Development

1. Run `npm install`
2. Run `npm run dev`

## Backend Development

This project now includes a Node.js + Express backend in `backend/` with PostgreSQL.

### Backend stack

- `Express` for the API
- `pg` for PostgreSQL access
- `dotenv` for configuration

### Environment setup

1. Copy `.env.example` to `.env`
2. Update `DATABASE_URL` to point to your PostgreSQL database

Example:

`postgresql://postgres:postgres@localhost:5432/smart_expense_tracker`

### Create the database

1. Create a PostgreSQL database named `smart_expense_tracker`
2. Run the schema in [backend/db/schema.sql](c:\Users\Neha\Downloads\Smart%20Expense%20Tracker%20UI\backend\db\schema.sql)

Example using `psql`:

```powershell
psql -U postgres -d smart_expense_tracker -f backend/db/schema.sql
```

### Run the backend

1. Start the API:

```powershell
npm run server:dev
```

2. The API will run at:

`http://localhost:4000`

### Starter endpoints

- `GET /api/health`
- `GET /api/profile`
- `GET /api/expenses`
- `POST /api/expenses`
- `GET /api/dashboard/summary`

## Build The Mobile App

1. Run `npm install`
2. Run `npm run android`

That command:

- builds the Vite app into `dist`
- syncs the web assets into the Capacitor Android project

## Open In Android Studio

1. Run `npm run android:open`
2. Let Android Studio finish Gradle sync
3. Run the app on an emulator or connected Android phone

## iOS Notes

Capacitor iOS is already configured in `package.json`, but the native iOS project must be created on macOS.

On a Mac, run:

1. `npm install`
2. `npx cap add ios`
3. `npm run build`
4. `npx cap sync ios`
5. `npx cap open ios`

## Important Files

- `capacitor.config.json`: Capacitor app configuration
- `android/`: Native Android project
- `src/app/`: Existing React app screens

## Mobile-Specific Improvements Added

- Android shell created with Capacitor
- mobile-safe viewport configuration
- safe-area support for notches and gesture bars
- reusable scripts for build, sync, and Android Studio launch
