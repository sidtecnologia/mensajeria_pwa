import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { businessesConfig } from '../lib/businesses';

const SearchContext = createContext();

const clients = businessesConfig
  .filter(b => b.supabaseUrl && b.supabaseKey)
  .map(business => ({
    ...business,
    client: createClient(business.supabaseUrl, business.supabaseKey, {
      auth: { persistSession: false }
    })
  }));

export const SearchProvider = ({ children }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

  const generateHomeLayout = (productsPool) => {
    const categoriesMap = {};
    const shuffledPool = shuffle(productsPool).sort((a, b) => b.business_priority - a.business_priority);
    
    shuffledPool.forEach(p => {
      if (!categoriesMap[p.category]) categoriesMap[p.category] = [];
      if (categoriesMap[p.category].length < 3) {
        categoriesMap[p.category].push(p);
      }
    });

    const homeProducts = Object.values(categoriesMap).flat();
    return shuffle(homeProducts).slice(0, 20);
  };

  const searchProducts = async (searchTerm = '', category = 'Todo') => {
    if (!searchTerm && category === 'Todo') {
      setDisplayProducts(generateHomeLayout(allProducts));
      return;
    }

    let filtered = allProducts;
    if (category !== 'Todo') {
      filtered = filtered.filter(p => p.category === category);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.description?.toLowerCase().includes(term) ||
        p.business_name.toLowerCase().includes(term)
      );
    }
    setDisplayProducts(filtered);
  };

  const initData = async () => {
    setLoading(true);
    try {
      const promises = clients.map(async (business) => {
        const { data } = await business.client
          .from('products')
          .select('id, name, description, price, image, category, stock, isOffer, featured')
          .gt('stock', 0);
        
        return (data || []).map(p => ({
          ...p,
          business_id: business.id,
          business_name: business.name,
          business_url: business.slug_url,
          business_priority: business.priority
        }));
      });

      const results = await Promise.allSettled(promises);
      const loaded = results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);

      setAllProducts(loaded);
      setDisplayProducts(generateHomeLayout(loaded));
    } catch (err) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { initData(); }, []);

  return (
    <SearchContext.Provider value={{ products: displayProducts, loading, error, searchProducts, allProducts }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);