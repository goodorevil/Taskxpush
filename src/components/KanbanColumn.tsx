import React, { useState } from 'react';
import { Plus, CheckCircle2, ListTodo, PlayCircle, Layers } from 'lucide-react';
import { InboxTask, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: InboxTask[];
  onTaskClick: (task: InboxTask) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDropTask: (taskId: string, targetStatus: TaskStatus) => void;
  onAddTaskClick: (defaultStatus: TaskStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  tasks,
  onTaskClick,
  onStatusChange,
  onDropTask,
  onAddTaskClick,
}) => {
  const [isOver, setIsOver] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const getHeaderIcon = () => {
    switch (status) {
      case 'todo':
        return <ListTodo className="w-4 h-4 text-stone-500" />;
      case 'in_progress':
        return <PlayCircle className="w-4 h-4 text-orange-500" />;
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDropTask(taskId, status);
    }
    setDraggedTaskId(null);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  return (
    <div
      id={`kanban-column-${status}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col flex-1 min-w-[280px] max-w-[420px] bg-stone-100/70 dark:bg-stone-900/50 rounded-2xl p-3 border transition-colors duration-150 ${
        isOver
          ? 'border-orange-400 bg-orange-50/40 dark:bg-orange-950/20 ring-2 ring-orange-500/20'
          : 'border-stone-200/70 dark:border-stone-800'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 py-1 mb-3 select-none">
        <div className="flex items-center gap-2">
          {getHeaderIcon()}
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
            {title}
          </h2>
          <span
            id={`column-count-${status}`}
            className="bg-slate-200 text-slate-600 text-[10px] px-2 rounded-full py-0.5 font-bold"
          >
            {tasks.length}
          </span>
        </div>

        <button
          id={`add-task-btn-${status}`}
          type="button"
          onClick={() => onAddTaskClick(status)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          title={`Add task to ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Task Cards Container */}
      <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto max-h-[calc(100vh-250px)] pr-0.5">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            onStatusChange={onStatusChange}
            isDragging={draggedTaskId === task.id}
            onDragStart={handleDragStart}
          />
        ))}

        {tasks.length === 0 && (
          <div
            id={`empty-state-${status}`}
            className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-[#E7E7E4] text-slate-400 min-h-[140px] bg-white/40"
          >
            <Layers className="w-6 h-6 mb-2 opacity-40" />
            <p className="text-xs font-medium">No tasks in {title.toLowerCase()}</p>
            <button
              type="button"
              onClick={() => onAddTaskClick(status)}
              className="mt-2 text-xs text-orange-600 hover:underline font-medium"
            >
              + Create one
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
