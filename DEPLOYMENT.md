# Deployment Guide

## 🚀 Deploying to Production

This guide covers deploying the AI WhatsApp Business Automation CRM to production.

---

## Backend Deployment (Node.js)

### Option 1: Deploy to Heroku

#### Prerequisites
- Heroku account (free tier available)
- Heroku CLI installed

#### Steps

1. **Login to Heroku**
```bash
heroku login
```

2. **Create Heroku App**
```bash
heroku create your-app-name
```

3. **Add MongoDB (using MongoDB Atlas)**
```bash
# Create MongoDB cluster on atlas.mongodb.com
# Copy connection string
heroku config:set MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/db
```

4. **Set Environment Variables**
```bash
heroku config:set JWT_SECRET=your_production_secret
heroku config:set GEMINI_API_KEY=your_gemini_key
heroku config:set RAZORPAY_KEY_ID=your_key
heroku config:set RAZORPAY_KEY_SECRET=your_secret
# ... add all other environment variables
```

5. **Create Procfile**
```bash
echo "web: node server.js" > Procfile
```

6. **Deploy**
```bash
git push heroku main
```

7. **View Logs**
```bash
heroku logs --tail
```

### Option 2: Deploy to Railway

1. Connect GitHub repository to Railway
2. Select the backend folder
3. Add environment variables in dashboard
4. Deploy automatically on push

### Option 3: Deploy to DigitalOcean

1. Create Ubuntu 20.04 droplet
2. SSH into droplet
3. Install Node.js and MongoDB
4. Clone repository
5. Set environment variables
6. Run with PM2 for process management

```bash
# Install PM2
npm install -g pm2

# Start app
pm2 start server.js
pm2 save

# Restart on reboot
pm2 startup
```

---

## Frontend Deployment (React)

### Option 1: Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Select GitHub repository
   - Configure build settings:
     - Framework: Next.js (or React)
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `build`

3. **Set Environment Variables**
```
REACT_APP_API_URL=https://your-backend-url.com/api
```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically deploy on push

### Option 2: Deploy to Netlify

1. **Build Production**
```bash
cd frontend
npm run build
```

2. **Connect to Netlify**
   - Drag and drop `build` folder to Netlify
   - Or connect GitHub for automatic deployments

3. **Configure Redirects**
   - Create `public/_redirects`:
   ```
   /* /index.html 200
   ```

### Option 3: Deploy to AWS S3 + CloudFront

1. **Build**
```bash
npm run build
```

2. **Upload to S3**
   - Create S3 bucket
   - Upload `build` folder contents
   - Make objects public

3. **Setup CloudFront**
   - Create distribution pointing to S3
   - Set default root object to `index.html`

---

## Database Setup (MongoDB Atlas)

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free

2. **Create Cluster**
   - Choose AWS, select region (closest to users)
   - Choose M0 free tier

3. **Create Database User**
   - Username: your_username
   - Password: strong_password
   - Note the connection string

4. **Whitelist IP**
   - Add 0.0.0.0/0 to allow all IPs
   - (Restrict in production)

5. **Use Connection String**
```
mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

---

## Environment Variables for Production

### Backend

```env
# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# Security
JWT_SECRET=use_a_very_long_random_string_here
DEVELOPER_CODE=another_long_random_code_here

# API Keys
GEMINI_API_KEY=your_production_gemini_key
SENDGRID_API_KEY=your_sendgrid_key

# Payment (Production Keys)
RAZORPAY_KEY_ID=live_key_id
RAZORPAY_KEY_SECRET=live_key_secret
STRIPE_SECRET_KEY=sk_live_your_stripe_key

# WhatsApp
WHATSAPP_PHONE_ID=your_phone_id
WHATSAPP_ACCESS_TOKEN=your_access_token

# App Settings
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
```

### Frontend

```env
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_ENV=production
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)

1. **Install Certbot**
```bash
sudo apt-get install certbot python3-certbot-nginx
```

2. **Generate Certificate**
```bash
sudo certbot certonly --standalone -d yourdomain.com
```

3. **Configure Nginx**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
    }
}
```

4. **Renew Certificate**
```bash
sudo certbot renew --dry-run
```

---

## Performance Optimization

### Backend Optimization

1. **Enable Compression**
```javascript
const compression = require('compression');
app.use(compression());
```

2. **Cache Headers**
```javascript
app.use((req, res, next) => {
  res.header('Cache-Control', 'public, max-age=3600');
  next();
});
```

3. **Database Indexing**
```javascript
// Create indexes for frequently queried fields
userSchema.index({ email: 1, createdAt: -1 });
chatSchema.index({ userId: 1, timestamp: -1 });
```

### Frontend Optimization

1. **Code Splitting**
```javascript
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Chat = lazy(() => import('./pages/Chat'));
```

2. **Image Optimization**
   - Use WebP format
   - Lazy load images
   - Compress images

3. **Build Optimization**
```bash
npm run build
# Check bundle size
npm install -g serve
serve -s build
```

---

## Monitoring & Logging

### Application Monitoring

1. **PM2 Monitoring**
```bash
npm install -g pm2
pm2 monit
```

2. **Sentry (Error Tracking)**
```javascript
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "your-sentry-dsn" });
```

3. **Datadog or New Relic**
   - Sign up for free tier
   - Install agent
   - Monitor performance

### Log Management

1. **Winston Logger**
```javascript
const winston = require('winston');
const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

2. **ELK Stack** (Elasticsearch, Logstash, Kibana)
   - Centralized logging
   - Real-time monitoring

---

## Security Checklist

- [ ] All API keys in environment variables
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Password hashing with bcrypt
- [ ] JWT validation on protected routes
- [ ] Helmet security headers enabled
- [ ] Database backups enabled
- [ ] Firewall rules configured
- [ ] Dependencies updated
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens if needed

---

## Scaling Strategies

### Horizontal Scaling

1. **Load Balancer** (Nginx)
```nginx
upstream backend {
    server server1:5000;
    server server2:5000;
    server server3:5000;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
    }
}
```

2. **Docker Containerization**
```bash
docker build -t whatsapp-crm .
docker run -p 5000:5000 whatsapp-crm
```

3. **Kubernetes Deployment**
   - Deploy containers in Kubernetes
   - Auto-scaling based on load

### Database Scaling

1. **Read Replicas**
   - Set up MongoDB replica sets
   - Read from secondary nodes

2. **Connection Pooling**
   - Use connection pools for efficiency
   - Reduce database connections

---

## Backup & Recovery

### Database Backups

```bash
# Backup MongoDB
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/db" --out=./backup

# Restore
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/db" ./backup
```

### Automated Backups

1. **MongoDB Atlas Automatic Backups**
   - Enable in cluster settings
   - Backups every 6 hours

2. **Cloud Storage**
   - Backup to AWS S3
   - Backup to Google Cloud Storage

---

## Continuous Integration/Deployment (CI/CD)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy backend
        run: |
          # Deploy backend
      - name: Deploy frontend
        run: |
          # Deploy frontend
```

---

## Post-Deployment

1. **Test All Features**
   - Register new user
   - Send messages
   - Process payments
   - Check automations

2. **Monitor Performance**
   - Check response times
   - Monitor error rates
   - Watch resource usage

3. **Plan Maintenance**
   - Schedule database backups
   - Update dependencies monthly
   - Review security logs

---

## Support & Troubleshooting

- Check application logs
- Monitor error tracking (Sentry)
- Review database performance
- Test API endpoints
- Check SSL certificate expiration

---

## Cost Estimation

| Service | Free Tier | Price |
|---------|-----------|-------|
| Heroku | 550 hours/month | $7-9000+/month |
| Vercel | Unlimited | starts at $20 |
| MongoDB Atlas | 512MB | pay-as-you-go |
| Stripe/Razorpay | - | 2-3% per transaction |
| SendGrid | 100/day | $19+/month |

**Estimated monthly cost for small business: $50-100**

---

Happy deploying! 🚀
