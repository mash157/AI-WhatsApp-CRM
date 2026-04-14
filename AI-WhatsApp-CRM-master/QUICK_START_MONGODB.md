# MongoDB Setup - Step-by-Step Quick Start

## 5-Minute Quick Setup with Docker

### Step 1: Install Docker Desktop
- Download from: https://www.docker.com/products/docker-desktop
- Run installer and complete setup
- Restart your computer
- Open PowerShell and verify: `docker --version`

### Step 2: Run Setup Script (Auto)
**Windows CMD:**
```bash
setup-mongodb.bat
```

**Windows PowerShell:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\setup-mongodb.ps1
```

This will automatically:
- ✅ Check Docker installation
- ✅ Start MongoDB container
- ✅ Start Mongo Express web UI
- ✅ Display connection details

### Step 3: Copy Environment File
```bash
cd backend
copy .env.example .env
```

### Step 4: Start Backend
```bash
npm install
npm start
```

✅ **Done! Your MongoDB is now running!**

---

## Manual Setup (If Auto Script Doesn't Work)

### Step 1: Open PowerShell in Project Root

### Step 2: Start MongoDB
```powershell
docker-compose up -d
```

### Step 3: Wait 10 Seconds

### Step 4: Verify Services Running
```powershell
docker-compose ps
```

You should see:
```
NAME                    STATUS
whatsapp_mongodb        Up (healthy)
whatsapp_mongo_express  Up
```

---

## Access Your Database

### Option 1: Web UI (Easiest)
Open browser: http://localhost:8081
- Username: `admin`
- Password: `admin123`

### Option 2: MongoDB Compass (Recommended)
1. Download from: https://www.mongodb.com/products/tools/compass
2. New Connection
3. Connection String:
   ```
   mongodb://whatsapp_admin:whatsapp_secure_password_123@localhost:27017/whatsappdb?authSource=admin
   ```
4. Click Connect

### Option 3: MongoDB Shell (CLI)
```bash
mongosh "mongodb://whatsapp_admin:whatsapp_secure_password_123@localhost:27017/whatsappdb?authSource=admin"
```

---

## Backend Connection

### File: `backend/.env`
```env
MONGO_URI=mongodb://whatsapp_admin:whatsapp_secure_password_123@localhost:27017/whatsappdb?authSource=admin
MONGODB_DB_NAME=whatsappdb
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
```

### Test Connection
```bash
cd backend
npm start
```

Look for: **✅ MongoDB connected successfully**

---

## Stop Everything

### Stop Services (Keep Data)
```bash
docker-compose down
```

### Stop & Delete Everything
```bash
docker-compose down -v
```

---

## Common Issues

### "Docker daemon is not running"
- Open Docker Desktop application
- Wait for it to fully start
- Try again

### "Port 27017 already in use"
```bash
# Find what's using the port
netstat -ano | findstr :27017

# Stop it or use different port
```

### "Cannot connect from Compass"
- Check MongoDB is running: `docker-compose ps`
- Verify connection string
- Check firewall isn't blocking

---

## Next Steps

1. ✅ MongoDB running locally
2. ✅ Backend connected
3. ✅ Frontend already setup with premium UI
4. 🔄 Create database schemas
5. 🔄 Implement API endpoints
6. 🔄 Test WhatsApp integration
7. 🔄 Deploy to production

---

## Connection Strings for Different Setups

**Local Docker (Current Setup):**
```
mongodb://whatsapp_admin:whatsapp_secure_password_123@localhost:27017/whatsappdb?authSource=admin
```

**MongoDB Atlas (Cloud - Later):**
```
mongodb+srv://whatsapp_admin:<password>@<cluster>.mongodb.net/whatsappdb?retryWrites=true&w=majority
```

**No Auth (Development Only):**
```
mongodb://localhost:27017/whatsappdb
```

---

## Verify Everything Works

### Checklist
- [ ] Docker Desktop installed and running
- [ ] `docker-compose ps` shows 2 healthy containers
- [ ] Can access http://localhost:8081
- [ ] Can login to Mongo Express (admin/admin123)
- [ ] Backend .env configured
- [ ] Backend starts without MongoDB errors
- [ ] MongoDB Compass connects successfully

### Test Command
```powershell
docker exec whatsapp_mongodb mongosh -u whatsapp_admin -p whatsapp_secure_password_123 --authenticationDatabase admin --eval "print('✅ MongoDB is working!')"
```

---

## Files Created

- ✅ `docker-compose.yml` - Container configuration
- ✅ `.env.example` - Environment template
- ✅ `MONGODB_SETUP.md` - Detailed setup guide
- ✅ `MONGODB_COMMANDS.md` - Command reference
- ✅ `setup-mongodb.bat` - Auto setup script (CMD)
- ✅ `setup-mongodb.ps1` - Auto setup script (PowerShell)

---

## Support Commands

**View Logs:**
```bash
docker-compose logs -f mongodb
```

**Restart MongoDB:**
```bash
docker-compose restart mongodb
```

**Shell Access:**
```bash
docker exec -it whatsapp_mongodb mongosh -u whatsapp_admin -p whatsapp_secure_password_123 --authenticationDatabase admin
```

**Check Data:**
```bash
docker exec whatsapp_mongodb mongosh -u whatsapp_admin -p whatsapp_secure_password_123 --authenticationDatabase admin whatsappdb --eval "db.users.countDocuments()"
```

---

## Ready to Go! 🚀

Your MongoDB is now ready for development. Start building amazing features!

Need help? Check these files:
- `MONGODB_SETUP.md` - Detailed setup
- `MONGODB_COMMANDS.md` - All commands
- Backend logs - Debug issues
