const https = require('http');

const data = JSON.stringify({
  email: 'admin@health.gov',
  password: 'password123',
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    console.log(body);
  });
});

req.on('error', (err) => {
  console.error(err);
});

req.write(data);
req.end();
