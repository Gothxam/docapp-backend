import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';

// Load .env manually for Cloudinary config
dotenv.config();

console.log('\n📋 ENV Variables Loaded:');
console.log('   CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('   CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.substring(0, 5) + '...' : 'MISSING');
console.log('   CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '***' : 'MISSING');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('☁️  Cloudinary configured with cloud_name:', process.env.CLOUDINARY_CLOUD_NAME, '\n');

export default cloudinary;