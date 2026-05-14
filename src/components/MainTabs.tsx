import React from "react";
import { MainTab } from "../model/main-tab";

interface MainTabsProps {
  activeTab: MainTab;
  onChange: (tab: MainTab) => void;
  hasHistory: boolean;
}

export const MainTabs = ({ activeTab, onChange, hasHistory }: MainTabsProps) => {
  return (
    <nav className="main-tabs">
      <button
        className={`main-tab-btn ${activeTab === 'current' ? 'active' : ''}`}
        onClick={() => onChange('current')}
      >
        Tarama Sonuçları
      </button>
      <button
        className={`main-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => onChange('history')}
        disabled={!hasHistory}
        title={!hasHistory ? 'Henüz kaydedilmiş tarama yok' : undefined}
      >
        {hasHistory ? 'Geçmiş' : 'Geçmiş (henüz yok)'}
      </button>
    </nav>
  );
};
