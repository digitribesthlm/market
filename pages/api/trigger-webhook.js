export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const webhookUrl = process.env.WEBHOOK;

    if (!webhookUrl) {
      return res.status(500).json({ success: false, error: 'Webhook URL not configured' });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        action: 'check_market_conditions'
      })
    });

    const data = await response.json();

    res.status(200).json({ 
      success: true, 
      message: 'Webhook triggered successfully',
      response: data
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to trigger webhook',
      details: error.message
    });
  }
}

