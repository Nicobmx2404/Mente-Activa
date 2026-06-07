const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  process.env.JWT_SECRET = 'test_secret_key_123';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.NODE_ENV = 'test';
  global.__MONGOD__ = mongod;
};