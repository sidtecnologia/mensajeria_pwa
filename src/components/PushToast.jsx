import { Bell, X } from 'lucide-react'

const PushToast = ({ isVisible, onSubscribe, onClose, loading }) => {
  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 left-4 right-4 z-[100] animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="max-w-md mx-auto bg-gray-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2.5 rounded-xl shrink-0">
              <Bell className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-tight leading-tight">
                ¡No te pierdas las ofertas! 🔥
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                Activá las notificaciones y enterate primero de los mejores platos y promociones.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-white transition-colors shrink-0 mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={onSubscribe}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Bell className="w-3.5 h-3.5" />
            )}
            {loading ? 'Activando...' : 'Activar notificaciones'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white/10 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-white/20 transition-all"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  )
}

export default PushToast
