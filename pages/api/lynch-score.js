export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ticker } = req.body;

  if (!ticker) {
    return res.status(400).json({ error: 'Ticker is required' });
  }

  // Get webhook URL from environment variable
  const webhookUrl = process.env.WEBHOOK_LYNCH;

  if (!webhookUrl) {
    console.error('WEBHOOK_LYNCH environment variable is not set');
    return res.status(500).json({ error: 'Webhook URL not configured' });
  }

  try {
    // Call the n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'tooken',
        tickers: [ticker.toUpperCase().trim()]
      })
    });

    if (!response.ok) {
      throw new Error(`Webhook returned status ${response.status}`);
    }

    let data = await response.json();
    
    // n8n returns an array with one item, extract the first item
    if (Array.isArray(data) && data.length > 0) {
      data = data[0];
    }
    
    // Return the webhook response to the frontend
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error calling webhook:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze ticker',
      details: error.message 
    });
  }
}
