import { businessesConfig } from '../lib/businesses';

const BusinessLogos = () => {
  const businesses = businessesConfig.filter(b => b.supabaseUrl && b.slug_url);

  const buildCandidates = (b) => {
    const base = b.supabaseUrl?.replace(/\/$/, '') || '';
    const imagesPath = `${base}/storage/v1/object/public/images/favicon.png`;
    const dondePath = `${base}/storage/v1/object/public/donde_peter/favicon.png`;
    const prefersDonde = b.id === 'negocio-1' || (b.name || '').toLowerCase().includes('peter') || (b.slug_url || '').includes('comidarapida');
    return prefersDonde ? [dondePath, imagesPath] : [imagesPath, dondePath];
  };

  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide touch-scroll py-2">
          {businesses.map(b => {
            const [primary, fallback] = buildCandidates(b);
            return (
              <a
                key={b.id}
                href={b.slug_url}
                rel="noopener noreferrer"
                className="flex-shrink-0 logo-item"
                aria-label={b.name}
              >
                <img
                  src={primary}
                  data-fallback={fallback}
                  alt={b.name}
                  loading="lazy"
                  onError={(e) => {
                    const el = e.currentTarget;
                    const next = el.getAttribute('data-fallback');
                    if (next && el.src !== next) {
                      el.src = next;
                      el.removeAttribute('data-fallback');
                    } else {
                      el.src = '/img/placeholder.png';
                      el.removeAttribute('data-fallback');
                    }
                  }}
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