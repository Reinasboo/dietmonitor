'use client';

import React, { useState } from 'react';
import { Trash2, Clock, Edit2, Check, X } from 'lucide-react';
import { formatTimeForDisplay } from '@/lib/date-utils';
import { Entry } from '@/lib/patterns';
import { format, parseISO } from 'date-fns';

interface LogEntryProps {
  entry: Entry;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, content: string, loggedAt: string) => Promise<void>;
}

export function LogEntry({ entry, onDelete, onUpdate }: LogEntryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(entry.content);
  const [editLoggedAt, setEditLoggedAt] = useState(
    format(parseISO(entry.logged_at), "yyyy-MM-dd'T'HH:mm")
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(entry.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) {
      setEditContent(entry.content);
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(entry.id, editContent.trim(), parseISO(editLoggedAt).toISOString());
      setIsEditing(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditContent(entry.content);
    setEditLoggedAt(format(parseISO(entry.logged_at), "yyyy-MM-dd'T'HH:mm"));
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="group animate-slide-in rounded-pill border-2 border-lilac-200 bg-lilac-50 p-lg shadow-sm transition-all">
        <div className="space-y-lg">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full resize-none rounded-pill border-2 border-lilac-200 bg-white px-lg py-md text-sm font-medium focus:border-lilac-500 focus:outline-none focus:ring-2 focus:ring-lilac-500"
            rows={2}
          />
          <div className="flex items-center gap-md">
            <input
              type="datetime-local"
              value={editLoggedAt}
              onChange={(e) => setEditLoggedAt(e.target.value)}
              className="flex-1 rounded-pill border-2 border-lilac-200 bg-white px-lg py-md text-sm font-medium focus:border-lilac-500 focus:outline-none focus:ring-2 focus:ring-lilac-500"
            />
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white transition-all hover:bg-green-600 disabled:opacity-50"
            >
              <Check size={16} />
            </button>
            <button
              onClick={handleCancel}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-gray-700 transition-all hover:bg-gray-400"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group animate-slide-in rounded-pill border-2 border-gray-200 bg-white p-lg shadow-sm transition-all hover:border-lilac-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-lg">
        <div className="flex-1 min-w-0">
          <p className="break-words text-sm font-medium text-gray-900">{entry.content}</p>
          <div className="mt-md flex items-center gap-sm text-xs text-gray-500">
            <Clock size={12} />
            <time dateTime={entry.logged_at}>{formatTimeForDisplay(entry.logged_at)}</time>
          </div>
        </div>

        <div className="flex items-center gap-sm opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => setIsEditing(true)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-lilac-600"
            title="Edit entry"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-50"
            title="Delete entry"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
