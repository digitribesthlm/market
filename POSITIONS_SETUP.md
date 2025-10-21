# Positions Feature Setup Guide

## Overview
The app now includes a **Positions** section that displays your current portfolio positions directly from Airtable. The positions are automatically filtered to show only records where `CronWork = 'On'` (indicating Live positions).

## What Was Added

### 1. **API Endpoint** (`pages/api/positions.js`)
- Fetches all records from your Airtable
- Filters records where `CronWork = 'On'`
- Groups positions by Portfolio
- Sorts by Portfolio name, then Ticker

### 2. **Positions Component** (`components/PositionsCard.js`)
- Beautiful table display of positions
- Shows all relevant columns: Ticker, Shares, Buy Price, Current Price, Gain/Loss %, Gain/Loss $
- Displays Status with color coding (Active = Green, Closed = Red)
- Shows Stop Loss and Stop Win levels
- Calculates gain/loss automatically
- Groups positions by Portfolio
- Hover effects for better interactivity

### 3. **Dashboard Integration** (`pages/index.js`)
- Added `fetchPositions()` function
- Integrated positions fetching into the refresh cycle (every 60 seconds)
- Displays positions section at the top of the dashboard
- Shows total position count in the heading

## Environment Variables Required

You must set these environment variables in your `.env.local` file:

```env
AIRTABLE_SECRET_TOKEN=your_airtable_api_token
AIRTABLE_BASE_ID=your_base_id
AIRTABLE_TABLE_NAME=your_table_name
```

### How to Get These Values:

1. **AIRTABLE_SECRET_TOKEN**: 
   - Go to https://airtable.com/account/tokens
   - Create a new personal access token
   - Give it `data.records:read` scope

2. **AIRTABLE_BASE_ID**: 
   - Found in your Airtable URL: `https://airtable.com/app{BASE_ID}/...`
   - Or use Airtable API docs to find your base

3. **AIRTABLE_TABLE_NAME**: 
   - The exact name of your table in Airtable

## Airtable Table Structure

The component expects these columns (they can have any values, but these are recommended):

| Column | Type | Notes |
|--------|------|-------|
| `Ticker` | Text | Stock symbol (e.g., FTNT) |
| `Portfolio` | Text | Portfolio name (e.g., "KF Portfolio") |
| `CronWork` | Checkbox/Select | Should be 'On' for positions to display |
| `Shares` | Number | Number of shares held |
| `Price` | Number | Current price per share |
| `STOP LOSS` | Number | Stop loss price level |
| `STOP WIN` | Number | Stop win/target price level |
| `Status` | Text | Active/Closed status |
| `Currency` | Text | Currency symbol (USD, etc.) |
| `BuyDate` | Date | When the position was opened |
| `SellDate` | Date | When the position was closed (if applicable) |
| `SellPrice` | Number | Sale price (if applicable) |

## How It Works

1. **Automatic Refresh**: Positions are fetched every 60 seconds along with market data
2. **Portfolio Grouping**: Positions are automatically grouped by portfolio name
3. **Gain/Loss Calculation**: Displayed in both percentage and dollar amount
4. **Color Coding**: 
   - Green for gains (positive %)
   - Red for losses (negative %)
   - Green for Active status
   - Red for Closed status

## Customization

### Changing Refresh Rate
Edit line 39-43 in `pages/index.js`:
```javascript
const interval = setInterval(() => {
  fetchMarketData();
  fetchTradingSignals();
  fetchPositions();
}, 60000); // Change 60000 to your desired milliseconds
```

### Modifying Display Order
Edit the sort function in `pages/api/positions.js` (around line 40-50) to change how positions are ordered.

### Styling
The `PositionsCard` component uses inline styles. You can modify the colors and styling directly in `components/PositionsCard.js`.

## Troubleshooting

### Positions Not Showing
- Check that Airtable credentials are correct in `.env.local`
- Verify that records have `CronWork = 'On'`
- Check browser console for API errors
- Ensure your API token has `data.records:read` permission

### Missing Columns
- If a column doesn't exist in Airtable, the app will display "N/A"
- Add the missing columns to your Airtable base
- Column names must match exactly (case-sensitive)

### Gain/Loss Shows as N/A
- Check that `Shares`, `Price` columns have numeric values
- The app calculates: `(currentPrice - buyPrice) * shares`
- Make sure these are proper numbers, not text

## Features

✅ Automatic filtering of Live positions (CronWork = 'On')
✅ Real-time position data from Airtable
✅ Automatic gain/loss calculation
✅ Portfolio grouping
✅ Beautiful, responsive table layout
✅ Stop Loss and Stop Win tracking
✅ Position status indicators
✅ Hourly refresh cycle

