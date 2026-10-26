const https = require('https');

export default async function handler(req, res) {
  // CORS Ayarları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const data = JSON.stringify(req.body);

    const options = {
      hostname: 'c2b-fbusiness.customs.gov.az',
      port: 443,
      path: '/api/v1/dictionaries/calcAutoDuty',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'lang': 'az',
        'requestSource': '1'
      },
      // ★ BÜTÜN SSL (525) XƏTALARINI HƏLL EDƏN HİSSƏ ★
      rejectUnauthorized: false 
    };

    const proxyReq = https.request(options, (proxyRes) => {
      let body = '';
      proxyRes.on('data', (chunk) => body += chunk);
      proxyRes.on('end', () => {
        res.status(200).send(body);
      });
    });

    proxyReq.on('error', (e) => {
      res.status(500).json({ code: 500, exception: { errorMessage: e.message } });
    });

    proxyReq.write(data);
    proxyReq.end();

  } catch (err) {
    res.status(500).json({ code: 500, exception: { errorMessage: err.message } });
  }
}
