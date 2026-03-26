import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import CategoryTabs from './components/CategoryTabs';
import LatestPublications from './components/LatestPublications';
import NossosConteudos from './components/NossosConteudos';
import NewsletterSection from './components/NewsletterSection';
import EventosSection from './components/EventosSection';
import IndustrySection from './components/IndustrySection';
import LifeScienceSection from './components/LifeScienceSection';
import HealthcareSection from './components/HealthcareSection';
import OutrosSetoresSection from './components/OutrosSetoresSection';
import Footer from './components/Footer';
import SearchResultsPage from './pages/SearchResultsPage';
import ArticlePage from './pages/ArticlePage';
import EbooksPage from './pages/EbooksPage';
import EbookPage from './pages/EbookPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import CookiesPage from './pages/CookiesPage';
import NewsletterSuccessPage from './pages/NewsletterSuccessPage';
import NewsletterErrorPage from './pages/NewsletterErrorPage';

import LoginPage from './pages/admin/LoginPage';
import ProtectedRoute from './components/admin/ProtectedRoute';
import DashboardPage from './pages/admin/DashboardPage';
import ArticlesListPage from './pages/admin/ArticlesListPage';
import ArticleFormPage from './pages/admin/ArticleFormPage';
import EbooksListPage from './pages/admin/EbooksListPage';
import EbookFormPage from './pages/admin/EbookFormPage';
import EventsListPage from './pages/admin/EventsListPage';
import EventFormPage from './pages/admin/EventFormPage';
import LeadsPage from './pages/admin/LeadsPage';
import WordPressImportPage from './pages/admin/WordPressImportPage';

import './i18n';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function HomePage() {
  return (
    <>
      <SearchSection />
      <CategoryTabs />
      <LatestPublications />
      <NossosConteudos />
      <NewsletterSection />
      <EventosSection />
      <IndustrySection />
      <LifeScienceSection />
      <HealthcareSection />
      <OutrosSetoresSection />
    </>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin><DashboardPage /></ProtectedRoute>} />
        <Route path="/admin/artigos" element={<ProtectedRoute requireAdmin><ArticlesListPage /></ProtectedRoute>} />
        <Route path="/admin/artigos/novo" element={<ProtectedRoute requireAdmin><ArticleFormPage /></ProtectedRoute>} />
        <Route path="/admin/artigos/:id/editar" element={<ProtectedRoute requireAdmin><ArticleFormPage /></ProtectedRoute>} />
        <Route path="/admin/artigos/importar" element={<ProtectedRoute requireAdmin><WordPressImportPage /></ProtectedRoute>} />
        <Route path="/admin/ebooks" element={<ProtectedRoute requireAdmin><EbooksListPage /></ProtectedRoute>} />
        <Route path="/admin/ebooks/novo" element={<ProtectedRoute requireAdmin><EbookFormPage /></ProtectedRoute>} />
        <Route path="/admin/ebooks/:id/editar" element={<ProtectedRoute requireAdmin><EbookFormPage /></ProtectedRoute>} />
        <Route path="/admin/eventos" element={<ProtectedRoute requireAdmin><EventsListPage /></ProtectedRoute>} />
        <Route path="/admin/eventos/novo" element={<ProtectedRoute requireAdmin><EventFormPage /></ProtectedRoute>} />
        <Route path="/admin/eventos/:id/editar" element={<ProtectedRoute requireAdmin><EventFormPage /></ProtectedRoute>} />
        <Route path="/admin/leads" element={<ProtectedRoute requireAdmin><LeadsPage /></ProtectedRoute>} />
      </Routes>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/results" element={<SearchResultsPage />} />
        <Route path="/artigo/:slug" element={<ArticlePage />} />
        <Route path="/ebooks" element={<EbooksPage />} />
        <Route path="/ebook/:slug" element={<EbookPage />} />
        <Route path="/termos-de-uso" element={<TermsPage />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPage />} />
        <Route path="/politica-de-cookies" element={<CookiesPage />} />
        <Route path="/newsletter/sucesso" element={<NewsletterSuccessPage />} />
        <Route path="/newsletter/erro" element={<NewsletterErrorPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
