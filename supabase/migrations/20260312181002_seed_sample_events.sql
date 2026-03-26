/*
  # Seed Sample Events

  1. Sample Data
    - API World 2025 - Presencial event
    - Webinar MFT Security - Online event
    - Tech Summit Brazil - Presencial event

  2. Notes
    - Events are seeded as published for demonstration
*/

INSERT INTO events (slug, data, event_date, event_time, location, location_type, image_url, registration_url, is_published)
VALUES
  (
    'api-world-2025',
    '{
      "title_pt": "API World 2025",
      "title_en": "API World 2025",
      "title_es": "API World 2025",
      "description_pt": "O maior evento de APIs do mundo. Junte-se a milhares de desenvolvedores e líderes de tecnologia para explorar as últimas tendências em APIs e integração.",
      "description_en": "The world''s largest API event. Join thousands of developers and technology leaders to explore the latest trends in APIs and integration.",
      "description_es": "El evento de APIs más grande del mundo. Únase a miles de desarrolladores y líderes tecnológicos para explorar las últimas tendencias en APIs e integración."
    }'::jsonb,
    '2025-10-28',
    '09:00',
    'Santa Clara Convention Center, California',
    'presencial',
    'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://apiworld.co',
    true
  ),
  (
    'webinar-mft-security-2025',
    '{
      "title_pt": "Webinar: Segurança em MFT",
      "title_en": "Webinar: MFT Security Best Practices",
      "title_es": "Webinar: Seguridad en MFT",
      "description_pt": "Aprenda as melhores práticas de segurança para transferência gerenciada de arquivos. Nossos especialistas compartilharão insights sobre proteção de dados sensíveis.",
      "description_en": "Learn security best practices for managed file transfer. Our experts will share insights on protecting sensitive data.",
      "description_es": "Aprenda las mejores prácticas de seguridad para transferencia gestionada de archivos. Nuestros expertos compartirán información sobre protección de datos sensibles."
    }'::jsonb,
    '2025-04-15',
    '14:00',
    'Online via Zoom',
    'online',
    'https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://axway.com/webinars',
    true
  ),
  (
    'tech-summit-brazil-2025',
    '{
      "title_pt": "Tech Summit Brasil 2025",
      "title_en": "Tech Summit Brazil 2025",
      "title_es": "Tech Summit Brasil 2025",
      "description_pt": "O principal evento de tecnologia empresarial do Brasil. Networking, palestras e workshops sobre transformação digital, APIs e integração de sistemas.",
      "description_en": "Brazil''s leading enterprise technology event. Networking, talks and workshops on digital transformation, APIs and system integration.",
      "description_es": "El principal evento de tecnología empresarial de Brasil. Networking, charlas y talleres sobre transformación digital, APIs e integración de sistemas."
    }'::jsonb,
    '2025-06-20',
    '08:30',
    'Centro de Convenções Frei Caneca, São Paulo',
    'presencial',
    'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://techsummit.com.br',
    true
  )
ON CONFLICT (slug) DO NOTHING;