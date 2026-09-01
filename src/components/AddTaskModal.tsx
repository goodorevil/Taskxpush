import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { InboxTask, TaskCategory, TaskStatus } from '../types';

const CANONICAL_CATEGORIES: TaskCategory[] = [
  'Engagements',
  'Deadlines / Reply',
  'Opportunities',
  'Experiences',
  'Finance',
  'Discover',
  'Updates',
  'Spam',
];

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
  const [category, setCategory] = useState<TaskCategory>('Updates');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || null,
      priority: 'medium',
      category,
      status: defaultStatus,
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
            <div className="p-2 rounded-lg bg-orange-50 text-[#C2542D]">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              New Task
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
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
              placeholder="e.g. Review Master Service Agreement section 4.2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm font-medium bg-slate-50 border border-[#E7E7E4] rounded-lg px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#C2542D] text-slate-800 min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                id="new-task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full text-xs font-medium bg-slate-50 border border-[#E7E7E4] rounded-lg p-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-[#C2542D] min-h-[44px]"
              >
                {CANONICAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date
              </label>
              <input
                id="new-task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-[#E7E7E4] rounded-lg p-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-[#C2542D] min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              id="new-task-description"
              rows={3}
              placeholder="Add additional context or details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-[#E7E7E4] rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#C2542D] text-slate-800 leading-relaxed font-medium"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E7E7E4]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              id="create-task-submit-btn"
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#C2542D] hover:bg-[#B14A27] rounded-xl shadow-xs transition-colors min-h-[44px]"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
