import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { stableShuffle, getSessionSeed } from '../utils/shuffle'

const SearchContext = createContext()

const CACHE_KEY = 'ttraigo_catalog_v2'
const CACHE_TTL_MS = 5 * 60 * 1000
const PAGE_SIZE = 20

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL_MS) return null
    return data
  } catch {
    return null
  }
}

function writeCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
  } catch {}
}

export const SearchProvider = ({ children }) => {
  const [allProducts, setAllProducts] = useState([])
  const [displayProducts, setDisplayProducts] = useState([])
  const [banners, setBanners] = useState([])
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasNext: false })
  const seedRef = useRef(getSessionSeed())

  const generateHomeLayout = useCallback((productsPool) => {
    if (!productsPool.length) return []
    const categoriesMap = {}
    productsPool.forEach(p => {
      if (!categoriesMap[p.category]) categoriesMap[p.category] = []
      if (categoriesMap[p.category].length < 4) categoriesMap[p.category].push(p)
    })
    const pool = Object.values(categoriesMap).flat()
    return stableShuffle(pool, seedRef.current).slice(0, 32)
  }, [])

  const fetchPage = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) setLoading(true)
      else setLoadingMore(true)

      const { data, error: funcError } = await supabase.functions.invoke('get-global-catalog', {
        body: { page, pageSize: PAGE_SIZE },
      })

      if (funcError) throw funcError

      setAllProducts(prev => {
        const next = append ? [...prev, ...(data?.products || [])] : (data?.products || [])
        return next
      })

      if (!append) {
        setBusinesses(data?.businesses || [])
        setBanners(data?.banners || [])
      } else {
        setBusinesses(prev => [...prev, ...(data?.businesses || [])])
      }

      setPagination(data?.pagination || { page: 1, totalPages: 1, hasNext: false })

      if (!append) {
        setDisplayProducts(generateHomeLayout(data?.products || []))
        writeCache({
          products: data?.products || [],
          businesses: data?.businesses || [],
          banners: data?.banners || [],
          pagination: data?.pagination,
        })
      }
    } catch (err) {
      setError('Error al cargar catálogo')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [generateHomeLayout])

  const loadMore = useCallback(() => {
    if (pagination.hasNext && !loadingMore) {
      fetchPage(pagination.page + 1, true)
    }
  }, [pagination, loadingMore, fetchPage])

  const initData = useCallback(async () => {
    const cached = readCache()
    if (cached) {
      setAllProducts(cached.products || [])
      setBusinesses(cached.businesses || [])
      setBanners(cached.banners || [])
      setPagination(cached.pagination || { page: 1, totalPages: 1, hasNext: false })
      setDisplayProducts(generateHomeLayout(cached.products || []))
      setLoading(false)

      fetchPage(1, false)
      return
    }
    await fetchPage(1, false)
  }, [fetchPage, generateHomeLayout])

  const searchProducts = useCallback((term = '', category = 'Todo') => {
    if (!allProducts.length) return
    let filtered = [...allProducts]
    if (category !== 'Todo') filtered = filtered.filter(p => p.category === category)
    if (term) {
      const t = term.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(t) ||
        p.business_name?.toLowerCase().includes(t) ||
        p.description?.toLowerCase().includes(t)
      )
    }
    const result = (!term && category === 'Todo')
      ? generateHomeLayout(allProducts)
      : filtered
    setDisplayProducts(result)
  }, [allProducts, generateHomeLayout])

  useEffect(() => { initData() }, [])

  return (
    <SearchContext.Provider value={{
      products: displayProducts,
      banners,
      businesses,
      loading,
      loadingMore,
      error,
      searchProducts,
      allProducts,
      pagination,
      loadMore,
      refresh: () => { sessionStorage.removeItem(CACHE_KEY); initData() },
    }}>
      {children}
    </SearchContext.Provider>
  )
}

export const useSearch = () => useContext(SearchContext)
