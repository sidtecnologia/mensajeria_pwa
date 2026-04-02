import { useState, useEffect, useMemo } from 'react'
import { SearchProvider, useSearch } from './context/SearchContext'
import Navbar from './components/Navbar'
import ProductCard from './components/ProductCard'
import BannerCarousel from './components/BannerCarousel'
import BusinessLogos from './components/BusinessLogos'
import HorizontalCategory from './components/HorizontalCategory'
import InstallToast from './components/InstallToast'
import { usePWAInstall } from './hooks/usePWAInstall'
import { Loader2, Flame } from 'lucide-react'

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
  const { products, banners, loading, error, searchProducts, allProducts } = useSearch()
  const { isVisible, handleInstall, closeToast } = usePWAInstall()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todo')

  const categories = useMemo(() => {
    return [...new Set(allProducts.map(p => p.category))].filter(Boolean).sort()
  }, [allProducts])

  const sections = useMemo(() => {
    return [...categories].sort(() => 0.5 - Math.random()).slice(0, 2)
  }, [categories])

  useEffect(() => {
    searchProducts(searchTerm, selectedCategory)
  }, [searchTerm, selectedCategory, allProducts, searchProducts])

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
              <p className="font-black text-sm animate-pulse uppercase tracking-widest text-center">Cargando...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-500 font-bold bg-white rounded-3xl shadow-sm border border-red-50">{error}</div>
          ) : (
            <div className="mt-6">
              <h2 className="text-xl font-black text-gray-800 flex items-center gap-3 mb-6 uppercase tracking-tighter">
                {isHome ? (
                  <>
                    <div className="bg-orange-100 p-1.5 rounded-lg">
                      <Flame className="text-orange-600 w-5 h-5 fill-orange-600" />
                    </div>
                    RECOMENDADOS
                  </>
                ) : (
                  `RESULTADOS (${products.length})`
                )}
              </h2>
              <div className="flex flex-col">
                {isHome && sections[0] && <HorizontalCategory category={sections[0]} allProducts={allProducts} />}
                {rows.map((row, idx) => (
                  <div key={`row-chunk-${idx}`}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
                      {row.map(p => <ProductCard key={`${p.business_id}-${p.id}`} product={p} />)}
                    </div>
                    {isHome && idx === 0 && sections[1] && <HorizontalCategory category={sections[1]} allProducts={allProducts} />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <InstallToast isVisible={isVisible} onInstall={handleInstall} onClose={closeToast} />
    </div>
  )
}

const App = () => (
  <SearchProvider>
    <MainContent />
  </SearchProvider>
)

export default App;