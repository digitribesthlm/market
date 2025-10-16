import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(process.env.COLLECTION);

    // Get the latest market data entries, sorted by timestamp
    const data = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(30) // Get last 30 entries for chart
      .toArray();

    res.status(200).json({ success: true, data: data.reverse() });
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch market data' });
  }
}

