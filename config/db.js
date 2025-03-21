const mongoose = require('mongoose');

const connectDB = async (uri = process.env.MONGO_URI) => {
  if (mongoose.connection.readyState >= 1) {
    console.log('MongoDB already connected');
    return;
  }
  try {
    await mongoose.connect(uri, {
     
    });
    console.log('MongoDB Connected ', uri.split('/').pop().split('?')[0]);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;