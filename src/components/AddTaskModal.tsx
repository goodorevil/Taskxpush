import React, { useState } from 'react';
import { X, Plus, Calendar, Tag, AlertCircle } from 'lucide-react';
import { InboxTask, TaskCategory, TaskPriority, TaskStatus } from '../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (newTask: Omit<InboxTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  defaultStatus?: TaskStatus;
  defaultDueDate?: string;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  defaultStatus = 'todo',
  defaultDueDate,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(defaultDueDate || new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('General');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || null,
      priority,
      category,
      status,
      isManual: true,
      actionItems: [],
    });

    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div
        id="add-task-modal"
        className="w-full max-w-lg bg-white rounded-xl border border-[#E7E7E4] shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E7E4]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              New Task
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="new-task-title"
              type="text"
              required
              autoFocus
              placeholder="e.g. Approve marketing budget for Q4 campaign"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-[#E7E7E4] rounded-lg px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-orange-500 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Category
              </label>
              <select
                id="new-task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full text-xs bg-slate-50 border border-[#E7E7E4] rounded-lg p-2 text-slate-800 outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="General">General</option>
                <option value="Meeting">Meeting</option>
                <option value="Deadline">Deadline</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Reply Needed">Reply Needed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Priority
              </label>
              <select
                id="new-task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full text-xs bg-slate-50 border border-[#E7E7E4] rounded-lg p-2 text-slate-800 outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Due Date
              </label>
              <input
                id="new-task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-[#E7E7E4] rounded-lg p-2 text-slate-800 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Column
              </label>
              <select
                id="new-task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full text-xs bg-slate-50 border border-[#E7E7E4] rounded-lg p-2 text-slate-800 outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              id="new-task-description"
              rows={2}
              placeholder="Add additional details or checklist items..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-[#E7E7E4] rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500 text-slate-800"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E7E7E4]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="create-task-submit-btn"
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm transition-colors"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
