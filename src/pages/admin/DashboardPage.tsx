import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  BookOpen,
  Calendar,
  Users,
  Download,
  Mail,
  TrendingUp,
  Clock,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/supabase';

interface Stats {
  articles: { total: number; published: number; draft: number };
  ebooks: { total: number; published: number; draft: number; totalDownloads: number };
  events: { total: number; published: number; draft: number; upcoming: number; past: number };
  leads: { total: number };
  subscribers: { total: number };
}

interface RecentArticle {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  updated_at: string;
}

interface RecentLead {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adminApi.get('admin-dashboard-stats');
        setStats(data.stats);
        setRecentArticles(data.recentArticles || []);
        setRecentLeads(data.recentLeads || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      label: 'Artigos',
      value: stats?.articles.total || 0,
      subtext: `${stats?.articles.published || 0} publicados, ${stats?.articles.draft || 0} rascunhos`,
      icon: FileText,
      color: 'bg-blue-500',
      link: '/admin/artigos',
    },
    {
      label: 'E-books',
      value: stats?.ebooks.total || 0,
      subtext: `${stats?.ebooks.published || 0} publicados, ${stats?.ebooks.draft || 0} rascunhos`,
      icon: BookOpen,
      color: 'bg-emerald-500',
      link: '/admin/ebooks',
    },
    {
      label: 'Eventos',
      value: stats?.events.total || 0,
      subtext: `${stats?.events.upcoming || 0} proximos, ${stats?.events.past || 0} passados`,
      icon: Calendar,
      color: 'bg-amber-500',
      link: '/admin/eventos',
    },
    {
      label: 'Downloads',
      value: stats?.ebooks.totalDownloads || 0,
      subtext: 'Total de downloads de e-books',
      icon: Download,
      color: 'bg-purple-500',
    },
    {
      label: 'Leads',
      value: stats?.leads.total || 0,
      subtext: 'Contatos capturados',
      icon: Users,
      color: 'bg-rose-500',
      link: '/admin/leads',
    },
    {
      label: 'Newsletter',
      value: stats?.subscribers.total || 0,
      subtext: 'Inscritos ativos',
      icon: Mail,
      color: 'bg-cyan-500',
      link: '/admin/leads',
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visao geral do seu conteudo</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            const content = (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{card.subtext}</p>
                  </div>
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );

            return card.link ? (
              <Link key={index} to={card.link}>
                {content}
              </Link>
            ) : (
              <div key={index}>{content}</div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <h2 className="font-semibold text-gray-900">Conteudo Recente</h2>
              </div>
              <Link to="/admin/artigos" className="text-sm text-teal-600 hover:text-teal-700">
                Ver todos
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentArticles.length === 0 ? (
                <p className="px-6 py-4 text-gray-500 text-sm">Nenhum artigo encontrado</p>
              ) : (
                recentArticles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/admin/artigos/${article.id}/editar`}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{article.title}</p>
                      <p className="text-sm text-gray-500">{formatDate(article.updated_at)}</p>
                    </div>
                    <span
                      className={`ml-4 px-2.5 py-1 text-xs font-medium rounded-full ${
                        article.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {article.is_published ? 'Publicado' : 'Rascunho'}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <h2 className="font-semibold text-gray-900">Leads Recentes</h2>
              </div>
              <Link to="/admin/leads" className="text-sm text-teal-600 hover:text-teal-700">
                Ver todos
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentLeads.length === 0 ? (
                <p className="px-6 py-4 text-gray-500 text-sm">Nenhum lead encontrado</p>
              ) : (
                recentLeads.map((lead) => (
                  <div key={lead.id} className="px-6 py-4">
                    <p className="font-medium text-gray-900">{lead.name}</p>
                    <p className="text-sm text-gray-500">{lead.email}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(lead.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
