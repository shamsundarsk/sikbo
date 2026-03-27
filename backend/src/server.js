require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5001;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 SIKBO API running on port ${PORT}`);
    console.log(`   Health:    http://localhost:${PORT}/health`);
    console.log(`   API v1:    http://localhost:${PORT}/api/v1`);
    console.log(`   Legacy:    http://localhost:${PORT}/api\n`);
  });
};

start();
