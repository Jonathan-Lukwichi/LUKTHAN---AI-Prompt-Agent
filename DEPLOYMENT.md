# LUKTHAN AI Deployment Guide

Deploy LUKTHAN AI Prompt Agent to production. Choose the option that best fits your needs.

---

## Prerequisites

1. **Gemini API Key** - Get one free at [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Git** - Push your code to GitHub
3. **Node.js 18+** and **Python 3.11+** (for local testing)

---

## Option 1: Vercel + Railway (Recommended)

**Cost:** Free tier available | **Difficulty:** Easy | **Time:** ~15 minutes

### Step 1: Deploy Backend to Railway

1. Go to [Railway.app](https://railway.app) and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository and choose the `backend` folder
4. Add environment variables:
   ```
   GEMINI_API_KEY=your_api_key_here
   SECRET_KEY=generate_a_random_string
   ALLOWED_HOSTS=https://your-frontend.vercel.app
   DATABASE_URL=sqlite:///./lukthan.db
   DEBUG=false
   ```
5. Railway will auto-detect Python and deploy
6. Copy your backend URL (e.g., `https://lukthan-backend.railway.app`)

### Step 2: Deploy Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com) and sign up with GitHub
2. Click "Import Project" → Select your repository
3. Set the **Root Directory** to `frontend`
4. Add environment variable:
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app/api
   ```
5. Click "Deploy"

### Step 3: Update CORS

Go back to Railway and update `ALLOWED_HOSTS` with your Vercel URL:
```
ALLOWED_HOSTS=https://your-app.vercel.app
```

---

## Option 2: Render (All-in-One)

**Cost:** Free tier available | **Difficulty:** Easy | **Time:** ~20 minutes

### Deploy Backend

1. Go to [Render.com](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (same as Railway)
6. Deploy

### Deploy Frontend

1. Click "New" → "Static Site"
2. Connect the same repo
3. Configure:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Add environment variable:
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com/api
   ```
5. Deploy

---

## Option 3: Docker (VPS/Self-Hosted)

**Cost:** ~$5-10/mo for VPS | **Difficulty:** Medium | **Time:** ~30 minutes

### Prerequisites
- A VPS (DigitalOcean, Linode, AWS EC2, etc.)
- Docker and Docker Compose installed

### Step 1: Clone and Configure

```bash
# Clone your repository
git clone https://github.com/your-username/lukthan-ai-prompt-agent.git
cd lukthan-ai-prompt-agent

# Create environment file
cat > .env << EOF
GEMINI_API_KEY=your_api_key_here
SECRET_KEY=$(openssl rand -hex 32)
EOF
```

### Step 2: Update Frontend Environment

Edit `frontend/.env.production`:
```
VITE_API_BASE_URL=http://your-server-ip:8000/api
```

Or for domain:
```
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### Step 3: Build and Run

```bash
# Build and start containers
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 4: Setup Reverse Proxy (Optional but Recommended)

Install Nginx and configure SSL with Certbot:

```bash
# Install Nginx
sudo apt install nginx certbot python3-certbot-nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/lukthan
```

Add:
```nginx
server {
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/lukthan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

---

## Option 4: DigitalOcean App Platform

**Cost:** ~$5/mo | **Difficulty:** Easy | **Time:** ~20 minutes

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App" → Connect GitHub
3. Add two components:
   - **Backend (Web Service):** Point to `backend` folder
   - **Frontend (Static Site):** Point to `frontend` folder
4. Configure environment variables
5. Deploy

---

## Environment Variables Reference

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Gemini API key | `AIza...` |
| `DATABASE_URL` | Database connection | `sqlite:///./lukthan.db` |
| `SECRET_KEY` | App secret key | Random 32+ char string |
| `ALLOWED_HOSTS` | CORS allowed origins | `https://app.com,https://www.app.com` |
| `DEBUG` | Debug mode | `false` (production) |

### Frontend (.env.production)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://api.yourdomain.com/api` |

---

## Post-Deployment Checklist

- [ ] Backend health check: `https://your-backend/health` returns `{"status": "healthy"}`
- [ ] Frontend loads without errors
- [ ] Chat functionality works (test "Hello!")
- [ ] Prompt optimization works
- [ ] CORS is properly configured (no console errors)
- [ ] SSL certificates are valid (if using custom domain)

---

## Troubleshooting

### CORS Errors
Ensure `ALLOWED_HOSTS` in backend includes your frontend URL exactly (with `https://`).

### API Connection Failed
Check that `VITE_API_BASE_URL` ends with `/api` and points to your backend.

### Gemini API Errors
1. Verify API key is correct
2. Check API key has Gemini API enabled in Google Cloud Console
3. Ensure you're using `gemini-2.0-flash` model (older models deprecated)

### Docker Issues
```bash
# Rebuild without cache
docker-compose build --no-cache

# Check logs
docker-compose logs backend
docker-compose logs frontend
```

---

## Scaling Considerations

For high traffic:
1. **Database:** Migrate from SQLite to PostgreSQL
2. **Caching:** Add Redis for session/response caching
3. **CDN:** Put Cloudflare in front for static assets
4. **Multiple Instances:** Use Railway/Render autoscaling or Kubernetes

---

Need help? Open an issue on GitHub!
