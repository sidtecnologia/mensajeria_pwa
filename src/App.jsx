import { useState, useMemo, useEffect } from 'react';
import { SearchProvider, useSearch } from './context/SearchContext';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import BannerCarousel from './components/BannerCarousel';
import BusinessLogos from './components/BusinessLogos';
import HorizontalCategory from './components/HorizontalCategory';
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
    const excluded = ['Aderezo', 'Adicional'];
    const cats = [...new Set(allProducts.map(p => p.category))];
    return cats
      .filter(cat => cat && !excluded.includes(cat))
      .sort();
  }, [allProducts]);

  const randomCategories = useMemo(() => {
    if (categories.length === 0) return [];
    const shuffled = [...categories].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [categories]);

  useEffect(() => {
    searchProducts(searchTerm, selectedCategory);
  }, [searchTerm, selectedCategory, allProducts]);

  const banners = [
    'https://ogycxpjbzmynkyivmdsz.supabase.co/storage/v1/object/public/images/baner/baner1.webp',
    'https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/baner2.webp',
    'https://flqtcvqykladelzvxrue.supabase.co/storage/v1/object/public/images/baner/baner3.webp',
    'https://nqjdtwocsnruptnkaucd.supabase.co/storage/v1/object/public/images/baner/baner1.webp',
    'https://nqjdtwocsnruptnkaucd.supabase.co/storage/v1/object/public/imagenes/t_traigo.jpg'

  ];

  const isHome = !searchTerm && selectedCategory === 'Todo';

  const rows = useMemo(() => {
    const size = 8;
    const result = [];
    for (let i = 0; i < products.length; i += size) {
      result.push(products.slice(i, i + size));
    }
    return result;
  }, [products]);

  const middleIndex = Math.floor(rows.length / 2);

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
                <p className="font-bold animate-pulse text-lg">Cargando...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 text-red-500 font-bold bg-white rounded-2xl shadow-sm">{error}</div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
                    {isHome ? (
                      <><Sparkles className="text-yellow-500 w-5 h-5" /> Recomendados del Día</>
                    ) : (
                      `Encontramos ${products.length} opciones`
                    )}
                  </h2>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    No encontramos lo que buscas, intenta con otra palabra.
                  </div>
                ) : (
                  <div className="flex flex-col">
                    
                    {isHome && randomCategories[0] && (
                      <HorizontalCategory 
                        category={randomCategories[0]} 
                        allProducts={allProducts} 
                      />
                    )}

                    {rows.map((row, index) => (
                      <div key={`row-container-${index}`}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                          {row.map(p => (
                            <ProductCard key={`${p.business_id}-${p.id}`} product={p} />
                          ))}
                        </div>

                        {isHome && index === middleIndex && randomCategories[1] && rows.length > 1 && (
                          <HorizontalCategory 
                            category={randomCategories[1]} 
                            allProducts={allProducts} 
                          />
                        )}
                      </div>
                    ))}

                    {isHome && randomCategories[2] && (
                      <HorizontalCategory 
                        category={randomCategories[2]} 
                        allProducts={allProducts} 
                      />
                    )}
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