/*
  # Seed Initial Articles Data

  1. Data Import
    - 12 articles across 3 categories: banking, life-science, healthcare
    - Translations in Portuguese (pt) and English (en)
    - Tags for each article

  2. Categories
    - banking (4 articles)
    - life-science (4 articles)
    - healthcare (4 articles)
*/

-- Insert articles
INSERT INTO articles (slug, category, image_url) VALUES
  ('governanca-integracao-inovacao-confianca', 'banking', NULL),
  ('servidores-mcp-gestao-integracao-b2b', 'banking', NULL),
  ('solucao-integracao-b2b-fim-de-vida', 'banking', NULL),
  ('confianca-digital-moeda-ecossistema-empresarial', 'banking', NULL),
  ('migracao-nuvem-axway-mft-life-science', 'life-science', NULL),
  ('servidores-mcp-integracao-b2b-life-science', 'life-science', NULL),
  ('governanca-integracao-life-science', 'life-science', NULL),
  ('convergencia-apis-eventos-mft-arquitetura-composable', 'life-science', NULL),
  ('governanca-integracao-healthcare', 'healthcare', NULL),
  ('solucao-integracao-b2b-fim-de-vida-healthcare', 'healthcare', NULL),
  ('confianca-digital-ecossistema-healthcare', 'healthcare', NULL),
  ('servidores-mcp-gestao-integracao-b2b-healthcare', 'healthcare', NULL)
ON CONFLICT (slug) DO NOTHING;

-- Insert Portuguese translations
INSERT INTO article_translations (article_id, language, title, summary, content)
SELECT a.id, 'pt', t.title, t.summary, t.content
FROM articles a
JOIN (VALUES
  ('governanca-integracao-inovacao-confianca', 
   'Governanca da Integracao e o elo entre Inovacao, Rastreabilidade e Confianca Digital',
   'Como uma governanca solida de integracao conecta inovacao, rastreabilidade e confianca no ecossistema digital financeiro.',
   'No setor financeiro, a governanca da integracao e mais do que um requisito tecnico — e o alicerce da confianca digital. Instituicoes que adotam frameworks robustos de governanca para suas integracoes B2B conseguem equilibrar agilidade e controle, garantindo rastreabilidade completa de cada transacao e dado trocado. Com regulacoes como PCI-DSS, SOX e as diretrizes do Banco Central, a capacidade de auditar, monitorar e controlar fluxos de dados em tempo real torna-se um diferencial competitivo. A governanca eficaz de integracao abrange politicas de acesso, monitoramento continuo, gestao de SLAs e planos de contingencia que sustentam a inovacao sem comprometer a seguranca.'),
  ('servidores-mcp-gestao-integracao-b2b',
   'Como os Servidores MCP podem transformar a Gestao de Integracao B2B',
   'Descubra como os servidores MCP elevam a eficiencia, seguranca e escalabilidade das integracoes B2B no setor financeiro.',
   'Os servidores MCP (Managed Communication Protocol) representam uma evolucao significativa na gestao de integracoes B2B para instituicoes financeiras. Ao centralizar o controle de protocolos como AS2, SFTP e HTTPS, os servidores MCP simplificam a complexidade das integracoes com parceiros, reduzem o tempo de onboarding de novos parceiros e garantem conformidade com padroes de seguranca do setor. Bancos e fintechs que adotam arquiteturas baseadas em MCP reportam reducoes significativas em falhas de transferencia e maior visibilidade sobre o status de cada troca de dados com parceiros comerciais, camaras de compensacao e orgaos reguladores.'),
  ('solucao-integracao-b2b-fim-de-vida',
   'A solucao de integracao B2B esta chegando ao fim da vida?',
   'Sinais de que sua plataforma de integracao B2B esta obsoleta e como planejar a modernizacao sem riscos.',
   'Muitas instituicoes financeiras ainda operam com solucoes de integracao B2B desenvolvidas ha mais de uma decada, quando as demandas de volume, seguranca e agilidade eram completamente diferentes. Identificar quando uma plataforma atingiu seu fim de vida util e critico para evitar riscos operacionais e de compliance. Sinais de alerta incluem: falta de suporte do fabricante, incapacidade de suportar novos protocolos como SFTP ou APIs REST, ausencia de criptografia moderna e dificuldade em gerar relatorios de auditoria. O planejamento da migracao deve considerar continuidade operacional, mapeamento das integracoes existentes e uma estrategia de rollback para garantir zero interrupcao nos servicos criticos.'),
  ('confianca-digital-moeda-ecossistema-empresarial',
   'Por que Confianca Digital e a nova moeda do Ecossistema Empresarial?',
   'Como a confianca digital tornou-se o ativo mais valioso para bancos, fintechs e parceiros no ecossistema financeiro moderno.',
   'No contexto do Open Finance e da economia de APIs, a confianca digital deixou de ser um valor subjetivo para tornar-se um ativo mensuravel e estrategico. Instituicoes financeiras que nao conseguem demonstrar transparencia, seguranca e confiabilidade em suas integracoes perdem parceiros, clientes e oportunidades de negocio. A confianca digital e construida sobre pilares tecnicos — criptografia, autenticacao forte, rastreabilidade — mas tambem sobre governanca e cultura organizacional. Empresas que investem em certificacoes reconhecidas como ISO 27001, SOC 2 e PCI-DSS sinalizam ao mercado seu compromisso com a protecao de dados, tornando a confianca digital um diferencial competitivo real no ecossistema financeiro.'),
  ('migracao-nuvem-axway-mft-life-science',
   'A migracao tranquila para a nuvem com o Axway MFT',
   'Como empresas de Life Science estao usando o Axway MFT para migrar para a nuvem com seguranca, compliance e sem interrupcoes.',
   'O setor de Life Science lida com dados extremamente sensiveis — resultados de ensaios clinicos, pesquisas farmaceuticas, dados de pacientes e propriedade intelectual — que exigem os mais altos padroes de seguranca e conformidade durante qualquer processo de migracao. O Axway MFT oferece uma abordagem estruturada para migracao para a nuvem que garante continuidade operacional, conformidade com 21 CFR Part 11, FDA e GxP durante toda a transicao. Com conectores nativos para AWS, Azure e Google Cloud, a plataforma permite mover cargas de trabalho gradualmente, mantendo trilhas de auditoria completas e validacao de integridade de dados em cada etapa.'),
  ('servidores-mcp-integracao-b2b-life-science',
   'Como os Servidores MCP podem transformar a Gestao de Integracao B2B',
   'O papel dos servidores MCP na otimizacao do intercambio de dados entre laboratorios, CROs, fabricantes e reguladores no setor de Life Science.',
   'No setor de Life Science, a integracao B2B envolve uma rede complexa de parceiros: organizacoes de pesquisa contratadas (CROs), fabricantes por contrato (CMOs), distribuidores, reguladores e sistemas hospitalares. Os servidores MCP permitem gerenciar essa complexidade com eficiencia, padronizando protocolos de comunicacao e garantindo que cada transferencia de dados entre parceiros seja rastreavel, segura e auditavel. A capacidade de automatizar o envio de dossies regulatorios para FDA, EMA e Anvisa, com trilhas de auditoria integras, representa um avanco significativo na eficiencia regulatoria das empresas farmaceuticas e de biotecnologia.'),
  ('governanca-integracao-life-science',
   'Governanca da Integracao e o elo entre Inovacao, Rastreabilidade e Confianca Digital',
   'Como a governanca de integracao garante conformidade regulatoria e acelera a inovacao no setor de Life Science.',
   'O setor de Life Science e um dos mais regulados do mundo, e a governanca de integracao desempenha um papel central na capacidade das empresas de inovar sem comprometer a conformidade. Cada troca de dados — seja entre um laboratorio e um regulador, entre um fabricante e um distribuidor, ou entre sistemas de gestao clinica — precisa ser documentada, rastreavel e protegida. Uma governanca eficaz de integracao define padroes para validacao de dados, gerenciamento de certificados digitais, politicas de retencao e controles de acesso que atendem simultaneamente as exigencias do FDA, EMA, Anvisa e ISO 13485, sem criar barreiras a inovacao e a colaboracao entre parceiros.'),
  ('convergencia-apis-eventos-mft-arquitetura-composable',
   'Convergencia de APIs, Eventos e MFT: o alicerce de uma arquitetura digital composable e escalavel',
   'Como a convergencia entre APIs, arquiteturas orientadas a eventos e MFT cria uma base solida para a transformacao digital no setor de Life Science.',
   'A arquitetura digital moderna no setor de Life Science nao pode depender de um unico paradigma de integracao. A convergencia entre APIs RESTful, arquiteturas orientadas a eventos (event-driven) e MFT cria um ecossistema de integracao composable capaz de atender desde transferencias massivas de arquivos de sequenciamento genomico ate integracoes em tempo real com sistemas de monitoramento de ensaios clinicos. Essa abordagem hibrida permite que empresas farmaceuticas e de biotecnologia escolham o mecanismo de integracao mais adequado para cada caso de uso — velocidade, volume ou confiabilidade — sem abrir mao de visibilidade centralizada e governanca unificada sobre todos os fluxos de dados.'),
  ('governanca-integracao-healthcare',
   'Governanca da Integracao e o elo entre Inovacao, Rastreabilidade e Confianca Digital',
   'O papel da governanca de integracao na protecao de dados de pacientes e na habilitacao da inovacao digital na saude.',
   'Na area da saude, a governanca de integracao vai alem da conformidade tecnica — ela e a base da confianca que pacientes, profissionais de saude e reguladores depositam nos sistemas digitais. Com a proliferacao de dispositivos conectados, prontuarios eletronicos, telemedicina e integracao com planos de saude, garantir que cada fluxo de dados seja seguro, rastreavel e integro tornou-se um imperativo clinico e regulatorio. Uma arquitetura de integracao bem governada permite que hospitais, clinicas e operadoras de saude troquem informacoes com parceiros sem expor dados sensiveis de pacientes, cumprindo simultaneamente LGPD, HIPAA e as resolucoes do CFM e ANS.'),
  ('solucao-integracao-b2b-fim-de-vida-healthcare',
   'A solucao de integracao B2B esta chegando ao fim da vida?',
   'Como hospitais e operadoras de saude identificam que suas solucoes de integracao B2B estao obsoletas e precisam ser modernizadas.',
   'O ecossistema de saude brasileiro conta com padroes de integracao como TISS, HL7 FHIR e DICOM que evoluem constantemente para atender as novas demandas regulatorias e tecnologicas. Solucoes de integracao que nao acompanham essa evolucao tornam-se gargalos operacionais e riscos de compliance. Hospitais e operadoras que ainda operam com middleware legado enfrentam dificuldades para integrar novas fontes de dados como dispositivos IoT clinicos, sistemas de imagem PACS de nova geracao e plataformas de telemedicina. O diagnostico correto da obsolescencia tecnologica e o planejamento de uma migracao estruturada sao passos essenciais para garantir a continuidade assistencial e a seguranca dos dados de pacientes.'),
  ('confianca-digital-ecossistema-healthcare',
   'Por que Confianca Digital e a nova moeda do Ecossistema Empresarial?',
   'Como a confianca digital esta redefinindo as relacoes entre hospitais, operadoras, laboratorios e pacientes no ecossistema de saude.',
   'O ecossistema de saude e uma das redes de confianca mais complexas e criticas da economia. Pacientes confiam seus dados mais sensiveis a hospitais; operadoras confiam em prestadores para executar procedimentos cobertos; laboratorios confiam em integracoes digitais para entregar resultados que influenciam diagnosticos e tratamentos. Nesse contexto, a confianca digital e a moeda que lubrica todo o ecossistema. Investir em plataformas de integracao com criptografia de ponta a ponta, autenticacao forte, monitoramento continuo e conformidade com padroes como HL7 FHIR e IHE nao e apenas uma decisao tecnica — e uma declaracao de compromisso com a seguranca e o bem-estar dos pacientes.'),
  ('servidores-mcp-gestao-integracao-b2b-healthcare',
   'Como os Servidores MCP podem transformar a Gestao de Integracao B2B',
   'Como os servidores MCP simplificam a complexidade das integracoes B2B entre hospitais, laboratorios, operadoras e sistemas de saude publica.',
   'A complexidade das integracoes B2B na saude e uma das maiores do mercado. Um hospital de medio porte pode ter dezenas de integracoes ativas com laboratorios, farmacias, operadoras de planos de saude, sistemas de regulacao municipal e estadual, e plataformas de telemedicina. Os servidores MCP oferecem uma camada de gestao centralizada que simplifica essa complexidade, padronizando protocolos, automatizando monitoramento e fornecendo dashboards de visibilidade em tempo real sobre o status de cada integracao. Isso reduz o tempo de resolucao de falhas, melhora a qualidade dos dados clinicos trocados e garante que SLAs criticos para o atendimento ao paciente sejam cumpridos.')
) AS t(slug, title, summary, content) ON a.slug = t.slug
ON CONFLICT (article_id, language) DO NOTHING;

-- Insert English translations
INSERT INTO article_translations (article_id, language, title, summary, content)
SELECT a.id, 'en', t.title, t.summary, t.content
FROM articles a
JOIN (VALUES
  ('governanca-integracao-inovacao-confianca',
   'Integration Governance is the link between Innovation, Traceability and Digital Trust',
   'How solid integration governance connects innovation, traceability, and trust in the digital financial ecosystem.',
   'In the financial sector, integration governance is more than a technical requirement — it is the foundation of digital trust. Institutions that adopt robust governance frameworks for their B2B integrations manage to balance agility and control, ensuring full traceability of every transaction and data exchanged. With regulations like PCI-DSS, SOX, and Central Bank guidelines, the ability to audit, monitor, and control data flows in real time becomes a competitive differentiator. Effective integration governance covers access policies, continuous monitoring, SLA management, and contingency plans that sustain innovation without compromising security.'),
  ('servidores-mcp-gestao-integracao-b2b',
   'How MCP Servers can transform B2B Integration Management',
   'Discover how MCP servers elevate efficiency, security, and scalability of B2B integrations in the financial sector.',
   'MCP (Managed Communication Protocol) servers represent a significant evolution in B2B integration management for financial institutions. By centralizing control of protocols like AS2, SFTP, and HTTPS, MCP servers simplify the complexity of partner integrations, reduce onboarding time for new partners, and ensure compliance with industry security standards. Banks and fintechs adopting MCP-based architectures report significant reductions in transfer failures and greater visibility over the status of each data exchange with business partners, clearinghouses, and regulatory bodies.'),
  ('solucao-integracao-b2b-fim-de-vida',
   'Is the B2B integration solution reaching end of life?',
   'Signs that your B2B integration platform is obsolete and how to plan modernization without risks.',
   'Many financial institutions still operate with B2B integration solutions developed more than a decade ago, when volume, security, and agility demands were completely different. Identifying when a platform has reached its end of useful life is critical to avoid operational and compliance risks. Warning signs include: lack of vendor support, inability to support new protocols like SFTP or REST APIs, absence of modern encryption, and difficulty generating audit reports. Migration planning must consider operational continuity, mapping of existing integrations, and a rollback strategy to ensure zero interruption in critical services.'),
  ('confianca-digital-moeda-ecossistema-empresarial',
   'Why Digital Trust is the new currency of the Business Ecosystem?',
   'How digital trust has become the most valuable asset for banks, fintechs, and partners in the modern financial ecosystem.',
   'In the context of Open Finance and the API economy, digital trust has moved from being a subjective value to a measurable and strategic asset. Financial institutions that cannot demonstrate transparency, security, and reliability in their integrations lose partners, customers, and business opportunities. Digital trust is built on technical pillars — encryption, strong authentication, traceability — but also on governance and organizational culture. Companies that invest in recognized certifications like ISO 27001, SOC 2, and PCI-DSS signal to the market their commitment to data protection, making digital trust a real competitive differentiator in the financial ecosystem.'),
  ('migracao-nuvem-axway-mft-life-science',
   'Smooth cloud migration with Axway MFT',
   'How Life Science companies are using Axway MFT to migrate to the cloud safely, with compliance and without interruptions.',
   'The Life Science sector handles extremely sensitive data — clinical trial results, pharmaceutical research, patient data, and intellectual property — that requires the highest standards of security and compliance during any migration process. Axway MFT offers a structured approach to cloud migration that ensures operational continuity and compliance with 21 CFR Part 11, FDA, and GxP standards throughout the transition. With native connectors for AWS, Azure, and Google Cloud, the platform allows workloads to be moved gradually while maintaining complete audit trails and data integrity validation at each step.'),
  ('servidores-mcp-integracao-b2b-life-science',
   'How MCP Servers can transform B2B Integration Management',
   'The role of MCP servers in optimizing data exchange between laboratories, CROs, manufacturers, and regulators in Life Science.',
   'In the Life Science sector, B2B integration involves a complex network of partners: contract research organizations (CROs), contract manufacturing organizations (CMOs), distributors, regulators, and hospital systems. MCP servers allow managing this complexity efficiently, standardizing communication protocols and ensuring that each data transfer between partners is traceable, secure, and auditable. The ability to automate submission of regulatory dossiers to FDA, EMA, and Anvisa with complete audit trails represents a significant advance in regulatory efficiency for pharmaceutical and biotechnology companies.'),
  ('governanca-integracao-life-science',
   'Integration Governance is the link between Innovation, Traceability and Digital Trust',
   'How integration governance ensures regulatory compliance and accelerates innovation in the Life Science sector.',
   'The Life Science sector is one of the most regulated in the world, and integration governance plays a central role in companies'' ability to innovate without compromising compliance. Each data exchange — between a laboratory and a regulator, a manufacturer and a distributor, or clinical management systems — needs to be documented, traceable, and protected. Effective integration governance defines standards for data validation, digital certificate management, retention policies, and access controls that simultaneously meet FDA, EMA, Anvisa, and ISO 13485 requirements without creating barriers to innovation and partner collaboration.'),
  ('convergencia-apis-eventos-mft-arquitetura-composable',
   'Convergence of APIs, Events and MFT: the foundation of a composable and scalable digital architecture',
   'How the convergence of APIs, event-driven architectures, and MFT creates a solid foundation for digital transformation in Life Science.',
   'Modern digital architecture in Life Science cannot rely on a single integration paradigm. The convergence of RESTful APIs, event-driven architectures, and MFT creates a composable integration ecosystem capable of handling everything from massive genomic sequencing file transfers to real-time integrations with clinical trial monitoring systems. This hybrid approach allows pharmaceutical and biotechnology companies to choose the most appropriate integration mechanism for each use case — speed, volume, or reliability — without sacrificing centralized visibility and unified governance over all data flows.'),
  ('governanca-integracao-healthcare',
   'Integration Governance is the link between Innovation, Traceability and Digital Trust',
   'The role of integration governance in protecting patient data and enabling digital innovation in healthcare.',
   'In healthcare, integration governance goes beyond technical compliance — it is the foundation of trust that patients, healthcare professionals, and regulators place in digital systems. With the proliferation of connected devices, electronic health records, telemedicine, and health insurance integration, ensuring that every data flow is secure, traceable, and intact has become a clinical and regulatory imperative. A well-governed integration architecture allows hospitals, clinics, and health operators to exchange information with partners without exposing sensitive patient data, while simultaneously complying with LGPD, HIPAA, and CFM and ANS regulations.'),
  ('solucao-integracao-b2b-fim-de-vida-healthcare',
   'Is the B2B integration solution reaching end of life?',
   'How hospitals and health operators identify that their B2B integration solutions are obsolete and need modernization.',
   'The Brazilian healthcare ecosystem has integration standards like TISS, HL7 FHIR, and DICOM that constantly evolve to meet new regulatory and technological demands. Integration solutions that do not keep up with this evolution become operational bottlenecks and compliance risks. Hospitals and operators still running legacy middleware face difficulties integrating new data sources such as clinical IoT devices, next-generation PACS imaging systems, and telemedicine platforms. Correct diagnosis of technological obsolescence and planning a structured migration are essential steps to ensure care continuity and patient data security.'),
  ('confianca-digital-ecossistema-healthcare',
   'Why Digital Trust is the new currency of the Business Ecosystem?',
   'How digital trust is redefining relationships between hospitals, insurers, laboratories, and patients in the healthcare ecosystem.',
   'The healthcare ecosystem is one of the most complex and critical trust networks in the economy. Patients trust hospitals with their most sensitive data; health insurers trust providers to perform covered procedures; laboratories trust digital integrations to deliver results that influence diagnoses and treatments. In this context, digital trust is the currency that lubricates the entire ecosystem. Investing in integration platforms with end-to-end encryption, strong authentication, continuous monitoring, and compliance with standards like HL7 FHIR and IHE is not just a technical decision — it is a declaration of commitment to patient safety and well-being.'),
  ('servidores-mcp-gestao-integracao-b2b-healthcare',
   'How MCP Servers can transform B2B Integration Management',
   'How MCP servers simplify the complexity of B2B integrations between hospitals, laboratories, insurers, and public health systems.',
   'The complexity of B2B integrations in healthcare is one of the highest in the market. A medium-sized hospital may have dozens of active integrations with laboratories, pharmacies, health insurance operators, municipal and state regulation systems, and telemedicine platforms. MCP servers offer a centralized management layer that simplifies this complexity, standardizing protocols, automating monitoring, and providing real-time visibility dashboards on the status of each integration. This reduces failure resolution time, improves the quality of clinical data exchanged, and ensures that SLAs critical for patient care are met.')
) AS t(slug, title, summary, content) ON a.slug = t.slug
ON CONFLICT (article_id, language) DO NOTHING;

-- Insert tags for each article
INSERT INTO article_tags (article_id, tag)
SELECT a.id, t.tag
FROM articles a
JOIN (VALUES
  ('governanca-integracao-inovacao-confianca', 'integracao'),
  ('governanca-integracao-inovacao-confianca', 'governanca'),
  ('governanca-integracao-inovacao-confianca', 'confianca digital'),
  ('governanca-integracao-inovacao-confianca', 'inovacao'),
  ('governanca-integracao-inovacao-confianca', 'B2B'),
  ('servidores-mcp-gestao-integracao-b2b', 'MCP'),
  ('servidores-mcp-gestao-integracao-b2b', 'integracao B2B'),
  ('servidores-mcp-gestao-integracao-b2b', 'banking'),
  ('servidores-mcp-gestao-integracao-b2b', 'servidores'),
  ('servidores-mcp-gestao-integracao-b2b', 'automacao'),
  ('solucao-integracao-b2b-fim-de-vida', 'integracao B2B'),
  ('solucao-integracao-b2b-fim-de-vida', 'legado'),
  ('solucao-integracao-b2b-fim-de-vida', 'modernizacao'),
  ('solucao-integracao-b2b-fim-de-vida', 'migracao'),
  ('solucao-integracao-b2b-fim-de-vida', 'banking'),
  ('confianca-digital-moeda-ecossistema-empresarial', 'confianca digital'),
  ('confianca-digital-moeda-ecossistema-empresarial', 'ecossistema'),
  ('confianca-digital-moeda-ecossistema-empresarial', 'banking'),
  ('confianca-digital-moeda-ecossistema-empresarial', 'open finance'),
  ('confianca-digital-moeda-ecossistema-empresarial', 'seguranca'),
  ('migracao-nuvem-axway-mft-life-science', 'MFT'),
  ('migracao-nuvem-axway-mft-life-science', 'nuvem'),
  ('migracao-nuvem-axway-mft-life-science', 'life science'),
  ('migracao-nuvem-axway-mft-life-science', 'Axway'),
  ('migracao-nuvem-axway-mft-life-science', 'migracao'),
  ('migracao-nuvem-axway-mft-life-science', 'compliance'),
  ('servidores-mcp-integracao-b2b-life-science', 'MCP'),
  ('servidores-mcp-integracao-b2b-life-science', 'integracao B2B'),
  ('servidores-mcp-integracao-b2b-life-science', 'life science'),
  ('servidores-mcp-integracao-b2b-life-science', 'parceiros'),
  ('servidores-mcp-integracao-b2b-life-science', 'automacao'),
  ('governanca-integracao-life-science', 'governanca'),
  ('governanca-integracao-life-science', 'integracao'),
  ('governanca-integracao-life-science', 'life science'),
  ('governanca-integracao-life-science', 'rastreabilidade'),
  ('governanca-integracao-life-science', 'inovacao'),
  ('convergencia-apis-eventos-mft-arquitetura-composable', 'APIs'),
  ('convergencia-apis-eventos-mft-arquitetura-composable', 'eventos'),
  ('convergencia-apis-eventos-mft-arquitetura-composable', 'MFT'),
  ('convergencia-apis-eventos-mft-arquitetura-composable', 'arquitetura composable'),
  ('convergencia-apis-eventos-mft-arquitetura-composable', 'integracao'),
  ('convergencia-apis-eventos-mft-arquitetura-composable', 'life science'),
  ('governanca-integracao-healthcare', 'governanca'),
  ('governanca-integracao-healthcare', 'integracao'),
  ('governanca-integracao-healthcare', 'healthcare'),
  ('governanca-integracao-healthcare', 'confianca digital'),
  ('governanca-integracao-healthcare', 'LGPD'),
  ('governanca-integracao-healthcare', 'HIPAA'),
  ('solucao-integracao-b2b-fim-de-vida-healthcare', 'integracao B2B'),
  ('solucao-integracao-b2b-fim-de-vida-healthcare', 'legado'),
  ('solucao-integracao-b2b-fim-de-vida-healthcare', 'healthcare'),
  ('solucao-integracao-b2b-fim-de-vida-healthcare', 'modernizacao'),
  ('solucao-integracao-b2b-fim-de-vida-healthcare', 'TISS'),
  ('solucao-integracao-b2b-fim-de-vida-healthcare', 'HL7'),
  ('confianca-digital-ecossistema-healthcare', 'confianca digital'),
  ('confianca-digital-ecossistema-healthcare', 'healthcare'),
  ('confianca-digital-ecossistema-healthcare', 'ecossistema'),
  ('confianca-digital-ecossistema-healthcare', 'interoperabilidade'),
  ('confianca-digital-ecossistema-healthcare', 'FHIR'),
  ('servidores-mcp-gestao-integracao-b2b-healthcare', 'MCP'),
  ('servidores-mcp-gestao-integracao-b2b-healthcare', 'integracao B2B'),
  ('servidores-mcp-gestao-integracao-b2b-healthcare', 'healthcare'),
  ('servidores-mcp-gestao-integracao-b2b-healthcare', 'interoperabilidade'),
  ('servidores-mcp-gestao-integracao-b2b-healthcare', 'automacao')
) AS t(slug, tag) ON a.slug = t.slug;