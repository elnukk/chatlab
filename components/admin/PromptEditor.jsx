'use client';

import { useState } from 'react';

const TEMPLATE_VARS = [
  { name: 'participant_id', desc: 'Participant identifier' },
  { name: 'experiment_id', desc: 'Experiment identifier' },
  { name: 'message_count', desc: 'Messages sent so far' },
];

export default function PromptEditor({ value, onChange, className }) {
  const [showVars, setShowVars] = useState(false);

  const insertVariable = (varName) => {
    const insertion = `{{${varName}}}`;
    onChange((value || '') + insertion);
  };

  return (
    <div className={`flex gap-4 ${className || ''}`}>
      <div className="flex-1">
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your system prompt here. Use {{variable_name}} for dynamic values and {{#if variable_name}}...{{/if}} for conditional blocks."
          className="w-full h-64 rounded-lg border border-gray-300 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-y"
        />
      </div>

      <div className="w-64 shrink-0">
        <button
          onClick={() => setShowVars(!showVars)}
          className="text-sm font-medium text-gray-900 hover:text-gray-700 mb-2"
        >
          {showVars ? 'Hide' : 'Show'} Template Variables
        </button>

        {showVars && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-2">
            <p className="text-xs text-gray-500 font-medium mb-1">
              Built-in variables:
            </p>
            {TEMPLATE_VARS.map((v) => (
              <button
                key={v.name}
                onClick={() => insertVariable(v.name)}
                className="block w-full text-left hover:bg-white rounded p-2 transition-colors"
              >
                <code className="text-xs text-gray-900 font-mono">
                  {`{{${v.name}}}`}
                </code>
                <p className="text-xs text-gray-500 mt-0.5">{v.desc}</p>
              </button>
            ))}

            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 font-medium mb-1">
                URL parameter variables:
              </p>
              <p className="text-xs text-gray-500">
                Any URL parameter (e.g. ?persona=friendly) becomes {'{{persona}}'}.
              </p>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 font-medium mb-1">
                Conditional blocks:
              </p>
              <code className="text-xs text-gray-600 font-mono block">
                {`{{#if var}}...{{/if}}`}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
