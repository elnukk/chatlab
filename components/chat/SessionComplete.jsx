'use client';

import { CheckCircle } from 'lucide-react';

export default function SessionComplete({ message }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center border-t border-gray-200 bg-gray-50">
      <CheckCircle className="w-10 h-10 text-gray-500 mb-3" />
      <p className="text-gray-700 font-medium">
        {message || 'This session is complete. Thank you!'}
      </p>
    </div>
  );
}
