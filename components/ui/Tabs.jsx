'use client';

export function Tabs({ activeTab, onTabChange, children }) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {children.map((child) => {
          if (!child || !child.props) return null;
          const { value, label } = child.props;
          const isActive = activeTab === value;

          return (
            <button
              key={value}
              onClick={() => onTabChange(value)}
              className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export function Tab({ value, label }) {
  // Tab is a declarative component; rendering is handled by the Tabs parent.
  return null;
}
