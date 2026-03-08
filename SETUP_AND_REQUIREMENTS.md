# ExamNotes AI – Requirements to Complete the Project

This document lists everything needed to run and complete the ExamNotes AI project.

---

## 1. Environment & configuration

### Server (`server/.env`)

Create or update `server/.env` with:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URL` | Yes | MongoDB connection string (e.g. `mongodb://localhost:27017/examnotes` or Atlas URI) |
| `JWT_SECRET` | Yes | Secret for signing/verifying JWT tokens |
| `GEMINI_API_KEY` | Yes | Google AI (Gemini) API key from [Google AI Studio](https://aistudio.google.com/apikey) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (starts with `sk_`) for payments |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret (from Stripe Dashboard → Webhooks) |
| `CLIENT_URL` | Yes | Frontend URL for Stripe redirects (e.g. `http://localhost:5173`) |
| `PORT` | No | Server port (default `5000`; see port mismatch below) |

### Client (`client/.env` or `client/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_FIREBASE_APIKEY` | Yes | Firebase Web API key (from Firebase Console → Project settings) |

Firebase config in `client/src/utils/firebase.js` already has `authDomain`, `projectId`, etc.; ensure the project in Firebase Console matches (e.g. `authexamnotes`).

---

## 2. Fix port mismatch

- **Client** in `client/src/App.jsx` uses: `serverUrl = "http://localhost:8000"`.
- **Server** in `server/index.js` uses: `PORT = process.env.PORT || 5000`.

**Do one of the following:**

- Set in `server/.env`: `PORT=8000` and keep client as is, **or**
- Change in `App.jsx`: `serverUrl = "http://localhost:5000"` and keep server default.

---

## 3. External services to set up

### MongoDB

- Install and run MongoDB locally, **or**
- Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and set `MONGODB_URL` in `server/.env`.

### Firebase (Authentication)

- Create a project at [Firebase Console](https://console.firebase.google.com).
- Enable **Google** sign-in in Authentication → Sign-in method.
- Add your app (Web), copy the API key into `VITE_FIREBASE_APIKEY`.
- Ensure authorized domains include `localhost` (and your production domain later).

### Google AI (Gemini)

- Get an API key from [Google AI Studio](https://aistudio.google.com/apikey).
- Put it in `server/.env` as `GEMINI_API_KEY`.
- **Note:** The code uses `gemini-3-flash-preview`. If that model name changes, update `server/services/gemini.services.js`.

### Stripe (Payments)

- Create an account at [Stripe](https://stripe.com).
- Get **Secret key** and set as `STRIPE_SECRET_KEY`.
- For **webhooks**:
  - In Stripe Dashboard → Developers → Webhooks, add endpoint:  
    `https://your-server-url/api/credits/webhook`
  - Event: `checkout.session.completed`
  - Copy the **Signing secret** into `STRIPE_WEBHOOK_SECRET`.
- For local testing use Stripe CLI: `stripe listen --forward-to localhost:5000/api/credits/webhook` and use the CLI’s webhook secret in `STRIPE_WEBHOOK_SECRET`.
- Set `CLIENT_URL` in `server/.env` to your frontend URL (e.g. `http://localhost:5173`).

---

## 4. Running the project

1. **MongoDB** must be running (local or Atlas).
2. **Server:**  
   `cd server && npm install && npm run dev`  
   (Uses nodemon; ensure port matches client’s `serverUrl`.)
3. **Client:**  
   `cd client && npm install && npm run dev`  
   (Vite usually serves on `http://localhost:5173`.)

---

## 5. Optional improvements / completion items

| Item | Description |
|------|-------------|
| **CORS** | Server CORS is set to `http://localhost:5173`. For production, set `origin` (or env) to your real frontend URL. |
| **Cookie `secure`** | Auth cookie uses `secure: true`. For local HTTP (no HTTPS), you may need to set `secure: false` in `server/controllers/auth.controller.js` so cookies work on localhost. |
| **Stripe webhook in dev** | Use Stripe CLI to forward webhooks to localhost and set `STRIPE_WEBHOOK_SECRET` to the CLI secret. |
| **Error handling** | `client/src/services/api.js`: `generateNotes` and `getCurrentUser` only `console.log` errors; consider surfacing messages to the user (e.g. toast or state). |
| **PaymentSuccess deps** | `PaymentSuccess.jsx` `useEffect` uses `[]`; consider adding `[dispatch, navigate]` if the linter warns. |
| **Typo** | In `client/src/pages/Pricing.jsx`, "Seleted" → "Selected". |
| **Root README** | Add a root `README.md` with project description, env setup, and run instructions (pointing to this file if needed). |

---

## 6. Quick checklist

- [ ] `server/.env` has: `MONGODB_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLIENT_URL`
- [ ] `client/.env` has: `VITE_FIREBASE_APIKEY`
- [ ] Client and server ports aligned (e.g. 8000 or 5000)
- [ ] MongoDB running (local or Atlas)
- [ ] Firebase project created; Google sign-in enabled; API key in client env
- [ ] Gemini API key created and set in server env
- [ ] Stripe keys and webhook configured; CLI used for local webhook testing if needed
- [ ] `npm install` and `npm run dev` in both `server` and `client`
- [ ] (Optional) Cookie `secure` and CORS adjusted for local/production

Once the above are done, you can sign in with Google, generate notes, buy credits, and download PDFs.
