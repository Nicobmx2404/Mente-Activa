'use strict';
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    const conn = await mongoose.connect(uri);
    if (process.env.NODE_ENV !== 'test') {
      console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error(`❌ Error MongoDB: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;