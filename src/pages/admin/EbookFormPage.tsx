import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Upload, X, FileText, Image } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import MarkdownEditor from '../../components/admin/MarkdownEditor';
import { adminApi, supabase } from '../../lib/supabase';

const CATEGORIES = [
  { value: 'general', label: 'Geral' },
  { value: 'banking', label: 'Banking' },
  { value: 'life-science', label: 'Life Science' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'technology', label: 'Technology' },
];

function useFileUpload(bucket: string) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<string | null> => {
    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, error };
}

function CoverUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, error } = useFileUpload('ebook-covers');

  const handleFile = async (file: File) => {
    const url = await upload(file);
    if (url) onChange(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Capa</label>
      {value ? (
        <div className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <img src={value} alt="Capa" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-gray-800 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Trocar
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Remover
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="relative border-2 border-dashed border-gray-200 rounded-lg h-40 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Image className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Clique ou arraste a imagem</p>
              <p className="text-xs text-gray-400">JPG, PNG, WEBP — max 5MB</p>
            </>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

function PdfUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, error } = useFileUpload('ebook-pdfs');

  const handleFile = async (file: File) => {
    const url = await upload(file);
    if (url) onChange(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const filename = value ? value.split('/').pop()?.split('?')[0] : null;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Arquivo PDF</label>
      {value ? (
        <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{filename || 'arquivo.pdf'}</p>
            <p className="text-xs text-gray-500">PDF carregado</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              title="Trocar PDF"
            >
              <Upload className="w-4 h-4 text-gray-500" />
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
              title="Remover PDF"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-lg p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Clique ou arraste o PDF</p>
              <p className="text-xs text-gray-400">PDF — max 50MB</p>
            </>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

export default function EbookFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'pt' | 'en'>('pt');

  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('general');
  const [isPublished, setIsPublished] = useState(false);
  const [edicaoEspecial, setEdicaoEspecial] = useState(false);
  const [coverImagePath, setCoverImagePath] = useState('');
  const [pdfPath, setPdfPath] = useState('');
  const [tags, setTags] = useState('');

  const [titlePt, setTitlePt] = useState('');
  const [summaryPt, setSummaryPt] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [summaryEn, setSummaryEn] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      adminApi
        .get(`admin-ebooks/${id}`)
        .then((data) => {
          const ebook = data.ebook;
          setSlug(ebook.slug || '');
          setCategory(ebook.category || 'general');
          setIsPublished(ebook.is_published || false);
          setEdicaoEspecial(ebook.edicao_especial || false);
          setCoverImagePath(ebook.cover_image_path || '');
          setPdfPath(ebook.pdf_path || '');
          setTags((ebook.tags || []).join(', '));

          setTitlePt(ebook.data?.title_pt || '');
          setSummaryPt(ebook.data?.summary_pt || '');
          setTitleEn(ebook.data?.title_en || '');
          setSummaryEn(ebook.data?.summary_en || '');
        })
        .catch((error) => {
          console.error('Error loading ebook:', error);
          navigate('/admin/ebooks');
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

  const handleTitleChange = (title: string) => {
    setTitlePt(title);
    if (!isEdit && !slug) {
      setSlug(generateSlug(title));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const ebookData = {
      slug,
      category,
      cover_image_path: coverImagePath,
      pdf_path: pdfPath,
      data: {
        title_pt: titlePt,
        summary_pt: summaryPt,
        title_en: titleEn,
        summary_en: summaryEn,
      },
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      is_published: isPublished,
      edicao_especial: edicaoEspecial,
    };

    try {
      if (isEdit) {
        await adminApi.put(`admin-ebooks/${id}`, ebookData);
      } else {
        await adminApi.post('admin-ebooks', ebookData);
      }
      navigate('/admin/ebooks');
    } catch (error) {
      console.error('Error saving ebook:', error);
      alert('Erro ao salvar e-book');
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
              onClick={() => navigate('/admin/ebooks')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Editar E-book' : 'Novo E-book'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEdit ? 'Atualize as informacoes do e-book' : 'Preencha os dados do novo e-book'}
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
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descricao (PT)
                    </label>
                    <MarkdownEditor value={summaryPt} onChange={setSummaryPt} rows={10} />
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
                      onChange={(e) => setTitleEn(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (EN)
                    </label>
                    <MarkdownEditor value={summaryEn} onChange={setSummaryEn} rows={10} />
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

                <CoverUpload value={coverImagePath} onChange={setCoverImagePath} />
                <PdfUpload value={pdfPath} onChange={setPdfPath} />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (separadas por virgula)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="mft, seguranca, integracao"
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
                    <span className="text-sm font-medium text-gray-700">Publicar e-book</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-8">
                    E-books nao publicados ficam como rascunho
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={edicaoEspecial}
                      onChange={(e) => setEdicaoEspecial(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                    />
                    <span className="text-sm font-medium text-gray-700">Edicao Especial</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-8">
                    Exibe a capa deste e-book como banner na pagina inicial
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
