const app = require('./app');
const mongoose = require('mongoose');
const { initializeCronJobs } = require('./jobs/automation');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

console.log('📋 Configuration:');
console.log(`   Database: ${process.env.MONGO_URI?.substring(0, 50)}...`);
console.log(`   Port: ${PORT}`);
console.log(`   Environment: ${process.env.NODE_ENV}`);

// Connect to MongoDB with retry logic
const connectDB = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`\n🔄 Connecting to MongoDB (Attempt ${i + 1}/${retries})...`);
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        writeConcern: { w: 'majority' }
      });
      
      console.log('✅ MongoDB Connected Successfully');
      console.log(`   Cluster: ${mongoose.connection.host}`);
      console.log(`   Database: ${mongoose.connection.name}`);
      
      // Initialize cron jobs
      initializeCronJobs();
      
      return true;
    } catch (err) {
      console.error(`❌ Attempt ${i + 1} failed: ${err.message}`);
      if (i < retries - 1) {
        console.log(`⏳ Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  console.warn('\n⚠️  MongoDB connection failed, but server will start anyway');
  console.warn('    (Using mock data mode for testing)\n');
  return false;
};

// Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
    console.log(`\n✨ Ready to accept requests!\n`);
  });
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
