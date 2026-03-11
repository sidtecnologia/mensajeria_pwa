import { useState, useMemo, useEffect } from 'react';
import { SearchProvider, useSearch } from './context/SearchContext';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import BannerCarousel from './components/BannerCarousel';
import BusinessLogos from './components/BusinessLogos';
import { Loader2, Sparkles } from 'lucide-react';

const Categories = ({ categories, selected, onSelect }) => (
  <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-4 scrollbar-hide">
    <button
      onClick={() => onSelect('Todo')}
      className={`flex-shrink-0 flex items-center gap-2 px-5 py-2 rounded-full border text-sm transition-all ${
        selected === 'Todo' ? 'bg-primary text-white border-primary shadow-md font-bold' : 'bg-white border-gray-200 text-gray-600'
      }`}
    >
      Todo
    </button>
    {categories.map(cat => (
      <button
        key={cat}
        onClick={() => onSelect(cat)}
        className={`flex-shrink-0 flex items-center gap-2 px-5 py-2 rounded-full border text-sm transition-all ${
          selected === cat ? 'bg-primary text-white border-primary shadow-md font-bold' : 'bg-white border-gray-200 text-gray-600'
        }`}
      >
        <span className="whitespace-nowrap">{cat}</span>
      </button>
    ))}
  </div>
);

const MainContent = () => {
  const { products, loading, error, searchProducts, allProducts } = useSearch();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todo');

  const categories = useMemo(() => {
    const cats = [...new Set(allProducts.map(p => p.category))];
    return cats.filter(Boolean).sort();
  }, [allProducts]);

  useEffect(() => {
    searchProducts(searchTerm, selectedCategory);
  }, [searchTerm, selectedCategory, allProducts]);

  const banners = [
    'https://ogycxpjbzmynkyivmdsz.supabase.co/storage/v1/object/public/images/baner/baner1.webp',
    'https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/baner2.webp',
    'https://flqtcvqykladelzvxrue.supabase.co/storage/v1/object/public/images/baner/baner3.webp'
  ];

  const isHome = !searchTerm && selectedCategory === 'Todo';

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Navbar onSearch={setSearchTerm} value={searchTerm} />
      
      <main className="w-full mx-auto">
        {isHome && <BannerCarousel images={banners} />}
        {isHome && <BusinessLogos />}

        <div className="max-w-6xl mx-auto">
          <Categories
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />

          <div className="px-4 mt-6">
            {loading && allProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-primary">
                <Loader2 className="animate-spin w-12 h-12" />
                <p className="font-bold animate-pulse">Cocinando resultados...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 text-red-500 font-bold bg-white rounded-2xl shadow-sm">{error}</div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
                    {isHome ? (
                      <><Sparkles className="text-yellow-500 w-5 h-5" /> Sugerencias del día</>
                    ) : (
                      `Encontramos ${products.length} productos`
                    )}
                  </h2>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                    No hay productos que coincidan con tu búsqueda.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {products.map(p => (
                      <ProductCard key={`${p.business_id}-${p.id}`} product={p} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const App = () => (
  <SearchProvider>
    <MainContent />
  </SearchProvider>
);

export default App;