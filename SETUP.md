# Setup Guide

## Quick Start

Follow these steps to get your Market Analysis Dashboard running:

### 1. Configure Environment Variables

Create a `.env.local` file in the project root (same directory as this file):

```bash
cp env.template .env.local
```

Then edit `.env.local` with your actual MongoDB credentials:

```env
MONGO_URI=mongodb://your-actual-connection-string
DB_NAME=your-actual-database-name
COLLECTION=your-actual-collection-name
```

**Important:** Never commit `.env.local` to version control. This file is already in `.gitignore`.

### 2. Install Dependencies

Dependencies have already been installed, but if you need to reinstall:

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

The dashboard will be available at [http://localhost:3000](http://localhost:3000)

### 4. Build for Production (Optional)

When you're ready to deploy:

```bash
npm run build
npm start
```

## Troubleshooting

### MongoDB Connection Issues

If you see "Failed to fetch market data":
1. Check that your `MONGO_URI` is correct in `.env.local`
2. Ensure your MongoDB database is running and accessible
3. Verify that `DB_NAME` and `COLLECTION` match your actual database/collection names
4. Check that your collection contains documents with the expected structure

### No Data Showing

If the dashboard loads but shows "No market data available":
1. Verify your collection has data
2. Check that the data structure matches the expected format (see README.md)
3. Look at the browser console for any error messages

### Port Already in Use

If port 3000 is already in use:
```bash
npm run dev -- -p 3001
```

This will run the server on port 3001 instead.

## Features Overview

- **Warning Boxes**: Color-coded indicators (Green/Yellow/Red) based on market health
- **Line Chart**: Shows market health score trend over the last 30 data points
- **Symbol Cards**: Individual cards for each stock/ETF with detailed metrics
- **Auto-Refresh**: Data refreshes automatically every 60 seconds
- **Responsive Design**: Works on desktop and mobile devices

## Next Steps

- Customize the refresh interval in `pages/index.js` (currently 60000ms = 1 minute)
- Adjust the number of historical data points in `pages/api/market-data.js` (currently 30)
- Modify colors and styling in the component files to match your preferences

