import { XCircle, RotateCcw, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function NewsletterErrorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email ?? '';

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-24">
      <main className="flex items-center justify-center px-4 py-24">
        <div className="max-w-lg w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-8">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Algo deu errado
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-10">
            Não foi possível processar sua inscrição no momento. Por favor, tente novamente em instantes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/', { state: { scrollTo: 'newsletter', prefillEmail: email } })}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-dark-teal text-white font-semibold rounded-2xl hover:bg-teal-800 transition-colors shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              Tentar novamente
            </button>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-2xl hover:border-gray-400 hover:bg-white transition-colors"
            >
              Voltar para a home
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-400">
              Se o problema persistir, entre em contato pelo site da Axway.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
