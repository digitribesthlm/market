export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const webhookUrl = process.env.LIVE_HOLDINGS;

    if (!webhookUrl) {
      return res.status(400).json({
        success: false,
        error: 'LIVE_HOLDINGS webhook URL not configured'
      });
    }

    console.log('[Sync Holdings] Triggering webhook...');
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[Sync Holdings] Webhook completed successfully');

    res.status(200).json({
      success: true,
      message: 'Holdings synced successfully',
      data: result
    });
  } catch (error) {
    console.error('[Sync Holdings] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync holdings'
    });
  }
}
