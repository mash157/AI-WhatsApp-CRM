# WhatsApp CRM - Complete Project Startup Guide

## Prerequisites
- ✅ Node.js installed (check: `node --version`)
- ✅ Docker Desktop installed and running
- ✅ MongoDB setup (completed in QUICK_START_MONGODB.md)

---

## Step 1: Start MongoDB (Terminal 1)

### PowerShell
```powershell
docker-compose up -d
docker-compose ps
```

**Expected Output:**
```
NAME                    STATUS
whatsapp_mongodb        Up (healthy)
whatsapp_mongo_express  Up
```

### Verify MongoDB Connection
```powershell
mongosh "mongodb://whatsapp_admin:whatsapp_secure_password_123@localhost:27017/whatsappdb?authSource=admin" --eval "print('✅ Connected!')"
```

---

## Step 2: Start Backend Server (Terminal 2)

### Navigate to Backend
```powershell
cd backend
```

### Install Dependencies (First Time Only)
```bash
npm install
```

### Create .env File
```bash
copy .env.example .env
```

### Verify .env Contains
```env
MONGO_URI=mongodb://whatsapp_admin:whatsapp_secure_password_123@localhost:27017/whatsappdb?authSource=admin
MONGODB_DB_NAME=whatsappdb
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here_change_it_in_production
```

### Start Backend
```bash
npm start
```

**Expected Output:**
```
✅ MongoDB connected successfully
Server running on port 5000
```

---

## Step 3: Start Frontend (Terminal 3)

### Navigate to Frontend
```powershell
cd frontend
```

### Install Dependencies (First Time Only)
```bash
npm install
```

### Create .env File (Optional)
```bash
copy .env.example .env
```

Or create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Start Frontend
```bash
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view app in the browser at:
  http://localhost:3000
```

---

## Step 4: Verify Everything Works

### Test API Health
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-04-11T...",
  "mongodb": "connected"
}
```

### Open in Browser
- Frontend: http://localhost:3000
- Mongo Express: http://localhost:8081 (admin/admin123)

---

## Complete Terminal Setup

### Terminal 1: MongoDB
```bash
docker-compose up -d
docker-compose logs -f mongodb
```

### Terminal 2: Backend
```bash
cd backend
npm install
npm start
```

### Terminal 3: Frontend
```bash
cd frontend
npm install
npm start
```

---

## If Something Goes Wrong

### Backend Not Starting
```bash
# Check Node version
node --version

# Clear npm cache
npm cache clean --force

# Reinstall
cd backend
rm -r node_modules
npm install
npm start
```

### MongoDB Connection Error
```bash
# Check MongoDB is running
docker-compose ps

# View logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Port Already in Use
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Or use different port in .env
# PORT=5001
```

### Frontend Build Issues
```bash
cd frontend
rm -r node_modules package-lock.json
npm install
npm start
```

---

## Expected Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React)                 │
│      http://localhost:3000              │
└─────────────┬───────────────────────────┘
              │ API Calls
              ↓
┌─────────────────────────────────────────┐
│      Backend (Node.js/Express)          │
│      http://localhost:5000              │
└─────────────┬───────────────────────────┘
              │ Database Queries
              ↓
┌─────────────────────────────────────────┐
│   MongoDB (Docker Container)            │
│    localhost:27017                      │
└─────────────────────────────────────────┘
```

---

## Project Structure

```
WhatsApp Business Automation CRM/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── .env
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── docker-compose.yml
└── README.md
```

---

## Development Workflow

1. **Start Services** (in order)
   - MongoDB: `docker-compose up -d`
   - Backend: `npm start` (from backend/)
   - Frontend: `npm start` (from frontend/)

2. **Make Changes**
   - Edit code in your IDE
   - Frontend auto-reloads on save
   - Backend may need manual restart

3. **Check Status**
   - Frontend: http://localhost:3000
   - API Health: http://localhost:5000/api/health
   - Database: http://localhost:8081

4. **Stop Services** (in reverse order)
   - Stop Frontend: Ctrl+C
   - Stop Backend: Ctrl+C
   - Stop MongoDB: `docker-compose down`

---

## Useful Commands

### Backend
```bash
# Start with npm
npm start

# List available scripts
npm run

# Test database connection
npm run test:db

# Seed database (if available)
npm run seed
```

### Frontend
```bash
# Start development
npm start

# Build for production
npm run build

# Run tests
npm test
```

### MongoDB
```bash
# Start containers
docker-compose up -d

# Stop containers (keep data)
docker-compose down

# View logs
docker-compose logs -f

# Connect to MongoDB
mongosh "mongodb://whatsapp_admin:whatsapp_secure_password_123@localhost:27017/whatsappdb?authSource=admin"
```

---

## Troubleshooting Checklist

- [ ] Docker Desktop is running
- [ ] MongoDB containers are running (`docker-compose ps`)
- [ ] Backend .env file exists and has MongoDB URI
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:3000
- [ ] API responds to http://localhost:5000/api/health
- [ ] MongoDB Compass or Mongo Express shows database

---

## First Time Setup (Complete Fresh Start)

```powershell
# Terminal 1 - MongoDB
docker-compose up -d

# Terminal 2 - Backend
cd backend
copy .env.example .env
npm install
npm start

# Terminal 3 - Frontend (in new terminal)
cd frontend
npm install
npm start
```

Wait for all to complete, then open: http://localhost:3000

---

## Next Steps

1. ✅ All services running
2. ✅ API responding
3. 🔄 Create user account (register page)
4. 🔄 Login to dashboard
5. 🔄 Configure WhatsApp integration
6. 🔄 Set up automations
7. 🔄 Monitor analytics

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Kill process or use PORT=3001 npm start |
| Port 5000 in use | Kill process or change PORT in .env |
| MongoDB connection failed | Check .env MONGO_URI and docker-compose ps |
| CORS errors | Frontend .env needs correct API_URL |
| Blank page | Check browser console for errors (F12) |
| Backend won't start | Check Node version, clear node_modules |

---

## Support

Check these files for help:
- `QUICK_START_MONGODB.md` - MongoDB setup
- `MONGODB_COMMANDS.md` - Database commands
- `README.md` - Project overview
- Backend logs - Debug issues

---

## Ready to Go! 🚀

All three services should now be running. Open http://localhost:3000 and start building!
