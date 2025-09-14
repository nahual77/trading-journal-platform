import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center ${isMobile ? 'space-x-1 px-2 py-1' : 'space-x-2 px-3 py-2'} bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors language-button-mobile`}
        title="Cambiar idioma"
      >
        <Globe className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-gray-300`} />
        <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-300`}>{currentLanguage.flag}</span>
        {!isMobile && <span className="text-sm text-gray-300">{currentLanguage.name}</span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                  i18n.language === language.code ? 'text-gold-300' : 'text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{language.flag}</span>
                  <span>{language.name}</span>
                </div>
                {i18n.language === language.code && (
                  <Check className="h-4 w-4 text-gold-300" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
