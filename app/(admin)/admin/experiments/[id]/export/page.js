'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ExportDialog from '@/components/admin/ExportDialog';

export default function ExportPage() {
  const router = useRouter();
  const params = useParams();

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.push(`/admin/experiments/${params.id}`)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Export Data</h1>

      <ExportDialog
        open={true}
        onClose={() => router.push(`/admin/experiments/${params.id}`)}
        experimentId={params.id}
      />
    </div>
  );
}
