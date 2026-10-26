const https = require('https');

module.exports = async (req, res) => {
  // CORS başlıqları (Brauzerin bloklamaması üçün)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Expose-Headers', '*');
  
  // Brauzerin ilk göndərdiyi yoxlama (OPTIONS) sorğusuna müsbət cavab
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel bəzən body-ni obyekt, bəzən string kimi verir
    let bodyData = req.body;
    if (typeof bodyData === 'string') {
      try { bodyData = JSON.parse(bodyData); } catch(e) {}
    }
    
    const data = JSON.stringify(bodyData);

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
      rejectUnauthorized: false // SSL keçidi
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
