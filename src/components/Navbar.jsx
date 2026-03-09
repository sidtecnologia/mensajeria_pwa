import { Search, MapPin } from 'lucide-react';

const Navbar = ({ onSearch }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <MapPin className="w-6 h-6" />
            <span>Catálogo de Comidas | El Socorro</span>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar platos, ingredientes o negocios..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;