'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ParticipantTable from '@/components/admin/ParticipantTable';
import ConversationViewer from '@/components/admin/ConversationViewer';

export default function ParticipantsPage() {
  const router = useRouter();
  const params = useParams();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [conversation, setConversation] = useState(null);

  useEffect(() => {
    fetch(`/api/admin/experiments/${params.id}/participants`)
      .then((r) => r.json())
      .then((data) => {
        setParticipants(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const viewConversation = async (participant) => {
    const searchParams = new URLSearchParams({
      experiment_id: params.id,
      participant_id: participant.external_id,
    });

    const res = await fetch(`/api/session?${searchParams}`);
    const data = await res.json();

    setConversation({
      messages: data.messages || [],
      participant: participant.external_id,
    });
  };

  const handleSelect = (participant) => {
    setSelected(participant);
    viewConversation(participant);
  };

  return (
    <div>
      <button
        onClick={() => router.push(`/admin/experiments/${params.id}`)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Experiment
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Participants</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 mb-6">
            <ParticipantTable
              participants={participants}
              onSelect={handleSelect}
            />
          </div>

          {conversation && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                Conversation: {conversation.participant}
              </h2>

              <ConversationViewer
                messages={conversation.messages}
                participant={conversation.participant}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
