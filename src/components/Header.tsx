import { Search, Menu, X, ChevronDown } from 'lucide-react';
import axwayLogo from '../assets/logo-axway copy.svg';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchModal from './SearchModal';
import { useEdicaoEspecial } from '../hooks/useEdicaoEspecial';

const LANGUAGES = [
  { code: 'pt', label: 'PT', full: 'Português' },
  { code: 'en', label: 'EN', full: 'English' }
];

const CATEGORIES = [
  { id: 'banking', labelKey: 'categories.banking' },
  { id: 'life-science', labelKey: 'categories.life_science' },
  { id: 'healthcare', labelKey: 'categories.healthcare' },
  { id: 'automotivo', labelKey: 'categories.automotive' },
  { id: 'energia', labelKey: 'categories.energy' },
  { id: 'governo', labelKey: 'categories.government' },
  { id: 'setor-publico', labelKey: 'categories.public_sector' },
  { id: 'manufatura', labelKey: 'categories.manufacturing' },
  { id: 'transporte', labelKey: 'categories.transport' },
  { id: 'varejo', labelKey: 'categories.retail' },
];

export default function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { ebook: edicaoEspecial } = useEdicaoEspecial();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [pendingScroll, setPendingScroll] = useState<string | null>(null);

  useEffect(() => {
    if (pendingScroll && location.pathname === '/') {
      const id = pendingScroll;
      setPendingScroll(null);
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [location.pathname, pendingScroll]);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      setPendingScroll(id);
      navigate('/');
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => i18n.language.startsWith(l.code)) || LANGUAGES[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsLangOpen(false);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setIsCatOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <>
    <header className="bg-white border-b border-gray-200">
      <div
        className={`bg-teal-800 text-white text-center py-2 text-sm ${edicaoEspecial ? 'cursor-pointer hover:bg-teal-700 transition-colors' : ''}`}
        onClick={() => edicaoEspecial && navigate(`/ebook/${edicaoEspecial.slug}`)}
      >
        {t('header.banner_prefix')} <span className="font-semibold">{t('header.banner_highlight')}</span> {t('header.banner_suffix')}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-5">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div>
              <h1 className="text-2xl font-bold text-teal-800">AxTech</h1>
              <p className="text-xs text-gray-500">{t('header.tagline')}</p>
            </div>
            <div className="hidden md:flex items-center space-x-2 ml-4 text-xs text-gray-400">
              <span>Powered by</span>
              <img src={axwayLogo} alt="Axway" className="h-3.5" />
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#ultimas" className="text-teal-700 font-medium hover:text-teal-900 transition-colors">
              {t('nav.latest')}
            </a>
            <div ref={catRef} className="relative">
              <button
                onClick={() => setIsCatOpen((v) => !v)}
                className="flex items-center gap-1 text-gray-700 hover:text-teal-700 transition-colors"
              >
                {t('nav.categories')}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCatOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCatOpen && (
                <div className="absolute left-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 py-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { navigate(`/results?category=${cat.id}`); setIsCatOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      {t(cat.labelKey)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => navigate('/ebooks')} className="text-gray-700 hover:text-teal-700 transition-colors">
              {t('nav.ebooks')}
            </button>
            <button onClick={() => scrollToSection('newsletter')} className="text-gray-700 hover:text-teal-700 transition-colors">
              {t('nav.newsletter')}
            </button>
            <button onClick={() => scrollToSection('eventos')} className="text-gray-700 hover:text-teal-700 transition-colors">
              {t('nav.events')}
            </button>
          </nav>

          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            <div ref={langRef} className="relative hidden md:block">
              <button
                onClick={() => setIsLangOpen((v) => !v)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                {currentLang.label}
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        currentLang.code === lang.code
                          ? 'bg-teal-50 text-teal-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{lang.full}</span>
                      <span className="text-xs text-gray-400 font-mono">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="hidden md:block bg-teal-700 text-white px-6 py-2 rounded-lg hover:bg-teal-800 transition-colors font-medium">
              {t('header.create_account')}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-teal-800">Menu</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <nav className="flex flex-col p-6 space-y-6">
            <a href="#ultimas" onClick={() => setIsMobileMenuOpen(false)} className="text-teal-700 font-medium hover:text-teal-900 transition-colors text-lg">
              {t('nav.latest')}
            </a>
            <div>
              <button
                onClick={() => setIsCatOpen((v) => !v)}
                className="flex items-center gap-2 text-gray-700 hover:text-teal-700 transition-colors text-lg w-full"
              >
                {t('nav.categories')}
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isCatOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCatOpen && (
                <div className="mt-2 ml-4 flex flex-col space-y-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { navigate(`/results?category=${cat.id}`); setIsCatOpen(false); setIsMobileMenuOpen(false); }}
                      className="text-left text-gray-500 hover:text-teal-700 transition-colors text-base"
                    >
                      {t(cat.labelKey)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => { navigate('/ebooks'); setIsMobileMenuOpen(false); }} className="text-gray-700 hover:text-teal-700 transition-colors text-lg text-left">
              {t('nav.ebooks')}
            </button>
            <button onClick={() => scrollToSection('newsletter')} className="text-gray-700 hover:text-teal-700 transition-colors text-lg text-left">
              {t('nav.newsletter')}
            </button>
            <button onClick={() => scrollToSection('eventos')} className="text-gray-700 hover:text-teal-700 transition-colors text-lg text-left">
              {t('nav.events')}
            </button>
          </nav>

          <div className="mt-auto p-6 space-y-4 border-t border-gray-200">
            <div className="flex gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { changeLanguage(lang.code); setIsMobileMenuOpen(false); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    currentLang.code === lang.code
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'text-gray-600 border-gray-200 hover:border-teal-400 hover:text-teal-700'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <button className="w-full bg-teal-700 text-white px-6 py-3 rounded-lg hover:bg-teal-800 transition-colors font-medium">
              {t('header.create_account')}
            </button>
          </div>
        </div>
      </div>
    </header>

    <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
