import { ConnectedAccount, EmailSource } from '../types';

export async function requestOutlookOAuthToken(clientId?: string): Promise<{ accessToken: string; userEmail: string; userName: string }> {
  // If custom Microsoft Client ID is provided, we can perform standard Microsoft OAuth flow or fallback to simulated/demo mailbox
  const msClientId = clientId || (import.meta as any).env?.VITE_MICROSOFT_CLIENT_ID;

  if (msClientId) {
    const redirectUri = window.location.origin;
    const scope = encodeURIComponent('https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/User.Read openid profile email');
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${msClientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_mode=fragment&state=outlook_auth`;

    return new Promise((resolve, reject) => {
      const popup = window.open(authUrl, 'Outlook Auth', 'width=600,height=700');
      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups for this site.'));
        return;
      }

      const checkInterval = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(checkInterval);
            reject(new Error('Outlook sign-in popup was closed by user.'));
            return;
          }
          if (popup.location.href.includes('#access_token=') || popup.location.href.includes('&access_token=')) {
            const hash = popup.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            const token = params.get('access_token');
            clearInterval(checkInterval);
            popup.close();

            if (token) {
              fetch('https://graph.microsoft.com/v1.0/me', {
                headers: { Authorization: `Bearer ${token}` }
              })
                .then(res => res.json())
                .then(user => {
                  resolve({
                    accessToken: token,
                    userEmail: user.mail || user.userPrincipalName || 'outlook_user@outlook.com',
                    userName: user.displayName || 'Outlook User'
                  });
                })
                .catch(() => {
                  resolve({
                    accessToken: token,
                    userEmail: 'outlook_user@outlook.com',
                    userName: 'Outlook User'
                  });
                });
            } else {
              reject(new Error('Failed to parse access token from Microsoft response.'));
            }
          }
        } catch {
          // Cross-origin restriction while on login.microsoftonline.com
        }
      }, 500);
    });
  }

  // Fallback / Sandbox Outlook connection
  return {
    accessToken: 'demo_outlook_token_' + Date.now(),
    userEmail: 'alex.corporate@outlook.com',
    userName: 'Alex Mercer (Outlook Demo)'
  };
}

export async function fetchOutlookMessages(
  accessToken: string,
  limit: number = 25
): Promise<EmailSource[]> {
  if (accessToken.startsWith('demo_')) {
    // Return Outlook-themed sample items
    const sampleRes = await fetch('/api/sample-inbox');
    const data = await sampleRes.json();
    return (data.emails || []).filter((e: any) => e.provider === 'outlook' || e.subject.includes('Invoice') || e.subject.includes('Interview') || e.subject.includes('MSA'));
  }

  try {
    const res = await fetch(`https://graph.microsoft.com/v1.0/me/messages?$top=${limit}&$select=id,conversationId,subject,from,receivedDateTime,bodyPreview,body,webLink`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      if (res.status === 401) throw new Error('Outlook session expired. Please reconnect.');
      throw new Error(`Failed to fetch Outlook messages (HTTP ${res.status})`);
    }

    const data = await res.json();
    return (data.value || []).map((msg: any) => ({
      id: msg.id,
      threadId: msg.conversationId || msg.id,
      subject: msg.subject || '(No Subject)',
      senderName: msg.from?.emailAddress?.name || msg.from?.emailAddress?.address || 'Unknown',
      senderEmail: msg.from?.emailAddress?.address || '',
      date: msg.receivedDateTime || new Date().toISOString(),
      snippet: msg.bodyPreview || '',
      fullBody: msg.body?.content || msg.bodyPreview || '',
      webLink: msg.webLink || 'https://outlook.live.com',
      labels: ['INBOX'],
      provider: 'outlook' as const
    }));
  } catch (err: any) {
    console.error('Error fetching Outlook messages:', err);
    throw err;
  }
}
