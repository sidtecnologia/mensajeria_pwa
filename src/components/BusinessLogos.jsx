import { memo } from 'react'
import { useSearch } from '../context/SearchContext'

const BusinessLogos = memo(() => {
  const { businesses, loading } = useSearch()

  if (loading || !businesses || businesses.length === 0) return null

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide py-2">
          {businesses.map(b => (
            <a key={b.id} href={b.slug_url} className="flex-shrink-0 group flex flex-col items-center gap-2">
              <div className="relative">
                <img
                  src={b.logo_url || '/img/placeholder.png'}
                  alt={b.name}
                  width={64}
                  height={64}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-100 shadow-sm group-hover:border-primary transition-all"
                  onError={(e) => { e.currentTarget.src = '/img/placeholder.png' }}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                {b.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
})

BusinessLogos.displayName = 'BusinessLogos'

export default BusinessLogos
