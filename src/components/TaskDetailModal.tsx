import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ExternalLink, 
  Mail, 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckSquare, 
  Square,
  AlertCircle,
  Tag,
  ArrowRight
} from 'lucide-react';
import { InboxTask, TaskCategory, TaskPriority, TaskStatus } from '../types';
import { getCategoryStyle, getPriorityStyle } from '../utils/dateUtils';

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
  const [dueTime, setDueTime] = useState(task.dueTime || '');
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
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
      dueTime: dueTime || null,
      priority,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        id="task-detail-drawer"
        className="w-full max-w-xl h-full bg-white border-l border-[#E7E7E4] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E7E4] bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-tight ${
                getCategoryStyle(category).bg
              } ${getCategoryStyle(category).text}`}
            >
              {category}
            </span>
            {task.confidence && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-orange-50 text-orange-700">
                <Sparkles className="w-3 h-3" />
                {Math.round(task.confidence * 100)}% AI Match
              </span>
            )}
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              id="close-drawer-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Task Title
            </label>
            <textarea
              id="task-title-input"
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-base font-bold text-slate-800 bg-transparent border border-[#E7E7E4] rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-[#E7E7E4] text-sm">
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select
                id="task-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-white border border-[#E7E7E4] rounded-lg py-1.5 px-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
              <select
                id="task-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-white border border-[#E7E7E4] rounded-lg py-1.5 px-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
              <select
                id="task-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full bg-white border border-[#E7E7E4] rounded-lg py-1.5 px-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="Meeting">Meeting</option>
                <option value="Deadline">Deadline</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Reply Needed">Reply Needed</option>
                <option value="General">General</option>
              </select>
            </div>

            {/* Due Date & Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Due Date</label>
              <div className="flex gap-1.5">
                <input
                  id="task-due-date-input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white border border-[#E7E7E4] rounded-lg py-1 px-2 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* AI Reason / Extraction Context */}
          {task.reason && (
            <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-100 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-orange-900 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>AI Extraction Reason</span>
              </div>
              <p className="text-orange-800 leading-relaxed">
                {task.reason}
              </p>
            </div>
          )}

          {/* Description / Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Task Notes & Context
            </label>
            <textarea
              id="task-desc-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add additional context or notes here..."
              className="w-full text-xs text-slate-800 bg-transparent border border-[#E7E7E4] rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none leading-relaxed"
            />
          </div>

          {/* Action Items Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Action Items ({actionItems.length})
            </label>
            <div className="space-y-2 mb-3">
              {actionItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-[#E7E7E4] text-xs text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveActionItem(idx)}
                    className="text-slate-400 hover:text-rose-500 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
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
                className="flex-1 text-xs bg-slate-50 border border-[#E7E7E4] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="px-3 py-2 text-xs font-medium bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
              >
                Add
              </button>
            </form>
          </div>

          {/* Source Email Preview */}
          {task.sourceEmail && (
            <div className="p-4 rounded-xl border border-[#E7E7E4] bg-slate-50/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Original Email Thread</span>
                </div>
                {task.sourceEmail.webLink && (
                  <a
                    id="open-original-email-btn"
                    href={task.sourceEmail.webLink}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:underline"
                  >
                    <span>Open in {task.sourceEmail.provider === 'gmail' ? 'Gmail' : 'Outlook'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="text-xs space-y-1">
                <div className="font-semibold text-slate-900">
                  {task.sourceEmail.subject}
                </div>
                <div className="text-slate-500">
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
        <div className="p-4 border-t border-[#E7E7E4] bg-slate-50/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            id="save-task-changes-btn"
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
