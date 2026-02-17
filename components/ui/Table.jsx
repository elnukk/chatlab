'use client';

export function Table({ children, className = '' }) {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = '' }) {
  return <thead className={`bg-gray-50 ${className}`}>{children}</thead>;
}

export function TableBody({ children, className = '' }) {
  return (
    <tbody className={`divide-y divide-gray-200 bg-white ${className}`}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = '' }) {
  return (
    <tr className={`hover:bg-gray-50 transition-colors ${className}`}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ${className}`}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 text-sm text-gray-700 ${className}`}>
      {children}
    </td>
  );
}
