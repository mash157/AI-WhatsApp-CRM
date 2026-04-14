it # MongoDB & Docker Commands Reference

## Quick Start (Easiest Way)

### Windows (Batch)
```batch
setup-mongodb.bat
```

### Windows (PowerShell)
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\setup-mongodb.ps1
```

---

## Docker Commands

### Start MongoDB & Mongo Express
```bash
docker-compose up -d
```

### Stop All Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f mongodb
docker-compose logs -f mongo-express
```

### Check Status
```bash
docker-compose ps
```

### Remove Everything (including data!)
```bash
docker-compose down -v
```

### Restart Services
```bash
docker-compose restart
```

---

## MongoDB Connection Strings

### Local (Docker)
```
mongodb://whatsapp_admin:whatsapp_secure_password_123@localhost:27017/whatsappdb?authSource=admin
```

### Local (Installed Locally)
```
mongodb://localhost:27017/whatsappdb
```

### MongoDB Atlas (Cloud)
```
mongodb+srv://whatsapp_admin:<password>@<cluster>.mongodb.net/whatsappdb?retryWrites=true&w=majority
```

---

## Access Tools

### Mongo Express Web UI
- **URL:** http://localhost:8081
- **Username:** admin
- **Password:** admin123

### MongoDB Compass (Desktop App)
1. Download from: https://www.mongodb.com/products/tools/compass
2. Connection String:
   ```
   mongodb://whatsapp_admin:whatsapp_secure_password_123@localhost:27017/whatsappdb?authSource=admin
   ```

### MongoDB Shell (CLI)
```bash
mongosh mongodb://whatsapp_admin:whatsapp_secure_password_123@localhost:27017/whatsappdb --authenticationDatabase admin
```

---

## Backend Setup

### 1. Copy Environment Template
```bash
cd backend
copy .env.example .env
```

### 2. Update .env
Add or verify:
```env
MONGO_URI=mongodb://whatsapp_admin:whatsapp_secure_password_123@localhost:27017/whatsappdb?authSource=admin
MONGODB_DB_NAME=whatsappdb
PORT=5000
NODE_ENV=development
```

### 3. Install Node Dependencies
```bash
npm install
```

### 4. Start Backend Server
```bash
npm start
```

### 5. Test Connection
```bash
npm run test:db
```

---

## Common MongoDB Operations

### Connect to MongoDB Shell
```bash
mongosh mongodb://whatsapp_admin:whatsapp_secure_password_123@localhost:27017 --authenticationDatabase admin
```

### View Databases
```javascript
show databases
```

### Switch Database
```javascript
use whatsappdb
```

### View Collections
```javascript
show collections
```

### Check Documents
```javascript
db.users.find()
db.chats.find().limit(5)
```

### Count Documents
```javascript
db.users.countDocuments()
db.chats.countDocuments()
```

### Clear Collection
```javascript
db.users.deleteMany({})
```

---

## Troubleshooting

### MongoDB Not Starting
```bash
# Check if port 27017 is already in use
netstat -ano | findstr :27017

# Check Docker status
docker ps -a

# View detailed logs
docker-compose logs mongodb
```

### Connection Refused
```bash
# Verify containers are running
docker-compose ps

# Restart MongoDB
docker-compose restart mongodb

# Check network
docker network ls
docker network inspect whatsapp_network
```

### Authentication Failed
- Verify username: `whatsapp_admin`
- Verify password: `whatsapp_secure_password_123`
- Include `?authSource=admin` in connection string

### Port Already in Use
```bash
# Find process using port 27017
netstat -ano | findstr :27017

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in docker-compose.yml and restart
docker-compose down
docker-compose up -d
```

---

## Environment Variables (.env)

### Minimal Setup
```env
MONGO_URI=mongodb://whatsapp_admin:whatsapp_secure_password_123@localhost:27017/whatsappdb?authSource=admin
MONGODB_DB_NAME=whatsappdb
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
```

### Production Setup
```env
MONGO_URI=mongodb+srv://whatsapp_admin:<password>@<cluster>.mongodb.net/whatsappdb?retryWrites=true&w=majority
MONGODB_DB_NAME=whatsappdb
PORT=5000
NODE_ENV=production
JWT_SECRET=very_strong_secret_key_here
CORS_ORIGIN=https://yourdomain.com
```

---

## Database Credentials

### Default Credentials (Docker)
- **Username:** whatsapp_admin
- **Password:** whatsapp_secure_password_123
- **Database:** whatsappdb
- **Port:** 27017

### Change Password
To change password, update `docker-compose.yml`:
```yaml
MONGO_INITDB_ROOT_PASSWORD: your_new_password
```

Then restart:
```bash
docker-compose down -v
docker-compose up -d
```

---

## Backup & Restore

### Backup Database
```bash
docker exec whatsapp_mongodb mongodump --authenticationDatabase admin -u whatsapp_admin -p whatsapp_secure_password_123 --out /data/dump
```

### List Backups
```bash
docker exec whatsapp_mongodb ls -la /data/
```

---

## Verification Steps

- [ ] Docker is running
- [ ] `docker-compose ps` shows 2 containers running
- [ ] Can connect to http://localhost:8081
- [ ] Can connect in MongoDB Compass
- [ ] Backend can connect (check logs)
- [ ] Can see collections in Mongo Express or Compass

---

## Additional Resources

- MongoDB Documentation: https://docs.mongodb.com
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- MongoDB Compass: https://www.mongodb.com/products/tools/compass
- Docker Documentation: https://docs.docker.com
- Mongoose (ODM): https://mongoosejs.com

---

## Support

For issues:
1. Check logs: `docker-compose logs`
2. Verify connection string in .env
3. Ensure MongoDB is running: `docker-compose ps`
4. Check firewall/antivirus blocking port 27017
5. Restart Docker and try again
