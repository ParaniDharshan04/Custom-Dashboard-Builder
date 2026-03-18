# Deployment Guide

This project can be deployed to various cloud platforms. Here are the configuration files and instructions for each:

## 🐳 Docker Deployment

### Local Docker
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build and run manually
docker build -t dashboard-builder .
docker run -p 8000:8000 dashboard-builder
```

### Production Docker
```bash
# Build for production
docker build -t dashboard-builder .

# Run with environment variables
docker run -p 8000:8000 \
  -e DATABASE_URL="your-database-url" \
  -e SECRET_KEY="your-secret-key" \
  dashboard-builder
```

## ☁️ Cloud Platform Deployments

### Railway
1. Connect your GitHub repository to Railway
2. Railway will automatically detect the `railway.json` configuration
3. Set environment variables in Railway dashboard:
   - `DATABASE_URL`
   - `SECRET_KEY`
   - `ALLOWED_ORIGINS`

### Render
1. Connect your GitHub repository to Render
2. Render will use the `render.yaml` configuration
3. Database will be automatically provisioned
4. Environment variables are configured in the YAML file

### Heroku
1. Install Heroku CLI and login
2. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```
3. Add PostgreSQL addon:
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```
4. Set environment variables:
   ```bash
   heroku config:set SECRET_KEY="your-secret-key"
   heroku config:set ALLOWED_ORIGINS="https://your-app-name.herokuapp.com"
   ```
5. Deploy:
   ```bash
   git push heroku main
   ```

### Vercel (Frontend + Serverless Backend)
1. Connect your GitHub repository to Vercel
2. Vercel will use the `vercel.json` configuration
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `SECRET_KEY`

## 🔧 Environment Variables

Required environment variables for production:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host:port/dbname

# Security
SECRET_KEY=your-super-secret-key-min-32-chars

# CORS (comma-separated list of allowed origins)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional: AI Features
GOOGLE_API_KEY=your-google-gemini-api-key
```

## 📋 Pre-deployment Checklist

- [ ] Set strong `SECRET_KEY` (32+ characters)
- [ ] Configure production database
- [ ] Set correct `ALLOWED_ORIGINS`
- [ ] Test health endpoint: `/health`
- [ ] Verify database migrations run: `alembic upgrade head`
- [ ] Test API endpoints: `/api/docs`

## 🔍 Monitoring

- Health check endpoint: `GET /health`
- API documentation: `/docs`
- Database status: Check connection in logs
- Frontend: Served from `/` (root path)

## 🚀 Quick Deploy Commands

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### Render
```bash
# Just push to GitHub - Render auto-deploys
git push origin main
```

### Docker
```bash
# Quick production build
docker build -t dashboard-builder .
docker run -p 8000:8000 --env-file .env dashboard-builder
```