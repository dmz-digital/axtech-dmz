import { Instagram, Linkedin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axwayLogo from '../assets/logo-axway.svg';

const CATEGORIES = [
  { labelKey: 'categories.banking', id: 'banking' },
  { labelKey: 'categories.life_science', id: 'life-science' },
  { labelKey: 'categories.healthcare', id: 'healthcare' },
  { labelKey: 'categories.automotive', id: 'automotivo' },
  { labelKey: 'categories.energy', id: 'energia' },
  { labelKey: 'categories.government', id: 'governo' },
  { labelKey: 'categories.transport', id: 'transporte' },
];

export default function Footer() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer style={{ backgroundColor: '#3E4447' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <div className="mb-1">
              <h2 className="text-3xl font-bold text-white">AxTech</h2>
              <p className="text-xs text-gray-400">News, trends and insights</p>
            </div>

            <div className="flex items-center gap-2 mt-4 mb-6">
              <span className="text-xs text-gray-400">Powered by</span>
              <img src={axwayLogo} alt="Axway" className="h-4" />
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Aqui na AxTech, a tecnologia não é apenas uma ferramenta; é uma paixão que compartilhamos com uma comunidade de pensadores inovadores.
            </p>

            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-gray-500 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors"
              >
                <Instagram style={{ width: '18px', height: '18px' }} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full border border-gray-500 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors"
              >
                <Linkedin style={{ width: '18px', height: '18px' }} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase mb-6 text-lightest-teal">
              {t('footer.solutions')}
            </h3>
            <ul className="space-y-3">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => navigate(`/results?category=${cat.id}`)}
                    className="text-gray-400 text-sm hover:text-white transition-colors text-left"
                  >
                    {t(cat.labelKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase mb-6 text-lightest-teal">
              {t('footer.content')}
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollTo('latest')}
                  className="text-gray-400 text-sm hover:text-white transition-colors text-left"
                >
                  {t('footer.latest_publications')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/ebooks')}
                  className="text-gray-400 text-sm hover:text-white transition-colors text-left"
                >
                  {t('footer.ebooks')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('eventos')}
                  className="text-gray-400 text-sm hover:text-white transition-colors text-left"
                >
                  {t('footer.events')}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase mb-6 text-lightest-teal">
              {t('footer.useful_links')}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">
                  {t('footer.about')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">
                  {t('footer.contact')}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap gap-6">
              <button onClick={() => navigate('/termos-de-uso')} className="text-gray-400 text-xs hover:text-white transition-colors">{t('footer.terms')}</button>
              <button onClick={() => navigate('/politica-de-privacidade')} className="text-gray-400 text-xs hover:text-white transition-colors">{t('footer.privacy')}</button>
              <button onClick={() => navigate('/politica-de-cookies')} className="text-gray-400 text-xs hover:text-white transition-colors">{t('footer.cookies')}</button>
            </div>
            <p className="text-gray-500 text-xs">© 2026 AxTech. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
