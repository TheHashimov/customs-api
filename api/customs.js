export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let bodyData = req.body;
    // Vercel bəzən body-ni string kimi verir, onu düzəldirik
    if (typeof bodyData === 'string') {
      try { bodyData = JSON.parse(bodyData); } catch (e) {}
    }
    
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxB-V7IpQ5WRblAY9AXOOgIuJTW-X8iwxAKMwIN5ISFltQSbR7dJxau6CQixkPrFE3s/exec";
    
    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.set('data', JSON.stringify(bodyData));

    // Google-a "real brauzer" kimi müraciət edirik
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      redirect: 'follow'
    });

    const text = await response.text();
    
    // Əgər Google "Giriş" (Login) səhifəsi qaytarıbsa, xəbərdarlıq edirik
    if (text.trim().startsWith('<!DOCTYPE html>') || text.trim().startsWith('<html')) {
        throw new Error("Google 'Login' səhifəsi qaytardı. Apps Script-də 'Anyone' icazəsi olduğunu yoxla.");
    }

    return res.status(200).send(text);

  } catch (err) {
    return res.status(500).json({ 
      code: 500, 
      exception: { errorMessage: err.message } 
    });
  }
}
