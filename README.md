# ProfPortfolio (MVP)

Монорепо из двух частей:

- `server/` — Node.js + Express + Prisma + PostgreSQL + JWT
- `client/` — React (Vite) + Tailwind CSS + Lucide React

## Требования

- Node.js **LTS** (рекомендуется 20+)
- PostgreSQL 14+

## Быстрый старт (Windows / PowerShell)

### 1) База данных

Создайте пустую БД, например `profportfolio`, и пользователя с доступом (или используйте существующего).

### 2) Backend

Перейдите в папку `server` и создайте `.env` на основе примера:

- `server\.env.example` → `server\.env`

Затем:

```powershell
cd server
npm install
npm run prisma:migrate
npm run dev
```

Сервер поднимется на `http://localhost:4000`.

### 3) Frontend

В отдельном терминале:

```powershell
cd client
npm install
npm run dev
```

Клиент поднимется на `http://localhost:5173`.

## Запуск не только локально (production)

Чтобы приложением могли пользоваться другие люди, разверните его на сервере/VPS или PaaS.

### 1) Backend (API)

В `server/.env` задайте:

- `PORT` (например, `4000`)
- `DATABASE_URL` (адрес вашей PostgreSQL)
- `JWT_SECRET` (длинный случайный ключ)
- `CLIENT_ORIGIN` (домен фронтенда, можно несколько через запятую)

Запуск:

```powershell
cd server
npm install
npm run prisma:migrate
npm start
```

### 2) Frontend (статическая сборка)

В `client/.env` задайте URL API:

- `VITE_API_URL=https://api.your-domain.com`

Сборка:

```powershell
cd client
npm install
npm run build
```

После этого раздавайте папку `client/dist` через Nginx/Apache/Caddy/любой static hosting.

### 3) Домен и сеть

- Направьте домены на сервер (например, `app.your-domain.com` и `api.your-domain.com`).
- Откройте нужные порты в firewall/security group.
- Включите HTTPS (Let's Encrypt / встроенные сертификаты на платформе).

## Основные маршруты

### Auth

- `POST /api/auth/register` — регистрация
- `POST /api/auth/login` — логин
- `GET /api/auth/me` — получить текущего пользователя (JWT)

### Личный кабинет (JWT)

- `GET /api/me/dashboard` — профиль + навыки + проекты + достижения
- `PUT /api/me/profile` — редактировать профиль
- `POST /api/me/skills` / `DELETE /api/me/skills/:id`
- `POST /api/me/projects` / `DELETE /api/me/projects/:id`
- `POST /api/me/achievements` / `DELETE /api/me/achievements/:id`

### Публичное портфолио

- `GET /api/portfolio/:username` — публичные данные пользователя

