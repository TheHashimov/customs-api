export default async function handler(req, res) {
  // CORS Ayarları
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
    const bodyData = req.body;
    
    // Sənin Google Apps Script linkin
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxB-V7IpQ5WRblAY9AXOOgIuJTW-X8iwxAKMwIN5ISFltQSbR7dJxau6CQixkPrFE3s/exec";
    
    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.append('data', JSON.stringify(bodyData));

    // Vercel-dən Google-a sorğu göndəririk
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Google Status: ${response.status}`);
    }

    const text = await response.text();
    return res.status(200).send(text);

  } catch (err) {
    return res.status(500).json({ 
      code: 500, 
      exception: { errorMessage: err.message } 
    });
  }
}
