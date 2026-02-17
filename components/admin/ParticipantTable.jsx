'use client';

import { CheckCircle, Circle, Minus } from 'lucide-react';

function ConversationStatus({ status }) {
  if (status === 'completed') {
    return <CheckCircle className="w-4 h-4 text-gray-900" />;
  }
  if (status === 'active') {
    return <Circle className="w-4 h-4 text-gray-500" />;
  }
  return <Minus className="w-4 h-4 text-gray-300" />;
}

export default function ParticipantTable({ participants, onSelect }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-600">
              Participant ID
            </th>
            <th className="text-center py-3 px-4 font-medium text-gray-600">
              Status
            </th>
            <th className="text-right py-3 px-4 font-medium text-gray-600">
              Started
            </th>
            <th className="text-right py-3 px-4 font-medium text-gray-600">
              Completed
            </th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => (
            <tr
              key={p.id}
              onClick={() => onSelect?.(p)}
              className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="py-3 px-4 font-mono text-xs">{p.external_id}</td>
              <td className="py-3 px-4 text-center">
                <ConversationStatus status={p.conversation_status} />
              </td>
              <td className="py-3 px-4 text-right text-xs text-gray-400">
                {p.started_at
                  ? new Date(p.started_at).toLocaleDateString()
                  : '-'}
              </td>
              <td className="py-3 px-4 text-right text-xs text-gray-400">
                {p.completed_at
                  ? new Date(p.completed_at).toLocaleDateString()
                  : '-'}
              </td>
            </tr>
          ))}
          {participants.length === 0 && (
            <tr>
              <td colSpan={4} className="py-8 text-center text-gray-400">
                No participants yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
