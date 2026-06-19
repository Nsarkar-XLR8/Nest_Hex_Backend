import mongoose from 'mongoose';

const run = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  await db.collection('users').insertOne({
    id: 'seed-admin',
    email: 'admin@local.dev',
    passwordHash: 'REPLACE_WITH_ARGON2_HASH',
    roles: ['ADMIN'],
    isActive: true,
    createdAt: new Date(),
  });

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
