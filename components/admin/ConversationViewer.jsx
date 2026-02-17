'use client';

import MessageBubble from '@/components/chat/MessageBubble';

export default function ConversationViewer({ messages, participant }) {
  return (
    <div className="flex gap-6">
      <div className="flex-1 bg-gray-50 rounded-xl p-4 max-h-[600px] overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No messages</p>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble
              key={i}
              role={msg.role}
              content={msg.content}
              timestamp={msg.created_at || msg.timestamp}
            />
          ))
        )}
      </div>

      <div className="w-64 shrink-0 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Metadata</h3>
          <dl className="space-y-2 text-xs">
            <div>
              <dt className="text-gray-500">Participant</dt>
              <dd className="font-mono">{participant}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Messages</dt>
              <dd>{messages.length}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
