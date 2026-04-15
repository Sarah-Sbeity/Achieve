# How to open and use the Survey Platform

## Step 1: Start the backend (API server)

1. Open **PowerShell** or **Command Prompt**.
2. Run:
   ```bash
   cd c:\Users\user\Desktop\Survey-Platform\backend
   npm run start
   ```
3. Wait until you see: **"Nest application successfully started"** and **"API listening on http://0.0.0.0:3000"**.
4. **Leave this window open** (do not close it).

---

## Step 2: Start the frontend (web app)

1. Open a **second** PowerShell or Command Prompt window.
2. Run:
   ```bash
   cd c:\Users\user\Desktop\Survey-Platform\frontend
   npm run start
   ```
3. Wait until you see something like: **"Serving!"** and a URL such as **http://localhost:5173**.
4. **Leave this window open** too.

---

## Step 3: Open the app in your browser

1. Open **Chrome** (or Edge, Firefox).
2. In the address bar type: **http://localhost:5173**
3. Press **Enter**.

You should see the **Login** page (no sidebar, just the sign-in form).

---

## Step 4: Sign in

1. Enter your **email** and **password**.
2. Click **Sign in**.
3. After a successful sign-in you should see the main app: **sidebar on the left** and **Survey** or **Analytics** (dashboard) on the right. You can then use the menu to open Survey, Analytics, Charts, Settings.

---

## If something goes wrong

- **"Network error" / "Cannot reach server"**  
  The frontend could not reach the backend. The message will show the URL it tried (e.g. `http://localhost:3000`). **Start the backend first** (Step 1) and ensure you see "API listening on http://0.0.0.0:3000". Then try signing in again.

- **"Address already in use" (port 3000)**  
  Another program is using port 3000. Close any other backend or app using that port, or ask for help to free the port.

- **Blank page or nothing loads**  
  Use **http://localhost:5173** (from Step 2). Do not open the `index.html` file directly from the folder.

- **First time / no account**  
  On the login page, click **Sign up** to create an account, then sign in with that email and password.
