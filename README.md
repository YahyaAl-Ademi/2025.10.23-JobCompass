# JobCompass

> Master navigating the sea of irrelevant jobs with **JobCompass**

JobCompass is an advanced job search platform that helps you find ideal positions with smart filtering capabilities, commute calculations, and personalized matching. Tell us your skills, role, and location, and we'll steer you to the right job with the least commute time.

The monorepo features a Vite/React Frontend and an Express/PostgreSQL backend, which also integrates Google Maps for transit times, RapidAPI (for LinkedIn jobs), Firebase Storage for avatars, and email-based password recovery.

## 🎯 Mission

Connect talented professionals with opportunities that match their skills, preferences, and career goals.

## ✨ Features

- **🔍 Smart Filtering and Sorting** - Filter by job type, work mode, and experience level, and sort listings based on what matters most to you
- **⚡ Smart Matching** - Search and browse open roles; surface skills detected in each description.
- **🗺️ Commute Calculator** - See travel time and number of transfers from your home to workplace
- **❤️ Save to Favorites** - Mark interesting job posts to easily view them later
- **✉️ Password Reset** - Recover account access via email with secure, short-lived tokens
- **👤 User Profiles** - Customize your profile with skills, address settings, and avatar uploads
- **👥 Guest Mode** - Try the platform without creating an account (with limited features)

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Lucide React** - Icon library

### Backend

- **Node.js** (>=24.0.0) - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** (Neon DB) - Database
- **Firebase Admin** - File storage and authentication
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Multer** - File upload handling
- **Google Maps API** - Commute calculations

### DevOps & Tools

- **Husky** - Git hooks
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Concurrently** - Run multiple commands
- **express-rate-limit** - API rate limiting
- **Jest** - Testing framework
- **Multer** - File upload handling

## 📁 Project Structure

```
2025.10.23-JobCompass/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── util/          # Utility functions
│   │   └── assets/        # Static assets
│   └── package.json
├── server/                 # Express backend application
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic services
│   │   ├── db/            # Database configuration
│   │   ├── config/        # Configuration files
│   │   ├── data/          # Data files
│   │   └── util/          # Utility functions
│   └── package.json
├── .github/               # GitHub workflows
├── .husky/                # Git hooks
└── package.json           # Root package.json with workspace scripts
```

## Backend Routes Overview

- `POST /api/users` – sign up;
- `POST /api/users/login` / `/logout` – auth via HTTP-only cookie.
- `GET /api/users/me` – current user;
- `PUT /api/users/profile` – update profile fields.
- `POST /api/users/update-avatar` – upload avatar (Multer memory storage → Firebase Storage, 6MB limit, JPEG/PNG/GIF/WebP only).
- `POST /api/users/change-password` / `/change-skills` – profile mutations.
- `POST /api/users/favorites/toggle` – save/unsave a job;
- `DELETE /api/users/delete` – delete account.
- `POST /api/users/forgot-password` / `/reset-password` – email reset flow.
- `POST /api/jobs/search` – search jobs (RapidAPI LinkedIn + local processing, requires authentication).
- `POST /api/travel/batch` – batch transit time + transfer counts for job locations.

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 24.0.0
- **npm** (comes with Node.js)
- **PostgreSQL** database (Neon DB recommended)
- **Firebase** Firebase service account (as JSON string)
- **SMTP credentials**
- **LinkedIn Job Search RapidAPI key**
- **Google Maps API** key for commute calculations

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/YaroslavKazeev/2025.10.23-JobCompass.git
   cd 2025.10.23-JobCompass
   ```

2. **Install dependencies**

   ```bash
   npm run setup
   ```

   This will install dependencies for both client and server.

3. **Set up environment variables**

   In client and server directories, copy and rename the `.env.example` files into `.env`. Set all environmental variables.

4. **Run the development servers**

   ```bash
   npm run dev
   ```

   This will start both the client (Vite dev server) and server (Express with nodemon) concurrently.
   - Frontend: http://localhost:5173 (or the port Vite assigns)
   - Backend: http://localhost:3000 (or your configured PORT)

## 📝 Development Environment

### Recommended VS Code Extensions

For the best experience with this project's documentation and codebase, we recommend installing these VS Code extensions:

- **Markdown All in One** - Enhanced Markdown editing, preview, and syntax highlighting
- **Markdown Preview Mermaid Support** - Render Mermaid diagrams in Markdown preview
- **Mermaid Markdown Syntax Highlighting** - Syntax highlighting for Mermaid diagram code blocks
- **Mermaid Lens** - Interactive Mermaid diagram preview and editing

These extensions will provide full access to the documentation features, including the Entity Relationship Diagram and other visual elements.

## 📜 Available Root Level Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run start` - Start the production server
- `npm run build` - Build the client for production
- `npm run setup` - Install dependencies for both client and server

## 🚢 Deployment

The project is configured for a professional CI/CD pipeline using **GitHub Actions**, **Heroku**, and repository scripts.

### 🔄 CI/CD Pipeline

1.  **Continuous Integration (GitHub Actions)**: Every Pull Request triggers automated workflows:
    - `client-code-style-check`: Runs Prettier and Lint for the frontend.
    - `server-code-style-check`: Runs Prettier and Lint for the backend.
    - (Optional) Performance and unit tests are executed to ensure stability.
2.  **Automated Deployment (Heroku)**:
    - **Review Apps**: Every PR automatically creates a temporary, isolated environment on Heroku. A link is provided in the PR for manual testing and QA.
    - **Production**: Merging to `main` (or `develop`) triggers an automatic deployment to the main Heroku application.

### 🛠️ Build Scripts

The deployment relies on the following scripts in the root `package.json`:

- `heroku-postbuild`: Automatically runs during Heroku's build phase. It sets up dependencies and builds the client production bundle.
  ```bash
  npm run heroku-postbuild
  ```
- `start`: The production start command, as defined in the `Procfile`.
  ```bash
  npm start
  ```

### 🚀 Manual Deployment (Alternative)

If you need to deploy manually from your terminal:

1.  Logged into Heroku CLI: `heroku login`
2.  Add the Heroku remote (if not done): `heroku git:remote -a <your-app-name>`
3.  Push to Heroku:
    ```bash
    git push heroku main
    ```

## 👥 Contributors

This project was developed as part of HackYourFuture's final project by:

- **Yaroslav Kazeev** - HYF trainee - [GitHub](https://github.com/YaroslavKazeev) | [LinkedIn](https://www.linkedin.com/in/yaroslavkazeev/)
- **Hanna Dubyna** - HYF trainee - [GitHub](https://github.com/HannaInIT) | [LinkedIn](https://www.linkedin.com/in/hanna-dubyna/)
- **Yahya Al-Ademi** - HYF trainee - [GitHub](https://github.com/YahyaAl-Ademi) | [LinkedIn](https://www.linkedin.com/in/yahya-al-ademi-12786555/)
- **Stas Seldin** - DevOps, Education Director - [GitHub](https://github.com/stasel) | [LinkedIn](https://www.linkedin.com/in/stasel/)
- **Jana Gombitová** - Product Owner, Scrum Master - [GitHub](https://github.com/janagombitova) | [LinkedIn](https://www.linkedin.com/in/jana-gombitova-42b08394/)
- **Tim Lorent** - Tech Lead - [GitHub](https://github.com/tlorent) | [LinkedIn](https://www.linkedin.com/in/timlorent/)

## 📧 Contact

Have questions or feedback? We would love to hear from you!

Drop us a line at [jobcompass2025@gmail.com](mailto:jobcompass2025@gmail.com?subject=Question about JobCompass) and we will get back to you as soon as possible!

## 📄 License

ISC

## 🙏 Acknowledgments

- Based on [c53-final-project-group-A](https://github.com/HackYourFutureProjects/c53-final-project-group-A), which was a part of the [HackYourFuture](https://www.hackyourfuture.net/) curriculum
- Special thanks to all mentors and contributors who made this project possible
