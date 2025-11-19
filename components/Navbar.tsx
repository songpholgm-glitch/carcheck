import React from 'react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'entry', label: 'บันทึกรถ', icon: '🚗' },
    { id: 'report', label: 'รายงานวันนี้', icon: '📋' },
    { id: 'database', label: 'ฐานข้อมูลรถ', icon: '💾' },
  ];

  return (
    <nav className="bg-security-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="font-bold text-xl flex items-center gap-2">
            <span className="text-2xl">👮</span>
            <span>Security Log</span>
          </div>
        </div>
      </div>
      {/* Mobile Tab Bar */}
      <div className="flex bg-security-800 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-security-600 text-white border-b-4 border-white'
                : 'text-security-100 hover:bg-security-700'
            }`}
          >
            <div className="text-xl mb-1">{tab.icon}</div>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};