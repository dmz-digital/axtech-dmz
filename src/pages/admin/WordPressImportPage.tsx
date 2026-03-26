import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Download,
  CheckSquare,
  Square,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Globe,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/supabase';
import { htmlToMarkdown, generateSlug } from '../../utils/htmlToMarkdown';

interface WPPost {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  link: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url?: string }>;
    'wp:term'?: Array<Array<{ name: string }>>;
  };
}

interface ImportArticle {
  wpId: number;
  selected: boolean;
  slug: string;
  category: string;
  imageUrl: string;
  tags: string;
  titlePt: string;
  summaryPt: string;
  contentPt: string;
  titleEn: string;
  summaryEn: string;
  contentEn: string;
  isPublished: boolean;
  expanded: boolean;
  link: string;
  date: string;
}

type ImportStatus = 'idle' | 'fetching' | 'reviewing' | 'importing' | 'done';

const PER_PAGE = 100;

const CATEGORIES = [
  { value: 'banking', label: 'Banking e Financial Services' },
  { value: 'life-science', label: 'Life Science' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'automotivo', label: 'Automotivo' },
  { value: 'energia', label: 'Energia' },
  { value: 'governo', label: 'Governo' },
  { value: 'setor-publico', label: 'Setor Público' },
  { value: 'manufatura', label: 'Manufatura' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'varejo', label: 'Varejo' },
  { value: 'technology', label: 'Technology' },
];

const WP_CATEGORY_MAP: Record<string, string> = {
  'banking': 'banking',
  'financial services': 'banking',
  'financeiro': 'banking',
  'banco': 'banking',
  'bancos': 'banking',
  'life science': 'life-science',
  'life-science': 'life-science',
  'ciências da vida': 'life-science',
  'ciencias da vida': 'life-science',
  'healthcare': 'healthcare',
  'saúde': 'healthcare',
  'saude': 'healthcare',
  'automotivo': 'automotivo',
  'automotive': 'automotivo',
  'energia': 'energia',
  'energy': 'energia',
  'governo': 'governo',
  'government': 'governo',
  'setor público': 'setor-publico',
  'setor publico': 'setor-publico',
  'public sector': 'setor-publico',
  'manufatura': 'manufatura',
  'manufacturing': 'manufatura',
  'transporte': 'transporte',
  'transportation': 'transporte',
  'varejo': 'varejo',
  'retail': 'varejo',
  'technology': 'technology',
  'tecnologia': 'technology',
};

function mapWpCategory(wpCategories: string[]): string {
  for (const name of wpCategories) {
    const normalized = name.toLowerCase().trim();
    if (WP_CATEGORY_MAP[normalized]) {
      return WP_CATEGORY_MAP[normalized];
    }
  }
  return 'technology';
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ').trim();
}

function buildApiUrl(base: string, page: number): string {
  const clean = base.replace(/\/$/, '');
  return `${clean}/wp-json/wp/v2/posts?_embed=1&per_page=${PER_PAGE}&page=${page}&status=publish`;
}

export default function WordPressImportPage() {
  const navigate = useNavigate();
  const [siteUrl, setSiteUrl] = useState('');
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<ImportArticle[]>([]);
  const [fetchProgress, setFetchProgress] = useState<{ fetched: number; total: number } | null>(null);
  const [importResults, setImportResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });

  const fetchFromWordPress = async () => {
    setError(null);
    setStatus('fetching');
    setFetchProgress(null);

    let url = siteUrl.trim();
    if (!url.startsWith('http')) url = `https://${url}`;

    try {
      const firstApiUrl = buildApiUrl(url, 1);
      const firstResponse = await fetch(firstApiUrl, {
        headers: { 'Accept': 'application/json' },
      });

      if (!firstResponse.ok) {
        if (firstResponse.status === 401 || firstResponse.status === 403) {
          throw new Error('Acesso negado. Verifique se o site permite acesso publico a API.');
        }
        if (firstResponse.status === 404) {
          throw new Error('API do WordPress nao encontrada. Verifique se a URL esta correta e se a REST API esta habilitada no site.');
        }
        throw new Error(`Erro ao acessar o site: ${firstResponse.status} ${firstResponse.statusText}`);
      }

      const totalPages = parseInt(firstResponse.headers.get('X-WP-TotalPages') || '1', 10);
      const totalPosts = parseInt(firstResponse.headers.get('X-WP-Total') || '0', 10);

      const firstPage: WPPost[] = await firstResponse.json();

      if (!Array.isArray(firstPage)) {
        throw new Error('Resposta invalida da API. Verifique se a URL e de um site WordPress.');
      }

      if (firstPage.length === 0) {
        throw new Error('Nenhum artigo publicado encontrado no site.');
      }

      setFetchProgress({ fetched: firstPage.length, total: totalPosts || firstPage.length });

      let allPosts: WPPost[] = [...firstPage];

      for (let page = 2; page <= totalPages; page++) {
        const pageUrl = buildApiUrl(url, page);
        const pageResponse = await fetch(pageUrl, { headers: { 'Accept': 'application/json' } });
        if (!pageResponse.ok) break;
        const pagePosts: WPPost[] = await pageResponse.json();
        if (!Array.isArray(pagePosts) || pagePosts.length === 0) break;
        allPosts = [...allPosts, ...pagePosts];
        setFetchProgress({ fetched: allPosts.length, total: totalPosts || allPosts.length });
      }

      const posts = allPosts;

      const mapped: ImportArticle[] = posts.map((post) => {
        const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
        const wpCategoryNames = post._embedded?.['wp:term']?.[0]?.map((t) => t.name) || [];
        const wpTags = post._embedded?.['wp:term']?.[1]?.map((t) => t.name) || [];

        const titlePt = stripHtml(post.title.rendered);
        const summaryPt = stripHtml(post.excerpt.rendered).slice(0, 300);
        const contentPt = htmlToMarkdown(post.content.rendered);

        return {
          wpId: post.id,
          selected: true,
          slug: post.slug || generateSlug(titlePt),
          category: mapWpCategory(wpCategoryNames),
          imageUrl: featuredImage,
          tags: wpTags.join(', '),
          titlePt,
          summaryPt,
          contentPt,
          titleEn: titlePt,
          summaryEn: summaryPt,
          contentEn: contentPt,
          isPublished: false,
          expanded: false,
          link: post.link,
          date: post.date,
        };
      });

      setArticles(mapped);
      setStatus('reviewing');
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError(
          'Nao foi possivel acessar o site. Possiveis causas:\n' +
          '1. O site nao permite requisicoes de outras origens (CORS bloqueado)\n' +
          '2. O endereco do site esta incorreto\n' +
          '3. O site esta fora do ar\n\n' +
          'Neste caso, exporte os artigos do WordPress em formato JSON e importe manualmente.'
        );
      } else {
        setError(err instanceof Error ? err.message : 'Erro desconhecido ao acessar o site.');
      }
      setStatus('idle');
    }
  };

  const toggleSelect = (idx: number) => {
    setArticles((prev) => prev.map((a, i) => (i === idx ? { ...a, selected: !a.selected } : a)));
  };

  const toggleAll = () => {
    const allSelected = articles.every((a) => a.selected);
    setArticles((prev) => prev.map((a) => ({ ...a, selected: !allSelected })));
  };

  const toggleExpand = (idx: number) => {
    setArticles((prev) => prev.map((a, i) => (i === idx ? { ...a, expanded: !a.expanded } : a)));
  };

  const updateArticle = (idx: number, field: keyof ImportArticle, value: string | boolean) => {
    setArticles((prev) => prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a)));
  };

  const selectedCount = articles.filter((a) => a.selected).length;

  const handleImport = async () => {
    const toImport = articles.filter((a) => a.selected);
    if (toImport.length === 0) return;

    setStatus('importing');
    setImportProgress({ current: 0, total: toImport.length });
    let success = 0;
    let failed = 0;

    for (let i = 0; i < toImport.length; i++) {
      const art = toImport[i];
      setImportProgress({ current: i + 1, total: toImport.length });

      try {
        await adminApi.post('admin-articles', {
          slug: art.slug,
          category: art.category,
          is_published: art.isPublished,
          data: {
            image_url: art.imageUrl,
            tags: art.tags.split(',').map((t) => t.trim()).filter(Boolean),
            translations: {
              pt: { title: art.titlePt, summary: art.summaryPt, content: art.contentPt },
              en: { title: art.titleEn, summary: art.summaryEn, content: art.contentEn },
            },
          },
        });
        success++;
      } catch {
        failed++;
      }
    }

    setImportResults({ success, failed });
    setStatus('done');
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => navigate('/admin/artigos')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Importar do WordPress</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Importe artigos de qualquer site WordPress com a REST API habilitada
            </p>
          </div>
        </div>

        {status === 'done' ? (
          <DoneState
            success={importResults.success}
            failed={importResults.failed}
            onGoToList={() => navigate('/admin/artigos')}
            onImportMore={() => {
              setStatus('idle');
              setSiteUrl('');
              setArticles([]);
            }}
          />
        ) : status === 'importing' ? (
          <ImportingState current={importProgress.current} total={importProgress.total} />
        ) : (
          <>
            <UrlStep
              siteUrl={siteUrl}
              setSiteUrl={setSiteUrl}
              loading={status === 'fetching'}
              fetchProgress={fetchProgress}
              onFetch={fetchFromWordPress}
              error={error}
            />

            {status === 'reviewing' && articles.length > 0 && (
              <ReviewStep
                articles={articles}
                selectedCount={selectedCount}
                onToggleAll={toggleAll}
                onToggleSelect={toggleSelect}
                onToggleExpand={toggleExpand}
                onUpdateArticle={updateArticle}
                onImport={handleImport}
              />
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function UrlStep({
  siteUrl,
  setSiteUrl,
  loading,
  fetchProgress,
  onFetch,
  error,
}: {
  siteUrl: string;
  setSiteUrl: (v: string) => void;
  loading: boolean;
  fetchProgress: { fetched: number; total: number } | null;
  onFetch: () => void;
  error: string | null;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
          <Globe className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">URL do site WordPress</h2>
          <p className="text-sm text-gray-500">Informe o endereco do site que deseja importar</p>
        </div>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={siteUrl}
          onChange={(e) => setSiteUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && siteUrl.trim() && onFetch()}
          placeholder="https://exemplo.com.br"
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          disabled={loading}
        />
        <button
          onClick={onFetch}
          disabled={loading || !siteUrl.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {loading
            ? fetchProgress
              ? `${fetchProgress.fetched} / ${fetchProgress.total}`
              : 'Buscando...'
            : 'Buscar artigos'}
        </button>
      </div>

      {loading && fetchProgress && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>Buscando artigos...</span>
            <span>{fetchProgress.fetched} de {fetchProgress.total}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((fetchProgress.fetched / fetchProgress.total) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <pre className="text-sm text-red-700 whitespace-pre-wrap font-sans">{error}</pre>
          </div>
        </div>
      )}

      <div className="mt-5 pt-5 border-t border-gray-100">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Como funciona</p>
        <ul className="space-y-1.5">
          {[
            'A busca utiliza a REST API publica do WordPress (wp-json/wp/v2/posts)',
            'As categorias do WordPress sao mapeadas automaticamente para as categorias do sistema',
            'Conteudo HTML e convertido automaticamente para Markdown',
            'Voce pode revisar e editar cada artigo antes de importar',
            'Os campos em ingles sao pre-preenchidos com o conteudo em portugues',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
              <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ReviewStep({
  articles,
  selectedCount,
  onToggleAll,
  onToggleSelect,
  onToggleExpand,
  onUpdateArticle,
  onImport,
}: {
  articles: ImportArticle[];
  selectedCount: number;
  onToggleAll: () => void;
  onToggleSelect: (idx: number) => void;
  onToggleExpand: (idx: number) => void;
  onUpdateArticle: (idx: number, field: keyof ImportArticle, value: string | boolean) => void;
  onImport: () => void;
}) {
  const allSelected = articles.every((a) => a.selected);

  return (
    <div className="mt-6 space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onToggleAll} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            {allSelected ? (
              <CheckSquare className="w-5 h-5 text-teal-600" />
            ) : (
              <Square className="w-5 h-5" />
            )}
            <span className="font-medium">
              {allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
            </span>
          </button>
          <span className="text-sm text-gray-500">
            {selectedCount} de {articles.length} selecionados
          </span>
        </div>
        <button
          onClick={onImport}
          disabled={selectedCount === 0}
          className="flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Importar {selectedCount > 0 ? `${selectedCount} artigo${selectedCount > 1 ? 's' : ''}` : ''}
        </button>
      </div>

      <div className="space-y-3">
        {articles.map((article, idx) => (
          <ArticleReviewCard
            key={article.wpId}
            article={article}
            idx={idx}
            onToggleSelect={onToggleSelect}
            onToggleExpand={onToggleExpand}
            onUpdate={onUpdateArticle}
          />
        ))}
      </div>
    </div>
  );
}

function ArticleReviewCard({
  article,
  idx,
  onToggleSelect,
  onToggleExpand,
  onUpdate,
}: {
  article: ImportArticle;
  idx: number;
  onToggleSelect: (idx: number) => void;
  onToggleExpand: (idx: number) => void;
  onUpdate: (idx: number, field: keyof ImportArticle, value: string | boolean) => void;
}) {
  const formattedDate = new Date(article.date).toLocaleDateString('pt-BR');

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border transition-colors ${
        article.selected ? 'border-teal-200' : 'border-gray-100 opacity-60'
      }`}
    >
      <div className="p-4 flex items-start gap-3">
        <button
          onClick={() => onToggleSelect(idx)}
          className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-teal-600 transition-colors"
        >
          {article.selected ? (
            <CheckSquare className="w-5 h-5 text-teal-600" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{article.titlePt}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-400">{formattedDate}</span>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" />
                  Ver original
                </a>
              </div>
              {article.summaryPt && (
                <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{article.summaryPt}</p>
              )}
            </div>
            <button
              onClick={() => onToggleExpand(idx)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
            >
              {article.expanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  Recolher
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  Editar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {article.expanded && (
        <div className="px-4 pb-5 pt-1 border-t border-gray-100 mt-1 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Slug</label>
              <input
                type="text"
                value={article.slug}
                onChange={(e) => onUpdate(idx, 'slug', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Categoria</label>
              <select
                value={article.category}
                onChange={(e) => onUpdate(idx, 'category', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">URL da Imagem</label>
            <input
              type="text"
              value={article.imageUrl}
              onChange={(e) => onUpdate(idx, 'imageUrl', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Tags (separadas por virgula)</label>
            <input
              type="text"
              value={article.tags}
              onChange={(e) => onUpdate(idx, 'tags', e.target.value)}
              placeholder="api, integracao, seguranca"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Titulo (PT)</label>
            <input
              type="text"
              value={article.titlePt}
              onChange={(e) => onUpdate(idx, 'titlePt', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Resumo (PT)</label>
            <textarea
              value={article.summaryPt}
              onChange={(e) => onUpdate(idx, 'summaryPt', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Conteudo Markdown (PT)</label>
            <textarea
              value={article.contentPt}
              onChange={(e) => onUpdate(idx, 'contentPt', e.target.value)}
              rows={8}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y font-mono"
            />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-3">Traducao para Ingles</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Title (EN)</label>
                <input
                  type="text"
                  value={article.titleEn}
                  onChange={(e) => onUpdate(idx, 'titleEn', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Summary (EN)</label>
                <textarea
                  value={article.summaryEn}
                  onChange={(e) => onUpdate(idx, 'summaryEn', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Content (EN)</label>
                <textarea
                  value={article.contentEn}
                  onChange={(e) => onUpdate(idx, 'contentEn', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y font-mono"
                />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={article.isPublished}
              onChange={(e) => onUpdate(idx, 'isPublished', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-600">Publicar imediatamente</span>
          </label>
        </div>
      )}
    </div>
  );
}

function ImportingState({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="bg-white rounded-xl p-10 shadow-sm border border-gray-100 flex flex-col items-center gap-6">
      <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-900">Importando artigos...</p>
        <p className="text-gray-500 mt-1">
          {current} de {total} artigos importados
        </p>
      </div>
      <div className="w-full max-w-sm">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-center text-sm text-gray-400 mt-2">{pct}%</p>
      </div>
    </div>
  );
}

function DoneState({
  success,
  failed,
  onGoToList,
  onImportMore,
}: {
  success: number;
  failed: number;
  onGoToList: () => void;
  onImportMore: () => void;
}) {
  return (
    <div className="bg-white rounded-xl p-10 shadow-sm border border-gray-100 flex flex-col items-center gap-6 text-center">
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
        <CheckCircle2 className="w-9 h-9 text-green-500" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Importacao concluida</h2>
        <p className="text-gray-500 mt-2">
          {success} artigo{success !== 1 ? 's' : ''} importado{success !== 1 ? 's' : ''} com sucesso
          {failed > 0 && `, ${failed} com erro`}.
        </p>
        {failed > 0 && (
          <p className="text-sm text-amber-600 mt-1">
            Os artigos com erro podem ter slugs duplicados. Revise e ajuste antes de tentar novamente.
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={onImportMore}
          className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm font-medium"
        >
          Importar mais
        </button>
        <button
          onClick={onGoToList}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          Ver artigos importados
        </button>
      </div>
    </div>
  );
}
