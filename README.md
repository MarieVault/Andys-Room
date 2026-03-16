# Andy's Room

A roleplay dashboard and storytelling companion app. Manage characters, stories, scenarios, and scenes — with a clean dark UI built for creative writers.

## Features

- 🎭 **Character roster** — build and manage a cast of characters with portraits, personalities, and tags
- 📖 **Stories** — create and track ongoing narratives
- 🎬 **Scenes** — write and organise individual scenes within stories
- 🗺️ **Scenarios** — define reusable scene setups and settings
- ⚙️ **Settings** — manage locations and atmospheres for your stories

## Tech Stack

- **Frontend:** React, Vite, React Router, CSS Modules
- **Backend:** Express.js (Node.js)
- **Database:** SQLite via better-sqlite3
- **Portraits:** Local file storage

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

```bash
git clone https://github.com/MarieVault/Andys-Room.git
cd Andys-Room
```

Install backend:
```bash
cd backend
npm install
```

Install frontend:
```bash
cd frontend
npm install
```

### Run

Backend (port 3001):
```bash
cd backend
npm start
```

Frontend (port 3000):
```bash
cd frontend
npm run dev
```

Or for production, build the frontend and serve via nginx:
```bash
cd frontend
npm run build
# serve dist/ via nginx or any static server
```

### Configuration

No `.env` required for basic setup. The backend creates `andy.db` automatically on first run.

To change ports, edit:
- `backend/index.js` — `const PORT = 3001`
- `frontend/vite.config.js` — dev server port

---

## Project Structure

```
backend/
  index.js        Express API + SQLite
  andy.db         Database (auto-created, not in git)
  seed.js         Seed script for default characters

frontend/
  src/
    pages/        React page components
    App.jsx       Router + layout
  dist/           Production build (not in git)
```

---

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/characters | List all characters |
| POST | /api/characters | Create character |
| PUT | /api/characters/:id | Update character |
| DELETE | /api/characters/:id | Delete character |
| GET | /portraits/:file | Serve portrait image |
| GET | /api/stories | List stories |
| GET | /api/scenarios | List scenarios |
| GET | /api/settings | List settings |

---

## License

MIT
