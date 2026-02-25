# JobCompass

> Master navigating the sea of irrelevant jobs with **JobCompass**

JobCompass is a full-stack job search platform focused on practical matching: skill-based search, smart filtering/sorting, commute estimation, and favorites.

The repository is a monorepo with:

- `client/` — Vite + React frontend
- `server/` — Express + PostgreSQL backend
- `shared/` — utilities used by both client and server

## Mission

Connect talented professionals with opportunities that match their skills, preferences, and career goals.

## Features

- **Smart filtering and sorting** of fetched job listings
- **Skill-oriented matching** from normalized job descriptions
- **Commute calculator** (travel time + transfer count) using Google Directions API
- **Favorites** with persisted travel details
- **User profiles** (skills, address settings, avatar upload)
- **Guest mode** with default profile and reduced job-fetch scope
- **Password reset flow** via email
- **AI skills assistant** (`/api/ai/assist-skills`) for CV/job-input-based skill suggestions

## Tech Stack

### Frontend

- React 19
- Vite 7
- React Router DOM 7
- Lucide React
- Jest + Testing Library

### Backend

- Node.js (>= 24.0.0)
- Express 5
- PostgreSQL (`pg`, Neon-compatible)
- JWT + HTTP-only cookies
- bcrypt
- Nodemailer
- Multer
- Firebase Admin (avatar storage)
- OpenAI SDK (skills assistance)
- Zod (structured AI output validation)

### Tooling

- ESLint + Prettier
- Husky
- Concurrently
- Jest

## API Routes

### User Management (`/api/users`)

- `POST /api/users` — Register user (rate limited)
- `POST /api/users/login` — Login (rate limited)
- `POST /api/users/logout` — Logout (auth required)
- `GET /api/users/me` — Get current profile (auth required)
- `PUT /api/users/profile` — Update profile (auth required)
- `POST /api/users/update-avatar` — Upload avatar (auth required, 6MB image limit)
- `POST /api/users/change-password` — Change password (auth required)
- `POST /api/users/change-skills` — Update skills (auth required)
- `POST /api/users/favorites/toggle` — Toggle favorite job (auth required)
- `DELETE /api/users/delete` — Delete account (auth required)
- `POST /api/users/forgot-password` — Start reset flow
- `POST /api/users/reset-password` — Complete reset flow

### Job Search (`/api/jobs`)

- `POST /api/jobs/search` — Search jobs
  - Route is mounted with token middleware, but middleware explicitly allows unauthenticated access for this endpoint.
  - Authenticated users trigger broader fetch behavior and background scraper persistence.

### Travel (`/api/travel`)

- `POST /api/travel/batch` — Batch commute calculations for multiple locations

### AI (`/api/ai`)

- `POST /api/ai/assist-skills` — Generate skills from CV/free-text input

## Job Fetch Architecture

Job search combines caching, RapidAPI fetches, and background scraper persistence:

1. Validate request (`search_string`)
2. Check DB cache for full query (auth-aware)
3. Trigger background Apify scraper persistence flow (for authenticated users)
4. Split query into words for broader coverage
5. Reuse cache or fetch via LinkedIn RapidAPI per search word
6. Normalize, deduplicate, and return aggregated jobs

## Security Notes

- JWT authentication via HTTP-only cookie (`token`)
- Auth limiter for register/login (5 requests per 5 minutes)
- Password hashing with bcrypt
- Avatar upload type + size validation
- Password reset token workflow

## Prerequisites

- Node.js >= 24.0.0
- npm
- PostgreSQL database
- RapidAPI key (LinkedIn jobs)
- Apify key (LinkedIn scraper)
- Google Maps API key
- Firebase service account + storage bucket
- SMTP credentials
- OpenAI API key (AI skills assistant)

## Environment Variables

### Server (`server/.env`)

```dotenv
PORT=3000
DATABASE_URL=
X_RAPIDAPI_KEY=
LINKEDIN_SCRAPER_KEY=
JWT_EXPIRES_IN=
JWT_SECRET=
DONATION_URL=
GOOGLE_MAPS_API_KEY=
VITE_FRONTEND_URL=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
STORAGE_BUCKET=
GOOGLE_APPLICATION_CREDENTIALS=
OPENAI_API_KEY=
```

### Client (`client/.env`)

```dotenv
VITE_BACKEND_URL=http://localhost:3000
```

## Getting Started

1. Install dependencies (root + client + server):

```bash
npm run setup
```

2. Create env files:

- Copy `server/.env.example` to `server/.env`
- Copy `client/.env.example` to `client/.env`

3. Start development servers:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Root Scripts

- `npm run dev` — Run client and server in parallel
- `npm run start` — Start production server (`server/src/index`)
- `npm run build:client` — Build frontend
- `npm run setup` — Install client and server dependencies
- `npm run test` — Run client and server tests
- `npm run lint` — Run client and server lint
- `npm run code-style-check` — Prettier check + lint (client and server)

## Deployment

- `Procfile` starts the app via `npm run start`
- `heroku-postbuild` runs setup and client build:

```bash
npm run heroku-postbuild
```

## Contributors

- **Yaroslav Kazeev** - HYF alumni - [GitHub](https://github.com/YaroslavKazeev) | [LinkedIn](https://www.linkedin.com/in/yaroslavkazeev/)
- **Yahya Al-Ademi** - HYF alumni - [GitHub](https://github.com/YahyaAl-Ademi) | [LinkedIn](https://www.linkedin.com/in/yahya-al-ademi-12786555/)
- **Stas Seldin** - DevOps, Education Director - [GitHub](https://github.com/stasel) | [LinkedIn](https://www.linkedin.com/in/stasel/)

## Contact

Questions or feedback: [jobcompass2025@gmail.com](mailto:jobcompass2025@gmail.com?subject=Question%20about%20JobCompass)

## License

ISC

## Acknowledgments

- Based on [c53-final-project-group-A](https://github.com/HackYourFutureProjects/c53-final-project-group-A)
- Thanks to all mentors and contributors who supported the project
