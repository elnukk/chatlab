'use client';

import { useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function ChatInput({
  value,
  onChange,
  onSend,
  loading,
  disabled,
  placeholder,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading && !disabled && value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-3">
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Type your message...'}
          disabled={loading || disabled}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
        />
        <button
          onClick={onSend}
          disabled={loading || disabled || !value.trim()}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
