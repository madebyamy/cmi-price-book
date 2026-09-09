const https = require('https');

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', ...headers } }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

const TOKEN = process.env.NFUSION_API_KEY;

const ENDPOINTS = [
  `https://api.nfusionsolutions.biz/api/v1/Metals/spot/summary?token=${TOKEN}&currency=USD&format=json`,
  `https://api.nfusionsolutions.com/api/v1/Metals/spot/summary?token=${TOKEN}&currency=USD&format=json`,
  { url: 'https://api.nfusionsolutions.biz/api/v1/Metals/spot/summary?currency=USD&format=json', headers: { 'Authorization': `Bearer ${TOKEN}` } },
];

exports.handler = async () => {
  if (!TOKEN) return { statusCode: 500, body: JSON.stringify({ error: 'NFUSION_API_KEY not set' }) };
  const results = {};
  for (const entry of ENDPOINTS) {
    const url = typeof entry === 'string' ? entry : entry.url;
    const headers = typeof entry === 'string' ? {} : (entry.headers || {});
    const key = url.replace(/token=[^&]+/, 'token=REDACTED').split('nfusion')[1];
    const { status, body } = await get(url, headers).catch(e => ({ status: 0, body: e.message }));
    results[key] = { status, body: body.slice(0, 400) };
  }
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(results, null, 2) };
};
