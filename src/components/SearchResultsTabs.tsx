import { Sparkles, Link2, BookOpen, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type TabType = 'resposta' | 'links' | 'ebooks' | 'axway';

interface SearchResultsTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function SearchResultsTabs({ activeTab, onTabChange }: SearchResultsTabsProps) {
  const { t } = useTranslation();

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'resposta', label: t('tabs.answer'), icon: <Sparkles className="w-4 h-4" /> },
    { id: 'links', label: t('tabs.links'), icon: <Link2 className="w-4 h-4" /> },
    { id: 'ebooks', label: t('tabs.ebooks'), icon: <BookOpen className="w-4 h-4" /> },
    { id: 'axway', label: 'Axway', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === tab.id
              ? 'text-teal-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-700" />
          )}
        </button>
      ))}
    </div>
  );
}
