require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = process.argv[2];
const secret = ((process.env.JWT_SECRET || 'ggdgzxcvbnjmkwedrftgyujikl').toString().replace(/^"|"$/g, '')).replace(/;$/g, '');

if (!token) {
  console.error('Usage: node verify.js "<TOKEN>"');
  process.exit(1);
}

try {
  const payload = jwt.verify(token, secret);
  console.log('VERIFIED:', payload);
} catch (e) {
  console.error('VERIFY ERROR:', e.message);
  try {
    const decoded = jwt.decode(token, { complete: true });
    console.log('DECODED (no verification):', decoded);
  } catch (de) {
    console.error('DECODE ERROR:', de.message);
  }
  process.exit(2);
}
