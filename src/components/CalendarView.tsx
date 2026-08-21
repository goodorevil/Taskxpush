import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Sparkles, 
  Check, 
  Layers,
  ChevronDown,
  X,
  ArrowRight,
  Filter
} from 'lucide-react';
import { InboxTask, TaskCategory, TaskPriority, TaskStatus } from '../types';
import { getCategoryStyle, getPriorityStyle, formatTimeDisplay } from '../utils/dateUtils';

interface CalendarViewProps {
  tasks: InboxTask[];
  onTaskClick: (task: InboxTask) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateDueDate?: (taskId: string, newDueDate: string | null) => void;
  onAddTaskForDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onTaskClick,
  onStatusChange,
  onUpdateDueDate,
  onAddTaskForDate,
}) => {
  // Current viewing month/year state (defaults to today)
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [showUnscheduledDrawer, setShowUnscheduledDrawer] = useState(false);
  const [expandedDayDate, setExpandedDayDate] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // Today's date string YYYY-MM-DD
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month name formatting
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Compute tasks with due dates and group them by YYYY-MM-DD
  const { tasksByDate, unscheduledTasks, monthStats } = useMemo(() => {
    const map: Record<string, InboxTask[]> = {};
    const unscheduled: InboxTask[] = [];
    let monthTotal = 0;
    let monthCompleted = 0;

    // Month prefix for matching (e.g. "2026-08")
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    tasks.forEach((task) => {
      if (task.dueDate) {
        if (!map[task.dueDate]) {
          map[task.dueDate] = [];
        }
        map[task.dueDate].push(task);

        if (task.dueDate.startsWith(monthPrefix)) {
          monthTotal++;
          if (task.status === 'done') {
            monthCompleted++;
          }
        }
      } else {
        unscheduled.push(task);
      }
    });

    return {
      tasksByDate: map,
      unscheduledTasks: unscheduled,
      monthStats: {
        total: monthTotal,
        completed: monthCompleted,
        pending: monthTotal - monthCompleted,
      }
    };
  }, [tasks, currentYear, currentMonth]);

  // Calendar Grid Days Calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday...
    const totalDaysInMonth = lastDayOfMonth.getDate();

    // Previous month trailing days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    const prevMonthDays: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      prevMonthDays.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    // Current month days
    const currentMonthDays: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      currentMonthDays.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // Next month leading days to complete 35 or 42 grid cells
    const remainingCells = (7 - ((prevMonthDays.length + currentMonthDays.length) % 7)) % 7;
    const nextMonthDays: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      nextMonthDays.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [currentYear, currentMonth, todayStr]);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId && onUpdateDueDate) {
      onUpdateDueDate(taskId, targetDateStr);
    }
    setDraggedTaskId(null);
  };

  // Expanded day tasks
  const expandedDayTasks = expandedDayDate ? (tasksByDate[expandedDayDate] || []) : [];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-[#E7E7E4] shadow-xs overflow-hidden">
      {/* Calendar Top Control Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-[#E7E7E4] bg-white gap-3 shrink-0">
        {/* Month Navigation & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <h2 className="text-base font-bold text-slate-800">
              {monthName} {currentYear}
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 border border-[#E7E7E4] rounded-lg p-0.5">
            <button
              id="calendar-prev-month-btn"
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="calendar-today-btn"
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white rounded-md transition-colors"
            >
              Today
            </button>
            <button
              id="calendar-next-month-btn"
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Month Metrics & Unscheduled Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span><strong>{monthStats.total}</strong> scheduled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span><strong>{monthStats.completed}</strong> completed</span>
            </div>
          </div>

          {/* Unscheduled Tasks Drawer Toggle */}
          <button
            id="toggle-unscheduled-tasks-btn"
            type="button"
            onClick={() => setShowUnscheduledDrawer(!showUnscheduledDrawer)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              showUnscheduledDrawer
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                : 'border-[#E7E7E4] hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Unscheduled</span>
            {unscheduledTasks.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                showUnscheduledDrawer ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {unscheduledTasks.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Calendar Area + Optional Unscheduled Sidebar */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Calendar Grid Container */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-y-auto">
          {/* Weekday Header Row */}
          <div className="grid grid-cols-7 border-b border-[#E7E7E4] bg-slate-50/80 sticky top-0 z-10">
            {weekdays.map((day, idx) => (
              <div
                key={day}
                className={`py-2 text-center text-[11px] font-bold uppercase tracking-wider ${
                  idx === 0 || idx === 6 ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 7-column Calendar Cells Grid */}
          <div className="grid grid-cols-7 auto-rows-fr flex-1 border-b border-[#E7E7E4] divide-y divide-[#E7E7E4] bg-white">
            {calendarDays.map((cell, index) => {
              const dayTasks = tasksByDate[cell.dateStr] || [];
              const hasTasks = dayTasks.length > 0;
              const completedCount = dayTasks.filter(t => t.status === 'done').length;
              const isCellToday = cell.isToday;

              return (
                <div
                  key={cell.dateStr + '-' + index}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, cell.dateStr)}
                  className={`group relative min-h-[96px] sm:min-h-[120px] p-1.5 sm:p-2 border-r border-[#E7E7E4] flex flex-col transition-colors ${
                    cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/50'
                  } ${isCellToday ? 'bg-indigo-50/20' : ''} hover:bg-slate-50/80`}
                >
                  {/* Day Number and Quick Actions */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`inline-flex items-center justify-center text-xs font-semibold rounded-full w-6 h-6 ${
                        isCellToday
                          ? 'bg-indigo-600 text-white font-bold shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Day summary count on hover/compact */}
                      {hasTasks && (
                        <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">
                          {completedCount}/{dayTasks.length}
                        </span>
                      )}

                      {/* Quick Add Task Button for this day */}
                      <button
                        type="button"
                        onClick={() => onAddTaskForDate(cell.dateStr)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        title={`Add task for ${cell.dateStr}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Tasks List within this Day Cell */}
                  <div className="flex-1 space-y-1 overflow-hidden">
                    {dayTasks.slice(0, 3).map((task) => {
                      const isDone = task.status === 'done';
                      const catStyle = getCategoryStyle(task.category);
                      const priorityStyle = getPriorityStyle(task.priority);

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => onTaskClick(task)}
                          className={`group/task relative flex items-center gap-1.5 px-1.5 py-1 rounded text-[11px] font-medium border transition-all cursor-pointer select-none truncate ${
                            isDone
                              ? 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                              : `${catStyle.bg} ${catStyle.text} ${catStyle.border} hover:shadow-xs hover:border-slate-300`
                          }`}
                          title={`${task.title} (${task.category}${task.dueTime ? ' at ' + formatTimeDisplay(task.dueTime) : ''})`}
                        >
                          {/* Quick status check toggle */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusChange(task.id, isDone ? 'todo' : 'done');
                            }}
                            className="shrink-0 text-slate-400 hover:text-emerald-600"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Circle className="w-3 h-3 hover:text-emerald-600" />
                            )}
                          </button>

                          {/* Task title */}
                          <span className="truncate flex-1">
                            {task.title}
                          </span>

                          {/* Time tag if present */}
                          {task.dueTime && !isDone && (
                            <span className="text-[9px] text-slate-400 shrink-0 hidden sm:inline">
                              {formatTimeDisplay(task.dueTime)}
                            </span>
                          )}

                          {/* Priority indicator dot */}
                          {task.priority === 'high' && !isDone && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                          )}
                        </div>
                      );
                    })}

                    {/* +N More indicator */}
                    {dayTasks.length > 3 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedDayDate(cell.dateStr);
                        }}
                        className="w-full text-left px-1.5 py-0.5 rounded text-[10px] font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        +{dayTasks.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unscheduled Tasks Side Drawer */}
        {showUnscheduledDrawer && (
          <aside
            id="unscheduled-tasks-drawer"
            className="w-72 sm:w-80 border-l border-[#E7E7E4] bg-slate-50/60 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-200"
          >
            <div className="p-3.5 border-b border-[#E7E7E4] bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-800">
                  Unscheduled Tasks ({unscheduledTasks.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowUnscheduledDrawer(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 text-[11px] text-slate-500 bg-indigo-50/50 border-b border-indigo-100/60 flex items-center gap-1.5 px-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Drag any task onto a calendar date to schedule it.</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {unscheduledTasks.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  <Check className="w-5 h-5 mx-auto mb-1.5 text-emerald-500" />
                  All tasks have been scheduled!
                </div>
              ) : (
                unscheduledTasks.map((task) => {
                  const catStyle = getCategoryStyle(task.category);
                  const isDone = task.status === 'done';

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => onTaskClick(task)}
                      className="p-2.5 bg-white rounded-lg border border-[#E7E7E4] hover:shadow-xs hover:border-slate-300 transition-all cursor-pointer space-y-1.5 group"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tight ${catStyle.bg} ${catStyle.text}`}>
                          {task.category}
                        </span>

                        <div className="flex items-center gap-1">
                          {/* Quick assign today button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onUpdateDueDate) onUpdateDueDate(task.id, todayStr);
                            }}
                            className="text-[10px] font-semibold text-indigo-600 hover:bg-indigo-50 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Schedule for Today"
                          >
                            + Today
                          </button>
                        </div>
                      </div>

                      <h4 className={`text-xs font-semibold leading-snug line-clamp-2 ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </h4>

                      {task.sourceEmail && (
                        <div className="text-[10px] text-slate-400 truncate">
                          From: {task.sourceEmail.senderName}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Expanded Day Details Modal (when user clicks +N more) */}
      {expandedDayDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-xl border border-[#E7E7E4] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E7E7E4] bg-slate-50/50">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Tasks for {new Date(expandedDayDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExpandedDayDate(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {expandedDayTasks.map((task) => {
                const isDone = task.status === 'done';
                const catStyle = getCategoryStyle(task.category);

                return (
                  <div
                    key={task.id}
                    onClick={() => {
                      setExpandedDayDate(null);
                      onTaskClick(task);
                    }}
                    className="p-3 rounded-lg border border-[#E7E7E4] hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-2.5"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(task.id, isDone ? 'todo' : 'done');
                      }}
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tight ${catStyle.bg} ${catStyle.text}`}>
                          {task.category}
                        </span>
                        {task.dueTime && (
                          <span className="text-[11px] text-slate-400 font-medium">
                            {formatTimeDisplay(task.dueTime)}
                          </span>
                        )}
                      </div>
                      <h4 className={`text-xs font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t border-[#E7E7E4] bg-slate-50/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const targetDate = expandedDayDate;
                  setExpandedDayDate(null);
                  onAddTaskForDate(targetDate);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add task for this date</span>
              </button>

              <button
                type="button"
                onClick={() => setExpandedDayDate(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
