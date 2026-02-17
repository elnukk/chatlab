'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';

export default function NewExperimentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    llm_provider: 'openai',
    llm_model: 'gpt-4',
    llm_temperature: 0.7,
    llm_max_tokens: '',
    llm_api_key: '',
    allowed_origins: '',
    system_prompt: '',
    seed_message: '',
    max_messages: '',
    completion_message: 'Thank you for completing this conversation.',
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Experiment name is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        name: form.name,
        description: form.description,
        llm_provider: form.llm_provider,
        llm_model: form.llm_model,
        llm_temperature: parseFloat(form.llm_temperature) || 0.7,
        llm_max_tokens: form.llm_max_tokens ? parseInt(form.llm_max_tokens) : null,
        llm_api_key: form.llm_api_key || null,
        allowed_origins: form.allowed_origins
          ? form.allowed_origins.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        system_prompt: form.system_prompt,
        seed_message: form.seed_message,
        max_messages: form.max_messages ? parseInt(form.max_messages) : null,
        completion_message: form.completion_message,
      };

      const res = await fetch('/api/admin/experiments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create experiment');
        return;
      }

      router.push(`/admin/experiments/${data.id}`);
    } catch (err) {
      setError('Failed to create experiment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Create Experiment
      </h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Experiment Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g., Weekend Planning Study v2"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Brief description of this experiment"
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
            />
          </div>
        </div>

        {/* System Prompt */}
        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">System Prompt</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              System Prompt Template
            </label>
            <textarea
              value={form.system_prompt}
              onChange={(e) => updateField('system_prompt', e.target.value)}
              placeholder="You are a {{persona}} assistant who helps with {{topic}}."
              rows={6}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {'{{variable_name}}'} for template variables. Any URL parameter from Qualtrics
              (except experiment_id and participant_id) becomes a variable.
              Example: ?persona=friendly &rarr; {'{{persona}}'} resolves to "friendly".
            </p>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seed Message (optional)
            </label>
            <input
              type="text"
              value={form.seed_message}
              onChange={(e) => updateField('seed_message', e.target.value)}
              placeholder="Hi! How can I help you today?"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <p className="text-xs text-gray-500 mt-0.5">
              First message shown to the participant before they type anything.
            </p>
          </div>
        </div>

        {/* Limits */}
        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Limits</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Messages (optional)
              </label>
              <input
                type="number"
                value={form.max_messages}
                onChange={(e) => updateField('max_messages', e.target.value)}
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
                onChange={(e) => updateField('completion_message', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>
        </div>

        {/* LLM Config */}
        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">LLM Configuration</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LLM Provider
              </label>
              <select
                value={form.llm_provider}
                onChange={(e) => updateField('llm_provider', e.target.value)}
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
                onChange={(e) => updateField('llm_model', e.target.value)}
                placeholder="gpt-4"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature
              </label>
              <input
                type="number"
                value={form.llm_temperature}
                onChange={(e) => updateField('llm_temperature', e.target.value)}
                min="0"
                max="2"
                step="0.1"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Tokens (optional)
              </label>
              <input
                type="number"
                value={form.llm_max_tokens}
                onChange={(e) => updateField('llm_max_tokens', e.target.value)}
                placeholder="1024"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>

          {form.llm_provider !== 'custom' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                type="password"
                value={form.llm_api_key}
                onChange={(e) => updateField('llm_api_key', e.target.value)}
                placeholder={`Your ${form.llm_provider === 'anthropic' ? 'Anthropic' : 'OpenAI'} API key`}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <p className="text-xs text-gray-500 mt-0.5">
                Required. Stored securely on the server.
              </p>
            </div>
          )}
        </div>

        {/* CORS */}
        <div className="border-t border-gray-200 pt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allowed Origins (comma-separated)
            </label>
            <input
              type="text"
              value={form.allowed_origins}
              onChange={(e) => updateField('allowed_origins', e.target.value)}
              placeholder="https://stanforduniversity.qualtrics.com, http://localhost:3000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={saving || !form.name.trim()}
            className="flex items-center gap-1 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300"
          >
            {saving ? 'Creating...' : 'Create Experiment'}
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
