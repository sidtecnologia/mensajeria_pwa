const ProductCard = ({ product }) => {
  const isOutOfStock = product.stock <= 0;

  const handleClick = () => {
    if (isOutOfStock) return;
    const url = new URL(product.business_url);
    url.searchParams.set('p', product.id);
    window.location.href = url.toString();
  };

  return (
    <div 
      onClick={handleClick}
      className={`relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col transition-all duration-300 ${
        isOutOfStock ? 'opacity-60 grayscale-[80%]' : 'cursor-pointer hover:shadow-lg'
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

      <img 
        src={product.image?.[0] || '/img/placeholder.png'} 
        className="w-full aspect-square object-cover" 
        alt={product.name}
        loading="lazy"
      />
      
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-bold text-sm text-gray-800 line-clamp-1">{product.name}</h3>
        
        <p className="text-gray-500 text-[11px] mt-1 line-clamp-3 flex-grow">
          {product.description || 'Sin descripción disponible'}
        </p>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
          <p className="text-primary font-bold text-sm">${product.price?.toLocaleString()}</p>
          <span className="text-[10px] text-gray-400 font-medium truncate ml-2">
            {product.business_name}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;