'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

// Context for tab state management
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within a Tabs component');
  }
  return context;
};

// Main Tabs container component
interface TabsProps {
  defaultTab: string;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultTab, children, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

// TabList container
interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabList({ children, className = '' }: TabListProps) {
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const tabs = tabListRef.current?.querySelectorAll('[role="tab"]');
    if (!tabs || tabs.length === 0) return;

    const currentIndex = Array.from(tabs).findIndex(
      (tab) => tab === document.activeElement
    );

    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    (tabs[nextIndex] as HTMLElement).focus();
  };

  return (
    <div
      ref={tabListRef}
      role="tablist"
      className={`flex gap-2 mb-6 border-b border-gray-200 pb-1 overflow-x-auto ${className}`}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}

// Individual Tab button
interface TabProps {
  value: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: number;
}

export function Tab({ value, children, icon, badge }: TabProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;
  const tabRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(() => {
    setActiveTab(value);
  }, [value, setActiveTab]);

  const baseClasses = 'px-4 py-2.5 text-sm font-medium rounded-t-lg transition-smooth focus-ring whitespace-nowrap flex items-center gap-2';
  const activeClasses = 'bg-ocean-600 text-white shadow-md';
  const inactiveClasses = 'bg-white text-slate-medium hover:bg-gray-50 border border-gray-200 border-b-0';

  return (
    <button
      ref={tabRef}
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      id={`tab-${value}`}
      tabIndex={isActive ? 0 : -1}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      onClick={handleClick}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
            isActive ? 'bg-white bg-opacity-20' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// TabPanels container
interface TabPanelsProps {
  children: React.ReactNode;
}

export function TabPanels({ children }: TabPanelsProps) {
  return <div>{children}</div>;
}

// Individual TabPanel
interface TabPanelProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ value, children, className = '' }: TabPanelProps) {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === value;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      className={`animate-fadeIn ${className}`}
    >
      {children}
    </div>
  );
}
