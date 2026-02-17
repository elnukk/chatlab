'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import SessionComplete from '@/components/chat/SessionComplete';

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ChatPageInner />
    </Suspense>
  );
}

function ChatPageInner() {
  const searchParams = useSearchParams();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('loading');
  const [completionMessage, setCompletionMessage] = useState('');
  const [error, setError] = useState(null);

  const experimentId = searchParams.get('experiment_id');
  const participantId = searchParams.get('participant_id');

  // Collect all URL params except experiment_id and participant_id as template variables
  const templateVariables = {};
  for (const [key, value] of searchParams.entries()) {
    if (key !== 'experiment_id' && key !== 'participant_id') {
      templateVariables[key] = value;
    }
  }

  const loadSession = useCallback(async () => {
    if (!experimentId || !participantId) {
      setError('Missing required URL parameters: experiment_id, participant_id');
      setSessionStatus('error');
      return;
    }

    try {
      const params = new URLSearchParams({
        experiment_id: experimentId,
        participant_id: participantId,
      });

      const res = await fetch(`/api/session?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load session');
        setSessionStatus('error');
        return;
      }

      setMessages(data.messages || []);
      setSessionStatus(data.status || 'active');
      setCompletionMessage(data.completion_message || '');
    } catch (err) {
      setError('Failed to connect to the server');
      setSessionStatus('error');
    }
  }, [experimentId, participantId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || loading || sessionStatus !== 'active') return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content }]);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experiment_id: experimentId,
          participant_id: participantId,
          template_variables: templateVariables,
          message: content,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.session_status === 'completed') {
          setSessionStatus('completed');
          setCompletionMessage(data.completion_message || '');
        } else {
          setError(data.error || 'Failed to send message');
        }
        setLoading(false);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message },
      ]);

      if (data.session_status === 'completed') {
        setSessionStatus('completed');
        setCompletionMessage(data.completion_message || '');
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sessionStatus === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (sessionStatus === 'error') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 max-w-md text-center">
          <p className="text-red-600 font-medium mb-2">Error</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatMessages messages={messages} loading={loading} />

      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-xs text-red-600 text-center">{error}</p>
        </div>
      )}

      {sessionStatus === 'completed' ? (
        <SessionComplete message={completionMessage} />
      ) : (
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={sendMessage}
          loading={loading}
          disabled={sessionStatus !== 'active'}
        />
      )}
    </div>
  );
}
