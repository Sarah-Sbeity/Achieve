# Survey Platform

## How to run (platform not working? follow this)

### 1. Start the backend

From the project root:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run start
```

Or for development with auto-reload:

```bash
cd backend
npm run start:dev
```

You should see:

- `API listening on http://0.0.0.0:3000`
- `Frontend served from ... Open http://localhost:3000`

### 2. Open the app in the browser

**Important:** Use this URL only (do not open `index.html` as a file):

- **http://localhost:3000**

If you open the frontend as `file:///...` or from another port, login will not work (cookies require same origin).

### 3. Log in

- Use an account created by the seed (see `backend/prisma/seed.ts` for default users), or sign up.
- After login you should be redirected to Dashboard (admin) or OSR Form (viewer).

### If it still doesn’t work

- Ensure you ran `npm run prisma:seed` so at least one user exists.
- In the browser: F12 → Console and Network. Check for failed requests or errors.
- Confirm the backend is running and that you see the “Frontend served from” message when it starts.
