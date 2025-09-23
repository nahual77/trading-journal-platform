import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar traducciones de forma estática para asegurar que se incluyan en el bundle
import esTranslation from '../locales/es/translation.json';
import enTranslation from '../locales/en/translation.json';
import ptTranslation from '../locales/pt/translation.json';
import frTranslation from '../locales/fr/translation.json';
import deTranslation from '../locales/de/translation.json';
import itTranslation from '../locales/it/translation.json';
import zhCNTranslation from '../locales/zh-CN/translation.json';
import jaTranslation from '../locales/ja/translation.json';
import koTranslation from '../locales/ko/translation.json';
import ruTranslation from '../locales/ru/translation.json';
import arTranslation from '../locales/ar/translation.json';

const resources = {
  es: { translation: esTranslation },
  en: { translation: enTranslation },
  pt: { translation: ptTranslation },
  fr: { translation: frTranslation },
  de: { translation: deTranslation },
  it: { translation: itTranslation },
  'zh-CN': { translation: zhCNTranslation },
  ja: { translation: jaTranslation },
  ko: { translation: koTranslation },
  ru: { translation: ruTranslation },
  ar: { translation: arTranslation }
};

// Función para inicializar i18n de forma síncrona
const initI18n = () => {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'es',
      lng: 'es', // Idioma por defecto explícito
      debug: process.env.NODE_ENV === 'development',
      interpolation: {
        escapeValue: false
      },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage']
      },
      react: {
        useSuspense: false
      },
      // Asegurar que las traducciones estén disponibles inmediatamente
      initImmediate: false,
      // Configuración adicional para producción
      load: 'languageOnly',
      preload: ['es', 'en'],
      saveMissing: false,
      missingKeyHandler: (lng, ns, key) => {
        console.warn(`Missing translation key: ${key} for language: ${lng}`);
        return key; // Devolver la clave si no se encuentra la traducción
      }
    });
};

// Inicializar inmediatamente
initI18n();

export default i18n;
