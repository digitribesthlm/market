# Market Analysis Dashboard

A Next.js dashboard for displaying stock market analysis data from MongoDB.

## Features

- 🎨 Beautiful, modern UI with color-coded warning levels (Green/Yellow/Red)
- 📊 Interactive line chart showing market health score over time
- 📈 Real-time display of major indexes (SPY, QQQ, DIA, IWM)
- 🏢 Sector ETF tracking (XLC, XLE, XLF, XLI, XLK, XLP, XLU, XLV, XLY)
- 📉 Other indicators (VIX, HYG, TLT)
- 🔄 Auto-refresh every minute

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory with your MongoDB credentials:
```env
MONGO_URI=mongodb://your-mongodb-connection-string
DB_NAME=your-database-name
COLLECTION=your-collection-name
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

The following environment variables are required in `.env.local`:

- `MONGO_URI` - Your MongoDB connection string
- `DB_NAME` - The name of your database
- `COLLECTION` - The name of your collection containing market analysis data
- `TRADING_COLLECTION` - The name of your collection containing trading signals
- `LOGIN_COLLECTION` - The name of your collection containing user login credentials

## Data Structure

The application expects MongoDB documents with the following structure:

```json
{
  "timestamp": "2025-10-09T14:31:22.854197",
  "analysis": {
    "market_health_score": 90,
    "warning_level": "HEALTHY",
    "emoji": "🟢",
    "index_warnings": 0,
    "sector_warnings": 2,
    "warning_signals": [],
    "detailed_results": {
      "SPY": {
        "symbol": "SPY",
        "price": 670.73,
        "stoch_14": 83.59,
        "above_ema": true,
        "overbought": false,
        "warning_count": 0
      }
    }
  }
}
```

## Warning Levels

- 🟢 **HEALTHY** (Green) - Market is in good condition
- 🟡 **MODERATE** (Yellow) - Some warnings detected
- 🔴 **DANGER** (Red) - Multiple warnings, caution advised

## Build for Production

```bash
npm run build
npm start
```

