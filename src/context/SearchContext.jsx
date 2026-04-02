import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const SearchContext = createContext()

export const SearchProvider = ({ children }) => {
  const [allProducts, setAllProducts] = useState([])
  const [displayProducts, setDisplayProducts] = useState([])
  const [banners, setBanners] = useState([])
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const shuffle = (array) => [...array].sort(() => Math.random() - 0.5)

  const generateHomeLayout = (productsPool) => {
    if (!productsPool.length) return []
    const categoriesMap = {}
    productsPool.forEach(p => {
      if (!categoriesMap[p.category]) categoriesMap[p.category] = []
      if (categoriesMap[p.category].length < 4) {
        categoriesMap[p.category].push(p)
      }
    })
    return shuffle(Object.values(categoriesMap).flat()).slice(0, 32)
  }

  const initData = async () => {
    try {
      setLoading(true)
      const { data, error: funcError } = await supabase.functions.invoke('get-global-catalog')
      
      if (funcError) throw funcError

      const prods = data?.products || []
      const brands = data?.businesses || []
      const bans = data?.banners || []

      setAllProducts(prods)
      setBusinesses(brands)
      setBanners(bans)
      setDisplayProducts(generateHomeLayout(prods))
      setError(null)
    } catch (err) {
      setError('Error al cargar catálogo')
    } finally {
      setLoading(false)
    }
  }

  const searchProducts = (term = '', category = 'Todo') => {
    let filtered = allProducts
    if (category !== 'Todo') filtered = filtered.filter(p => p.category === category)
    if (term) {
      const t = term.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(t) || 
        p.business_name.toLowerCase().includes(t)
      )
    }
    setDisplayProducts(term === '' && category === 'Todo' ? generateHomeLayout(allProducts) : filtered)
  }

  useEffect(() => { initData() }, [])

  return (
    <SearchContext.Provider value={{ 
      products: displayProducts, 
      banners, 
      businesses,
      loading, 
      error, 
      searchProducts, 
      allProducts, 
      refresh: initData 
    }}>
      {children}
    </SearchContext.Provider>
  )
}

export const useSearch = () => useContext(SearchContext)