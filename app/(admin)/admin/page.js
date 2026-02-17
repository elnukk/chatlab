'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FlaskConical, Users, MessageCircle, Plus } from 'lucide-react';

export default function AdminDashboard() {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/experiments')
      .then((res) => res.json())
      .then((data) => setExperiments(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeCount = experiments.filter((e) => e.status === 'active').length;
  const totalParticipants = experiments.reduce(
    (sum, e) => sum + (e.participants_count || 0),
    0
  );

  const stats = [
    {
      label: 'Total Experiments',
      value: experiments.length,
      icon: FlaskConical,
    },
    { label: 'Active Experiments', value: activeCount, icon: FlaskConical },
    { label: 'Total Participants', value: totalParticipants, icon: Users },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of your experiments
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/experiments/new')}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Experiment
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '-' : stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Experiments
        </h2>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : experiments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FlaskConical className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">No experiments yet</p>
            <button
              onClick={() => router.push('/admin/experiments/new')}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium underline"
            >
              Create your first experiment
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {experiments.slice(0, 5).map((exp) => (
              <div
                key={exp.id}
                onClick={() => router.push(`/admin/experiments/${exp.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm hover:border-gray-300 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{exp.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {exp.participants_count || 0} participants
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                    exp.status === 'active'
                      ? 'bg-gray-900 text-white'
                      : exp.status === 'paused'
                      ? 'bg-gray-200 text-gray-600'
                      : exp.status === 'completed'
                      ? 'bg-gray-300 text-gray-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {exp.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
