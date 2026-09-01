import { TaskCategory, TaskPriority } from '../types';

export function formatRelativeDueDate(dueDateStr?: string | null, dueTimeStr?: string | null): {
  label: string;
  isOverdue: boolean;
  isDueSoon: boolean;
  pillColor: string;
} {
  if (!dueDateStr) {
    return {
      label: 'No deadline',
      isOverdue: false,
      isDueSoon: false,
      pillColor: 'text-slate-400 bg-slate-50 border border-slate-100',
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const [year, month, day] = dueDateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const timeSuffix = dueTimeStr ? ` · ${formatTimeDisplay(dueTimeStr)}` : '';

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    return {
      label: daysAgo === 1 ? `URGENT (1d ago)` : `URGENT (${daysAgo}d ago)`,
      isOverdue: true,
      isDueSoon: false,
      pillColor: 'text-red-500 bg-red-50 border border-red-100 font-bold',
    };
  }

  if (diffDays === 0) {
    return {
      label: `Today${timeSuffix}`,
      isOverdue: false,
      isDueSoon: true,
      pillColor: 'text-red-500 bg-red-50 border border-red-100 font-bold',
    };
  }

  if (diffDays === 1) {
    return {
      label: `Tomorrow${timeSuffix}`,
      isOverdue: false,
      isDueSoon: true,
      pillColor: 'text-slate-500 bg-slate-50 border border-slate-100 font-bold',
    };
  }

  if (diffDays <= 6) {
    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      label: `${dayName}, ${targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${timeSuffix}`,
      isOverdue: false,
      isDueSoon: false,
      pillColor: 'text-slate-500 bg-slate-50 border border-slate-100 font-medium',
    };
  }

  return {
    label: `${targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${timeSuffix}`,
    isOverdue: false,
    isDueSoon: false,
    pillColor: 'text-slate-500 bg-slate-50 border border-slate-100 font-medium',
  };
}

export function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return '';
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = minutesStr ? minutesStr.padStart(2, '0') : '00';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes} ${ampm}`;
}

export function formatLastSynced(dateString?: string): string {
  if (!dateString) return 'Never synced';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 1) return 'Just now';
  if (mins === 1) return '1 min ago';
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getCategoryStyle(category: TaskCategory): {
  bg: string;
  text: string;
  border: string;
  dotColor: string;
} {
  switch (category) {
    case 'Engagements':
      return {
        bg: 'bg-sky-100',
        text: 'text-sky-800',
        border: 'border-sky-200',
        dotColor: 'bg-sky-500',
      };
    case 'Opportunities':
      return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        dotColor: 'bg-emerald-500',
      };
    case 'Experiences':
      return {
        bg: 'bg-pink-100',
        text: 'text-pink-800',
        border: 'border-pink-200',
        dotColor: 'bg-pink-500',
      };
    case 'Deadlines / Reply':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        dotColor: 'bg-red-500',
      };
    case 'Finance':
      return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        dotColor: 'bg-emerald-500',
      };
    case 'Discover':
      return { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200', dotColor: 'bg-violet-500' };
    case 'Updates':
      return { bg: 'bg-slate-200', text: 'text-slate-800', border: 'border-slate-300', dotColor: 'bg-slate-500' };
    case 'Spam':
      return {
        bg: 'bg-stone-200',
        text: 'text-stone-700',
        border: 'border-stone-300',
        dotColor: 'bg-stone-500',
      };
    default:
      return {
        bg: 'bg-slate-200',
        text: 'text-slate-800',
        border: 'border-slate-300',
        dotColor: 'bg-slate-500',
      };
  }
}

export function getPriorityStyle(priority: TaskPriority): {
  label: string;
  dotColor: string;
  textColor: string;
} {
  switch (priority) {
    case 'high':
      return {
        label: 'High',
        dotColor: 'bg-red-500',
        textColor: 'text-slate-400'
      };
    case 'medium':
      return {
        label: 'Medium',
        dotColor: 'bg-amber-400',
        textColor: 'text-slate-400'
      };
    case 'low':
    default:
      return {
        label: 'Low',
        dotColor: 'bg-slate-400',
        textColor: 'text-slate-400'
      };
  }
}
