/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  InboxTask, 
  ConnectedAccount, 
  ScanConfig, 
  ScanProgress, 
  TaskCategory, 
  TaskStatus, 
  EmailSource 
} from './types';
import { 
  getStoredTasks, 
  saveStoredTasks, 
  getStoredAccounts, 
  saveStoredAccounts, 
  getActiveAccountId, 
  setActiveAccountId, 
  getStoredConfig, 
  saveStoredConfig, 
  isOnboardingCompleted, 
  setOnboardingCompleted,
  getProcessedThreadIds,
  recordProcessedThreads,
  clearAllStorageData
} from './services/storage';
import { extractTasksFromEmails, fetchSampleInbox } from './services/geminiService';
import { requestGmailOAuthToken, fetchGmailMessages } from './services/gmailApi';
import { requestOutlookOAuthToken, fetchOutlookMessages } from './services/outlookApi';

import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { CategoryTabs } from './components/CategoryTabs';
import { TaskDetailModal } from './components/TaskDetailModal';
import { AddTaskModal } from './components/AddTaskModal';
import { ScanningModal } from './components/ScanningModal';
import { LandingConnect } from './components/LandingConnect';
import { OnboardingFlow } from './components/OnboardingFlow';
import { SettingsModal } from './components/SettingsModal';
import { OAuthGuideModal } from './components/OAuthGuideModal';

export default function App() {
  // Global State
  const [tasks, setTasks] = useState<InboxTask[]>([]);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [activeAccountId, setActiveAccountIdState] = useState<string | null>(null);
  const [config, setConfig] = useState<ScanConfig>(getStoredConfig());
  const [initialized, setInitialized] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'done'>('all');

  // Modals & Drawers
  const [selectedTask, setSelectedTask] = useState<InboxTask | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [addTaskDefaultStatus, setAddTaskDefaultStatus] = useState<TaskStatus>('todo');
  const [addTaskDefaultDueDate, setAddTaskDefaultDueDate] = useState<string | undefined>(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isOAuthGuideOpen, setIsOAuthGuideOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'error' | 'success' } | null>(null);

  // Scanning state
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    isScanning: false,
    totalEmails: 0,
    processedEmails: 0,
    tasksFound: 0,
    skippedEmails: 0,
  });

  // Initialize data on mount
  useEffect(() => {
    const loadedTasks = getStoredTasks();
    const loadedAccounts = getStoredAccounts();
    const activeId = getActiveAccountId() || (loadedAccounts.length > 0 ? loadedAccounts[0].id : null);
    const loadedConfig = getStoredConfig();

    setTasks(loadedTasks);
    setAccounts(loadedAccounts);
    setActiveAccountIdState(activeId);
    setConfig(loadedConfig);

    if (!isOnboardingCompleted() && loadedAccounts.length === 0) {
      setIsOnboardingOpen(true);
    }
    setInitialized(true);
  }, []);

  // Save tasks to LocalStorage whenever they change
  useEffect(() => {
    if (initialized) {
      saveStoredTasks(tasks);
    }
  }, [tasks, initialized]);

  // Save accounts whenever they change
  useEffect(() => {
    if (initialized) {
      saveStoredAccounts(accounts);
    }
  }, [accounts, initialized]);

  const activeAccount = useMemo(() => {
    return accounts.find((a) => a.id === activeAccountId) || (accounts.length > 0 ? accounts[0] : null);
  }, [accounts, activeAccountId]);

  const showToast = (text: string, type: 'info' | 'error' | 'success' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Connect Gmail Handler
  const handleConnectGmail = async () => {
    setIsConnecting(true);
    try {
      showToast('Connecting to Google Identity...', 'info');
      const { accessToken, userEmail, userName } = await requestGmailOAuthToken();

      const newAccount: ConnectedAccount = {
        id: `acc-gmail-${Date.now()}`,
        provider: 'gmail',
        email: userEmail,
        name: userName,
        connectedAt: new Date().toISOString(),
        accessToken,
      };

      const updated = [...accounts.filter((a) => a.email !== userEmail), newAccount];
      setAccounts(updated);
      setActiveAccountIdState(newAccount.id);
      setActiveAccountId(newAccount.id);
      setIsConnecting(false);

      showToast(`Connected Gmail: ${userEmail}`, 'success');
      setTimeout(() => {
        handleScanInbox(newAccount);
      }, 400);
    } catch (err: any) {
      console.warn('Gmail OAuth error/fallback:', err);
      setIsConnecting(false);
      showToast(err.message || 'Google OAuth app is in testing mode. Connect using developer test account or try Demo Workspace.', 'error');
    }
  };

  // Connect Outlook Handler
  const handleConnectOutlook = async () => {
    setIsConnecting(true);
    try {
      showToast('Connecting to Microsoft Identity...', 'info');
      const { accessToken, userEmail, userName } = await requestOutlookOAuthToken();

      const newAccount: ConnectedAccount = {
        id: `acc-outlook-${Date.now()}`,
        provider: 'outlook',
        email: userEmail,
        name: userName,
        connectedAt: new Date().toISOString(),
        accessToken,
      };

      const updated = [...accounts.filter((a) => a.email !== userEmail), newAccount];
      setAccounts(updated);
      setActiveAccountIdState(newAccount.id);
      setActiveAccountId(newAccount.id);
      setIsConnecting(false);

      showToast(`Connected Outlook: ${userEmail}`, 'success');
      setTimeout(() => {
        handleScanInbox(newAccount);
      }, 400);
    } catch (err: any) {
      console.warn('Outlook auth error:', err);
      setIsConnecting(false);
      showToast(err.message || 'Outlook connection cancelled', 'error');
    }
  };

  // Try Demo Workspace
  const handleTryDemo = () => {
    const demoAcc: ConnectedAccount = {
      id: 'acc-demo-workspace',
      provider: 'demo',
      email: 'demo@inboxflow.sample',
      name: 'Demo Workspace',
      connectedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
      isTestMode: true,
    };

    if (!accounts.some((a) => a.id === demoAcc.id)) {
      setAccounts([...accounts, demoAcc]);
    }
    setActiveAccountIdState(demoAcc.id);
    setActiveAccountId(demoAcc.id);
    showToast('Loaded demo workspace with sample emails - sample data only', 'info');
  };

  // Scan & Extract Actionable Tasks
  const handleScanInbox = useCallback(
    async (accountToScan?: ConnectedAccount | null) => {
      const targetAccount = accountToScan || activeAccount;
      if (!targetAccount) {
        showToast('Please connect an email account first.', 'error');
        return;
      }

      setScanProgress({
        isScanning: true,
        totalEmails: 0,
        processedEmails: 0,
        tasksFound: 0,
        skippedEmails: 0,
        statusMessage: 'Fetching incoming messages...',
      });

      try {
        let emails: EmailSource[] = [];

        if (targetAccount.provider === 'gmail' && targetAccount.accessToken && !targetAccount.isTestMode) {
          emails = await fetchGmailMessages(
            targetAccount.accessToken,
            config.scanLimit,
            config.scanRangeDays
          );
        } else if (targetAccount.provider === 'outlook' && targetAccount.accessToken && !targetAccount.isTestMode) {
          emails = await fetchOutlookMessages(targetAccount.accessToken, config.scanLimit);
        } else {
          // Demo / Sandbox emails
          emails = await fetchSampleInbox();
        }

        const touchLastSynced = () => {
          const nowIso = new Date().toISOString();
          setAccounts((prevAccounts) => {
           const updatedAccounts = prevAccounts.map((acc) =>
            acc.id === targetAccount.id ? { ...acc, lastSyncedAt: nowIso } : acc
           );
           saveStoredAccounts(updatedAccounts);
           return updatedAccounts;
         });
       };

        if (emails.length === 0) {
          touchLastSynced();
          setScanProgress((prev) => ({ ...prev, isScanning: false }));
          showToast('No new emails found in scan range.', 'info');
          return;
        }

        // Check deduplication
        const processedSet = getProcessedThreadIds();
        const unProcessedEmails = emails.filter((em) => !processedSet.has(em.threadId));

        if (unProcessedEmails.length === 0) {
          touchLastSynced();
          setScanProgress((prev) => ({ ...prev, isScanning: false }));
          showToast('Inbox is up to date. All recent emails have already been scanned.', 'success');
          return;
        }

        setScanProgress((prev) => ({
          ...prev,
          totalEmails: unProcessedEmails.length,
          processedEmails: 0,
        }));

        // Send to Gemini in batches of 4 with live ticker
        const batchSize = 4;
        const newTasks: InboxTask[] = [];
        let skippedCount = 0;

        for (let i = 0; i < unProcessedEmails.length; i += batchSize) {
          const batch = unProcessedEmails.slice(i, i + batchSize);

          setScanProgress((prev) => ({
            ...prev,
            currentSubject: batch[0].subject,
            statusMessage: `Scanning ${i + 1} to ${Math.min(i + batchSize, unProcessedEmails.length)} of ${unProcessedEmails.length}...`,
          }));

          const extractionRes = await extractTasksFromEmails(batch);

          for (const res of extractionRes.results) {
            const originalEmail = batch.find((e) => e.id === res.emailId || e.threadId === res.threadId);
            const newTask: InboxTask = {
              id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              title: res.taskTitle || originalEmail?.subject || '(No subject)',
              description: res.description || originalEmail?.snippet,
              dueDate: res.dueDate || null,
              dueTime: res.dueTime || null,
              priority: res.priority || 'medium',
              category: res.category || 'General',
              status: 'todo',
              confidence: res.confidence || 0.85,
              reason: res.reason,
              actionItems: res.actionItems || [],
              sourceEmail: originalEmail,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              accountId: targetAccount.id,
            };
            newTasks.push(newTask);
          }

          setScanProgress((prev) => ({
            ...prev,
            processedEmails: Math.min(i + batch.length, unProcessedEmails.length),
            tasksFound: newTasks.length,
            skippedEmails: skippedCount,
          }));

          await new Promise((r) => setTimeout(r, 200));
        }

        // Record processed threads
        recordProcessedThreads(unProcessedEmails.map((e) => e.threadId));

        // Update active account last synced timestamp
        touchLastSynced();

        // Prepend new tasks & save
        setTasks((prev) => {
          const combined = [...newTasks, ...prev];
          saveStoredTasks(combined);
          return combined;
        });

        setScanProgress((prev) => ({ ...prev, isScanning: false }));

        if (newTasks.length > 0) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
          showToast(`Sorted ${newTasks.length} emails into your categories!`, 'success');
        } else {
          showToast('Scan complete. No new emails to sort.', 'info');
        }
      } catch (scanError: any) {
        console.error('Scan error:', scanError);
        setScanProgress((prev) => ({ ...prev, isScanning: false }));
        showToast(scanError.message || 'Failed to scan inbox.', 'error');
      }
    },
    [activeAccount, accounts, config]
  );

  // Background Auto-sync setup
  useEffect(() => {
    if (!config.autoSync || !activeAccount) return;
    const intervalMs = Math.max(config.autoSyncIntervalMin, 5) * 60 * 1000;
    const interval = setInterval(() => {
      console.log('Running background auto-sync...');
      handleScanInbox(activeAccount);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [config.autoSync, config.autoSyncIntervalMin, activeAccount, handleScanInbox]);

  // Task Status Update (persist to storage immediately)
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === taskId) {
          if (newStatus === 'done' && t.status !== 'done') {
            confetti({
              particleCount: 30,
              spread: 45,
              origin: { y: 0.8 },
            });
          }
          return {
            ...t,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            completedAt: newStatus === 'done' ? new Date().toISOString() : null,
          };
        }
        return t;
      });
      saveStoredTasks(updated);
      return updated;
    });
  };

  // Manual category override (persist to storage immediately)
  const handleCategoryChange = (taskId: string, newCategory: TaskCategory) => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId ? { ...t, category: newCategory, updatedAt: new Date().toISOString() } : t
      );
      saveStoredTasks(updated);
      return updated;
    });
  };

  // Add Manual Task
  const handleAddManualTask = (newTaskData: Omit<InboxTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: InboxTask = {
      ...newTaskData,
      id: `task-manual-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accountId: activeAccount?.id,
    };
    setTasks((prev) => {
      const updated = [newTask, ...prev];
      saveStoredTasks(updated);
      return updated;
    });
    showToast('Task created', 'success');
  };

  // Update Task
  const handleUpdateTask = (updatedTask: InboxTask) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === updatedTask.id ? updatedTask : t));
      saveStoredTasks(updated);
      return updated;
    });
    showToast('Task updated', 'success');
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      saveStoredTasks(updated);
      return updated;
    });
    showToast('Task removed', 'info');
  };

  // Disconnect Account
  const handleDisconnectAccount = (accId: string) => {
    const remaining = accounts.filter((a) => a.id !== accId);
    setAccounts(remaining);
    if (activeAccountId === accId) {
      const nextId = remaining.length > 0 ? remaining[0].id : null;
      setActiveAccountIdState(nextId);
      setActiveAccountId(nextId);
    }
    showToast('Account disconnected', 'info');
  };

  // Clear All Data
  const handleClearAllData = () => {
    clearAllStorageData();
    setTasks([]);
    setAccounts([]);
    setActiveAccountIdState(null);
    showToast('All stored tasks and accounts have been wiped.', 'info');
  };

  // Filtered & Searched Tasks list
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Account filter
      if (activeAccount && task.accountId && task.accountId !== activeAccount.id) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        const matchesSender = task.sourceEmail?.senderName.toLowerCase().includes(q);
        const matchesSubject = task.sourceEmail?.subject.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSender && !matchesSubject) {
          return false;
        }
      }

      // Status filter
      if (selectedStatusFilter === 'active' && task.status === 'done') {
        return false;
      }
      if (selectedStatusFilter === 'done' && task.status !== 'done') {
        return false;
      }

      return true;
    });
  }, [tasks, activeAccount, searchQuery, selectedStatusFilter]);

  // If no account connected yet, display Landing / Connect screen
  if (accounts.length === 0) {
    return (
      <>
        <LandingConnect
          onConnectGmail={handleConnectGmail}
          onConnectOutlook={handleConnectOutlook}
          onTryDemo={handleTryDemo}
          onOpenOAuthGuide={() => setIsOAuthGuideOpen(true)}
          isConnecting={isConnecting}
        />

        <OnboardingFlow
          isOpen={isOnboardingOpen}
          onClose={() => {
            setOnboardingCompleted(true);
            setIsOnboardingOpen(false);
          }}
          config={config}
          onSaveConfig={(cfg) => {
            setConfig(cfg);
            saveStoredConfig(cfg);
          }}

          onStartFirstScan={() => {
            if (accounts.length > 0) {
             handleScanInbox(activeAccount);
            } else {
             handleTryDemo();
           }
          }}
        />

        <OAuthGuideModal
          isOpen={isOAuthGuideOpen}
          onClose={() => setIsOAuthGuideOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-[#FAFAF7] text-slate-800 overflow-hidden font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="toast-notification"
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${
            toastMessage.type === 'error'
              ? 'bg-rose-600 text-white'
              : toastMessage.type === 'success'
              ? 'bg-emerald-700 text-white'
              : 'bg-slate-900 text-white'
          }`}
        >
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar
        tasks={tasks}
        selectedStatusFilter={selectedStatusFilter}
        onSelectStatusFilter={setSelectedStatusFilter}
        accounts={accounts}
        activeAccount={activeAccount}
        onSelectAccount={(acc) => {
          setActiveAccountIdState(acc.id);
          setActiveAccountId(acc.id);
        }}
        onConnectNew={() => handleConnectGmail()}
        onDisconnectAccount={handleDisconnectAccount}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenOAuthGuide={() => setIsOAuthGuideOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={() => handleScanInbox()}
          isScanning={scanProgress.isScanning}
          lastSyncedAt={activeAccount?.lastSyncedAt}
          onOpenAddTask={() => {
            setAddTaskDefaultStatus('todo');
            setAddTaskDefaultDueDate(undefined);
            setIsAddTaskOpen(true);
          }}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Dashboard Workspace */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto flex flex-col min-h-0">
          <CategoryTabs
            tasks={filteredTasks}
            onTaskClick={setSelectedTask}
            onStatusChange={handleStatusChange}
            onCategoryChange={handleCategoryChange}
          />
        </main>
      </div>

      {/* Modals and Drawers */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />

      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => {
          setIsAddTaskOpen(false);
          setAddTaskDefaultDueDate(undefined);
        }}
        onAddTask={handleAddManualTask}
        defaultStatus={addTaskDefaultStatus}
        defaultDueDate={addTaskDefaultDueDate}
      />

      <ScanningModal
        progress={scanProgress}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={(cfg) => {
          setConfig(cfg);
          saveStoredConfig(cfg);
          showToast('Settings saved', 'success');
        }}
        accounts={accounts}
        onDisconnectAccount={handleDisconnectAccount}
        onClearAllData={handleClearAllData}
        onOpenOAuthGuide={() => setIsOAuthGuideOpen(true)}
      />

      <OAuthGuideModal
        isOpen={isOAuthGuideOpen}
        onClose={() => setIsOAuthGuideOpen(false)}
      />
    </div>
  );
}
