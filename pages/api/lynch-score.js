export default async function handler(req, res) {
  console.log('=== Lynch Score API Called ===');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  
  if (req.method !== 'POST') {
    console.log('ERROR: Method not allowed');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ticker } = req.body;
  console.log('Ticker received:', ticker);

  if (!ticker) {
    console.log('ERROR: No ticker provided');
    return res.status(400).json({ error: 'Ticker is required' });
  }

  // Get webhook URL from environment variable
  const webhookUrl = process.env.WEBHOOK_LYNCH;
  console.log('Webhook URL configured:', webhookUrl ? 'YES' : 'NO');
  console.log('Webhook URL:', webhookUrl);

  if (!webhookUrl) {
    console.error('ERROR: WEBHOOK_LYNCH environment variable is not set');
    return res.status(500).json({ error: 'Webhook URL not configured' });
  }

  const requestBody = {
    token: 'tooken',
    tickers: [ticker.toUpperCase().trim()]
  };
  
  console.log('Calling webhook with body:', JSON.stringify(requestBody));
  console.log('Webhook URL:', webhookUrl);

  try {
    const startTime = Date.now();
    
    // Call the n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const duration = Date.now() - startTime;
    console.log(`Webhook response received in ${duration}ms`);
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook error response:', errorText);
      throw new Error(`Webhook returned status ${response.status}: ${errorText}`);
    }

    const rawData = await response.text();
    console.log('Raw response data:', rawData);
    
    let data;
    try {
      data = JSON.parse(rawData);
      console.log('Parsed response data:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON response from webhook');
    }
    
    // n8n returns an array with one item, extract the first item
    if (Array.isArray(data) && data.length > 0) {
      console.log('Response is array, extracting first item');
      data = data[0];
    }
    
    console.log('Final data to return:', JSON.stringify(data, null, 2));
    
    // Return the webhook response to the frontend
    return res.status(200).json(data);

  } catch (error) {
    console.error('=== ERROR in Lynch Score API ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({ 
      error: 'Failed to analyze ticker',
      details: error.message,
      type: error.constructor.name
    });
  }
}
