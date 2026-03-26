import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, CreditCard as Edit, Trash2, Eye, EyeOff, MapPin, Globe, ExternalLink } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { adminApi } from '../../lib/supabase';

interface Event {
  id: string;
  slug: string;
  data: {
    title_pt?: string;
    title_en?: string;
    description_pt?: string;
    description_en?: string;
  };
  event_date: string;
  event_time: string;
  location: string;
  location_type: 'online' | 'presencial';
  registration_url: string;
  is_published: boolean;
}

export default function EventsListPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * itemsPerPage;
      const data = await adminApi.get(`admin-events?limit=${itemsPerPage}&offset=${offset}`);
      setEvents(data.events || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.delete(`admin-events/${deleteId}`);
      setDeleteId(null);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setDeleting(false);
    }
  };

  const togglePublish = async (event: Event) => {
    try {
      await adminApi.put(`admin-events/${event.id}`, {
        is_published: !event.is_published,
      });
      fetchEvents();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isPastEvent = (date: string) => {
    return new Date(date) < new Date();
  };

  const columns: Array<{ key: keyof Event | string; label: string; render: (event: Event) => React.ReactNode }> = [
    {
      key: 'id',
      label: 'Evento',
      render: (event) => (
        <div className="max-w-xs">
          <p className="font-medium truncate">{event.data?.title_pt || 'Sem titulo'}</p>
          <p className="text-xs text-gray-500 truncate">{event.slug}</p>
        </div>
      ),
    },
    {
      key: 'event_date',
      label: 'Data',
      render: (event) => (
        <div>
          <p className={`font-medium ${isPastEvent(event.event_date) ? 'text-gray-400' : 'text-gray-900'}`}>
            {formatDate(event.event_date)}
          </p>
          {event.event_time && (
            <p className="text-xs text-gray-500">{event.event_time}</p>
          )}
        </div>
      ),
    },
    {
      key: 'location_type',
      label: 'Tipo',
      render: (event) => (
        <div className="flex items-center gap-1.5">
          {event.location_type === 'online' ? (
            <>
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">Online</span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 text-rose-500" />
              <span className="text-sm text-gray-600">Presencial</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'registration_url',
      label: 'Inscricao',
      render: (event) =>
        event.registration_url ? (
          <a
            href={event.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-teal-600 hover:text-teal-700"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm">Link</span>
          </a>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        ),
    },
    {
      key: 'is_published',
      label: 'Status',
      render: (event) => (
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
            event.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {event.is_published ? 'Publicado' : 'Rascunho'}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
            <p className="text-gray-600 mt-1">Gerencie os eventos e webinars</p>
          </div>
          <Link
            to="/admin/eventos/novo"
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Evento</span>
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={events}
          keyField="id"
          loading={loading}
          totalItems={total}
          currentPage={page}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
          actions={(event) => (
            <>
              <button
                onClick={() => togglePublish(event)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title={event.is_published ? 'Despublicar' : 'Publicar'}
              >
                {event.is_published ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => navigate(`/admin/eventos/${event.id}/editar`)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteId(event.id)}
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
          title="Excluir Evento"
          message="Tem certeza que deseja excluir este evento? Esta acao nao pode ser desfeita."
          confirmLabel="Excluir"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      </div>
    </AdminLayout>
  );
}
