import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, CreditCard as Edit, Trash2, Eye, EyeOff, Download } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { adminApi } from '../../lib/supabase';

interface Ebook {
  id: string;
  slug: string;
  category: string;
  cover_image_path: string;
  data: {
    title_pt?: string;
    title_en?: string;
    summary_pt?: string;
    summary_en?: string;
  };
  download_count: number;
  is_published: boolean;
  created_at: string;
}

export default function EbooksListPage() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const fetchEbooks = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * itemsPerPage;
      const data = await adminApi.get(`admin-ebooks?limit=${itemsPerPage}&offset=${offset}`);
      setEbooks(data.ebooks || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching ebooks:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchEbooks();
  }, [fetchEbooks]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.delete(`admin-ebooks/${deleteId}`);
      setDeleteId(null);
      fetchEbooks();
    } catch (error) {
      console.error('Error deleting ebook:', error);
    } finally {
      setDeleting(false);
    }
  };

  const togglePublish = async (ebook: Ebook) => {
    try {
      await adminApi.put(`admin-ebooks/${ebook.id}`, {
        is_published: !ebook.is_published,
      });
      fetchEbooks();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const columns: Array<{ key: keyof Ebook | string; label: string; render: (ebook: Ebook) => React.ReactNode }> = [
    {
      key: 'id',
      label: 'Titulo',
      render: (ebook) => (
        <div className="flex items-center gap-3">
          {ebook.cover_image_path && (
            <img
              src={ebook.cover_image_path}
              alt=""
              className="w-10 h-14 object-cover rounded"
            />
          )}
          <div className="max-w-xs">
            <p className="font-medium truncate">{ebook.data?.title_pt || 'Sem titulo'}</p>
            <p className="text-xs text-gray-500 truncate">{ebook.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Categoria',
      render: (ebook) => (
        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 capitalize">
          {ebook.category}
        </span>
      ),
    },
    {
      key: 'download_count',
      label: 'Downloads',
      render: (ebook) => (
        <div className="flex items-center gap-1.5 text-gray-600">
          <Download className="w-4 h-4" />
          <span>{ebook.download_count || 0}</span>
        </div>
      ),
    },
    {
      key: 'is_published',
      label: 'Status',
      render: (ebook) => (
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
            ebook.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {ebook.is_published ? 'Publicado' : 'Rascunho'}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">E-books</h1>
            <p className="text-gray-600 mt-1">Gerencie os e-books disponiveis para download</p>
          </div>
          <Link
            to="/admin/ebooks/novo"
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Novo E-book</span>
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={ebooks}
          keyField="id"
          loading={loading}
          totalItems={total}
          currentPage={page}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
          actions={(ebook) => (
            <>
              <button
                onClick={() => togglePublish(ebook)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title={ebook.is_published ? 'Despublicar' : 'Publicar'}
              >
                {ebook.is_published ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => navigate(`/admin/ebooks/${ebook.id}/editar`)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteId(ebook.id)}
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
          title="Excluir E-book"
          message="Tem certeza que deseja excluir este e-book? Esta acao nao pode ser desfeita."
          confirmLabel="Excluir"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      </div>
    </AdminLayout>
  );
}
