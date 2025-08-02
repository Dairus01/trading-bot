# 🚀 Vercel Deployment Guide

## Prerequisites
- GitHub repository with your code
- Vercel account (free at vercel.com)
- MongoDB Atlas database
- Redis Cloud database

## Step 1: Prepare Your Code

### 1.1 Update Environment Variables
Make sure your `.env` file has the correct production values:

```env
PORT=3000
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database
JWT_EXPIRES_IN=24h
JWT_SECRET=your_jwt_secret
MESSAGE=Please sign this message to connect
SOL_RPC=https://mainnet.helius-rpc.com/?api-key=your_api_key
walletAddress=your_wallet_address
withdrawWalletAddress=your_withdraw_wallet_address
RAYDIUM_AUTHORITY_V4=5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1
RAYDIUM_POOL_V4_PROGRAM_ID=675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8
RAYDIUM_FEE_ACCOUNT=7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5
SOL=So11111111111111111111111111111111111111112
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
PUMPFUN_RAYDIUM_MIGRATIOM=39azUYFWPz3VHgKCf3VChUwbpURdCHRxjWVowf5jUJjg
SOLTOUSDC_URL=https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDC
SOLTOUSDC_URL_COIN=https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd
RPC_ENDPOINTS=https://mainnet.helius-rpc.com/?api-key=your_api_key
numberOfWorker=1
DISCORD_CHANNEL_ID=your_discord_channel_id
DISCORD_BOT_TOKEN=your_discord_bot_token
```

### 1.2 Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Deploy to Vercel

### 2.1 Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository

### 2.2 Configure Project
- **Framework Preset**: Node.js
- **Root Directory**: `XAI__Backend`
- **Build Command**: Leave empty (Vercel will auto-detect)
- **Output Directory**: Leave empty
- **Install Command**: `npm install`

### 2.3 Set Environment Variables
In Vercel dashboard, go to Settings → Environment Variables and add:

```
PORT=3000
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database
JWT_EXPIRES_IN=24h
JWT_SECRET=your_jwt_secret
MESSAGE=Please sign this message to connect
SOL_RPC=https://mainnet.helius-rpc.com/?api-key=your_api_key
walletAddress=your_wallet_address
withdrawWalletAddress=your_withdraw_wallet_address
RAYDIUM_AUTHORITY_V4=5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1
RAYDIUM_POOL_V4_PROGRAM_ID=675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8
RAYDIUM_FEE_ACCOUNT=7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5
SOL=So11111111111111111111111111111111111111112
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
PUMPFUN_RAYDIUM_MIGRATIOM=39azUYFWPz3VHgKCf3VChUwbpURdCHRxjWVowf5jUJjg
SOLTOUSDC_URL=https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDC
SOLTOUSDC_URL_COIN=https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd
RPC_ENDPOINTS=https://mainnet.helius-rpc.com/?api-key=your_api_key
numberOfWorker=1
DISCORD_CHANNEL_ID=your_discord_channel_id
DISCORD_BOT_TOKEN=your_discord_bot_token
```

### 2.4 Deploy
Click "Deploy" and wait for the build to complete.

## Step 3: Verify Deployment

### 3.1 Check Health Endpoint
Visit: `https://your-app-name.vercel.app/health`

Should return: `{"status":"ok","message":"Server is running"}`

### 3.2 Test API Endpoints
- `GET /api/user/fund-wallet-balance`
- `GET /api/user/token-holding`

## Step 4: Update Frontend

Update your frontend API base URL to point to Vercel:

```javascript
// In your frontend API configuration
const API_BASE_URL = 'https://your-app-name.vercel.app';
```

## Important Notes

### ⚠️ Vercel Limitations
- **Serverless Functions**: Vercel uses serverless functions with timeout limits
- **No Background Workers**: Vercel doesn't support long-running background processes
- **Cold Starts**: Functions may have cold start delays

### 🔧 Workarounds
1. **Use External Workers**: Consider using a separate service for background jobs
2. **Optimize Functions**: Keep functions lightweight and fast
3. **Use Edge Functions**: For better performance

### 🚨 Alternative for Background Jobs
Since Vercel doesn't support background workers, consider:
- **Railway** for background workers only
- **DigitalOcean App Platform**
- **Heroku** (free tier discontinued)
- **Render** (free tier available)

## Troubleshooting

### Common Issues
1. **Build Failures**: Check package.json and dependencies
2. **Environment Variables**: Ensure all required vars are set
3. **Database Connection**: Verify MongoDB Atlas connection string
4. **Redis Connection**: Verify Redis Cloud connection

### Debug Commands
```bash
# Check Vercel logs
vercel logs

# Deploy with debug info
vercel --debug
```

## Next Steps
1. Deploy backend to Vercel
2. Test all endpoints
3. Update frontend API URL
4. Monitor performance and logs
5. Set up custom domain (optional) 