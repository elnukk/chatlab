'use client';

export default function MessageBubble({ role, content, timestamp }) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl whitespace-pre-wrap text-sm leading-relaxed ${
          isUser
            ? 'bg-gray-900 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        }`}
      >
        {content}
        {timestamp && (
          <div
            className={`text-[10px] mt-1 ${
              isUser ? 'text-gray-400' : 'text-gray-400'
            }`}
          >
            {new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>
    </div>
  );
}
