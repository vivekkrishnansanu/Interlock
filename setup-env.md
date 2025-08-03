# Environment Variables Setup Guide

## For Local Development:

1. Create a `.env` file in the root directory with:
```
REACT_APP_SUPABASE_URL=https://nviyxewmtbpstmlhaaic.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E
```

2. Restart your development server:
```bash
npm start
```

## For Vercel Deployment:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:
   - `REACT_APP_SUPABASE_URL` = `https://nviyxewmtbpstmlhaaic.supabase.co`
   - `REACT_APP_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E`

5. Redeploy your application

## Create a Test User:

After setting up environment variables, you can create a test user using the provided script:

```bash
node add-user.js admin@interlock.com admin123 "Admin User" admin
```

This will create an admin user that you can use to log in. 