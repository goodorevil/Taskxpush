import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  Mail, 
  Clock, 
  Sparkles, 
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { InboxTask, TaskStatus } from '../types';
import { formatRelativeDueDate, getCategoryStyle, getPriorityStyle } from '../utils/dateUtils';

interface TaskCardProps {
  task: InboxTask;
  onClick: () => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onStatusChange,
  isDragging = false,
  onDragStart,
}) => {
  const isDone = task.status === 'done';
  const isInProgress = task.status === 'in_progress';
  const dueInfo = formatRelativeDueDate(task.dueDate, task.dueTime);
  const catStyle = getCategoryStyle(task.category);
  const priorityStyle = getPriorityStyle(task.priority);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStatusChange(task.id, isDone ? 'todo' : 'done');
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Helper for sender initials & background
  const getSenderInitials = (name?: string) => {
    if (!name) return 'ME';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div
      id={`task-card-${task.id}`}
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, task.id)}
      onClick={onClick}
      className={`group relative flex flex-col p-4 rounded-xl cursor-pointer select-none transition-all duration-150 gap-3 ${
        isDragging
          ? 'opacity-40 shadow-none ring-2 ring-orange-500/50'
          : 'active:scale-[0.99]'
      } ${
        isDone
          ? 'bg-slate-50 border border-dashed border-[#E7E7E4] grayscale opacity-80 shadow-none'
          : isInProgress
          ? 'bg-white border border-orange-200 shadow-md border-l-4 border-l-orange-500 hover:shadow-lg'
          : 'bg-white border border-[#E7E7E4] shadow-sm hover:shadow-md hover:border-slate-300'
      }`}
    >
      {/* Top Header: Category & Priority */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Category Chip */}
          <span
            id={`category-chip-${task.id}`}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight ${catStyle.bg} ${catStyle.text}`}
          >
            {task.category}
          </span>

          {/* Manual Tag */}
          {task.isManual && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
              Manual
            </span>
          )}
        </div>

        {/* Priority Badge */}
        <div
          id={`priority-badge-${task.id}`}
          className="flex items-center gap-1 text-[10px] font-medium text-slate-400"
          title={`Priority: ${priorityStyle.label}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dotColor}`} />
          <span>{priorityStyle.label}</span>
        </div>
      </div>

      {/* Task Title & Status Checkbox */}
      <div className="flex items-start gap-2.5">
        <button
          id={`task-toggle-${task.id}`}
          type="button"
          onClick={handleCheckboxClick}
          className="mt-0.5 shrink-0 text-slate-400 hover:text-orange-600 transition-colors focus:outline-none"
          title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
        >
          {isDone ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
          ) : (
            <Circle className="w-4 h-4 hover:stroke-orange-600" />
          )}
        </button>

        <p
          className={`text-sm leading-tight flex-1 ${
            isDone
              ? 'line-through text-slate-400 font-medium'
              : 'font-bold text-slate-800'
          }`}
        >
          {task.title}
        </p>
      </div>

      {/* Description Snippet if available */}
      {task.description && !isDone && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed -mt-1 pl-6.5">
          {task.description}
        </p>
      )}

      {/* Footer: Sender Info on left, Due Date Pill on right */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
        {/* Source info / Sender Avatar */}
        {task.sourceEmail ? (
          <div className="flex items-center gap-1.5 min-w-0 max-w-[65%]">
            <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-[9px] text-white font-bold shrink-0">
              {getSenderInitials(task.sourceEmail.senderName)}
            </div>
            <span
              className="text-[10px] text-slate-400 italic truncate"
              title={`From: ${task.sourceEmail.senderName} (${task.sourceEmail.senderEmail})`}
            >
              {task.sourceEmail.senderName}
            </span>
            {task.sourceEmail.webLink && (
              <a
                id={`email-link-${task.id}`}
                href={task.sourceEmail.webLink}
                target="_blank"
                rel="noreferrer noopener"
                onClick={handleLinkClick}
                className="text-slate-400 hover:text-orange-600 p-0.5 rounded transition-colors shrink-0"
                title={`Open email: "${task.sourceEmail.subject}"`}
              >
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] text-slate-600 font-bold">
              ME
            </div>
            <span className="text-[10px] text-slate-400 italic">Self-created</span>
          </div>
        )}

        {/* Due date pill */}
        <span
          id={`due-date-${task.id}`}
          className={`text-[10px] font-bold px-2 py-0.5 rounded ${dueInfo.pillColor}`}
        >
          {dueInfo.label}
        </span>
      </div>
    </div>
  );
};
