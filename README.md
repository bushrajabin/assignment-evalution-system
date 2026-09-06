# Gradeline — Assignment Evaluation System

A full-stack app for teachers to create assignments and get AI-assisted grading
of student submissions, with a dashboard to review, override marks, and track
performance.

**Stack**
- Frontend: React (Vite) + Tailwind CSS + React Router + Recharts
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Auth: JWT (email/password, roles: teacher/student)
- AI evaluation: pluggable — OpenAI, Gemini, or a built-in local evaluator that
  needs no API key at all (great for demoing without any paid account)

---

## 1. Prerequisites

- Node.js 18+
- A MongoDB instance — either:
  - Local: `mongod` running on `mongodb://127.0.0.1:27017`, or
  - Free cloud: a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (get a connection string)
- (Optional) An OpenAI or Gemini API key if you want LLM-based grading instead
  of the built-in local evaluator.

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, and optionally AI_PROVIDER + API key
npm run dev
```

The API starts on `http://localhost:5000`. Health check: `GET /api/health`.

### AI provider modes (set in `backend/.env`)

| AI_PROVIDER | Requires                    | Behavior                                                |
|-------------|------------------------------|----------------------------------------------------------|
| `local`     | nothing                      | Built-in text-similarity + keyword-coverage grader. Works out of the box, no API key. |
| `openai`    | `OPENAI_API_KEY`             | Sends the question, expected answer, and student answer to an OpenAI chat model, asks for a JSON score/feedback/mistakes. |
| `gemini`    | `GEMINI_API_KEY`             | Same idea, via Gemini's `generateContent` endpoint.       |

If a real provider is configured but the call fails (bad key, network issue,
rate limit), the system automatically falls back to the local evaluator so a
submission is never left ungraded.

## 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
# edit .env if your backend isn't on localhost:5000
npm run dev
```

Open `http://localhost:5173`.

## 4. Using the app

1. Register two accounts: one as **teacher**, one as **student** (the register
   screen has a role toggle).
2. As the teacher: **New assignment** → fill in the question, the expected
   answer/solution, submission type, marks, and deadline.
3. As the student: open the assignment, type or paste an answer (or attach a
   file — `.txt`, code files, or `.pdf`), and submit. You'll see an AI score
   and feedback immediately.
4. Back as the teacher: **View submissions** on that assignment to read every
   student's answer, the AI's feedback and flagged mistakes, re-run the AI
   evaluation, or manually override the marks with a comment.
5. **Performance** (teacher nav) shows each student's average score across all
   assignments, as a chart and a table.

## 5. How evaluation works

1. Student submits text and/or a file.
2. If a file was attached, `services/textExtractionService.js` extracts plain
   text from it (native support for `.txt`/code files and `.pdf` via
   `pdf-parse`; image OCR is stubbed out with instructions to enable
   `tesseract.js` if you want it).
3. The combined text is sent to `services/aiEvaluationService.js`, which asks
   the configured AI provider to compare it against the teacher's expected
   answer and return a 0–100 score, short feedback, and a list of specific
   mistakes.
4. The score is scaled to the assignment's `maxMarks` and stored on the
   submission, instantly visible to the student.
5. Teachers can override `finalMarks` at any time — the student always sees
   `finalMarks` in preference to the raw `aiScore` once one exists.

## 6. Project structure

```
backend/
  server.js                     Express app entry point
  config/db.js                  MongoDB connection
  models/                       User, Assignment, Submission (Mongoose)
  middleware/auth.js            JWT auth + role guard
  middleware/upload.js          Multer file upload config
  controllers/                  Route handlers
  routes/                       Express routers
  services/aiEvaluationService.js     OpenAI / Gemini / local grading
  services/textExtractionService.js   PDF/text extraction from uploads

frontend/
  src/api/axios.js              Axios instance with JWT interceptor
  src/context/AuthContext.jsx   Auth state (login/register/logout)
  src/components/               Navbar, ProtectedRoute, ScoreBadge
  src/pages/teacher/            Dashboard, CreateAssignment, ViewSubmissions, Performance
  src/pages/student/            Dashboard, AssignmentDetail, MySubmissions
```

## 7. Notes on swapping in Firebase

The brief mentions Firebase Auth / Firestore as an option. This build uses
JWT + MongoDB instead because it's fully self-contained and doesn't require
you to create and configure a Firebase project or share credentials. If you'd
rather use Firebase:
- Swap `middleware/auth.js` to verify a Firebase ID token (`firebase-admin`)
  instead of a local JWT.
- Swap the Mongoose models/queries for Firestore collections, or keep Mongo
  for `Assignment`/`Submission` and use Firebase only for auth — both work
  fine together.

## 8. Known limitations / good next steps

- Image OCR is stubbed out (see `textExtractionService.js`) to avoid a heavy
  native dependency by default — flip it on with `tesseract.js` if needed.
- Evaluation runs synchronously on submit; for very large classes you'd want
  to move it to a background queue (e.g. BullMQ) and poll/notify on completion.
- No password-reset flow yet.
- One submission per student per assignment — add a "request resubmission"
  endpoint if you want teachers to allow redo attempts.
