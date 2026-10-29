/**
 * One-time setup script to generate Google OAuth consent URL and exchange
 * authorization code for a GMAIL_REFRESH_TOKEN.
 *
 * Usage:
 *   node scripts/gmail-auth.js
 */

const readline = require('readline');
const { google } = require('googleapis');
require('dotenv').config();

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
];

async function main() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/oauth2callback';

  console.log('\n======================================================');
  console.log('   NexaHR Gmail ATS Integration - OAuth Token Setup   ');
  console.log('======================================================\n');

  if (!clientId || !clientSecret) {
    console.error('ERROR: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env before running this script.');
    console.error('Add them to your .env file and run this script again.\n');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: GMAIL_SCOPES,
  });

  console.log('1. Open this URL in your web browser and authorize access for your HR mailbox:');
  console.log(`\n${authUrl}\n`);
  console.log('2. After granting consent, Google will redirect to your redirect URI with a code in the URL.');
  console.log('   Copy the "code" query parameter from the URL address bar.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Paste the authorization code here: ', async (code) => {
    rl.close();
    try {
      const { tokens } = await oauth2Client.getToken(code.trim());
      console.log('\n======================================================');
      console.log('              SUCCESSFULLY RETRIEVED TOKENS           ');
      console.log('======================================================\n');

      if (tokens.refresh_token) {
        console.log('Copy this refresh token and save it into your .env file:');
        console.log(`\nGMAIL_REFRESH_TOKEN="${tokens.refresh_token}"\n`);
        console.log('Also ensure your HR email is configured:');
        console.log('GMAIL_HR_ADDRESS="umairdevelop@gmail.com"\n');
      } else {
        console.warn('WARNING: No refresh token returned. This happens if consent was already granted without prompt=consent.');
        console.log('Access token:', tokens.access_token);
        console.log('Try visiting https://myaccount.google.com/permissions to revoke access, then run this script again.');
      }
    } catch (err) {
      console.error('\nERROR exchanging authorization code for token:', err.message);
    }
  });
}

main().catch(console.error);

