import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(process.env.TRADING_COLLECTION);

    // Get the latest trading signals, sorted by timestamp
    const data = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(50) // Get last 50 signals
      .toArray();

    res.status(200).json({ success: true, data: data });
  } catch (error) {
    console.error('Error fetching trading signals:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch trading signals' });
  }
}


