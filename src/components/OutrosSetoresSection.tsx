import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function OutrosSetoresSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const SECTORS = [
    {
      slug: 'automotivo',
      label: t('outros_setores.automotive_label'),
      description: t('outros_setores.automotive_description'),
      image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      slug: 'energia',
      label: t('outros_setores.energy_label'),
      description: t('outros_setores.energy_description'),
      image: 'https://images.pexels.com/photos/3862130/pexels-photo-3862130.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      slug: 'governo',
      label: t('outros_setores.government_label'),
      description: t('outros_setores.government_description'),
      image: 'https://images.pexels.com/photos/5717546/pexels-photo-5717546.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      slug: 'transporte',
      label: t('outros_setores.transport_label'),
      description: t('outros_setores.transport_description'),
      image: 'https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
  ];

  return (
    <section className="py-16 bg-dark-teal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white mb-10">{t('outros_setores.title')}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {SECTORS.map((sector) => (
            <div
              key={sector.slug}
              className="cursor-pointer group"
              onClick={() => navigate(`/results?category=${sector.slug}`)}
            >
              <div className="rounded-2xl overflow-hidden mb-4 aspect-[3/4] bg-white/10">
                <img
                  src={sector.image}
                  alt={sector.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
              </div>
              <h3 className="text-lg font-bold text-teal-300 mb-2 group-hover:text-white transition-colors">
                {sector.label}
              </h3>
              <p className="text-white/70 text-sm leading-relaxed font-light">
                {sector.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
