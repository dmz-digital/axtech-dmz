/*
  # Seed Sample E-books Data
  
  Adding sample e-books for testing the functionality.
  These use placeholder URLs that should be replaced with actual Storage paths.
*/

INSERT INTO ebooks (slug, category, cover_image_path, pdf_path, data, tags)
VALUES
  (
    'guia-transformacao-digital-2024',
    'digital',
    'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800',
    'ebooks/guia-transformacao-digital-2024.pdf',
    '{
      "title_pt": "Guia Completo de Transformacao Digital 2024",
      "title_en": "Complete Digital Transformation Guide 2024",
      "summary_pt": "Um guia abrangente para lideres de TI que desejam acelerar a transformacao digital em suas organizacoes. Aprenda as melhores praticas, frameworks e estrategias para modernizar sua infraestrutura e processos.",
      "summary_en": "A comprehensive guide for IT leaders looking to accelerate digital transformation in their organizations. Learn best practices, frameworks, and strategies to modernize your infrastructure and processes."
    }'::jsonb,
    ARRAY['transformacao digital', 'inovacao', 'estrategia', 'modernizacao']
  ),
  (
    'seguranca-cibernetica-empresas',
    'security',
    'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800',
    'ebooks/seguranca-cibernetica-empresas.pdf',
    '{
      "title_pt": "Seguranca Cibernetica para Empresas",
      "title_en": "Cybersecurity for Enterprises",
      "summary_pt": "Proteja sua empresa contra ameacas ciberneticas com este guia pratico. Cobrimos desde conceitos basicos ate estrategias avancadas de protecao, incluindo compliance e gestao de riscos.",
      "summary_en": "Protect your company against cyber threats with this practical guide. We cover everything from basic concepts to advanced protection strategies, including compliance and risk management."
    }'::jsonb,
    ARRAY['seguranca', 'ciberseguranca', 'compliance', 'protecao de dados']
  ),
  (
    'integracao-apis-microservicos',
    'integration',
    'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800',
    'ebooks/integracao-apis-microservicos.pdf',
    '{
      "title_pt": "Integracao de APIs e Microservicos",
      "title_en": "API and Microservices Integration",
      "summary_pt": "Domine a arte da integracao de sistemas com APIs e microservicos. Este e-book cobre arquiteturas modernas, padroes de design, e melhores praticas para criar integracoes robustas e escalaveis.",
      "summary_en": "Master the art of system integration with APIs and microservices. This e-book covers modern architectures, design patterns, and best practices for creating robust and scalable integrations."
    }'::jsonb,
    ARRAY['API', 'microservicos', 'integracao', 'arquitetura']
  ),
  (
    'cloud-computing-estrategias',
    'cloud',
    'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=800',
    'ebooks/cloud-computing-estrategias.pdf',
    '{
      "title_pt": "Estrategias de Cloud Computing para Negocios",
      "title_en": "Cloud Computing Strategies for Business",
      "summary_pt": "Descubra como implementar uma estrategia de cloud eficiente para sua empresa. Abordamos multicloud, cloud hibrida, otimizacao de custos e governanca.",
      "summary_en": "Discover how to implement an efficient cloud strategy for your company. We cover multicloud, hybrid cloud, cost optimization, and governance."
    }'::jsonb,
    ARRAY['cloud', 'AWS', 'Azure', 'GCP', 'multicloud']
  )
ON CONFLICT (slug) DO NOTHING;