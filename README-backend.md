# Productivity Hub Backend

Supabase-powered REST API backend for the Productivity Hub application.

## 🏗️ Architecture

- **Framework**: Express.js with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (OTP-based email auth)
- **Security**: RLS policies, rate limiting, CORS, Helmet.js
- **Logging**: Winston

## 📋 Prerequisites

- Node.js >= 18.0.0
- Supabase account and project
- npm or yarn

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Run Migrations

Execute the SQL migrations in your Supabase SQL Editor:

```bash
# Run migrations in order:
# 1. migrations/001_initial_schema.sql
# 2. migrations/002_rls_policies.sql
```

### 4. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:3001`

## 🧪 Testing

```bash
npm test
```

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t productivity-backend .
```

### Run Container

```bash
docker run -p 3001:3001 \
  -e SUPABASE_URL=https://your-project.supabase.co \
  -e SUPABASE_ANON_KEY=your-key \
  -e SUPABASE_SERVICE_KEY=your-service-key \
  -e ALLOWED_ORIGINS=https://yourdomain.com \
  productivity-backend
```

## 🌐 PM2 Deployment

```bash
# Build first
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# View logs
pm2 logs productivity-backend

# Monitor
pm2 monit
```

## 📡 API Endpoints

### Authentication

- `POST /api/v1/auth/send-otp` - Send OTP to email
- `POST /api/v1/auth/verify-otp` - Verify OTP and login
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/session` - Get current session

### Tasks

- `GET /api/v1/tasks` - Get user tasks
- `POST /api/v1/tasks` - Create task
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

### Journal

- `GET /api/v1/journal` - Get journal entries
- `POST /api/v1/journal` - Create entry
- `PUT /api/v1/journal/:id` - Update entry
- `DELETE /api/v1/journal/:id` - Delete entry

### Habits

- `GET /api/v1/habits` - Get habits
- `POST /api/v1/habits` - Create habit
- `PUT /api/v1/habits/:id` - Update habit
- `DELETE /api/v1/habits/:id` - Delete habit
- `GET /api/v1/habits/logs` - Get habit logs
- `POST /api/v1/habits/logs` - Create log
- `PUT /api/v1/habits/logs/:id` - Update log
- `DELETE /api/v1/habits/logs/:id` - Delete log

### Health

- `GET /api/v1/health` - Get health data
- `POST /api/v1/health` - Create health data
- `PUT /api/v1/health/:id` - Update health data
- `DELETE /api/v1/health/:id` - Delete health data

### Goals

- `GET /api/v1/goals` - Get goals
- `POST /api/v1/goals` - Create goal
- `PUT /api/v1/goals/:id` - Update goal
- `DELETE /api/v1/goals/:id` - Delete goal
- `GET /api/v1/goals/milestones` - Get milestones
- `POST /api/v1/goals/milestones` - Create milestone
- `PUT /api/v1/goals/milestones/:id` - Update milestone
- `DELETE /api/v1/goals/milestones/:id` - Delete milestone

## 🔒 Security Features

1. **JWT Authentication**: Bearer token in Authorization header
2. **Row Level Security**: Supabase RLS policies
3. **Rate Limiting**: 100 req/15min general, 5 req/15min auth
4. **CORS**: Configurable allowed origins
5. **Helmet.js**: Security headers
6. **Input Validation**: Zod schemas

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 3001 |
| `SUPABASE_URL` | Supabase project URL | Required |
| `SUPABASE_ANON_KEY` | Supabase anon key | Required |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Required |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | Required |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## 📊 Monitoring

Logs are stored in `logs/` directory:
- `error.log` - Error logs only
- `combined.log` - All logs
- `out.log` - PM2 stdout
- `err.log` - PM2 stderr

## 🚢 Production Deployment

### Option 1: VPS with PM2

```bash
# On your VPS
git clone <repo>
cd backend
npm install
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Option 2: Railway

```bash
railway login
railway init
railway up
```

### Option 3: Render

1. Connect GitHub repository
2. Set environment variables
3. Deploy with build command: `npm run build`
4. Start command: `npm start`

## 🔄 Migration from Old Backend

See `MIGRATION.md` for step-by-step migration guide.

## 📝 License

MIT
