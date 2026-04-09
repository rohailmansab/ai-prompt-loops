# AI Prompt Engineering Hub

A production-ready web platform for discovering, creating, and mastering AI prompts.

## Tech Stack

- **Frontend:** React (Vite) + React Router + Framer Motion
- **Backend:** Node.js + Express
- **Database:** MySQL
- **Authentication:** JWT
- **SEO:** Dynamic meta tags, Schema markup, Sitemap

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+

### 1. Database Setup

```sql
CREATE DATABASE ai_prompt_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm install
npm run dev
```

The backend auto-creates tables and seeds sample data on first run.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

### Admin Panel

- URL: `http://localhost:5173/admin`
- Username: `admin`
- Password: `admin123`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Admin login |
| GET | /api/prompts | List prompts |
| GET | /api/prompts/:slug | Get prompt |
| POST | /api/prompts | Create prompt (auth) |
| PUT | /api/prompts/:id | Update prompt (auth) |
| DELETE | /api/prompts/:id | Delete prompt (admin) |
| GET | /api/categories | List categories |
| GET | /api/blog | List blog posts |
| GET | /api/blog/:slug | Get blog post |
| GET | /api/seo/sitemap.xml | Dynamic sitemap |
| GET | /api/seo/robots.txt | Robots.txt |

## Deployment

### VPS / Standard Hosting

1. Build frontend: `cd frontend && npm run build`
2. Configure Nginx/Apache to serve `frontend/dist`
3. Run backend with PM2: `pm2 start backend/src/server.js --name api`
4. Set up SSL certificate
5. Update `.env` with production values

### Folder Structure

```
ai-prompt-hub/
├── frontend/          # React Vite app
│   ├── src/
│   │   ├── components/   # Shared UI components
│   │   ├── pages/        # Page components
│   │   ├── pages/admin/  # Admin panel pages
│   │   ├── services/     # API client
│   │   ├── context/      # Auth context
│   │   └── index.css     # Global styles
│   └── vite.config.js
├── backend/           # Express API
│   ├── src/
│   │   ├── config/       # DB config & seed
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth & error handling
│   │   ├── routes/       # Express routes
│   │   ├── utils/        # Helpers
│   │   └── server.js     # Entry point
│   └── .env
└── README.md
```

## License

ISC
