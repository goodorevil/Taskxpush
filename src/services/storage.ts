import { ConnectedAccount, InboxTask, ScanConfig, TaskStatus, TaskPriority, TaskCategory, EmailSource } from '../types';

const TASKS_KEY = 'inboxflow_tasks_v1';
const ACCOUNTS_KEY = 'inboxflow_accounts_v1';
const ACTIVE_ACCOUNT_KEY = 'inboxflow_active_account_v1';
const CONFIG_KEY = 'inboxflow_config_v1';
const ONBOARDING_KEY = 'inboxflow_onboarding_done_v1';
const PROCESSED_THREADS_KEY = 'inboxflow_processed_threads_v1';

export const DEFAULT_CONFIG: ScanConfig = {
  scanLimit: 50,
  scanRangeDays: 14,
  autoSync: true,
  autoSyncIntervalMin: 15,
  scanFolders: ['INBOX', 'IMPORTANT'],
  autoArchiveDays: 7,
  minConfidence: 0.6,
  filterNewsletters: true
};

// Initial realistic seed tasks for immediate out-of-the-box delight
const INITIAL_DEMO_TASKS: InboxTask[] = [
  {
    id: 'task-seed-1',
    title: 'Review Section 4.2 & Section 9 of TechCorp MSA',
    description: 'Sarah Jenkins requested legal review of Liability Cap and IP terms before 5:00 PM Friday for procurement countersigning.',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueTime: '17:00',
    priority: 'high',
    category: 'Deadline',
    status: 'todo',
    confidence: 0.96,
    reason: 'Urgent contract approval deadline from Legal Counsel',
    actionItems: [
      'Check Section 4.2 liability cap language against standard playbook',
      'Confirm Section 9 IP terms with engineering lead',
      'Send written approval or redlines to Sarah Jenkins'
    ],
    sourceEmail: {
      id: 'msg-101',
      threadId: 'th-101',
      subject: 'URGENT: Review Master Service Agreement with TechCorp by Friday',
      senderName: 'Sarah Jenkins (Legal Counsel)',
      senderEmail: 'sarah.jenkins@acmelegal.com',
      date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      snippet: 'Please review Section 4.2 (Liability Cap) and Section 9 (IP terms) on the TechCorp MSA before 5 PM this Friday.',
      webLink: 'https://mail.google.com/mail/u/0/#inbox/th-101',
      provider: 'gmail'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    accountId: 'acc-demo-workspace'
  },
  {
    id: 'task-seed-2',
    title: 'Patch exponential backoff on Stripe checkout webhook handler',
    description: 'SRE alert: 429 rate limit errors on checkout webhook ingress. Needs staging deployment today before peak traffic.',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '18:00',
    priority: 'high',
    category: 'Deadline',
    status: 'todo',
    confidence: 0.94,
    reason: 'High-severity production SRE alert requiring engineering patch',
    actionItems: [
      'Inspect Linear ticket ENG-4029',
      'Add jittered exponential backoff to webhook retry loop',
      'Deploy to staging and verify with Datadog metrics'
    ],
    sourceEmail: {
      id: 'msg-108',
      threadId: 'th-108',
      subject: 'Production Bug: Webhook retry storm on v2 checkout endpoints',
      senderName: 'Marcus Vance (Principal SRE)',
      senderEmail: 'marcus.vance@company.internal',
      date: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
      snippet: 'We detected 429 rate limit errors on the Stripe webhook handler. Need someone to deploy a backoff fix today.',
      webLink: 'https://mail.google.com/mail/u/0/#inbox/th-108',
      provider: 'gmail'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    accountId: 'acc-demo-workspace'
  },
  {
    id: 'task-seed-3',
    title: 'Attend Q3 Product Roadmap Sync & prepare wireframes',
    description: '45-min roadmap alignment meeting with VP Product David Chen. Bring updated user flow wireframes and Figma notes.',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueTime: '14:00',
    priority: 'medium',
    category: 'Meeting/Interview',
    status: 'todo',
    confidence: 0.91,
    reason: 'Scheduled calendar sync with executive stakeholder',
    actionItems: [
      'Review Figma onboarding canvas',
      'Prepare 3 key discussion points on Q3 release milestones'
    ],
    sourceEmail: {
      id: 'msg-102',
      threadId: 'th-102',
      subject: 'Q3 Product Roadmap Sync & Design Review - Call Invite',
      senderName: 'David Chen (VP Product)',
      senderEmail: 'david.chen@enterprise.io',
      date: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      snippet: 'Let\'s meet tomorrow at 2:00 PM EST to align on the Q3 release schedule and design tokens.',
      webLink: 'https://mail.google.com/mail/u/0/#inbox/th-102',
      provider: 'gmail'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    accountId: 'acc-demo-workspace'
  },
  {
    id: 'task-seed-4',
    title: 'Reply to Elena Rostova with beta invite & API docs',
    description: 'Customer user research follow-up. Share onboarding beta link and webhook integration guides.',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueTime: null,
    priority: 'low',
    category: 'Reply Needed',
    status: 'todo',
    confidence: 0.88,
    reason: 'Direct deliverable request following user research interview',
    actionItems: [
      'Generate team beta invite token',
      'Email API documentation link to elena.rostova@designstudio.co'
    ],
    sourceEmail: {
      id: 'msg-104',
      threadId: 'th-104',
      subject: 'Follow up on customer interview: Elena Rostova (Feedback on search)',
      senderName: 'Elena Rostova',
      senderEmail: 'elena.rostova@designstudio.co',
      date: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
      snippet: 'Can you send over the beta invite link and documentation you mentioned? Excited to test it out.',
      webLink: 'https://mail.google.com/mail/u/0/#inbox/th-104',
      provider: 'gmail'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
    accountId: 'acc-demo-workspace'
  },
  {
    id: 'task-seed-5',
    title: 'Submit technical interview evaluation score for Alex Rivera',
    description: 'Complete 60-min architecture interview rubric in Lever by end of day Thursday.',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueTime: '17:00',
    priority: 'medium',
    category: 'Meeting/Interview',
    status: 'done',
    confidence: 0.92,
    reason: 'Recruiting panel score deadline',
    actionItems: [
      'Fill out architecture rubric score in Lever',
      'Submit written hiring recommendation'
    ],
    sourceEmail: {
      id: 'msg-106',
      threadId: 'th-106',
      subject: 'Candidate Interview: Senior Full-Stack Engineer - Alex Rivera',
      senderName: 'Talent Acquisition',
      senderEmail: 'recruiting@growthtech.com',
      date: new Date(Date.now() - 1000 * 60 * 1100).toISOString(),
      snippet: 'Please submit your interview score & rubric feedback by end of day Thursday.',
      webLink: 'https://outlook.live.com/mail/0/inbox/id/th-106',
      provider: 'outlook'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 1100).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    accountId: 'acc-demo-workspace'
  }
];

const INITIAL_DEMO_ACCOUNT: ConnectedAccount = {
  id: 'acc-demo-workspace',
  provider: 'demo',
  email: 'demo@inboxflow.sample',
  name: 'Demo Workspace',
  connectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  lastSyncedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  isTestMode: true
};

export function getStoredTasks(): InboxTask[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(TASKS_KEY);
  if (!raw) {
    // Seed initial tasks on first visit
    localStorage.setItem(TASKS_KEY, JSON.stringify(INITIAL_DEMO_TASKS));
    return INITIAL_DEMO_TASKS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredTasks(tasks: InboxTask[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function getStoredAccounts(): ConnectedAccount[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(ACCOUNTS_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredAccounts(accounts: ConnectedAccount[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getActiveAccountId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_ACCOUNT_KEY) || null;
}

export function setActiveAccountId(id: string | null): void {
  if (typeof window === 'undefined') return;
  if (id) {
    localStorage.setItem(ACTIVE_ACCOUNT_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
  }
}

export function getStoredConfig(): ScanConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  const raw = localStorage.getItem(CONFIG_KEY);
  if (!raw) return DEFAULT_CONFIG;
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveStoredConfig(config: ScanConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function isOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export function setOnboardingCompleted(completed: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ONBOARDING_KEY, completed ? 'true' : 'false');
}

export function getProcessedThreadIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  const raw = localStorage.getItem(PROCESSED_THREADS_KEY);
  if (!raw) {
    return new Set(['th-101', 'th-102', 'th-104', 'th-105', 'th-106', 'th-107', 'th-108']);
  }
  try {
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

export function recordProcessedThreads(threadIds: string[]): void {
  if (typeof window === 'undefined') return;
  const existing = getProcessedThreadIds();
  threadIds.forEach(id => existing.add(id));
  localStorage.setItem(PROCESSED_THREADS_KEY, JSON.stringify(Array.from(existing)));
}

export function clearAllStorageData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TASKS_KEY);
  localStorage.removeItem(ACCOUNTS_KEY);
  localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
  localStorage.removeItem(CONFIG_KEY);
  localStorage.removeItem(PROCESSED_THREADS_KEY);
  localStorage.removeItem(ONBOARDING_KEY);
}
