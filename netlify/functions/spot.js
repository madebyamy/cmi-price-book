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

// CMI's own nFusion widget feed (same source as cmigs.com ticker)
const WIDGET_URL = 'https://widget.nfusionsolutions.com/widget/script/ticker/1/f1a88494-4da3-4f36-b8ae-0317b4ee2475/36aa0e02-7d4a-4330-810c-69981ab1a7dc?symbols=gold,silver,platinum,palladium';

exports.handler = async () => {
  try {
    const { status, body } = await get(WIDGET_URL);
    if (status !== 200) throw new Error(`widget status ${status}`);

    // Extract prices from the JS — they appear as e.g. "gold":{"ask":3998.57,...}
    const prices = {};
    const metals = ['gold', 'silver', 'platinum', 'palladium'];
    for (const metal of metals) {
      // Try multiple patterns the widget JS might use
      const patterns = [
        new RegExp(`"${metal}"[^}]*?"ask"\\s*:\\s*([0-9.]+)`, 'i'),
        new RegExp(`"${metal}"[^}]*?"price"\\s*:\\s*([0-9.]+)`, 'i'),
        new RegExp(`"${metal}"[^}]*?"bid"\\s*:\\s*([0-9.]+)`, 'i'),
        new RegExp(`${metal}[^}]*?ask[^:]*:\\s*([0-9.]+)`, 'i'),
      ];
      for (const re of patterns) {
        const m = body.match(re);
        if (m) { prices[metal] = parseFloat(m[1]); break; }
      }
    }

    if (!prices.gold) {
      // Return first 500 chars of widget body for debugging
      return { statusCode: 502, body: JSON.stringify({ error: 'could not parse prices', preview: body.slice(0, 500) }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prices),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: err.message }) };
  }
};
