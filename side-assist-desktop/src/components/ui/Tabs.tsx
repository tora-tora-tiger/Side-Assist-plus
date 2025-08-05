import React from 'react';
import { Icon } from './Icon';

interface Tab {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  children,
  className = ''
}) => {
  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-white">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors
              ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {tab.icon && <Icon name={tab.icon} size="sm" />}
            {tab.label}
            {tab.badge && (
              <span className={`
                px-2 py-1 text-xs rounded-full
                ${activeTab === tab.id
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600'
                }
              `}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

interface TabPanelProps {
  tabId: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  tabId,
  activeTab,
  children,
  className = ''
}) => {
  if (tabId !== activeTab) return null;

  return (
    <div className={`h-full overflow-auto ${className}`}>
      {children}
    </div>
  );
};