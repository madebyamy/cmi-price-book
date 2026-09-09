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

exports.handler = async () => {
  const token = process.env.NFUSION_API_KEY;
  if (!token) return { statusCode: 500, body: JSON.stringify({ error: 'NFUSION_API_KEY not set' }) };
  try {
    const url = `https://api.nfusionsolutions.biz/api/v1/Metals/spot?token=${token}&currency=USD&format=json`;
    const { status, body } = await get(url);
    if (status !== 200) throw new Error(`nFusion status ${status}: ${body}`);
    const data = JSON.parse(body);
    const map = {};
    data.forEach(item => { if (item.name) map[item.name.toLowerCase()] = item.price; });
    if (!map.gold) throw new Error('no gold in response');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gold:      map.gold,
        silver:    map.silver,
        platinum:  map.platinum,
        palladium: map.palladium,
      }),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: err.message }) };
  }
};
