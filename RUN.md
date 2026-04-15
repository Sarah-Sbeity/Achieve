# How to run the Survey Platform

## 1. Start the backend

Open a terminal and run:

```powershell
cd c:\Users\user\Desktop\Survey-Platform\backend
npm install
npx prisma generate
npm run start:dev
```

Leave this running. You should see: `Nest application successfully started`. The API runs at **http://localhost:3000**.

(First time only: create admin user with `npm run prisma:seed` — ensure `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in `backend\.env`.)

## 2. Start the frontend

Open a **second** terminal and run:

```powershell
cd c:\Users\user\Desktop\Survey-Platform\frontend
npm install
npm run start
```

Note the URL it prints, e.g. **http://localhost:5173** (or another port if 5173 is in use).

## 3. Open the app

In your browser, go to **exactly** the URL the frontend printed — e.g. **http://localhost:5173** (or the port it shows).

- **Important:** Use only the **root** URL: `http://localhost:5173` with **nothing** after the port. Do **not** type `/dashboard`, `/login`, or any path — the app will show the login page at the root.
- Do **not** open `index.html` as a file (`file://`) — use the URL from the frontend server so login and cookies work.
- Log in with your admin email and password (e.g. from `backend\.env`: `admin@example.com` / `AdminPassword123!`).

**Alternative:** Double-click **`start-frontend.ps1`** in the project folder to start the frontend, then open the URL it prints (root only).

## If something doesn’t work

- **“Not opening” or blank / 404:** Open only the root URL (e.g. `http://localhost:5173`). Do not add `/dashboard` or anything else in the address bar.
- **Login fails or “Unable to load”:** Ensure the backend is running at http://localhost:3000 and you opened the app via the frontend URL (not `file://`).
- **Port in use:** If the frontend uses a port other than 5173, use that URL instead.
- **Database errors:** From `backend` run `npx prisma generate` and, if needed, `npm run prisma:seed`.
