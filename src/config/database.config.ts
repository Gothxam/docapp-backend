import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGO_URI || 'mongodb://localhost:27017/defaultdb',
  port:process.env.PORT || 3000,
  jwttoken:process.env.JWT_SECRET||"asdfrgtyhuio"
}));
