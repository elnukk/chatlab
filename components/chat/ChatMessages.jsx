'use client';

import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export default function ChatMessages({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 && !loading && (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          Waiting for conversation to start...
        </div>
      )}
      {messages.map((msg, i) => (
        <MessageBubble
          key={i}
          role={msg.role}
          content={msg.content}
          timestamp={msg.timestamp}
        />
      ))}
      {loading && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
