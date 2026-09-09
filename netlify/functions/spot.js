const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

const TOKEN = process.env.NFUSION_API_KEY;

const ENDPOINTS = [
  `https://api.nfusionsolutions.biz/api/v1/Metals/spot?token=${TOKEN}&currency=USD&format=json`,
  `https://api.nfusionsolutions.biz/api/v2/Metals/spot?token=${TOKEN}&currency=USD&format=json`,
  `https://api.nfusionsolutions.biz/api/v1/spot?token=${TOKEN}&currency=USD&format=json`,
  `https://api.nfusionsolutions.biz/api/v1/Metals/summary?token=${TOKEN}&currency=USD&format=json`,
];

exports.handler = async () => {
  if (!TOKEN) return { statusCode: 500, body: JSON.stringify({ error: 'NFUSION_API_KEY not set' }) };
  const results = {};
  for (const url of ENDPOINTS) {
    const { status, body } = await get(url).catch(e => ({ status: 0, body: e.message }));
    results[url.split('biz')[1].split('?')[0]] = { status, body: body.slice(0, 200) };
  }
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(results) };
};
