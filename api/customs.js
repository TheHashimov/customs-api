const https = require('https');

module.exports = async (req, res) => {
  // CORS Başlıqları (Brauzerin icazə verməsi üçün)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, lang, requestSource');
  
  // Brauzerin ilk göndərdiyi OPTIONS sorğusuna müsbət cavab veririk
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
      // ★ SSL XƏTASINI (525) KEÇMƏK ÜÇÜN ★
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
};
