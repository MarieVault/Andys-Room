# Bootstrap Guide — Andy's Room

Full setup from zero to running instance.

---

## 1. Clone & Install

```bash
git clone https://github.com/MarieVault/Andys-Room.git
cd Andys-Room
```

Install dependencies for both backend and frontend:

```bash
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

---

## 2. Add Character Portraits

Create a portraits directory and add your character images:

```bash
mkdir -p attachments/characters
# add .jpg portrait files here
# reference them by filename in the character form
```

---

## 3. Seed Default Characters (optional)

The backend will create an empty `andy.db` on first run. To seed example characters:

```bash
cd backend
node seed.js
```

---

## 4. Run (Development)

Start the backend:
```bash
cd backend
npm start
# API running on http://localhost:3001
```

Start the frontend:
```bash
cd frontend
npm run dev
# UI running on http://localhost:3000
```

---

## 5. Production Build

Build the frontend:
```bash
cd frontend
npm run build
# outputs to frontend/dist/
```

Serve via nginx (recommended):

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Portraits
    location /portraits/ {
        proxy_pass http://localhost:3001;
    }
}
```

Or serve the built frontend as static files:

```nginx
location / {
    root /path/to/Andys-Room/frontend/dist;
    try_files $uri $uri/ /index.html;
}
```

---

## 6. Keep Running (PM2)

```bash
npm install -g pm2
cd backend && pm2 start index.js --name andy-backend
pm2 save && pm2 startup
```

---

## Upgrading

```bash
git pull
cd backend && npm install
cd frontend && npm install && npm run build
pm2 restart andy-backend
```

---

## Troubleshooting

**Port already in use**
- Change `PORT` in `backend/index.js`

**Portraits not showing**
- Check `attachments/characters/` exists and contains `.jpg` files
- Filenames must match `portrait_file` field in the database

**Database errors**
- Delete `backend/andy.db` and restart to get a fresh database
- Run `node seed.js` to repopulate with defaults

---

## License

MIT
