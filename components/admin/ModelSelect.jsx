'use client';

import { useState } from 'react';
import { MODEL_OPTIONS } from '@/lib/llm/models';

const OTHER = '__other__';

export default function ModelSelect({ provider, value, onChange }) {
  const options = MODEL_OPTIONS[provider] || [];
  const isListed = options.some((m) => m.id === value);
  // Saved models that aren't in the list (or an explicit "Other…" pick) use the text input
  const [otherSelected, setOtherSelected] = useState(!isListed);
  const showInput = options.length === 0 || otherSelected || !isListed;

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400';

  if (options.length === 0) {
    return (
      <>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. llama-3-70b"
          className={inputClass}
        />
        <p className="text-xs text-gray-500 mt-0.5">
          The model name your endpoint expects.
        </p>
      </>
    );
  }

  return (
    <>
      <select
        value={showInput ? OTHER : value}
        onChange={(e) => {
          if (e.target.value === OTHER) {
            setOtherSelected(true);
            onChange('');
          } else {
            setOtherSelected(false);
            onChange(e.target.value);
          }
        }}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      >
        {options.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
        <option value={OTHER}>Other…</option>
      </select>
      {showInput && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Exact model ID"
          className={`${inputClass} mt-2`}
        />
      )}
    </>
  );
}
