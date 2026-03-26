import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/subscribe-newsletter`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      if (res.ok) {
        navigate('/newsletter/sucesso');
      } else {
        navigate('/newsletter/erro', { state: { email } });
      }
    } catch {
      navigate('/newsletter/erro', { state: { email } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="newsletter" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="rounded-3xl overflow-hidden shadow-lg aspect-[4/3]">
            <img
              src="/assets/images/img-newsletter-axtech.png"
              alt="Fique por dentro"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h2 className="text-4xl font-bold text-dark-teal mb-4">
              Fique por dentro
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-10">
              CIOs, CTOs, Diretores e Gerentes de TI, assinam a melhor newsletter de tecnologia do Brasil!
            </p>

            <form onSubmit={handleSubmit} className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu e-mail"
                disabled={loading}
                className="w-full px-6 py-5 pr-20 rounded-2xl border border-gray-200 focus:border-dark-teal focus:outline-none text-base shadow-sm text-gray-700 placeholder-gray-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!email.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-red hover:bg-red/90 text-white p-3 rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Inscrever"
              >
                {loading
                  ? <Loader2 className="w-6 h-6 animate-spin" />
                  : <ArrowRight className="w-6 h-6" />
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
