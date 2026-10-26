const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let bodyData = req.body;
    if (typeof bodyData === 'string') {
      try { bodyData = JSON.parse(bodyData); } catch(e) {}
    }
    const data = JSON.stringify(bodyData);

    // TLS 1.2-yə məcbur edirik və bağlantını açıq saxlayırıq
    const agent = new https.Agent({
      rejectUnauthorized: false, // SSL sertifikatını ignore et
      minVersion: 'TLSv1.2',
      maxVersion: 'TLSv1.2', 
      keepAlive: true
    });

    const options = {
      hostname: 'c2b-fbusiness.customs.gov.az',
      port: 443,
      path: '/api/v1/dictionaries/calcAutoDuty',
      method: 'POST',
      agent: agent,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'lang': 'az',
        'requestSource': '1',
        // Dövlət saytını aldatmaq üçün real brauzer başlıqları:
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'az,en-US;q=0.9,en;q=0.8',
        'Origin': 'https://c2b-fbusiness.customs.gov.az',
        'Referer': 'https://c2b-fbusiness.customs.gov.az/'
      }
    };

    const proxyReq = https.request(options, (proxyRes) => {
      let body = '';
      proxyRes.on('data', (chunk) => body += chunk);
      proxyRes.on('end', () => res.status(200).send(body));
    });

    proxyReq.on('error', (e) => {
      res.status(500).json({ code: 500, exception: { errorMessage: e.message } });
    });

    proxyReq.write(data);
    proxyReq.end();

  } catch (err) {
    res.status(500).json({ code: 500, exception: { errorMessage: err.message } });
  }
};
