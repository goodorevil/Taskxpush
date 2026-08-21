import { EmailSource, ExtractedAIItem } from '../types';

export interface TaskExtractionResponse {
  success: boolean;
  processedCount: number;
  results: (ExtractedAIItem & { emailId: string; threadId: string })[];
  modelUsed?: string;
  usedFallback?: boolean;
  warning?: string;
}

export async function extractTasksFromEmails(
  emails: EmailSource[],
  referenceDate?: string
): Promise<TaskExtractionResponse> {
  const response = await fetch('/api/extract-tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      emails,
      referenceDate: referenceDate || new Date().toISOString().split('T')[0],
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Server extraction failed with status ${response.status}`);
  }

  return response.json();
}

export async function fetchSampleInbox(): Promise<EmailSource[]> {
  const response = await fetch('/api/sample-inbox');
  if (!response.ok) {
    throw new Error('Failed to load sample mailbox');
  }
  const data = await response.json();
  return data.emails || [];
}
