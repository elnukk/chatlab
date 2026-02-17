'use client';

import { FlaskConical, Users } from 'lucide-react';

const statusColors = {
  draft: 'bg-gray-100 text-gray-500',
  active: 'bg-gray-900 text-white',
  paused: 'bg-gray-200 text-gray-600',
  completed: 'bg-gray-300 text-gray-700',
};

export default function ExperimentCard({ experiment, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-900">{experiment.name}</h3>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
            statusColors[experiment.status] || statusColors.draft
          }`}
        >
          {experiment.status}
        </span>
      </div>

      {experiment.description && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {experiment.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          <span>{experiment.participants_count || 0} participants</span>
        </div>
        <span className="ml-auto">
          {experiment.llm_provider}/{experiment.llm_model}
        </span>
      </div>
    </div>
  );
}
