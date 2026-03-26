import { CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NewsletterSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-24">
      <main className="flex items-center justify-center px-4 py-24">
        <div className="max-w-lg w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-50 mb-8">
            <CheckCircle className="w-10 h-10 text-dark-teal" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Inscrição confirmada!
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-10">
            Seu e-mail foi cadastrado com sucesso. Em breve você receberá os melhores conteúdos de tecnologia diretamente na sua caixa de entrada.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-dark-teal text-white font-semibold rounded-2xl hover:bg-teal-800 transition-colors shadow-md"
            >
              Voltar para a home
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-400">
              Você pode cancelar sua inscrição a qualquer momento pelo link no rodapé dos e-mails recebidos.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
