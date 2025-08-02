@echo off
echo 🚀 Setting up Vercel Deployment...
echo.

echo 📦 Installing Vercel CLI...
npm install -g vercel

echo.
echo 🔐 Login to Vercel...
vercel login

echo.
echo 📁 Deploying to Vercel...
vercel --prod

echo.
echo ✅ Deployment complete!
echo 🌐 Your app URL will be shown above
echo.
echo 📝 Next steps:
echo 1. Set environment variables in Vercel dashboard
echo 2. Test the health endpoint: https://your-app.vercel.app/health
echo 3. Update frontend API URL
echo.
pause 