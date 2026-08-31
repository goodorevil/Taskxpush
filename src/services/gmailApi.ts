import { ConnectedAccount, EmailSource } from '../types';

declare global {
  interface Window {
    google?: any;
  }
}

let gsiScriptLoading: Promise<void> | null = null;

export function loadGoogleScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.oauth2) return Promise.resolve();

  if (!gsiScriptLoading) {
    gsiScriptLoading = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', (e) => reject(e));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (e) => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }
  return gsiScriptLoading;
}

export async function requestGmailOAuthToken(clientId?: string): Promise<{ accessToken: string; userEmail: string; userName: string }> {
  await loadGoogleScript();

  const googleClientId = clientId || (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '1019283575122-demo.apps.googleusercontent.com';

  return new Promise((resolve, reject) => {
    try {
      if (!window.google?.accounts?.oauth2) {
        throw new Error('Google OAuth client library could not be initialized.');
      }

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        prompt: 'consent',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            if (tokenResponse.error === 'access_denied') {
              reject(new Error('Sign-in cancelled by user or permission denied.'));
            } else if (tokenResponse.error === 'idpiframe_initialization_failed' || tokenResponse.error.includes('origin')) {
              reject(new Error(`OAuth Domain Error: The current domain is not added to Authorized JavaScript Origins in Google Cloud Console. Please configure your Google Client ID or use the Instant Demo mailbox.`));
            } else {
              reject(new Error(`Google OAuth error: ${tokenResponse.error_description || tokenResponse.error}`));
            }
            return;
          }

          const accessToken = tokenResponse.access_token;
          try {
            // Fetch user profile info
            const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            let userEmail = 'user@gmail.com';
            let userName = 'Gmail User';
            if (profileRes.ok) {
              const profile = await profileRes.json();
              userEmail = profile.email || userEmail;
              userName = profile.name || profile.given_name || userName;
            }
            resolve({ accessToken, userEmail, userName });
          } catch (e) {
            resolve({ accessToken, userEmail: 'user@gmail.com', userName: 'Gmail User' });
          }
        },
      });

      tokenClient.requestAccessToken();
    } catch (err: any) {
      reject(err);
    }
  });
}

export async function fetchGmailMessages(
  accessToken: string,
  limit: number = 25,
  rangeDays: number = 14
): Promise<EmailSource[]> {
  try {
    const afterTimestamp = Math.floor((Date.now() - rangeDays * 24 * 60 * 60 * 1000) / 1000);
    const query = encodeURIComponent(`in:inbox after:${afterTimestamp}`);
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${limit}&q=${query}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (!listRes.ok) {
      const err = await listRes.json().catch(() => ({}));
      if (listRes.status === 401) {
        throw new Error('Gmail session expired. Please reconnect your account.');
      }
      if (listRes.status === 403) {
        throw new Error('Access denied by Gmail API. If your Google Cloud app is in "Testing" mode, ensure your email address is added to Approved Test Users in Google Cloud Console.');
      }
      throw new Error(err.error?.message || `Failed to fetch messages from Gmail (HTTP ${listRes.status})`);
    }

    const listData = await listRes.json();
    console.log('GMAIL API RESPONSE:', listData);
    const messageHeaders = listData.messages || [];

    if (messageHeaders.length === 0) {
      return [];
    }

    // Fetch message details in parallel batches of 5
    const emailResults: EmailSource[] = [];
    const batchSize = 5;

    for (let i = 0; i < messageHeaders.length; i += batchSize) {
      const batch = messageHeaders.slice(i, i + batchSize);
      const details = await Promise.all(
        batch.map(async (msg: { id: string; threadId: string }) => {
          try {
            const detailRes = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
              {
                headers: { Authorization: `Bearer ${accessToken}` }
              }
            );
            if (!detailRes.ok) return null;
            const fullMsg = await detailRes.json();
            return parseGmailMessage(fullMsg);
          } catch {
            return null;
          }
        })
      );

      for (const item of details) {
        if (item) emailResults.push(item);
      }
    }

    return emailResults;
  } catch (error: any) {
    console.error('Error fetching Gmail messages:', error);
    throw error;
  }
}

function parseGmailMessage(msg: any): EmailSource {
  const headers = msg.payload?.headers || [];
  const getHeader = (name: string) => {
    const h = headers.find((header: any) => header.name.toLowerCase() === name.toLowerCase());
    return h ? h.value : '';
  };

  const subject = getHeader('Subject') || '(No Subject)';
  const fromRaw = getHeader('From') || 'Unknown Sender';
  const dateRaw = getHeader('Date') || new Date().toISOString();

  let senderName = fromRaw;
  let senderEmail = fromRaw;
  const match = fromRaw.match(/(.*)<(.+)>/);
  if (match) {
    senderName = match[1].trim().replace(/^["']|["']$/g, '');
    senderEmail = match[2].trim();
  }

  // Extract body text
  let body = msg.snippet || '';
  if (msg.payload?.body?.data) {
    body = decodeBase64Url(msg.payload.body.data);
  } else if (msg.payload?.parts) {
    const plainPart = msg.payload.parts.find((p: any) => p.mimeType === 'text/plain');
    if (plainPart?.body?.data) {
      body = decodeBase64Url(plainPart.body.data);
    }
  }

  return {
    id: msg.id,
    threadId: msg.threadId || msg.id,
    subject,
    senderName: senderName || senderEmail,
    senderEmail,
    date: new Date(dateRaw).toISOString(),
    snippet: msg.snippet || body.slice(0, 180),
    fullBody: body || msg.snippet,
    webLink: `https://mail.google.com/mail/u/0/#inbox/${msg.threadId || msg.id}`,
    labels: msg.labelIds || ['INBOX'],
    provider: 'gmail'
  };
}

function decodeBase64Url(input: string): string {
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    try {
      return atob(input.replace(/-/g, '+').replace(/_/g, '/'));
    } catch {
      return input;
    }
  }
}
