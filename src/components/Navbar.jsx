import { memo } from 'react'
import { Search, X } from 'lucide-react'

const Navbar = memo(({ onSearch, value }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b px-4 py-3">
      <div className="max-w-4xl mx-auto flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <img
              src="https://nqjdtwocsnruptnkaucd.supabase.co/storage/v1/object/public/imagenes/t_traigo.png"
              alt="T! Traigo"
              className="h-10 w-auto object-contain"
              loading="eager"
              decoding="async"
            />
            <span>| Comidas</span>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="search"
            value={value}
            placeholder="Buscar platos, ingredientes o negocios..."
            onChange={(e) => onSearch(e.target.value)}
            autoComplete="off"
            className="w-full pl-10 pr-10 py-2.5 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
          {value && (
            <button
              onClick={() => onSearch('')}
              aria-label="Limpiar búsqueda"
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </nav>
  )
})

Navbar.displayName = 'Navbar'

export default Navbar
