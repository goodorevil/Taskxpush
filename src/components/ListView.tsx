import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  ExternalLink, 
  ArrowUpDown, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { InboxTask, TaskStatus } from '../types';
import { formatRelativeDueDate, getCategoryStyle, getPriorityStyle } from '../utils/dateUtils';

interface ListViewProps {
  tasks: InboxTask[];
  onTaskClick: (task: InboxTask) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  onTaskClick,
  onStatusChange,
}) => {
  return (
    <div id="list-view-container" className="flex flex-col flex-1 bg-white border border-[#E7E7E4] rounded-xl overflow-hidden shadow-sm">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-3 px-5 py-3.5 bg-slate-50/80 border-b border-[#E7E7E4] text-xs font-semibold text-slate-500 select-none">
        <div className="col-span-6 md:col-span-5 flex items-center gap-2">
          <span>Task & Source</span>
        </div>
        <div className="hidden md:flex md:col-span-2 items-center">
          <span>Category</span>
        </div>
        <div className="col-span-3 md:col-span-2 flex items-center">
          <span>Due Date</span>
        </div>
        <div className="hidden md:flex md:col-span-2 items-center">
          <span>Priority</span>
        </div>
        <div className="col-span-3 md:col-span-1 flex items-center justify-end">
          <span>Status</span>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#E7E7E4]/60 overflow-y-auto max-h-[calc(100vh-270px)]">
        {tasks.map((task) => {
          const isDone = task.status === 'done';
          const dueInfo = formatRelativeDueDate(task.dueDate, task.dueTime);
          const catStyle = getCategoryStyle(task.category);
          const priorityStyle = getPriorityStyle(task.priority);

          return (
            <div
              key={task.id}
              id={`list-row-${task.id}`}
              onClick={() => onTaskClick(task)}
              className={`grid grid-cols-12 gap-3 items-center px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                isDone ? 'bg-slate-50/60 opacity-70' : ''
              }`}
            >
              {/* Task Title & Checkbox */}
              <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(task.id, isDone ? 'todo' : 'done');
                  }}
                  className="text-slate-400 hover:text-orange-600 transition-colors shrink-0"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                  ) : (
                    <Circle className="w-4 h-4 hover:stroke-orange-600" />
                  )}
                </button>

                <div className="flex flex-col min-w-0 pr-2">
                  <span
                    className={`text-sm font-semibold text-slate-800 truncate ${
                      isDone ? 'line-through text-slate-400 font-normal' : ''
                    }`}
                  >
                    {task.title}
                  </span>
                  {task.sourceEmail && (
                    <span className="text-[11px] text-slate-400 italic truncate flex items-center gap-1 mt-0.5">
                      From {task.sourceEmail.senderName} · {task.sourceEmail.subject}
                    </span>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="hidden md:flex md:col-span-2 items-center">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight ${catStyle.bg} ${catStyle.text}`}
                >
                  {task.category}
                </span>
              </div>

              {/* Due Date */}
              <div className="col-span-3 md:col-span-2 flex items-center">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${dueInfo.pillColor}`}
                >
                  <span className="truncate">{dueInfo.label}</span>
                </span>
              </div>

              {/* Priority */}
              <div className="hidden md:flex md:col-span-2 items-center">
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                  <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dotColor}`} />
                  <span>{priorityStyle.label}</span>
                </div>
              </div>

              {/* Status Pill */}
              <div className="col-span-3 md:col-span-1 flex items-center justify-end">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    task.status === 'done'
                      ? 'bg-emerald-50 text-emerald-700'
                      : task.status === 'in_progress'
                      ? 'bg-orange-50 text-orange-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <Filter className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No matching tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
};
