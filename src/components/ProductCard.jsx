import { memo } from 'react'

const ProductCard = memo(({ product }) => {
  const isOutOfStock = product.stock <= 0

  const url = (() => {
    try {
      const u = new URL(product.business_url)
      u.searchParams.set('p', product.id)
      return u.toString()
    } catch {
      return product.business_url
    }
  })()

  return (
    <a
      href={isOutOfStock ? undefined : url}
      aria-disabled={isOutOfStock}
      className={`relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col transition-all duration-300 ${
        isOutOfStock ? 'opacity-60 grayscale-[80%] pointer-events-none' : 'hover:shadow-lg cursor-pointer'
      }`}
    >
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
        {product.isOffer && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            OFERTA
          </span>
        )}
        {product.featured && (
          <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            DESTACADO
          </span>
        )}
      </div>

      <div className="absolute bottom-[108px] left-2 z-10">
        <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded-md shadow-sm uppercase tracking-tighter border border-white/10">
          {product.business_name}
        </span>
      </div>

      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image?.[0] || '/img/placeholder.png'}
          className="w-full h-full object-cover"
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={(e) => { e.currentTarget.src = '/img/placeholder.png' }}
        />
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-bold text-sm text-gray-800 line-clamp-1 uppercase tracking-tight">{product.name}</h3>
        <p className="text-gray-500 text-[10px] mt-1 line-clamp-2 flex-grow leading-tight">
          {product.description || 'Sin descripción disponible'}
        </p>
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
          <span className="text-primary font-black text-sm">
            ${new Intl.NumberFormat('es-CO').format(product.price)}
          </span>
          {isOutOfStock && <span className="text-[9px] text-red-500 font-bold uppercase">Agotado</span>}
        </div>
      </div>
    </a>
  )
})

ProductCard.displayName = 'ProductCard'

export default ProductCard
