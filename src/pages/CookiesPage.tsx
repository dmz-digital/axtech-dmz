
const COOKIE_TYPES = [
  {
    name: 'Cookies Estritamente Necessários',
    purpose: 'Essenciais para o funcionamento do site. Permitem que você navegue pelo portal e utilize recursos básicos, como acesso a áreas seguras. Sem esses cookies, o site não funciona corretamente.',
    duration: 'Sessão / até 1 ano',
    canDisable: false,
  },
  {
    name: 'Cookies de Desempenho',
    purpose: 'Coletam informações sobre como os visitantes utilizam o site, como quais páginas são mais acessadas e se ocorrem mensagens de erro. Os dados são agregados e anônimos.',
    duration: 'Até 2 anos',
    canDisable: true,
  },
  {
    name: 'Cookies de Funcionalidade',
    purpose: 'Permitem que o site lembre escolhas feitas por você, como idioma preferido, e ofereçam recursos aprimorados e personalizados.',
    duration: 'Até 1 ano',
    canDisable: true,
  },
  {
    name: 'Cookies de Análise e Marketing',
    purpose: 'Utilizados para rastrear visitantes em sites e exibir anúncios relevantes. Também nos ajudam a entender a eficácia de nossas campanhas de conteúdo.',
    duration: 'Até 2 anos',
    canDisable: true,
  },
];

export default function CookiesPage() {

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Política de Uso de Cookies</h1>
        <p className="text-sm text-gray-400 mb-10">Última atualização: março de 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">O que são cookies?</h2>
            <p>
              Cookies são pequenos arquivos de texto armazenados no seu dispositivo (computador, tablet ou smartphone) quando você visita um site. Eles permitem que o site reconheça seu dispositivo e lembre informações sobre sua visita, como preferências de idioma e configurações, tornando sua próxima visita mais fácil e o site mais útil para você.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Como utilizamos cookies</h2>
            <p>
              O AxTech utiliza cookies para melhorar sua experiência de navegação, analisar o desempenho do site e personalizar o conteúdo exibido. Ao continuar navegando em nosso site, você concorda com o uso de cookies conforme descrito nesta política.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tipos de cookies que utilizamos</h2>
            <div className="space-y-4">
              {COOKIE_TYPES.map((type) => (
                <div key={type.name} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-semibold text-gray-900">{type.name}</h3>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
                        type.canDisable
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-teal-50 text-teal-700 border border-teal-200'
                      }`}
                    >
                      {type.canDisable ? 'Opcional' : 'Obrigatório'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{type.purpose}</p>
                  <p className="text-xs text-gray-400">
                    <span className="font-medium text-gray-500">Duração:</span> {type.duration}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Cookies de terceiros</h2>
            <p>
              Alguns cookies são definidos por serviços de terceiros que aparecem em nossas páginas, como ferramentas de análise (ex.: Google Analytics) e redes sociais. Esses terceiros podem usar cookies para rastrear sua atividade online ao longo de diferentes sites. Não temos controle sobre os cookies de terceiros — consulte as políticas de privacidade desses serviços para mais informações.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Como gerenciar cookies</h2>
            <p className="mb-4">
              Você pode controlar e/ou excluir cookies conforme sua preferência. Para gerenciar cookies diretamente no seu navegador, consulte as instruções correspondentes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Google Chrome:</strong> Configurações &rarr; Privacidade e segurança &rarr; Cookies e outros dados do site</li>
              <li><strong>Mozilla Firefox:</strong> Opções &rarr; Privacidade &amp; Segurança &rarr; Cookies e dados do site</li>
              <li><strong>Safari:</strong> Preferências &rarr; Privacidade &rarr; Gerenciar dados do site</li>
              <li><strong>Microsoft Edge:</strong> Configurações &rarr; Cookies e permissões do site</li>
            </ul>
            <p className="mt-4 text-sm text-gray-500">
              Atenção: desabilitar cookies pode afetar o funcionamento de algumas funcionalidades do site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Atualizações desta política</h2>
            <p>
              Podemos atualizar esta Política de Uso de Cookies periodicamente para refletir mudanças em nossas práticas ou por outros motivos operacionais, legais ou regulatórios. Recomendamos que você revise esta página regularmente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contato</h2>
            <p>
              Em caso de dúvidas sobre nossa Política de Uso de Cookies, entre em contato pelo e-mail: <a href="mailto:privacidade@axway.com" className="text-teal-600 hover:underline">privacidade@axway.com</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
