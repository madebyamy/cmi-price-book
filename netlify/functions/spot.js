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
  try {
    const { status, body } = await get('https://api.metals.live/v1/spot');
    if (status !== 200) throw new Error(`metals.live status ${status}`);
    const items = JSON.parse(body); // [{gold:…},{silver:…},…]
    const map = {};
    items.forEach(obj => Object.assign(map, obj));
    if (!map.gold) throw new Error('no gold price in response');
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
