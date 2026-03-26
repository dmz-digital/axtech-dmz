export default function PrivacyPage() {

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
        <p className="text-sm text-gray-400 mb-10">Última atualização: março de 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introdução</h2>
            <p>
              A Axway está comprometida com a proteção da sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações pessoais quando você acessa o portal AxTech, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Dados Coletados</h2>
            <p>Podemos coletar os seguintes tipos de informações:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>Dados de identificação:</strong> nome e endereço de e-mail fornecidos ao se cadastrar em nossa newsletter ou ao solicitar o download de materiais;</li>
              <li><strong>Dados de navegação:</strong> endereço IP, tipo de navegador, páginas visitadas, tempo de permanência e outras informações coletadas automaticamente por cookies e tecnologias similares;</li>
              <li><strong>Dados de interação:</strong> pesquisas realizadas, conteúdos acessados e preferências de navegação dentro do portal.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Finalidade do Tratamento</h2>
            <p>Utilizamos seus dados pessoais para:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Enviar newsletters, artigos e materiais informativos conforme sua solicitação;</li>
              <li>Personalizar sua experiência de navegação no portal;</li>
              <li>Analisar o desempenho do site e melhorar nossos conteúdos e serviços;</li>
              <li>Cumprir obrigações legais e regulatórias aplicáveis;</li>
              <li>Prevenir fraudes e garantir a segurança da plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Base Legal</h2>
            <p>
              O tratamento dos seus dados pessoais é realizado com base nas seguintes hipóteses legais previstas na LGPD: (i) consentimento do titular, (ii) legítimo interesse da Axway, (iii) cumprimento de obrigação legal ou regulatória, e (iv) execução de contrato ou procedimentos preliminares relacionados a contrato.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Compartilhamento de Dados</h2>
            <p>
              Não vendemos, alugamos ou comercializamos seus dados pessoais a terceiros. Podemos compartilhar informações com fornecedores de serviços que nos auxiliam na operação do portal (como serviços de e-mail e análise), sempre mediante acordos de confidencialidade que garantam a proteção dos seus dados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Retenção de Dados</h2>
            <p>
              Seus dados pessoais serão mantidos pelo tempo necessário para cumprir as finalidades descritas nesta política ou conforme exigido por lei. Quando os dados não forem mais necessários, serão excluídos ou anonimizados de forma segura.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Seus Direitos</h2>
            <p>Nos termos da LGPD, você possui os seguintes direitos em relação aos seus dados pessoais:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Confirmação da existência de tratamento;</li>
              <li>Acesso aos dados;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
              <li>Portabilidade dos dados;</li>
              <li>Eliminação dos dados tratados com base no consentimento;</li>
              <li>Revogação do consentimento a qualquer momento.</li>
            </ul>
            <p className="mt-3">Para exercer seus direitos, entre em contato pelo e-mail: <a href="mailto:privacidade@axway.com" className="text-teal-600 hover:underline">privacidade@axway.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Segurança</h2>
            <p>
              Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum sistema de transmissão pela internet é completamente seguro, e não podemos garantir segurança absoluta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Recomendamos que você a revise regularmente. A data da última atualização está indicada no início deste documento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contato e Encarregado (DPO)</h2>
            <p>
              Para questões relacionadas à privacidade e proteção de dados, entre em contato com nosso Encarregado pelo tratamento de dados pessoais pelo e-mail: <a href="mailto:privacidade@axway.com" className="text-teal-600 hover:underline">privacidade@axway.com</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
