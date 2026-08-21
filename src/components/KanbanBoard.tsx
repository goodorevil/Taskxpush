import React, { useState } from 'react';
import { InboxTask, TaskStatus } from '../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  tasks: InboxTask[];
  onTaskClick: (task: InboxTask) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDropTask: (taskId: string, targetStatus: TaskStatus) => void;
  onAddTaskClick: (defaultStatus: TaskStatus) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskClick,
  onStatusChange,
  onDropTask,
  onAddTaskClick,
}) => {
  // Mobile active tab ('todo' | 'in_progress' | 'done')
  const [mobileTab, setMobileTab] = useState<TaskStatus>('todo');

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <div id="kanban-board-container" className="flex flex-col flex-1 min-h-0">
      {/* Mobile Segmented Switcher (< md screens) */}
      <div className="flex md:hidden items-center justify-between bg-stone-200/70 dark:bg-stone-800/80 p-1 rounded-xl mb-4">
        <button
          id="mobile-tab-todo"
          type="button"
          onClick={() => setMobileTab('todo')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
            mobileTab === 'todo'
              ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
              : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          To Do ({todoTasks.length})
        </button>
        <button
          id="mobile-tab-inprogress"
          type="button"
          onClick={() => setMobileTab('in_progress')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
            mobileTab === 'in_progress'
              ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
              : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          In Progress ({inProgressTasks.length})
        </button>
        <button
          id="mobile-tab-done"
          type="button"
          onClick={() => setMobileTab('done')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
            mobileTab === 'done'
              ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
              : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          Done ({doneTasks.length})
        </button>
      </div>

      {/* Desktop & Tablet 3-Column Grid */}
      <div className="hidden md:flex gap-4.5 flex-1 min-h-0 overflow-x-auto pb-4">
        <KanbanColumn
          status="todo"
          title="To Do"
          tasks={todoTasks}
          onTaskClick={onTaskClick}
          onStatusChange={onStatusChange}
          onDropTask={onDropTask}
          onAddTaskClick={onAddTaskClick}
        />
        <KanbanColumn
          status="in_progress"
          title="In Progress"
          tasks={inProgressTasks}
          onTaskClick={onTaskClick}
          onStatusChange={onStatusChange}
          onDropTask={onDropTask}
          onAddTaskClick={onAddTaskClick}
        />
        <KanbanColumn
          status="done"
          title="Done"
          tasks={doneTasks}
          onTaskClick={onTaskClick}
          onStatusChange={onStatusChange}
          onDropTask={onDropTask}
          onAddTaskClick={onAddTaskClick}
        />
      </div>

      {/* Mobile Single Column View */}
      <div className="flex md:hidden flex-1 min-h-0">
        {mobileTab === 'todo' && (
          <KanbanColumn
            status="todo"
            title="To Do"
            tasks={todoTasks}
            onTaskClick={onTaskClick}
            onStatusChange={onStatusChange}
            onDropTask={onDropTask}
            onAddTaskClick={onAddTaskClick}
          />
        )}
        {mobileTab === 'in_progress' && (
          <KanbanColumn
            status="in_progress"
            title="In Progress"
            tasks={inProgressTasks}
            onTaskClick={onTaskClick}
            onStatusChange={onStatusChange}
            onDropTask={onDropTask}
            onAddTaskClick={onAddTaskClick}
          />
        )}
        {mobileTab === 'done' && (
          <KanbanColumn
            status="done"
            title="Done"
            tasks={doneTasks}
            onTaskClick={onTaskClick}
            onStatusChange={onStatusChange}
            onDropTask={onDropTask}
            onAddTaskClick={onAddTaskClick}
          />
        )}
      </div>
    </div>
  );
};
