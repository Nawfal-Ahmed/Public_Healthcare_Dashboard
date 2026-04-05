import fetch from 'node-fetch';

const base = 'http://localhost:3001';
const cookieJar = [];

async function request(path, opts = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...opts.headers,
  };
  if (cookieJar.length) {
    headers.Cookie = cookieJar.join('; ');
  }
  const res = await fetch(base + path, {
    method: opts.method || 'GET',
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    headers,
  });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    cookieJar.push(setCookie.split(';')[0]);
  }
  console.log(path, res.status);
  const text = await res.text();
  console.log(text);
  return { res, text };
}

(async () => {
  console.log('Login...');
  await request('/api/auth/login', { method: 'POST', body: { email: 'admin@health.gov', password: 'password123' } });
  console.log('List users...');
  const usersResp = await request('/api/users');
  if (usersResp.res.ok) {
    const users = JSON.parse(usersResp.text);
    console.log('users count', users.length);
  console.log(users.slice(0, 10).map((u) => ({ id: u.id, email: u.email })));
  if (users.length) {
    const id = users[0].id;
    console.log('Delete first user', id);
    await request(`/api/users/${id}`, { method: 'DELETE' });
  }
  }
})();
