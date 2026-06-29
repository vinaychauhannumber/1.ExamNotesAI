# ExamNotes AI

![ExamNotes AI](https://img.shields.io/badge/Status-Active-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue)

ExamNotes AI is an intelligent, AI-powered application designed to generate high-yield, revision-ready exam notes, project documentation, and charts instantly. It leverages Google's Gemini AI to synthesize information and provides users with downloadable PDFs for offline studying.

## Features
- **Google Authentication:** Secure and seamless login using Firebase Auth.
- **AI Note Generation:** Create instant notes using Google Gemini AI.
- **Credit System:** Stripe integration for managing credits (start with 50 free credits).
- **PDF Export:** Clean, printable PDF generation for your notes.
- **Modern UI:** Built with React, TailwindCSS, and Framer Motion for a sleek experience.

## Tech Stack
- **Frontend:** React, Vite, TailwindCSS, Redux Toolkit, Framer Motion, Firebase Auth
- **Backend:** Node.js, Express, MongoDB (Mongoose), Stripe, Google Generative AI (Gemini)

## Setup & Local Development

Detailed setup instructions are available in the [`SETUP_AND_REQUIREMENTS.md`](./SETUP_AND_REQUIREMENTS.md) file.

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vinaychauhannumber/1.ExamNotesAI.git
   cd 1.ExamNotesAI
   ```

2. **Configure Environment Variables:**
   - Create `server/.env` with your MongoDB URI, Gemini API Key, Stripe Keys, and JWT Secret.
   - Create `client/.env` with your Firebase API Key.

3. **Install Dependencies & Run:**
   - **Backend:**
     ```bash
     cd server
     npm install
     npm run dev
     ```
   - **Frontend:**
     ```bash
     cd client
     npm install
     npm run dev
     ```

4. Open your browser and navigate to `http://localhost:5173`.
