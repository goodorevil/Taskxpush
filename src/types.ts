export type AccountProvider = 'gmail' | 'outlook' | 'demo';

export interface ConnectedAccount {
  id: string;
  provider: AccountProvider;
  email: string;
  name: string;
  avatar?: string;
  connectedAt: string;
  lastSyncedAt?: string;
  accessToken?: string;
  isTestMode?: boolean;
}

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskCategory = 'Meeting' | 'Deadline' | 'Follow-up' | 'Reply Needed' | 'General';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface EmailSource {
  id: string;
  threadId: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  date: string;
  snippet: string;
  fullBody?: string;
  webLink?: string;
  labels?: string[];
  provider: AccountProvider;
}

export interface InboxTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: string | null; // YYYY-MM-DD format
  dueTime?: string | null;
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  sourceEmail?: EmailSource;
  isManual?: boolean;
  confidence?: number;
  reason?: string;
  actionItems?: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  accountId?: string;
}

export interface ScanConfig {
  scanLimit: number;
  scanRangeDays: number;
  autoSync: boolean;
  autoSyncIntervalMin: number;
  scanFolders: string[];
  autoArchiveDays: number;
  minConfidence: number;
  filterNewsletters: boolean;
}

export interface ScanProgress {
  isScanning: boolean;
  totalEmails: number;
  processedEmails: number;
  tasksFound: number;
  skippedEmails: number;
  currentSubject?: string;
  statusMessage?: string;
  error?: string;
}

export interface ExtractedAIItem {
  actionable: boolean;
  taskTitle?: string;
  dueDate?: string | null;
  dueTime?: string | null;
  priority?: TaskPriority;
  category?: TaskCategory;
  description?: string;
  actionItems?: string[];
  confidence?: number;
  reason?: string;
  skipReason?: string;
}
