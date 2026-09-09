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

exports.handler = async () => {
  if (!TOKEN) return { statusCode: 500, body: JSON.stringify({ error: 'NFUSION_API_KEY not set' }) };
  try {
    const metals = 'gold,silver,platinum,palladium';
    const url = `https://api.nfusionsolutions.biz/api/v1/Metals/spot/summary?token=${TOKEN}&currency=USD&metals=${metals}&format=json`;
    const { status, body } = await get(url);
    if (status !== 200) throw new Error(`nFusion ${status}: ${body.slice(0, 200)}`);
    const data = JSON.parse(body);
    const prices = {};
    (Array.isArray(data) ? data : []).forEach(item => {
      const name = (item.requestedSymbol || '').toLowerCase();
      const d = item.data || {};
      const price = d.ask ?? d.last ?? d.bid;
      if (name && price != null) prices[name] = price;
    });
    if (!prices.gold) throw new Error(`no gold — raw: ${body.slice(0, 300)}`);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prices),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: err.message }) };
  }
};
