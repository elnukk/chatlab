'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import ExperimentCard from '@/components/admin/ExperimentCard';

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/experiments')
      .then((res) => res.json())
      .then((data) => setExperiments(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === 'all'
      ? experiments
      : experiments.filter((e) => e.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Experiments</h1>
        <button
          onClick={() => router.push('/admin/experiments/new')}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Experiment
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'active', 'draft', 'paused', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
              filter === status
                ? 'bg-gray-200 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No experiments found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((exp) => (
            <ExperimentCard
              key={exp.id}
              experiment={exp}
              onClick={() => router.push(`/admin/experiments/${exp.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
