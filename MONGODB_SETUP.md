# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud) - Recommended for Production

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Sign Up for Free"
3. Create account with email/Google

### Step 2: Create a Free Cluster
1. After login, click "Create a Database"
2. Select "M0 Tier" (Free forever tier)
3. Choose your cloud provider (AWS, Google Cloud, Azure)
4. Select region closest to you
5. Click "Create Deployment"

### Step 3: Set Up Database Access
1. In left sidebar, go to "Database Access"
2. Click "Add New Database User"
3. Username: `whatsapp_admin`
4. Password: Generate secure password (copy it!)
5. Click "Add Database User"

### Step 4: Set Up Network Access
1. In left sidebar, go to "Network Access"
2. Click "Add IP Address"
3. Select "Allow access from anywhere" (for development)
   - For production, add your server IP only
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Databases" in left sidebar
2. Click "Connect" on your cluster
3. Select "Drivers"
4. Choose "Node.js" and version "4.0 and later"
5. Copy the connection string

**Connection String Format:**
```
mongodb+srv://whatsapp_admin:<password>@<cluster>.mongodb.net/whatsappdb?retryWrites=true&w=majority
```

Replace `<password>` with your actual password and `<cluster>` with your cluster name.

---

## Option 2: Local MongoDB Setup (Development)

### Windows - Using Docker Compose (Easiest)

1. Install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)

2. Create a `docker-compose.yml` in your project root:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    container_name: whatsapp_mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: whatsapp_admin
      MONGO_INITDB_ROOT_PASSWORD: whatsapp123
      MONGO_INITDB_DATABASE: whatsappdb
    volumes:
      - mongodb_data:/data/db
    networks:
      - whatsapp_network

volumes:
  mongodb_data:

networks:
  whatsapp_network:
    driver: bridge
```

3. Run MongoDB locally:
```powershell
docker-compose up -d
```

4. Connection String:
```
mongodb://whatsapp_admin:whatsapp123@localhost:27017/whatsappdb?authSource=admin
```

### Windows - Manual Installation

1. Download MongoDB Community from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run installer and follow setup wizard
3. Complete installation (default port: 27017)
4. Connection String:
```
mongodb://localhost:27017/whatsappdb
```

---

## MongoDB Compass Setup (GUI Tool)

### Step 1: Download & Install
1. Go to [MongoDB Compass](https://www.mongodb.com/products/tools/compass)
2. Download for Windows
3. Run installer

### Step 2: Connect to Database

**For MongoDB Atlas Cloud:**
1. Open Compass
2. Click "New Connection"
3. Paste your connection string:
```
mongodb+srv://whatsapp_admin:<password>@<cluster>.mongodb.net/whatsappdb?retryWrites=true&w=majority
```
4. Click "Connect"

**For Local MongoDB (Docker/Local):**
1. Open Compass
2. Click "New Connection"
3. Enter:
   - **Host:** localhost
   - **Port:** 27017
   - **Username:** whatsapp_admin
   - **Password:** whatsapp123 (or your password)
   - **Authentication:** SCRAM-SHA-1
4. Click "Connect"

---

## Backend Configuration

### Step 1: Update `.env` file

Create `.env` in your backend folder:

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://whatsapp_admin:<your_password>@<cluster>.mongodb.net/whatsappdb?retryWrites=true&w=majority
MONGODB_DB_NAME=whatsappdb
NODE_ENV=development
```

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://whatsapp_admin:whatsapp123@localhost:27017/whatsappdb?authSource=admin
MONGODB_DB_NAME=whatsappdb
NODE_ENV=development
```

### Step 2: Install MongoDB Driver
```bash
cd backend
npm install mongoose
```

### Step 3: Update Backend Connection (app.js)

```javascript
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
```

---

## Verification Checklist

- [ ] MongoDB Atlas account created OR local MongoDB running
- [ ] Database user created
- [ ] Network access configured
- [ ] Connection string obtained
- [ ] MongoDB Compass installed
- [ ] Compass connection successful
- [ ] `.env` file created with connection string
- [ ] Backend listening to MongoDB

---

## Testing Connection

### Using Node.js CLI

```bash
cd backend
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected!'))
  .catch(err => console.log('❌ Error:', err.message));
"
```

### Using MongoDB Compass
If you can see databases in Compass, your connection is working!

---

## Quick Start Commands

### Start Docker MongoDB
```bash
docker-compose up -d
```

### Stop Docker MongoDB
```bash
docker-compose down
```

### View Docker MongoDB Logs
```bash
docker-compose logs -f mongodb
```

### Connect Backend to MongoDB
```bash
cd backend
npm start
```

---

## Common Issues & Solutions

### "Authentication failed"
- Check username and password are correct
- Ensure IP is whitelisted (Atlas)
- Check authSource parameter

### "Connection refused"
- Ensure MongoDB is running
- Check port 27017 is available
- For Docker: `docker ps` to verify container

### "Cannot connect in Compass"
- Try without authentication first to test connectivity
- Check firewall settings
- Ensure MongoDB service is running

---

## Next Steps

1. Choose your MongoDB setup option
2. Complete the setup following above steps
3. Test connection with Compass
4. Configure backend with connection string
5. Run backend: `npm start`

**Your CRM is now ready for data persistence!** 🚀
