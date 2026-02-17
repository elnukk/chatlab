'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditExperimentPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/experiments/${params.id}`)
      .then((res) => res.json())
      .then((data) =>
        setForm({
          name: data.name || '',
          description: data.description || '',
          llm_provider: data.llm_provider || 'openai',
          llm_model: data.llm_model || 'gpt-4',
          llm_temperature: data.llm_temperature ?? 0.7,
          llm_max_tokens: data.llm_max_tokens || '',
          llm_api_key: '',
          llm_api_key_display: data.llm_api_key || '',
          allowed_origins: (data.allowed_origins || []).join(', '),
          system_prompt: data.system_prompt || '',
          seed_message: data.seed_message || '',
          max_messages: data.max_messages || '',
          completion_message: data.completion_message || '',
        })
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/experiments/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          llm_provider: form.llm_provider,
          llm_model: form.llm_model,
          llm_temperature: parseFloat(form.llm_temperature) || 0.7,
          llm_max_tokens: form.llm_max_tokens
            ? parseInt(form.llm_max_tokens)
            : null,
          ...(form.llm_api_key ? { llm_api_key: form.llm_api_key } : {}),
          allowed_origins: form.allowed_origins
            ? form.allowed_origins.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          system_prompt: form.system_prompt,
          seed_message: form.seed_message,
          max_messages: form.max_messages ? parseInt(form.max_messages) : null,
          completion_message: form.completion_message,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save');
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.push(`/admin/experiments/${params.id}`)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Edit Experiment
      </h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
          />
        </div>

        {/* System Prompt */}
        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            System Prompt Template
          </label>
          <textarea
            value={form.system_prompt}
            onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
            rows={6}
            placeholder="You are a {{persona}} assistant who helps with {{topic}}."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use {'{{variable_name}}'} for template variables from URL parameters.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seed Message
          </label>
          <input
            type="text"
            value={form.seed_message}
            onChange={(e) => setForm({ ...form, seed_message: e.target.value })}
            placeholder="Hi! How can I help you today?"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Messages
            </label>
            <input
              type="number"
              value={form.max_messages}
              onChange={(e) => setForm({ ...form, max_messages: e.target.value })}
              placeholder="Unlimited"
              min="1"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Completion Message
            </label>
            <input
              type="text"
              value={form.completion_message}
              onChange={(e) => setForm({ ...form, completion_message: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LLM Provider
              </label>
              <select
                value={form.llm_provider}
                onChange={(e) =>
                  setForm({ ...form, llm_provider: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="custom">Custom Endpoint</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                value={form.llm_model}
                onChange={(e) => setForm({ ...form, llm_model: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature
            </label>
            <input
              type="number"
              value={form.llm_temperature}
              onChange={(e) =>
                setForm({ ...form, llm_temperature: e.target.value })
              }
              min="0"
              max="2"
              step="0.1"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Tokens
            </label>
            <input
              type="number"
              value={form.llm_max_tokens}
              onChange={(e) =>
                setForm({ ...form, llm_max_tokens: e.target.value })
              }
              placeholder="1024"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
        </div>

        {form.llm_provider !== 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            {form.llm_api_key_display && (
              <p className="text-xs text-gray-500 mb-1">
                Current key: {form.llm_api_key_display}
              </p>
            )}
            <input
              type="password"
              value={form.llm_api_key}
              onChange={(e) => setForm({ ...form, llm_api_key: e.target.value })}
              placeholder={form.llm_api_key_display ? 'Enter new key to replace' : `Your ${form.llm_provider === 'anthropic' ? 'Anthropic' : 'OpenAI'} API key`}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <p className="text-xs text-gray-500 mt-0.5">
              Leave blank to keep the current key.
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Allowed Origins
          </label>
          <input
            type="text"
            value={form.allowed_origins}
            onChange={(e) =>
              setForm({ ...form, allowed_origins: e.target.value })
            }
            placeholder="https://example.qualtrics.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">Saved successfully!</p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
