'use client';

const variantStyles = {
  primary:
    'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-400 disabled:bg-gray-300',
  secondary:
    'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-400 disabled:bg-gray-100 disabled:text-gray-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400 disabled:text-gray-400',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  );
}
