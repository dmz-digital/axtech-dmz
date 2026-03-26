import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Clock, Calendar, ChevronRight } from 'lucide-react';
import { useArticle } from '../hooks/useArticle';
import { ArticleDetailSkeleton } from '../components/Skeleton';

const CATEGORY_IMAGES: Record<string, string> = {
  banking: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'life-science': 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  healthcare: 'https://images.pexels.com/photos/3846022/pexels-photo-3846022.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  automotive: 'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  energy: 'https://images.pexels.com/photos/9875441/pexels-photo-9875441.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  government: 'https://images.pexels.com/photos/1098515/pexels-photo-1098515.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  manufacturing: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  transport: 'https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  retail: 'https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
};

const CATEGORY_LABELS: Record<string, { pt: string; en: string }> = {
  banking: { pt: 'Banking e Financial Services', en: 'Banking & Financial Services' },
  'life-science': { pt: 'Life Science', en: 'Life Science' },
  healthcare: { pt: 'HealthCare', en: 'HealthCare' },
  automotive: { pt: 'Automotivo', en: 'Automotive' },
  energy: { pt: 'Energia e Utilitarios', en: 'Energy & Utilities' },
  government: { pt: 'Governo', en: 'Government' },
  manufacturing: { pt: 'Manufatura', en: 'Manufacturing' },
  transport: { pt: 'Transporte e Logistica', en: 'Transport & Logistics' },
  retail: { pt: 'Varejo', en: 'Retail' },
};

const TAG_COLORS = [
  'bg-blue-50 text-blue-600',
  'bg-teal-50 text-teal-600',
  'bg-orange-50 text-orange-600',
  'bg-cyan-50 text-cyan-600',
  'bg-emerald-50 text-emerald-600',
];

function getReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(dateString: string, lang: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function renderContent(content: string) {
  const paragraphs = content.split('\n\n').filter(p => p.trim());

  return paragraphs.map((paragraph, index) => {
    if (paragraph.startsWith('## ')) {
      return (
        <h2 key={index} className="text-2xl font-bold text-gray-900 mt-10 mb-4">
          {paragraph.replace('## ', '')}
        </h2>
      );
    }
    if (paragraph.startsWith('### ')) {
      return (
        <h3 key={index} className="text-xl font-semibold text-gray-800 mt-8 mb-3">
          {paragraph.replace('### ', '')}
        </h3>
      );
    }
    if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
      const items = paragraph.split('\n').filter(l => l.trim());
      return (
        <ul key={index} className="list-disc list-inside space-y-2 my-4 text-gray-700">
          {items.map((item, i) => (
            <li key={i}>{item.replace(/^[-*]\s/, '')}</li>
          ))}
        </ul>
      );
    }
    if (/^\d+\.\s/.test(paragraph)) {
      const items = paragraph.split('\n').filter(l => l.trim());
      return (
        <ol key={index} className="list-decimal list-inside space-y-2 my-4 text-gray-700">
          {items.map((item, i) => (
            <li key={i}>{item.replace(/^\d+\.\s/, '')}</li>
          ))}
        </ol>
      );
    }
    if (paragraph.startsWith('> ')) {
      return (
        <blockquote key={index} className="border-l-4 border-teal-500 pl-4 py-2 my-6 italic text-gray-600 bg-gray-50 rounded-r-lg">
          {paragraph.replace('> ', '')}
        </blockquote>
      );
    }
    return (
      <p key={index} className="text-gray-700 leading-relaxed mb-6">
        {paragraph}
      </p>
    );
  });
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const lang: 'pt' | 'en' = i18n.language.startsWith('en') ? 'en' : 'pt';
  const { article, isLoading, error } = useArticle(slug, lang);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <main className="bg-white min-h-[60vh]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <ArticleDetailSkeleton />
        </div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-5 py-10">
        <div className="bg-white rounded-2xl p-12 max-w-md text-center shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {t('article.not_found', 'Artigo nao encontrado')}
          </h2>
          <p className="text-gray-600 mb-2">
            {t('article.not_found_desc', 'O artigo que voce esta procurando nao existe ou foi removido.')}
          </p>
          <p className="text-gray-400 text-xs mb-6">Slug: {slug || 'undefined'}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('article.back_home', 'Voltar ao inicio')}
          </button>
        </div>
      </div>
    );
  }

  const { title, summary, content, tags, category, related, created_at } = article;
  const readingTime = getReadingTime(content);
  const heroImage = article.image_url || CATEGORY_IMAGES[category] || 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
  const categoryLabel = CATEGORY_LABELS[category]?.[lang] || category;

  return (
    <main className="bg-white min-h-[60vh]">
      <article className="max-w-4xl mx-auto py-8">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-teal-50 text-teal-700">
                {categoryLabel}
              </span>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(created_at, lang)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {readingTime} min
                </span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
              {title}
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              {summary}
            </p>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/results?tag=${encodeURIComponent(tag)}`)}
                  className={`px-3 py-1 rounded-full text-sm font-medium hover:opacity-80 transition-opacity ${TAG_COLORS[index % TAG_COLORS.length]}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </header>

          <figure className="mb-10 -mx-6 md:mx-0">
            <div className="relative overflow-hidden rounded-none md:rounded-2xl">
              <img
                src={heroImage}
                alt={title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          </figure>

          <div className="prose prose-lg max-w-none">
            {renderContent(content)}
          </div>

          {tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                {lang === 'pt' ? 'Topicos relacionados' : 'Related Topics'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <button
                    key={tag}
                    onClick={() => navigate(`/results?tag=${encodeURIComponent(tag)}`)}
                    className={`px-4 py-2 rounded-full text-sm font-medium hover:opacity-80 transition-opacity ${TAG_COLORS[index % TAG_COLORS.length]}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">
                {lang === 'pt' ? 'Continue lendo' : 'Continue Reading'}
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                {related.slice(0, 3).map((relatedArticle) => (
                  <button
                    key={relatedArticle.slug}
                    onClick={() => navigate(`/artigo/${relatedArticle.slug}`)}
                    className="text-left p-4 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all group"
                  >
                    <span className="text-xs font-medium text-teal-600 mb-2 block">
                      {CATEGORY_LABELS[relatedArticle.category]?.[lang] || relatedArticle.category}
                    </span>
                    <p className="font-medium text-gray-900 group-hover:text-teal-700 transition-colors line-clamp-2 mb-2">
                      {relatedArticle.title}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {relatedArticle.summary}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm text-teal-600 mt-3 group-hover:gap-2 transition-all">
                      {lang === 'pt' ? 'Ler mais' : 'Read more'}
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </article>
    </main>
  );
}
