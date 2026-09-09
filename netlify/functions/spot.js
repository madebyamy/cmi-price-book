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
    const { status, body } = await get('https://data-asg.goldprice.org/dbXRates/USD');
    if (status !== 200) throw new Error(`goldprice status ${status}`);
    const data = JSON.parse(body);
    const item = data.items?.[0];
    if (!item) throw new Error('no item in response');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gold:      item.xauPrice,
        silver:    item.xagPrice,
        platinum:  item.xptPrice,
        palladium: item.xpdPrice,
      }),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: err.message }) };
  }
};
