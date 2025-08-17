// Script to fix googleId index issue
require('dotenv').config();
const mongoose = require('mongoose');

async function fixGoogleIdIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Drop the problematic index
    try {
      await collection.dropIndex('googleId_1');
      console.log('Dropped old googleId_1 index');
    } catch (error) {
      console.log('Index might not exist or already dropped:', error.message);
    }

    // Create new sparse unique index
    await collection.createIndex(
      { googleId: 1 }, 
      { unique: true, sparse: true }
    );
    console.log('Created new sparse unique index for googleId');

    console.log('Index fix completed successfully!');
    
  } catch (error) {
    console.error('Error fixing index:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixGoogleIdIndex();
