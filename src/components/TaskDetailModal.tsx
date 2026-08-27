import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ExternalLink, 
  Mail, 
  CheckSquare
} from 'lucide-react';
import { InboxTask, TaskCategory, TaskStatus } from '../types';
import { getCategoryStyle } from '../utils/dateUtils';

const CANONICAL_CATEGORIES: TaskCategory[] = [
  'Meeting/Interview',
  'Job/Internship offer',
  'Event',
  'Deadline',
  'Reply Needed',
  'Opportunity',
  'General',
  'Spam',
];

interface TaskDetailModalProps {
  task: InboxTask | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (updatedTask: InboxTask) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
}) => {
  if (!isOpen || !task) return null;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [category, setCategory] = useState<TaskCategory>(task.category);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [actionItems, setActionItems] = useState<string[]>(task.actionItems || []);
  const [newActionItem, setNewActionItem] = useState('');

  const handleSave = () => {
    onUpdateTask({
      ...task,
      title,
      description,
      dueDate: dueDate || null,
      category,
      status,
      actionItems,
      updatedAt: new Date().toISOString(),
      completedAt: status === 'done' ? (task.completedAt || new Date().toISOString()) : null,
    });
    onClose();
  };

  const handleAddActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionItem.trim()) return;
    setActionItems([...actionItems, newActionItem.trim()]);
    setNewActionItem('');
  };

  const handleRemoveActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const catStyle = getCategoryStyle(category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        id="task-detail-drawer"
        className="w-full max-w-xl h-full bg-white border-l border-[#E7E7E4] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E7E4] bg-[#FAFAF7] min-h-[64px]">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-tight ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
            >
              {category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="delete-task-btn"
              type="button"
              onClick={() => {
                if (window.confirm('Delete this task?')) {
                  onDeleteTask(task.id);
                  onClose();
                }
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Delete task"
              aria-label="Delete task"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
            <button
              id="close-drawer-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Task Title
            </label>
            <textarea
              id="task-title-input"
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-base font-bold text-slate-800 bg-slate-50 border border-[#E7E7E4] rounded-xl p-3 focus:ring-2 focus:ring-[#C2542D] outline-none"
            />
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-[#E7E7E4] text-xs">
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select
                id="task-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-white border border-[#E7E7E4] rounded-lg py-2 px-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#C2542D] outline-none min-h-[44px]"
              >
                <option value="todo">To Do</option>
                <option value="done">Completed</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
              <select
                id="task-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full bg-white border border-[#E7E7E4] rounded-lg py-2 px-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#C2542D] outline-none min-h-[44px]"
              >
                {CANONICAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Due Date</label>
              <input
                id="task-due-date-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white border border-[#E7E7E4] rounded-lg py-2 px-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#C2542D] outline-none min-h-[44px]"
              />
            </div>
          </div>

          {/* Context Reason */}
          {task.reason && (
            <div className="p-3.5 rounded-xl bg-slate-100 border border-[#E7E7E4] text-xs">
              <div className="font-bold text-slate-800 mb-1">
                Context
              </div>
              <p className="text-slate-600 leading-relaxed">
                {task.reason}
              </p>
            </div>
          )}

          {/* Description / Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Notes
            </label>
            <textarea
              id="task-desc-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add additional context or notes..."
              className="w-full text-xs text-slate-800 bg-slate-50 border border-[#E7E7E4] rounded-xl p-3 focus:ring-2 focus:ring-[#C2542D] outline-none leading-relaxed font-medium"
            />
          </div>

          {/* Action Items Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Action Items ({actionItems.length})
            </label>
            <div className="space-y-2 mb-3">
              {actionItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-[#E7E7E4] text-xs text-slate-800 font-medium"
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#C2542D] shrink-0" />
                    <span>{item}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveActionItem(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddActionItem} className="flex gap-2">
              <input
                type="text"
                value={newActionItem}
                onChange={(e) => setNewActionItem(e.target.value)}
                placeholder="+ Add checklist step..."
                className="flex-1 text-xs bg-slate-50 border border-[#E7E7E4] rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#C2542D] font-medium min-h-[44px]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 text-xs font-bold bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors min-h-[44px]"
              >
                Add
              </button>
            </form>
          </div>

          {/* Source Email Preview */}
          {task.sourceEmail && (
            <div className="p-4 rounded-xl border border-[#E7E7E4] bg-slate-50 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>Original Email</span>
                </div>
                {task.sourceEmail.webLink && (
                  <a
                    id="open-original-email-btn"
                    href={task.sourceEmail.webLink}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#C2542D] hover:underline min-h-[44px] items-center"
                  >
                    <span>Open email</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="text-xs space-y-1">
                <div className="font-bold text-slate-900">
                  {task.sourceEmail.subject}
                </div>
                <div className="text-slate-600">
                  From: {task.sourceEmail.senderName} ({task.sourceEmail.senderEmail})
                </div>
                <div className="text-slate-400 text-[11px]">
                  Date: {new Date(task.sourceEmail.date).toLocaleString()}
                </div>
              </div>

              {task.sourceEmail.fullBody && (
                <div className="mt-2 p-3 bg-white rounded-lg border border-[#E7E7E4] text-xs text-slate-600 max-h-48 overflow-y-auto whitespace-pre-wrap font-sans leading-relaxed">
                  {task.sourceEmail.fullBody}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#E7E7E4] bg-[#FAFAF7] flex items-center justify-end gap-3 min-h-[64px]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors min-h-[44px]"
          >
            Cancel
          </button>
          <button
            id="save-task-changes-btn"
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#C2542D] hover:bg-[#B14A27] rounded-xl transition-colors shadow-xs min-h-[44px]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
