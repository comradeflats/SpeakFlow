'use client';

import { useState, useMemo } from 'react';
import { Globe, Search, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';
import Card from './ui/Card';

interface LanguagePickerProps {
  selectedLanguage: string;
  onLanguageChange: (languageCode: string) => void;
}

export const LanguagePicker: React.FC<LanguagePickerProps> = ({
  selectedLanguage,
  onLanguageChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return SUPPORTED_LANGUAGES;

    const query = searchQuery.toLowerCase();
    return SUPPORTED_LANGUAGES.filter(
      lang =>
        lang.name.toLowerCase().includes(query) ||
        lang.nativeName.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const selectedLang = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage);

  return (
    <div className="relative">
      {/* Language Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Globe size={18} className="text-ocean-600" />
        <span className="text-sm font-medium text-slate-dark">
          {selectedLang?.nativeName || 'Select Language'}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 z-50">
          <Card className="p-0 shadow-xl border-2 border-ocean-200 max-h-96 overflow-hidden flex flex-col">
            {/* Search Box */}
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search languages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>
            </div>

            {/* Language List */}
            <div className="overflow-y-auto flex-1">
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-ocean-50 transition-colors flex items-center justify-between
                      ${selectedLanguage === lang.code ? 'bg-ocean-100' : ''}
                    `}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-dark">{lang.name}</p>
                      <p className="text-xs text-slate-medium">{lang.nativeName}</p>
                    </div>
                    {selectedLanguage === lang.code && (
                      <Check size={18} className="text-ocean-600" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-slate-medium">
                  No languages found
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Click-outside handler */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
