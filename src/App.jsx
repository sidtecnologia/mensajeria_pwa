import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { SearchProvider, useSearch } from './context/SearchContext'
import Navbar from './components/Navbar'
import ProductCard from './components/ProductCard'
import BannerCarousel from './components/BannerCarousel'
import BusinessLogos from './components/BusinessLogos'
import HorizontalCategory from './components/HorizontalCategory'
import InstallToast from './components/InstallToast'
import UpdateToast from './components/UpdateToast'
import PushToast from './components/PushToast'
import { usePWAInstall } from './hooks/usePWAInstall'
import { useServiceWorker } from './hooks/useServiceWorker'
import { usePushNotifications } from './hooks/usePushNotifications'
import { stableShuffle } from './utils/shuffle'
import { Loader2, Flame, ChevronDown } from 'lucide-react'

const Categories = ({ categories, selected, onSelect }) => (
  <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-4 scrollbar-hide">
    <button
      onClick={() => onSelect('Todo')}
      className={`flex-shrink-0 px-6 py-2 rounded-full border text-sm transition-all font-bold ${
        selected === 'Todo' ? 'bg-primary text-white border-primary shadow-md' : 'bg-white border-gray-200 text-gray-600'
      }`}
    >
      Todo
    </button>
    {categories.map(cat => (
      <button
        key={cat}
        onClick={() => onSelect(cat)}
        className={`flex-shrink-0 px-6 py-2 rounded-full border text-sm transition-all font-bold ${
          selected === cat ? 'bg-primary text-white border-primary shadow-md' : 'bg-white border-gray-200 text-gray-600'
        }`}
      >
        <span className="whitespace-nowrap uppercase tracking-tighter">{cat}</span>
      </button>
    ))}
  </div>
)

const MainContent = () => {
  const { products, banners, loading, loadingMore, error, searchProducts, allProducts, loadMore, pagination } = useSearch()
  const { isVisible, handleInstall, closeToast } = usePWAInstall()
  const { hasUpdate, applyUpdate } = useServiceWorker()
  const { showToast: showPushToast, subscribe, dismissToast, loading: pushLoading } = usePushNotifications()
  const [showUpdateToast, setShowUpdateToast] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todo')
  const seedRef = useRef(Math.floor(Math.random() * 1e9))

  useEffect(() => {
    if (hasUpdate) setShowUpdateToast(true)
  }, [hasUpdate])

  const categories = useMemo(() => {
    return [...new Set(allProducts.map(p => p.category))].filter(Boolean).sort()
  }, [allProducts])

  const sections = useMemo(() => {
    if (categories.length === 0) return []
    return stableShuffle(categories, seedRef.current).slice(0, 2)
  }, [categories])

  useEffect(() => {
    const handler = setTimeout(() => {
      searchProducts(searchTerm, selectedCategory)
    }, 200)
    return () => clearTimeout(handler)
  }, [searchTerm, selectedCategory, searchProducts])

  const isHome = !searchTerm && selectedCategory === 'Todo'

  const rows = useMemo(() => {
    const res = []
    for (let i = 0; i < products.length; i += 8) res.push(products.slice(i, i + 8))
    return res
  }, [products])

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans text-gray-900">
      <Navbar onSearch={setSearchTerm} value={searchTerm} />

      <main>
        {isHome && <BannerCarousel images={banners} />}
        {isHome && <BusinessLogos />}

        <div className="max-w-6xl mx-auto px-4 mt-4">
          <Categories categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />

          {loading && allProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-primary gap-4">
              <Loader2 className="animate-spin w-10 h-10" />
              <p className="font-black text-sm animate-pulse uppercase tracking-widest text-center">Cargando catálogo...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-red-50 px-6">
              <p className="text-red-500 font-bold mb-2 uppercase tracking-tighter">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-xs bg-gray-100 px-4 py-2 rounded-lg font-black uppercase"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <h2 className="text-xl font-black text-gray-800 flex items-center gap-3 mb-6 uppercase tracking-tighter">
                {isHome ? (
                  <>
                    <div className="bg-orange-100 p-1.5 rounded-lg shadow-sm">
                      <Flame className="text-orange-600 w-5 h-5 fill-orange-600" />
                    </div>
                    RECOMENDADOS
                  </>
                ) : (
                  `RESULTADOS (${products.length})`
                )}
              </h2>

              <div className="flex flex-col">
                {isHome && sections[0] && (
                  <HorizontalCategory category={sections[0]} allProducts={allProducts} seed={seedRef.current} />
                )}

                {rows.map((row, idx) => (
                  <div key={`row-chunk-${idx}`}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
                      {row.map(p => (
                        <ProductCard key={`${p.business_id}-${p.id}`} product={p} />
                      ))}
                    </div>
                    {isHome && idx === 0 && sections[1] && (
                      <HorizontalCategory category={sections[1]} allProducts={allProducts} seed={seedRef.current + 1} />
                    )}
                  </div>
                ))}

                {products.length === 0 && !loading && (
                  <div className="text-center py-20">
                    <p className="text-gray-400 font-bold uppercase text-sm tracking-widest">No se encontraron productos</p>
                  </div>
                )}
              </div>

              {isHome && pagination?.hasNext && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 px-8 py-3 bg-white border border-gray-200 rounded-full text-sm font-black uppercase tracking-tighter text-gray-700 hover:border-primary hover:text-primary transition-all shadow-sm disabled:opacity-60"
                  >
                    {loadingMore ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    {loadingMore ? 'Cargando...' : 'Cargar más negocios'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <InstallToast
        isVisible={isVisible}
        onInstall={handleInstall}
        onClose={closeToast}
      />

      <UpdateToast
        isVisible={showUpdateToast}
        onUpdate={applyUpdate}
        onClose={() => setShowUpdateToast(false)}
      />

      <PushToast
        isVisible={showPushToast}
        onSubscribe={subscribe}
        onClose={dismissToast}
        loading={pushLoading}
      />
    </div>
  )
}

const App = () => (
  <SearchProvider>
    <MainContent />
  </SearchProvider>
)

export default App
