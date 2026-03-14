import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

const HorizontalCategory = ({ category, allProducts }) => {
  const scrollRef = useRef(null);
  const excludedCategories = ['Aderezo', 'Adicional'];

  if (excludedCategories.includes(category)) return null;

  const categoryProducts = allProducts
    .filter(p => p.category === category)
    .sort(() => Math.random() - 0.5)
    .slice(0, 12);

  if (categoryProducts.length === 0) return null;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.8 
        : scrollLeft + clientWidth * 0.8;
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="my-8 -mx-4 px-4 py-8 bg-white border-y border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto relative group">
        <div className="flex items-center justify-between mb-5 px-2">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-3 uppercase tracking-tighter">
            <span className="w-1.5 h-8 bg-primary rounded-full"></span>
            Más de {category}
          </h3>
        </div>

        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl border border-gray-100 rounded-full p-2 hidden md:flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-90"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide touch-scroll scroll-smooth px-2"
        >
          {categoryProducts.map(p => (
            <div key={`${p.business_id}-${p.id}-h`} className="w-[180px] sm:w-[240px] flex-shrink-0">
              <ProductCard product={p} />
            </div>
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl border border-gray-100 rounded-full p-2 hidden md:flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-90"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default HorizontalCategory;