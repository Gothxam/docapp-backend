import * as mongoose from 'mongoose';

export async function connectToDatabase(): Promise<void> {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/defaultdb';
    await mongoose.connect(uri);
    console.log('Successfully connected to the database');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
}
