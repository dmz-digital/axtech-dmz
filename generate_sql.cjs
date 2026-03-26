const fs = require('fs');

const data = {
  "fase_1_products": [
    {
      "url": "https://www.axway.com/en/products/amplify-api-management-platform",
      "short_description": "Amplify API Platform",
      "resumo_conteudo": "Plataforma federada de integração inteligente de dados; API Management, Fusion, Engage, AI Gateway; Leader Gartner 10x em 2025.",
      "palavras_chave": ["API Management", "Federated API", "Data Integration", "AI Gateway", "API Governance", "Cloud Integration", "API Lifecycle", "Low-code Integration", "API Security", "API Monetization"]
    },
    {
      "url": "https://www.axway.com/en/products/b2b-integration",
      "short_description": "B2B Integration",
      "resumo_conteudo": "Integração B2B com suporte a EDI e API; VAN moderno, eInvoicing, eSubmissions, Track & Trace; Leader IDC MarketScape 2024.",
      "palavras_chave": ["B2B Integration", "EDI", "API B2B", "VAN", "Partner Integration", "eInvoicing", "Supply Chain", "Business Network", "Cloud B2B", "Data Exchange"]
    },
    {
      "url": "https://www.axway.com/en/products/managed-file-transfer",
      "short_description": "Managed File Transfer",
      "resumo_conteudo": "MFT para 2.500+ organizações; $700 trilhões em pagamentos; 80% reservas de voos globais; SecureTransport, Transfer CFT, Workbench, MFT Cloud Services; conformidade GDPR/HIPAA/PCI-DSS.",
      "palavras_chave": ["Managed File Transfer", "Secure File Transfer", "MFT", "SecureTransport", "Transfer CFT", "File Encryption", "Compliance", "Cloud MFT", "Data Security", "Business Continuity"]
    },
    {
      "url": "https://www.axway.com/en/products/afah",
      "short_description": "Axway Financial Accounting Hub",
      "resumo_conteudo": "Transformação digital financeira; fecha livros em 2 dias; 10M transações em 10 min; AFAH HubLedger + AFAH Model; usado por BNP Paribas.",
      "palavras_chave": ["Financial Accounting", "Digital Finance", "Subledger", "Consolidation", "Accounting Rules", "ERP Integration", "Multi-GAAP", "Financial Compliance", "Audit Trail", "Data Quality"]
    },
    {
      "url": "https://www.axway.com/en/products/other-products",
      "short_description": "Specialized Products",
      "resumo_conteudo": "Portfólio complementar: Analytics, Automator, Sentinel, Validation Authority, Verification Router Service (farmacêutico).",
      "palavras_chave": ["Analytics", "Automation", "Sentinel", "Monitoring", "PKI Validation", "Pharmaceutical Compliance", "Real-time Intelligence", "Data Visibility", "Orchestration", "Risk Management"]
    }
  ],
  "fase_2_solutions_by_industry": [
    {
      "url": "https://www.axway.com/en/solutions/automotive",
      "short_description": "Automotive",
      "resumo_conteudo": "Cadeias de suprimento automotivas, integração B2B/EDI e MFT para produtores, fornecedores e logística.",
      "palavras_chave": ["Automotive", "Supply Chain", "Manufacturing", "B2B Integration", "Vehicle Production", "Supplier Network", "MFT", "EDI", "Cost Reduction", "OEM"]
    },
    {
      "url": "https://www.axway.com/en/solutions/financial-services",
      "short_description": "Banking & Financial Services",
      "resumo_conteudo": "3 de 4 cartões de crédito, 6 em 10 maiores bancos globais, 40% PIB diário EUA; MFT, B2Bi, API Management, Open Banking; conformidade PCI DSS, SWIFT.",
      "palavras_chave": ["Banking", "Financial Services", "API Management", "Open Banking", "Payment Processing", "PCI DSS Compliance", "SWIFT", "B2B Integration", "Fintech", "Regulatory Compliance"]
    },
    {
      "url": "https://www.axway.com/en/solutions/government",
      "short_description": "Government & Public Service",
      "resumo_conteudo": "Entrega segura de serviços governamentais; HSPD-12, FHIR, DoD, agências civis; integração híbrida.",
      "palavras_chave": ["Government", "Public Service", "HSPD-12", "FHIR", "DoD Solutions", "Federal Compliance", "PKI Infrastructure", "Identity Federation", "eGovernment", "HIPAA"]
    },
    {
      "url": "https://www.axway.com/en/solutions/healthcare",
      "short_description": "Healthcare",
      "resumo_conteudo": "2 de 3 maiores planos de saúde nacionais, 9 de 20 maiores empresas de saúde EUA; FHIR®, CMS Interoperability, Patient Access Rules.",
      "palavras_chave": ["Healthcare", "FHIR", "Patient Data", "PHI Protection", "Health Plans", "CMS Interoperability", "Patient Access", "API Management", "Health Exchange", "Compliance"]
    },
    {
      "url": "https://www.axway.com/en/solutions/insurance",
      "short_description": "Insurance",
      "resumo_conteudo": "Conformidade regulatória dinâmica, GDPR, PCI DSS; transformação digital para seguradoras.",
      "palavras_chave": ["Insurance", "Digital Transformation", "Regulatory Compliance", "GDPR", "PCI DSS", "Policy Management", "Claims Processing", "Data Security", "API Integration", "Cloud Services"]
    },
    {
      "url": "https://www.axway.com/en/solutions/life-science",
      "short_description": "Life Sciences",
      "resumo_conteudo": "85% fabricantes farmacêuticos, 3 principais distribuidoras; VRS GS1, CSOS, DSCSA, Track & Trace; Novartis como cliente.",
      "palavras_chave": ["Pharmaceutical", "Life Sciences", "Drug Development", "Supply Chain Security", "GS1 VRS", "CSOS", "DSCSA Compliance", "Track & Trace", "Counterfeit Prevention", "Clinical Trials"]
    },
    {
      "url": "https://www.axway.com/en/solutions/manufacturing-cpg",
      "short_description": "Manufacturing & CPG",
      "resumo_conteudo": "Cadeias de suprimento digitais; modernização B2B com APIs; visibilidade end-to-end; análise em tempo real.",
      "palavras_chave": ["Manufacturing", "CPG", "Supply Chain", "Digital Supply Chain", "B2B Integration", "ERP Systems", "SLA Management", "Compliance Tracking", "API Integration", "Cost Optimization"]
    },
    {
      "url": "https://www.axway.com/en/solutions/retail",
      "short_description": "Retail",
      "resumo_conteudo": "Experiência omnichannel; dados POS, IoT, histórico; Track & Trace para serialização e recalls; conformidade GDPR/PCI DSS.",
      "palavras_chave": ["Retail", "Customer Experience", "POS Systems", "Omnichannel", "Supply Chain", "Serialization", "Regulatory Compliance", "Data Analysis", "Security", "Digital Transformation"]
    },
    {
      "url": "https://www.axway.com/en/solutions/transportation-logistics",
      "short_description": "Transportation & Logistics",
      "resumo_conteudo": "Rastreamento em tempo real, merge-in-transit, cross-docking; API Management + B2B/EDI + MFT; DB Schenker, Swiss Post, ATPCO como clientes.",
      "palavras_chave": ["Transportation", "Logistics", "Real-time Tracking", "Supply Chain", "API Integration", "B2B/EDI", "MFT", "Inventory Management", "EDI Communication", "Global Trade"]
    }
  ],
  "fase_3_our_customers": [
    {
      "url": "https://www.axway.com/en/customers/customer-stories",
      "short_description": "Customer Stories",
      "resumo_conteudo": "Mais de 11.000 empresas em todo o mundo confiam na Axway para enriquecer a experiência do cliente, acelerar a inovação e simplificar a segurança de dados e governança.",
      "palavras_chave": ["Customer Stories", "Case Studies", "Client Success", "Digital Transformation", "Business Results", "Enterprise Solutions", "Industry Leaders", "Customer Testimonials", "Success Metrics", "Implementation"]
    },
    {
      "url": "https://www.axway.com/en/customers/advocacy-program",
      "short_description": "Customer Advocacy Program",
      "resumo_conteudo": "Programa de Advocacy de Clientes que oferece oportunidades de networking e liderança intelectual para expandir presença de mercado.",
      "palavras_chave": ["Advocacy Program", "Networking", "Thought Leadership", "Co-Marketing", "Speaking Opportunities", "Advisory Board", "Executive Access", "Brand Recognition", "Industry Influence", "Co-Innovation"]
    },
    {
      "url": "https://www.axway.com/en/2025-axway-excellence-awards",
      "short_description": "2025 Axway Excellence Awards",
      "resumo_conteudo": "Programa anual de prêmios reconhecendo achievement em transformação digital, inovação e excelência visionária.",
      "palavras_chave": ["Excellence Awards", "Transformation Excellence", "Innovation Excellence", "Visionary Excellence", "Customer Recognition", "Digital Achievement", "Awards Program", "Industry Recognition", "Case Studies", "Summit Showcase"]
    }
  ],
  "fase_4_company": [
    {
      "url": "https://www.axway.com/en/company/about-us",
      "short_description": "About Us",
      "resumo_conteudo": "Axway é uma empresa de software global que ajuda organizações a mover e integrar dados seguramente há mais de 20 anos. 1.500+ funcionários em 18 países servindo 4.000+ clientes. Líder Gartner 10x (2025).",
      "palavras_chave": ["About Axway", "Company Overview", "Global Software", "Data Integration", "Mission & Vision", "Leadership", "Employee Count", "Revenue Growth", "Customer Base", "Market Position"]
    },
    {
      "url": "https://www.axway.com/en/company/careers",
      "short_description": "Careers",
      "resumo_conteudo": "Página de carreiras descrevendo oportunidades de emprego na Axway com valores: Better Together, Authentic, Experienced Guides, Secure.",
      "palavras_chave": ["Careers", "Job Opportunities", "Recruitment", "Griffin Values", "Company Culture", "Diversity & Inclusion", "Women in Tech", "Global Teams", "Professional Growth", "Job Portal"]
    },
    {
      "url": "https://www.axway.com/en/company/axway-leadership",
      "short_description": "Leadership",
      "resumo_conteudo": "Equipe de liderança executiva: Roland Royer (CEO), Meetesh Patel (CPO), Ann Lloyd (CCSO), e líderes regionais e de produto.",
      "palavras_chave": ["Leadership", "Executive Team", "CEO", "C-Suite", "Management Team", "Board of Directors", "Global Leadership", "Regional Directors", "Product Executives", "Executive Committee"]
    },
    {
      "url": "https://www.74software.com/investor-relations",
      "short_description": "Investor Relations",
      "resumo_conteudo": "Relações com investidores da 74Software (empresa mãe de Axway). Axway agora é parte de 74Software (Euronext: 74SW).",
      "palavras_chave": ["Investor Relations", "Financial Information", "Corporate Governance", "Shareholder Information", "Financial Reports", "Press Releases", "Stock Information", "Compliance", "Corporate Structure", "Stakeholder Communications"]
    },
    {
      "url": "https://www.axway.com/en/legal/contract-documents",
      "short_description": "Legal Contracts",
      "resumo_conteudo": "Centro de contratos legais com documentação padrão: License, Subscription Services, SLAs, Support Policies, Privacy Notices, Purchase Conditions.",
      "palavras_chave": ["Legal Contracts", "Terms & Conditions", "License Agreements", "Service Terms", "SLAs", "Support Policies", "Privacy Notices", "Product Descriptions", "Purchase Conditions", "Legal Documentation"]
    },
    {
      "url": "https://www.axway.com/en/company/analyst-recognition",
      "short_description": "Analyst Recognition",
      "resumo_conteudo": "Axway foi nomeada líder 10x na Gartner Magic Quadrant (2025). Também reconhecida como líder em IDC MarketScape (2024), Forrester Wave (2024), e G2.",
      "palavras_chave": ["Analyst Recognition", "Gartner Magic Quadrant", "IDC MarketScape", "Forrester Wave", "G2 Leader", "Industry Recognition", "Market Leadership", "Analyst Reports", "Third-party Validation", "Industry Rankings"]
    }
  ],
  "fase_5_partners": [
    {
      "url": "https://www.axway.com/en/partners/find-partner",
      "short_description": "Find a Partner",
      "resumo_conteudo": "Portal de busca para localizar parceiros Axway qualificados globalmente. Busca por tipo de parceiro, nível de parceria e localização geográfica. Centenas de parceiros listados.",
      "palavras_chave": ["Partner Search", "Partner Directory", "Technology Partners", "System Integrators", "Managed Services", "Channel Partners", "Partner Locator", "Global Partners", "Partnership Types", "Partner Network"]
    },
    {
      "url": "https://www.axway.com/en/partners/become-partner",
      "short_description": "Become a Partner",
      "resumo_conteudo": "Página de recrutamento de parceiros. Oferece 4 tipos de parcerias: Technology Alliance, Managed Services, System Integrators, Channel Partners.",
      "palavras_chave": ["Become Partner", "Partner Program", "Partnership Opportunities", "Technology Alliance", "Managed Services Partner", "System Integrator", "Channel Partner", "Reseller Program", "Partner Enablement", "Partner Registration"]
    },
    {
      "url": "https://www.axway.com/en/partners/resources",
      "short_description": "Partner Resources",
      "resumo_conteudo": "Hub de recursos para parceiros: Partner Portal, LinkedIn, YouTube Playlists, Axway Community para Q&A e networking.",
      "palavras_chave": ["Partner Resources", "Partner Portal", "Partner Community", "Sales Tools", "Partner Training", "Deal Registration", "Partner Network", "Collaboration Tools", "Partner Development", "Knowledge Sharing"]
    }
  ],
  "fase_6_support": [
    {
      "url": "https://community.axway.com/s/",
      "short_description": "Axway Community",
      "resumo_conteudo": "Comunidade online Salesforce-powered: Q&A, networking, user groups, compartilhamento de conhecimento com clientes, partners e especialistas.",
      "palavras_chave": ["Community", "Q&A Forum", "User Forum", "Peer Networking", "Knowledge Sharing", "Expert Community", "Discussion Boards", "Problem Solving", "Best Practices", "User Groups"]
    },
    {
      "url": "https://docs.axway.com/",
      "short_description": "Axway Documentation",
      "resumo_conteudo": "Portal de documentação técnica: guias de instalação, configuração, administração, API references, best practices, troubleshooting, release notes.",
      "palavras_chave": ["Documentation", "Product Guides", "API Documentation", "Installation Guide", "Configuration", "Administration", "Technical References", "Troubleshooting", "Release Notes", "Knowledge Base"]
    },
    {
      "url": "https://support.axway.com/",
      "short_description": "Axway Support Portal",
      "resumo_conteudo": "Portal de suporte técnico: tickets, case tracking, SLA support 24/7, patch downloads, base de conhecimento.",
      "palavras_chave": ["Support Portal", "Technical Support", "Support Tickets", "Case Management", "SLA Support", "Knowledge Base", "Patch Downloads", "Issue Resolution", "Help Center", "Customer Support"]
    },
    {
      "url": "https://www.axway.com/en/customers/user-groups",
      "short_description": "User Group Program",
      "resumo_conteudo": "Programa de User Groups para clientes colaborarem e aprenderem. Cobre: Amplify, Automator, B2B Integration, Financial Accounting, MFT, TSIM.",
      "palavras_chave": ["User Groups", "Community Groups", "User Networking", "Peer Learning", "Product Education", "User Meetings", "Knowledge Exchange", "Local Communities", "Expert Access", "User Forum"]
    },
    {
      "url": "https://trust.axway.com/",
      "short_description": "Axway Trust Center / Security Statement",
      "resumo_conteudo": "Trust Center: transparência em segurança, privacidade, conformidade. Compliance com GDPR, HIPAA, PCI-DSS, ISO 27001, audit reports.",
      "palavras_chave": ["Trust Center", "Security", "Compliance", "Certifications", "GDPR Compliance", "Privacy Policy", "Audit Reports", "Security Statement", "Data Protection", "Risk Management"]
    },
    {
      "url": "https://github.com/Axway/",
      "short_description": "Axway Developer Portal / GitHub",
      "resumo_conteudo": "Repositório GitHub oficial: código aberto, SDKs, samples, ferramentas, projetos de comunidade. Centro para developer community.",
      "palavras_chave": ["GitHub", "Developer Portal", "Open Source", "Code Samples", "SDKs", "Developer Resources", "API Integration", "Code Repository", "Contributing", "Developer Community"]
    },
    {
      "url": "https://www.axway.com/en/resources/videos",
      "short_description": "Axway Videos & Webinars",
      "resumo_conteudo": "Biblioteca de vídeos e webinars: 6 canais YouTube (Axway, Amplify, B2B, AFAH, MFT, Developer), playlists, tutorials, customer stories.",
      "palavras_chave": ["Videos", "Webinars", "YouTube", "Product Demos", "Tutorials", "Customer Success Stories", "Training Videos", "Product Updates", "On-Demand Webinars", "Video Library"]
    }
  ],
  "fase_7_services": [
    {
      "url": "https://www.axway.com/en/catalysts",
      "short_description": "Axway Catalysts",
      "resumo_conteudo": "Equipe de especialistas em transformação digital e APIs: Accelerate Journey program (6 workshops, 3 meses), estratégia API, programa, produto, design, DevOps, adoção.",
      "palavras_chave": ["Catalysts", "Digital Transformation", "API Strategy", "Business Enablement", "Accelerate Journey", "Coaching", "Expert Guidance", "Enterprise Architecture", "API-First", "Workshops"]
    },
    {
      "url": "https://www.axway.com/en/resources/training-certification",
      "short_description": "Training & Certification",
      "resumo_conteudo": "Programa de treinamento através de Axway University: cursos eLearning e instructor-led para todos os produtos. Certificações para APIM, SecureTransport, Transfer CFT, B2Bi, TSIM, AFAH.",
      "palavras_chave": ["Training", "Certification", "eLearning", "Instructor-Led", "Axway University", "Professional Development", "Product Training", "Hands-on Labs", "Course Catalog", "Knowledge Building"]
    },
    {
      "url": "https://www.axway.com/en/services/consulting",
      "short_description": "Consulting Services",
      "resumo_conteudo": "Serviços de consultoria: design de solução, arquitetura, configuração, implementação, cloud transition, health checks. Consultores com 15+ anos de experiência média.",
      "palavras_chave": ["Consulting", "Professional Services", "Solution Design", "Implementation", "Architecture", "Best Practices", "Delivery Accelerators", "Cloud Migration", "Solution Health Check", "Expert Guidance"]
    }
  ],
  "fase_8_resources": [
    {
      "url": "https://resources.axway.com/",
      "short_description": "Resource Center",
      "resumo_conteudo": "Hub central de recursos: case studies, white papers, webinars, guias, artigos. Organizado por produto, setores, desafios de negócio, formatos.",
      "palavras_chave": ["Resource Center", "Case Studies", "White Papers", "Webinars", "Guides", "Articles", "Data Sheets", "eBooks", "Solution Briefs", "Business Resources"]
    },
    {
      "url": "https://blog.axway.com/",
      "short_description": "Axway Blog",
      "resumo_conteudo": "Blog oficial Axway: notícias, trends, insights sobre integração híbrida. Seções: Learning Center, Industry Insights, Product Insights.",
      "palavras_chave": ["Blog", "News", "Trends", "Insights", "Hybrid Integration", "Digital Strategy", "Thought Leadership", "Industry Updates", "Technology Trends", "Best Practices"]
    },
    {
      "url": "https://www.axway.com/en/events-and-webinars",
      "short_description": "Events & Webinars",
      "resumo_conteudo": "Portal de eventos e webinars: live events, upcoming webinars, on-demand webinars por tema, setor, localização.",
      "palavras_chave": ["Events", "Webinars", "Live Events", "Conferences", "Workshops", "Networking", "On-Demand", "Learning", "Industry Events", "Virtual Events"]
    },
    {
      "url": "https://university.axway.com/learn",
      "short_description": "Axway University",
      "resumo_conteudo": "Plataforma de aprendizado online Axway University: cursos por produto, learning paths, certificações, labs prácticos.",
      "palavras_chave": ["University", "Learning Platform", "Online Courses", "Learning Paths", "Certifications", "Practical Labs", "Self-Paced", "Professional Development", "Skill Building", "Course Completion"]
    }
  ]
};

let sql = `
CREATE TABLE IF NOT EXISTS axway_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  url text NOT NULL,
  short_description text NOT NULL,
  resumo_conteudo text,
  palavras_chave text[]
);

ALTER TABLE axway_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON axway_resources;
CREATE POLICY "Allow public read access" ON axway_resources FOR SELECT USING (true);

INSERT INTO axway_resources (category, url, short_description, resumo_conteudo, palavras_chave) VALUES
`;

const values = [];
for (const [key, value] of Object.entries(data)) {
  const category = key;
  for (const item of value) {
    const url = item.url.replace(/'/g, "''");
    const desc = item.short_description.replace(/'/g, "''");
    const resumo = item.resumo_conteudo.replace(/'/g, "''");
    const tags = item.palavras_chave.map(t => `'${t.replace(/'/g, "''")}'`).join(', ');
    values.push(`('${category}', '${url}', '${desc}', '${resumo}', ARRAY[${tags}])`);
  }
}

sql += values.join(',\n') + ';\n';

fs.writeFileSync('./migration.sql', sql);
console.log('SQL migration generated at ./migration.sql');
