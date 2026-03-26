import { useState } from 'react';
import { X, Loader2, Download, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EbookLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  ebookId: string;
  ebookTitle: string;
  ebookCover: string;
}

type ModalState = 'form' | 'loading' | 'success';

export default function EbookLeadModal({
  isOpen,
  onClose,
  ebookId,
  ebookTitle,
  ebookCover,
}: EbookLeadModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState<ModalState>('form');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setState('loading');
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/request-ebook-download`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            ebook_id: ebookId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      setState('success');

      if (data.download_url) {
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = data.download_url;
          link.download = data.filename || 'ebook.pdf';
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setState('form');
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setState('form');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/5 bg-gradient-to-br from-teal-700 to-teal-900 p-6 flex items-center justify-center">
            <img
              src={ebookCover}
              alt={ebookTitle}
              className="w-32 md:w-full max-w-[160px] rounded-lg shadow-lg"
            />
          </div>

          <div className="md:w-3/5 p-6">
            {state === 'success' ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t('ebook.download_success_title')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('ebook.download_success_message')}
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-2 pr-8">
                  {t('ebook.download_title')}
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  {t('ebook.download_subtitle')}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="lead-name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {t('ebook.form_name')}
                    </label>
                    <input
                      id="lead-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={state === 'loading'}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all disabled:opacity-60"
                      placeholder={t('ebook.form_name_placeholder')}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lead-email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {t('ebook.form_email')}
                    </label>
                    <input
                      id="lead-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={state === 'loading'}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all disabled:opacity-60"
                      placeholder={t('ebook.form_email_placeholder')}
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-red-600 text-sm">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={!name.trim() || !email.trim() || state === 'loading'}
                    className="w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {state === 'loading' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        {t('ebook.download_button')}
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    {t('ebook.privacy_notice')}
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
