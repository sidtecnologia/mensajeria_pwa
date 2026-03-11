import { businessesConfig } from '../lib/businesses';

const BusinessLogos = () => {
  const businesses = businessesConfig.filter(b => b.supabaseUrl && b.slug_url);

  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div
          className="flex items-center gap-4 overflow-x-auto scrollbar-hide touch-scroll py-2"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {businesses.map(b => {
            const base = b.supabaseUrl?.replace(/\/$/, '') || '';
            const favicon = `${base}/storage/v1/object/public/images/favicon.png`;
            return (
              <a
                key={b.id}
                href={b.slug_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 logo-item"
              >
                <img
                  src={favicon}
                  alt={b.name}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = '/img/placeholder.png'; }}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border border-gray-100 shadow-sm"
                />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BusinessLogos;