import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, CreditCard as Edit, Trash2, Eye, EyeOff, AlertCircle, RefreshCw, Download, Filter, CheckSquare, Square, Minus, ChevronDown } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { adminApi } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';

interface Article {
  id: string;
  slug: string;
  category: string;
  data: {
    image_url?: string;
    translations?: {
      pt?: { title: string; summary: string };
      en?: { title: string; summary: string };
    };
    tags?: string[];
  };
  is_published: boolean;
  created_at: string;
}

const CATEGORIES = [
  { id: 'banking', label: 'Banking e Financial Services' },
  { id: 'life-science', label: 'Life Science' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'automotivo', label: 'Automotivo' },
  { id: 'energia', label: 'Energia' },
  { id: 'governo', label: 'Governo' },
  { id: 'setor-publico', label: 'Setor Público' },
  { id: 'manufatura', label: 'Manufatura' },
  { id: 'transporte', label: 'Transporte' },
  { id: 'varejo', label: 'Varejo' },
  { id: 'technology', label: 'Technology' },
];

function StatusDropdown({ article, onToggle }: { article: Article; onToggle: (article: Article) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(article);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
          article.is_published
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
        }`}
      >
        {article.is_published ? 'Publicado' : 'Rascunho'}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 w-36 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={handleSelect}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors ${
              article.is_published
                ? 'text-amber-700 hover:bg-amber-50'
                : 'text-green-700 hover:bg-green-50'
            }`}
          >
            {article.is_published ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                Mover para Rascunho
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                Publicar
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ArticlesListPage() {
  const { session } = useAuthContext();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteProgress, setBulkDeleteProgress] = useState<{ current: number; total: number } | null>(null);
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const accessToken = session?.access_token;

  const fetchArticles = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const offset = (page - 1) * itemsPerPage;
      const params = new URLSearchParams({ limit: String(itemsPerPage), offset: String(offset) });
      if (categoryFilter) params.set('category', categoryFilter);
      const data = await adminApi.get(`admin-articles?${params}`);
      setArticles(data.articles || []);
      setTotal(data.total || 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar artigos';
      setError(message);
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter, accessToken]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, categoryFilter]);

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.delete(`admin-articles/${deleteId}`);
      setDeleteId(null);
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
    } finally {
      setDeleting(false);
    }
  };

  const togglePublish = async (article: Article) => {
    try {
      await adminApi.put(`admin-articles/${article.id}`, {
        is_published: !article.is_published,
      });
      fetchArticles();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const toggleSelectArticle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const pageIds = articles.map((a) => a.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const somePageSelected = pageIds.some((id) => selectedIds.has(id));

  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setBulkDeleting(true);
    setBulkDeleteProgress({ current: 0, total: ids.length });

    const CHUNK_SIZE = 50;
    try {
      for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
        const chunk = ids.slice(i, i + CHUNK_SIZE);
        await adminApi.deleteBulk('admin-articles', { ids: chunk });
        setBulkDeleteProgress({ current: Math.min(i + CHUNK_SIZE, ids.length), total: ids.length });
      }
      setSelectedIds(new Set());
      setShowBulkDeleteConfirm(false);
      fetchArticles();
    } catch (error) {
      console.error('Error bulk deleting articles:', error);
    } finally {
      setBulkDeleting(false);
      setBulkDeleteProgress(null);
    }
  };

  const columns: Array<{ key: keyof Article | string; label: string; render: (article: Article) => React.ReactNode }> = [
    {
      key: 'select',
      label: '',
      render: (article) => (
        <button
          onClick={(e) => { e.stopPropagation(); toggleSelectArticle(article.id); }}
          className="p-1 text-gray-400 hover:text-teal-600 transition-colors"
        >
          {selectedIds.has(article.id) ? (
            <CheckSquare className="w-4 h-4 text-teal-600" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>
      ),
    },
    {
      key: 'id',
      label: 'Titulo',
      render: (article) => (
        <div className="max-w-xs">
          <p className="font-medium truncate">
            {article.data?.translations?.pt?.title || 'Sem titulo'}
          </p>
          <p className="text-xs text-gray-500 truncate">{article.slug}</p>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Categoria',
      render: (article) => (
        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 capitalize">
          {article.category}
        </span>
      ),
    },
    {
      key: 'is_published',
      label: 'Status',
      render: (article) => <StatusDropdown article={article} onToggle={togglePublish} />,
    },
    {
      key: 'created_at',
      label: 'Criado em',
      render: (article) =>
        new Date(article.created_at).toLocaleDateString('pt-BR'),
    },
  ];

  const selectedCount = selectedIds.size;

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Artigos</h1>
            <p className="text-gray-600 mt-1">Gerencie os artigos do blog</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/artigos/importar"
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Importar WordPress</span>
            </Link>
            <Link
              to="/admin/artigos/novo"
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Novo Artigo</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchArticles}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </button>
          </div>
        )}

        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              title={allPageSelected ? 'Desmarcar página' : 'Selecionar página'}
            >
              {allPageSelected ? (
                <CheckSquare className="w-4 h-4 text-teal-600" />
              ) : somePageSelected ? (
                <Minus className="w-4 h-4 text-gray-400" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              <span>{allPageSelected ? 'Desmarcar página' : 'Selecionar página'}</span>
            </button>

            <div className="relative flex items-center">
              <Filter className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={categoryFilter}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Todas as categorias</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {categoryFilter && (
              <button
                onClick={() => handleCategoryChange('')}
                className="text-sm text-teal-600 hover:text-teal-800 transition-colors"
              >
                Limpar filtro
              </button>
            )}
          </div>

          {selectedCount > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">
                {selectedCount} {selectedCount === 1 ? 'artigo selecionado' : 'artigos selecionados'}
              </span>
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Excluir selecionados
              </button>
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          data={articles}
          keyField="id"
          loading={loading}
          totalItems={total}
          currentPage={page}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
          actions={(article) => (
            <>
              <button
                onClick={() => togglePublish(article)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title={article.is_published ? 'Despublicar' : 'Publicar'}
              >
                {article.is_published ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => navigate(`/admin/artigos/${article.id}/editar`)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteId(article.id)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        />

        <ConfirmDialog
          isOpen={!!deleteId}
          title="Excluir Artigo"
          message="Tem certeza que deseja excluir este artigo? Esta acao nao pode ser desfeita."
          confirmLabel="Excluir"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />

        <ConfirmDialog
          isOpen={showBulkDeleteConfirm}
          title="Excluir Artigos em Lote"
          message={
            bulkDeleting && bulkDeleteProgress
              ? `Excluindo... ${bulkDeleteProgress.current} de ${bulkDeleteProgress.total}`
              : `Tem certeza que deseja excluir ${selectedCount} ${selectedCount === 1 ? 'artigo' : 'artigos'}? Esta acao nao pode ser desfeita.`
          }
          confirmLabel={`Excluir ${selectedCount} ${selectedCount === 1 ? 'artigo' : 'artigos'}`}
          onConfirm={handleBulkDelete}
          onCancel={() => { if (!bulkDeleting) setShowBulkDeleteConfirm(false); }}
          loading={bulkDeleting}
        />
      </div>
    </AdminLayout>
  );
}
