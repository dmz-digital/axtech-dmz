import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import MarkdownEditor from '../../components/admin/MarkdownEditor';
import { adminApi } from '../../lib/supabase';

interface ArticleData {
  image_url: string;
  translations: {
    pt: { title: string; summary: string; content: string };
    en: { title: string; summary: string; content: string };
  };
  tags: string[];
}

const CATEGORIES = [
  { value: 'banking', label: 'Banking' },
  { value: 'life-science', label: 'Life Science' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'technology', label: 'Technology' },
];

export default function ArticleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'pt' | 'en'>('pt');

  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('banking');
  const [isPublished, setIsPublished] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('');

  const [titlePt, setTitlePt] = useState('');
  const [summaryPt, setSummaryPt] = useState('');
  const [contentPt, setContentPt] = useState('');

  const [titleEn, setTitleEn] = useState('');
  const [summaryEn, setSummaryEn] = useState('');
  const [contentEn, setContentEn] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      adminApi
        .get(`admin-articles/${id}`)
        .then((data) => {
          const article = data.article;
          setSlug(article.slug || '');
          setCategory(article.category || 'banking');
          setIsPublished(article.is_published || false);
          setImageUrl(article.data?.image_url || '');
          setTags((article.data?.tags || []).join(', '));

          const translations = article.data?.translations || {};
          setTitlePt(translations.pt?.title || '');
          setSummaryPt(translations.pt?.summary || '');
          setContentPt(translations.pt?.content || '');
          setTitleEn(translations.en?.title || '');
          setSummaryEn(translations.en?.summary || '');
          setContentEn(translations.en?.content || '');
        })
        .catch((error) => {
          console.error('Error loading article:', error);
          navigate('/admin/artigos');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, navigate]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string, lang: 'pt' | 'en') => {
    if (lang === 'pt') {
      setTitlePt(title);
      if (!isEdit && !slug) {
        setSlug(generateSlug(title));
      }
    } else {
      setTitleEn(title);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const articleData: ArticleData = {
      image_url: imageUrl,
      translations: {
        pt: { title: titlePt, summary: summaryPt, content: contentPt },
        en: { title: titleEn, summary: summaryEn, content: contentEn },
      },
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      if (isEdit) {
        await adminApi.put(`admin-articles/${id}`, {
          slug,
          category,
          data: articleData,
          is_published: isPublished,
        });
      } else {
        await adminApi.post('admin-articles', {
          slug,
          category,
          data: articleData,
          is_published: isPublished,
        });
      }
      navigate('/admin/artigos');
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Erro ao salvar artigo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/artigos')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Editar Artigo' : 'Novo Artigo'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEdit ? 'Atualize as informacoes do artigo' : 'Preencha os dados do novo artigo'}
              </p>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg transition-colors"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>{saving ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('pt')}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                    activeTab === 'pt'
                      ? 'border-teal-600 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Portugues
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('en')}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                    activeTab === 'en'
                      ? 'border-teal-600 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  English
                </button>
              </div>

              {activeTab === 'pt' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titulo (PT)
                    </label>
                    <input
                      type="text"
                      value={titlePt}
                      onChange={(e) => handleTitleChange(e.target.value, 'pt')}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resumo (PT)
                    </label>
                    <textarea
                      value={summaryPt}
                      onChange={(e) => setSummaryPt(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conteudo (PT)
                    </label>
                    <MarkdownEditor value={contentPt} onChange={setContentPt} />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title (EN)
                    </label>
                    <input
                      type="text"
                      value={titleEn}
                      onChange={(e) => handleTitleChange(e.target.value, 'en')}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Summary (EN)
                    </label>
                    <textarea
                      value={summaryEn}
                      onChange={(e) => setSummaryEn(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content (EN)
                    </label>
                    <MarkdownEditor value={contentEn} onChange={setContentEn} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Configuracoes</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL da Imagem
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (separadas por virgula)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="api, integracao, seguranca"
                  />
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Publicar artigo</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-8">
                    Artigos nao publicados ficam como rascunho
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
