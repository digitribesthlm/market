# Important: Update Your .env.local File

Please add this line to your `.env.local` file:

```env
TRADING_COLLECTION=your-trading-collection-name
```

Your complete `.env.local` should now look like:

```env
MONGO_URI=mongodb://your-mongodb-connection-string
DB_NAME=your-database-name
COLLECTION=your-market-analysis-collection-name
TRADING_COLLECTION=your-trading-signals-collection-name
```

After adding this, restart your development server:
1. Stop the current server (Ctrl+C if needed)
2. Run: `npm run dev`

The dashboard will now display your trading signals at the top!

