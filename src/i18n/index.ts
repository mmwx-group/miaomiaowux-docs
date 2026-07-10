import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from './locales/en/common.json'
import enLayout from './locales/en/layout.json'
import enSidebar from './locales/en/sidebar.json'
import enLanding from './locales/en/landing.json'
import enSearch from './locales/en/search.json'
import enXdocs from './locales/en/xdocs.json'

import zhCommon from './locales/zh/common.json'
import zhLayout from './locales/zh/layout.json'
import zhSidebar from './locales/zh/sidebar.json'
import zhLanding from './locales/zh/landing.json'
import zhSearch from './locales/zh/search.json'
import zhXdocs from './locales/zh/xdocs.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh'],
    defaultNS: 'common',
    ns: ['common', 'layout', 'sidebar', 'landing', 'search', 'xdocs'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'mmw-lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        common: enCommon,
        layout: enLayout,
        sidebar: enSidebar,
        landing: enLanding,
        search: enSearch,
        xdocs: enXdocs,
      },
      zh: {
        common: zhCommon,
        layout: zhLayout,
        sidebar: zhSidebar,
        landing: zhLanding,
        search: zhSearch,
        xdocs: zhXdocs,
      },
    },
  })

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})

export default i18n
