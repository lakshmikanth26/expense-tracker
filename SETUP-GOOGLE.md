# Google Sheets Integration Setup

## 🔒 Security Notice
**NEVER commit your actual Google OAuth credentials to git!**

## Setup Steps

### 1. Configure Environment Variables

Create a `.env.local` file in your project root (this file is git-ignored):

```bash
# Copy .env.example to .env.local
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials:

```env
# Replace these with your actual Google OAuth credentials
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret
NEXTAUTH_URL=http://localhost:3001
```

**Note:** Replace the placeholder values above with your actual Google OAuth credentials from the Google Cloud Console.

### 2. Google Cloud Console Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or select a project**: "Family-Expenses"
3. **Enable APIs**:
   - Google Sheets API
   - Google Drive API (optional, for file creation)
4. **Configure OAuth Consent Screen**:
   - User Type: External (for personal use)
   - App name: "Family Expense Tracker"
   - User support email: your email
   - Scopes: Add `../auth/spreadsheets` scope
5. **Create OAuth 2.0 Credentials**:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3001/auth/google/callback`

### 3. Security Best Practices

- ✅ `.env.local` is in `.gitignore`
- ✅ Never share credentials in chat/email
- ✅ Use different credentials for production
- ✅ Rotate credentials regularly
- ✅ Limit OAuth scopes to minimum required

### 4. Deployment

For production deployment (Vercel/Netlify):
1. Add environment variables in the platform's dashboard
2. Update `NEXTAUTH_URL` to your production domain
3. Add production domain to Google OAuth authorized URIs

### 5. Troubleshooting

If you get authentication errors:
1. Check that all URLs match exactly
2. Verify APIs are enabled in Google Cloud Console
3. Ensure OAuth consent screen is configured
4. Check that credentials are correctly set in environment

## 🚫 What NOT to do:
- Don't commit `.env.local` to git
- Don't share credentials publicly
- Don't use these credentials in production without rotating them