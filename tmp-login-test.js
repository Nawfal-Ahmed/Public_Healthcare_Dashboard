const fetch = globalThis.fetch ?? require('node-fetch');
const jar = {};
const base = 'http://localhost:3000';
const request = async (path, opts = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (jar.cookie) headers.Cookie = jar.cookie;
  const res = await fetch(base + path, { ...opts, headers });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) jar.cookie = setCookie.split(';')[0];
  const text = await res.text();
  console.log(path, res.status, text);
  return res;
};

(async () => {
  await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'admin@health.gov', password: 'password123' }) });
  await request('/api/users');
})();
