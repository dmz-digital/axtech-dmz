export default function TermsPage() {

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Termos de Uso</h1>
        <p className="text-sm text-gray-400 mb-10">Última atualização: março de 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar o site AxTech, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nosso site ou serviços.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Descrição do Serviço</h2>
            <p>
              O AxTech é um portal de conteúdo informativo sobre tecnologia, inovação e tendências de mercado, mantido pela Axway. O site disponibiliza artigos, e-books, análises setoriais e outros materiais educativos para profissionais e entusiastas de tecnologia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Uso Permitido</h2>
            <p>Você concorda em utilizar o site apenas para fins lícitos e de maneira que não infrinja os direitos de terceiros. É expressamente proibido:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Reproduzir, duplicar, copiar ou revender qualquer parte do conteúdo sem autorização expressa;</li>
              <li>Utilizar o site para enviar ou transmitir material publicitário não solicitado (spam);</li>
              <li>Tentar obter acesso não autorizado a qualquer parte do site ou sistemas relacionados;</li>
              <li>Utilizar robôs, scrapers ou outros meios automatizados para coletar dados do site sem permissão;</li>
              <li>Publicar ou transmitir conteúdo ilegal, difamatório, obsceno ou ofensivo.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo disponível no AxTech — incluindo textos, imagens, logotipos, gráficos, vídeos e outros materiais — é de propriedade da Axway ou de seus licenciadores e está protegido pelas leis de direitos autorais aplicáveis. O uso não autorizado de qualquer conteúdo é expressamente proibido.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Cadastro e Conta</h2>
            <p>
              Para acessar determinados recursos, pode ser necessário criar uma conta. Você é responsável por manter a confidencialidade das suas credenciais de acesso e por todas as atividades realizadas em sua conta. Notifique-nos imediatamente caso identifique qualquer uso não autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Links para Sites de Terceiros</h2>
            <p>
              O AxTech pode conter links para sites externos. Esses links são fornecidos apenas para conveniência e não implicam endosso ou responsabilidade pelo conteúdo, produtos ou serviços disponíveis nesses sites. Recomendamos que você revise os termos e políticas de privacidade de qualquer site de terceiros que visitar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitação de Responsabilidade</h2>
            <p>
              O conteúdo do AxTech é fornecido apenas para fins informativos e não constitui aconselhamento profissional ou legal. A Axway não garante a precisão, completude ou atualidade das informações publicadas e não será responsável por danos diretos ou indiretos resultantes do uso das informações disponibilizadas no site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Modificações</h2>
            <p>
              Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação no site. O uso continuado do site após a publicação de alterações constitui sua aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Lei Aplicável</h2>
            <p>
              Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Qualquer disputa decorrente do uso do site será submetida à jurisdição exclusiva dos tribunais competentes no Brasil.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contato</h2>
            <p>
              Em caso de dúvidas sobre estes Termos de Uso, entre em contato conosco pelo e-mail: <a href="mailto:contato@axtech.com.br" className="text-teal-600 hover:underline">contato@axtech.com.br</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
