import { useMemo } from 'react'

export const useHomeLayout = (products, allProducts, searchTerm, selectedCategory) => {
  const categories = useMemo(() => {
    const cats = [...new Set(allProducts.map(p => p.category))]
    return cats.filter(Boolean).sort()
  }, [allProducts])

  const layout = useMemo(() => {
    const isHome = !searchTerm && selectedCategory === 'Todo'
    
    const chunks = []
    const size = 8
    for (let i = 0; i < products.length; i += size) {
      chunks.push(products.slice(i, i + size))
    }

    const midIdx = Math.floor(chunks.length / 2)
    const randomCats = [...categories].sort(() => 0.5 - Math.random()).slice(0, 2)

    return { rows: chunks, sections: randomCats, midIdx, isHome }
  }, [products, categories, searchTerm, selectedCategory])

  return { categories, ...layout }
}