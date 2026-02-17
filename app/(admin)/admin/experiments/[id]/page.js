'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  Download,
  Settings,
  Play,
  Pause,
  CheckCircle,
  Link2,
  Copy,
} from 'lucide-react';
import ExportDialog from '@/components/admin/ExportDialog';

export default function ExperimentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/experiments/${params.id}`)
      .then((res) => res.json())
      .then((data) => setExperiment(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const updateStatus = async (status) => {
    const res = await fetch(`/api/admin/experiments/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setExperiment((prev) => ({ ...prev, status }));
    }
  };

  const copyEmbedUrl = () => {
    const baseUrl = window.location.origin;
    const js = `Qualtrics.SurveyEngine.addOnload(function () {
  var participantId = "\${e://Field/ResponseID}";

  var iframeUrl =
    "${baseUrl}/chat" +
    "?experiment_id=${params.id}" +
    "&participant_id=" + encodeURIComponent(participantId);

  var iframe = document.createElement("iframe");
  iframe.src = iframeUrl;
  iframe.style.width = "100%";
  iframe.style.height = "600px";
  iframe.style.border = "none";

  this.getQuestionContainer().appendChild(iframe);
});`;
    navigator.clipboard.writeText(js);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  if (!experiment) {
    return (
      <div className="text-center py-12 text-gray-500">
        Experiment not found
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push('/admin/experiments')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Experiments
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {experiment.name}
            </h1>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                experiment.status === 'active'
                  ? 'bg-gray-900 text-white'
                  : experiment.status === 'paused'
                  ? 'bg-gray-200 text-gray-600'
                  : experiment.status === 'completed'
                  ? 'bg-gray-300 text-gray-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {experiment.status}
            </span>
          </div>
          {experiment.description && (
            <p className="text-sm text-gray-500 mt-1">
              {experiment.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {experiment.status === 'draft' && (
            <button
              onClick={() => updateStatus('active')}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800"
            >
              <Play className="w-3.5 h-3.5" />
              Activate
            </button>
          )}
          {experiment.status === 'active' && (
            <button
              onClick={() => updateStatus('paused')}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause
            </button>
          )}
          {experiment.status === 'paused' && (
            <>
              <button
                onClick={() => updateStatus('active')}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800"
              >
                <Play className="w-3.5 h-3.5" />
                Resume
              </button>
              <button
                onClick={() => updateStatus('completed')}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-400 text-white rounded-lg text-sm hover:bg-gray-500"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Complete
              </button>
            </>
          )}
          <button
            onClick={() =>
              router.push(`/admin/experiments/${params.id}/edit`)
            }
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            <Settings className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Provider</p>
          <p className="font-medium text-sm">
            {experiment.llm_provider}/{experiment.llm_model}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Temperature</p>
          <p className="font-medium text-sm">{experiment.llm_temperature}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Max Messages</p>
          <p className="font-medium text-sm">{experiment.max_messages || 'Unlimited'}</p>
        </div>
      </div>

      {/* System Prompt Preview */}
      {experiment.system_prompt && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">
            System Prompt
          </h2>
          <pre className="bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-700 whitespace-pre-wrap overflow-x-auto">
            {experiment.system_prompt}
          </pre>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() =>
            router.push(`/admin/experiments/${params.id}/participants`)
          }
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-gray-300 transition-all text-left"
        >
          <Users className="w-5 h-5 text-gray-400 mb-2" />
          <h3 className="font-medium text-sm text-gray-900">Participants</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            View participant data and conversations
          </p>
        </button>
        <button
          onClick={() => setShowExport(true)}
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-gray-300 transition-all text-left"
        >
          <Download className="w-5 h-5 text-gray-400 mb-2" />
          <h3 className="font-medium text-sm text-gray-900">Export Data</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Download conversation data as CSV or JSON
          </p>
        </button>
      </div>

      {/* Embed Instructions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">
            Qualtrics Integration
          </h2>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Paste this JavaScript into your Qualtrics question&apos;s JavaScript editor.
          Any URL parameter (except experiment_id and participant_id) becomes a template variable in your system prompt.
        </p>
        <pre className="bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-700 overflow-x-auto">
{`Qualtrics.SurveyEngine.addOnload(function () {
  var participantId = "\${e://Field/ResponseID}";

  var iframeUrl =
    "${typeof window !== 'undefined' ? window.location.origin : 'https://chatlab-six.vercel.app'}/chat" +
    "?experiment_id=${params.id}" +
    "&participant_id=" + encodeURIComponent(participantId);

  var iframe = document.createElement("iframe");
  iframe.src = iframeUrl;
  iframe.style.width = "100%";
  iframe.style.height = "600px";
  iframe.style.border = "none";

  this.getQuestionContainer().appendChild(iframe);
});`}
        </pre>
        <button
          onClick={copyEmbedUrl}
          className="flex items-center gap-1 mt-3 text-xs text-gray-600 hover:text-gray-900 font-medium"
        >
          {copied ? (
            <CheckCircle className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? 'Copied!' : 'Copy JavaScript'}
        </button>
      </div>

      <ExportDialog
        open={showExport}
        onClose={() => setShowExport(false)}
        experimentId={params.id}
      />
    </div>
  );
}
