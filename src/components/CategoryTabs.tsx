import React, { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Mail, ExternalLink, Inbox } from 'lucide-react';
import { InboxTask, TaskCategory, TaskStatus } from '../types';
import { formatRelativeDueDate, getCategoryStyle } from '../utils/dateUtils';

const CATEGORIES: TaskCategory[] = [
  'Meeting/Interview',
  'Job/Internship offer',
  'Event',
  'Deadline',
  'Reply Needed',
  'Opportunity',
  'General',
  'Spam',
];

interface CategoryTabsProps {
  tasks: InboxTask[];
  onTaskClick: (task: InboxTask) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onCategoryChange: (taskId: string, newCategory: TaskCategory) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  tasks,
  onTaskClick,
  onStatusChange,
  onCategoryChange,
}) => {
  const [activeCategory, setActiveCategory] = useState<TaskCategory>('Meeting/Interview');

  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of CATEGORIES) counts[cat] = 0;
    for (const t of tasks) counts[t.category] = (counts[t.category] || 0) + 1;
    return counts;
  }, [tasks]);

  const visibleTasks = useMemo(
    () => tasks.filter((t) => t.category === activeCategory),
    [tasks, activeCategory]
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Category tab row */}
      <div className="flex gap-2 flex-wrap mb-4">
        {CATEGORIES.map((cat) => {
          const style = getCategoryStyle(cat);
          const isActive = cat === activeCategory;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                isActive
                  ? `${style.bg} ${style.text} ${style.border} border`
                  : 'bg-white text-slate-500 border-[#E7E7E4] hover:border-slate-300'
              }`}
            >
              {cat} <span className="opacity-60">&middot; {countsByCategory[cat] || 0}</span>
            </button>
          );
        })}
      </div>

      {/* Flat task list for the active category */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1">
        {visibleTasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-400">
            <Inbox className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm font-medium">Nothing here yet</p>
          </div>
        )}

        {visibleTasks.map((task) => {
          const isDone = task.status === 'done';
          const dueInfo = formatRelativeDueDate(task.dueDate, task.dueTime);

          return (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className={`flex items-center gap-3 bg-white border border-[#E7E7E4] rounded-xl px-4 py-3 cursor-pointer hover:border-slate-300 transition-colors ${
                isDone ? 'opacity-50' : ''
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(task.id, isDone ? 'todo' : 'done');
                }}
                className="text-slate-400 hover:text-orange-600 transition-colors shrink-0"
                aria-label="Mark done"
              >
                {isDone ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 fill-emerald-50" />
                ) : (
                  <Circle className="w-4.5 h-4.5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold text-slate-800 truncate ${isDone ? 'line-through text-slate-400 font-normal' : ''}`}>
                  {task.title}
                </div>
                {task.sourceEmail && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{task.sourceEmail.senderName}</span>
                    {task.sourceEmail.webLink && (
                      <a
                        href={task.sourceEmail.webLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-orange-600 shrink-0 flex items-center gap-0.5"
                      >
                        <ExternalLink className="w-3 h-3" /> view email
                      </a>
                    )}
                  </div>
                )}
              </div>

              {task.dueDate && !isDone && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${dueInfo.pillColor}`}>
                  {dueInfo.label}
                </span>
              )}

              <select
                value={task.category}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onCategoryChange(task.id, e.target.value as TaskCategory)}
                className="text-xs border border-[#E7E7E4] rounded-lg py-1 px-2 bg-slate-50 text-slate-600 shrink-0 outline-none focus:ring-2 focus:ring-orange-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
};
