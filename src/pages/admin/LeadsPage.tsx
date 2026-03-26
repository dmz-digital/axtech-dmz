import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Mail, Download, Search } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/supabase';

interface EbookLead {
  id: string;
  name: string;
  email: string;
  ebook_title: string;
  ebook_slug: string;
  created_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  active: boolean;
  created_at: string;
}

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState<'ebook' | 'newsletter'>('ebook');
  const [ebookLeads, setEbookLeads] = useState<EbookLead[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [ebookLeadsTotal, setEbookLeadsTotal] = useState(0);
  const [subscribersTotal, setSubscribersTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.get('admin-leads?type=all&limit=100');
      setEbookLeads(data.ebookLeads || []);
      setEbookLeadsTotal(data.ebookLeadsTotal || 0);
      setSubscribers(data.subscribers || []);
      setSubscribersTotal(data.subscribersTotal || 0);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredEbookLeads = ebookLeads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.ebook_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubscribers = subscribers.filter((sub) =>
    sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToCsv = (type: 'ebook' | 'newsletter') => {
    let csvContent = '';
    let filename = '';

    if (type === 'ebook') {
      csvContent = 'Nome,Email,E-book,Data\n';
      filteredEbookLeads.forEach((lead) => {
        csvContent += `"${lead.name}","${lead.email}","${lead.ebook_title || ''}","${formatDate(lead.created_at)}"\n`;
      });
      filename = 'leads-ebooks.csv';
    } else {
      csvContent = 'Email,Status,Data\n';
      filteredSubscribers.forEach((sub) => {
        csvContent += `"${sub.email}","${sub.active ? 'Ativo' : 'Inativo'}","${formatDate(sub.created_at)}"\n`;
      });
      filename = 'newsletter-subscribers.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">Visualize contatos capturados e inscritos na newsletter</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('ebook')}
                  className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                    activeTab === 'ebook'
                      ? 'text-teal-600 border-b-2 border-teal-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>E-book Leads</span>
                  <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {ebookLeadsTotal}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('newsletter')}
                  className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                    activeTab === 'newsletter'
                      ? 'text-teal-600 border-b-2 border-teal-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Newsletter</span>
                  <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {subscribersTotal}
                  </span>
                </button>
              </div>
              <button
                onClick={() => exportToCsv(activeTab)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-gray-100">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome ou email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg" />
                ))}
              </div>
            </div>
          ) : activeTab === 'ebook' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      E-book
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEbookLeads.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        Nenhum lead encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredEbookLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{lead.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{lead.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {lead.ebook_title || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(lead.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Data de Inscricao
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                        Nenhum inscrito encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredSubscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{sub.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                              sub.active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {sub.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(sub.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
