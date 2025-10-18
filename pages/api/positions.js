import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    console.log('\n========== POSITIONS API LOG ==========');
    console.log(`[${new Date().toISOString()}] Starting positions fetch...`);

    // Get MongoDB connection
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const collectionName = process.env.COLLECTION_HOLDINGS;

    console.log('✓ Environment Variables Check:');
    console.log(`  - DB_NAME: ${process.env.DB_NAME ? '✓ Found (' + process.env.DB_NAME + ')' : '✗ NOT FOUND'}`);
    console.log(`  - COLLECTION_HOLDINGS: ${collectionName ? '✓ Found (' + collectionName + ')' : '✗ NOT FOUND'}`);

    if (!process.env.DB_NAME || !collectionName) {
      console.log('✗ ERROR: Missing MongoDB configuration');
      console.log('========================================\n');
      return res.status(400).json({
        success: false,
        error: 'Missing MongoDB configuration',
        debug: {
          db: !process.env.DB_NAME,
          collection: !collectionName
        }
      });
    }

    const collection = db.collection(collectionName);
    console.log(`\n✓ Connected to MongoDB collection: ${collectionName}`);

    // Fetch all records from MongoDB
    console.log('\n📡 Querying MongoDB...');
    const allRecords = await collection.find({}).toArray();

    console.log(`✓ MongoDB Query Complete`);
    console.log(`✓ Total Records Retrieved: ${allRecords.length}`);

    // Log all records for debugging
    if (allRecords.length > 0) {
      console.log('\n📊 All Records:');
      allRecords.forEach((record, idx) => {
        console.log(`  [${idx + 1}] ${record.Ticker || 'N/A'} - CronWork: ${record.CronWork || 'N/A'}`);
      });
    }

    // Filter records where CronWork = 'On'
    console.log('\n🔍 Filtering for CronWork = "On"...');
    const positions = allRecords
      .filter(record => {
        const cronWork = record.CronWork;
        const matches = cronWork === 'On';
        if (!matches) {
          console.log(`  ✗ Filtered out: ${record.Ticker} (CronWork: "${cronWork}")`);
        }
        return matches;
      })
      .map(record => ({
        id: record._id,
        fields: {
          Ticker: record.Ticker,
          Name: record.Name,
          Portfolio: record.Portfolio,
          CronWork: record.CronWork,
          Shares: record.Shares?.$numberInt ? parseInt(record.Shares.$numberInt) : record.Shares,
          Price: record.Price?.$numberDouble ? parseFloat(record.Price.$numberDouble) : record.Price,
          BuyDate: record.BuyDate,
          Currency: record.Currency,
          'STOP LOSS': record['STOP LOSS'],
          'STOP WIN': record['STOP WIN'],
          Status: record.Status,
          Note: record.Note,
          Formula: record.Formula,
          'Last modified time': record['Last modified time'],
          // Include all calculated fields
          current_price: record.current_price,
          total_invested: record.total_invested,
          current_value: record.current_value,
          profit_loss: record.profit_loss,
          percent_change: record.percent_change,
          stop_status: record.stop_status,
          analysis_note: record.analysis_note,
          'Sub Formula': record['Sub Formula']
        }
      }))
      .sort((a, b) => {
        // Sort by portfolio and then by ticker
        const portfolioA = a.fields.Portfolio || '';
        const portfolioB = b.fields.Portfolio || '';
        if (portfolioA !== portfolioB) {
          return portfolioA.localeCompare(portfolioB);
        }
        const tickerA = a.fields.Ticker || '';
        const tickerB = b.fields.Ticker || '';
        return tickerA.localeCompare(tickerB);
      });

    console.log(`✓ Filter Complete: ${positions.length} positions with CronWork = "On"`);

    if (positions.length > 0) {
      console.log('\n✓ Active Positions:');
      positions.forEach((pos, idx) => {
        console.log(`  [${idx + 1}] ${pos.fields.Portfolio || 'N/A'} - ${pos.fields.Ticker || 'N/A'} (${pos.fields.Shares || 0} shares)`);
      });
    } else {
      console.log('⚠️  WARNING: No positions found with CronWork = "On"');
      console.log('    Check your MongoDB data - records need CronWork field set to exactly "On"');
    }

    console.log('\n✓ Returning successful response');
    console.log('========================================\n');

    res.status(200).json({
      success: true,
      data: positions,
      count: positions.length,
      debug: {
        totalRecords: allRecords.length,
        filteredCount: positions.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.log('\n✗ ERROR OCCURRED:');
    console.log(`  Error: ${error.message}`);
    console.log(`  Stack: ${error.stack}`);
    console.log('========================================\n');

    res.status(500).json({
      success: false,
      error: 'Failed to fetch positions from MongoDB',
      debug: {
        message: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
}
