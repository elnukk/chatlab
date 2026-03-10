'use client';

import { useState } from 'react';
import { Key, Globe, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="space-y-6">
        {/* API Keys */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">API Keys</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            API keys are configured via environment variables on the server.
            They are never exposed to the browser.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-gray-700">OpenAI</p>
                <p className="text-xs text-gray-400">OPENAI_API_KEY</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                Set via env
              </span>
            </div>
            <div className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Anthropic</p>
                <p className="text-xs text-gray-400">ANTHROPIC_API_KEY</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                Set via env
              </span>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Security</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Researcher authentication</span>
              <span className="text-xs text-gray-900 font-medium">
                Supabase Auth
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">
                Participant identification
              </span>
              <span className="text-xs text-gray-500">URL parameters</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">CORS protection</span>
              <span className="text-xs text-gray-500">
                Per-experiment origins
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API key storage</span>
              <span className="text-xs text-gray-900 font-medium">
                Server-side only
              </span>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">About</h2>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Chatbot Experiment Platform v1.0</p>
            <p>Platform for running AI chatbot experiments</p>
            <p className="text-xs text-gray-400">
              Licensed under MIT License
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
