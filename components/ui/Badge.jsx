'use client';

const variantStyles = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-gray-900 text-white',
  warning: 'bg-gray-200 text-gray-600',
  info: 'bg-gray-300 text-gray-700',
  danger: 'bg-red-100 text-red-700',
};

export default function Badge({
  variant = 'default',
  children,
  className = '',
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
