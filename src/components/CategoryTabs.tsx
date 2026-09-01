import React, { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Mail, ExternalLink, Inbox, Star } from 'lucide-react';
import { InboxTask, TaskCategory, TaskStatus } from '../types';
import { formatRelativeDueDate, getCategoryStyle } from '../utils/dateUtils';

const CATEGORIES: TaskCategory[] = [
  'Engagements',
  'Deadlines / Reply',
  'Opportunities',
  'Experiences',
  'Finance',
  'Discover',
  'Updates',
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
  const [activeCategory, setActiveCategory] = useState<TaskCategory>('Engagements');

  // Compute total counts per category
  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of CATEGORIES) counts[cat] = 0;
    for (const t of tasks) counts[t.category] = (counts[t.category] || 0) + 1;
    return counts;
  }, [tasks]);

  // Tasks matching currently selected category tab
  const visibleTasks = useMemo(
    () => tasks.filter((t) => t.category === activeCategory),
    [tasks, activeCategory]
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* 1 Category Tab Row (Sole Category Navigation in App) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-4 shrink-0">
        {CATEGORIES.map((cat) => {
          const style = getCategoryStyle(cat);
          const isActive = cat === activeCategory;
          const count = countsByCategory[cat] || 0;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-full border shrink-0 transition-all min-h-[44px] ${
                isActive
                  ? `${style.bg} ${style.text} ${style.border} font-bold ring-1 ring-slate-400/20`
                  : 'bg-[#F4F4F0] text-slate-600 border-[#E7E7E4] hover:bg-[#EBEBE6] hover:text-slate-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${style.dotColor}`} />
              <span>{cat}</span>
              <span className="text-[11px] opacity-70 font-normal">&middot; {count}</span>
            </button>
          );
        })}
      </div>

      {/* Flat task list for selected category */}
      <div className="flex flex-col gap-2.5 overflow-y-auto flex-1 pr-1">
        {visibleTasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
            <Inbox className="w-8 h-8 mb-2.5 opacity-40 text-slate-400" />
            <p className="text-sm font-medium">nothing here yet</p>
          </div>
        )}

        {visibleTasks.map((task) => {
          const isDone = task.status === 'done';
          const dueInfo = formatRelativeDueDate(task.dueDate, task.dueTime);

          return (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className={`flex items-center gap-3 bg-white border border-[#E7E7E4] rounded-xl px-4 py-3 cursor-pointer hover:border-slate-300 transition-colors shadow-2xs min-h-[64px] ${
                isDone ? 'opacity-50 bg-slate-50/70 border-dashed' : ''
              }`}
            >
              {/* Checkbox toggle with min 44px touch target */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(task.id, isDone ? 'todo' : 'done');
                }}
                className="text-slate-400 hover:text-[#C2542D] transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2"
                aria-label={isDone ? 'Mark to do' : 'Mark completed'}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>

              {/* Title & Sender metadata */}
              <div className="flex-1 min-w-0 py-0.5">
                <div className={`text-sm font-bold text-slate-800 truncate ${isDone ? 'line-through text-slate-400 font-normal' : ''}`}>
                  {task.title}
                </div>
                {task.isPrioritySender && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-violet-700">
                    <Star className="w-3 h-3 fill-violet-500 text-violet-500" /> Priority sender
                  </span>
                )}
                {task.sourceEmail ? (
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{task.sourceEmail.senderName}</span>
                    {task.sourceEmail.webLink && (
                      <a
                        href={task.sourceEmail.webLink}
                        target="_blank"
                        rel="noreferrer noopener"
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-[#C2542D] shrink-0 flex items-center gap-1 font-medium ml-1"
                      >
                        <ExternalLink className="w-3 h-3" /> view email
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 mt-0.5 italic">Self-created</div>
                )}
              </div>

              {/* Due Date pill (if present) */}
              {task.dueDate && !isDone && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${dueInfo.pillColor}`}>
                  {dueInfo.label}
                </span>
              )}

              {/* Editable Category Dropdown */}
              <select
                value={task.category}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onCategoryChange(task.id, e.target.value as TaskCategory)}
                className="text-xs font-medium border border-[#E7E7E4] rounded-lg py-2 px-2.5 bg-slate-50 text-slate-700 shrink-0 outline-none focus:ring-2 focus:ring-[#C2542D] min-h-[44px]"
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
