import { RefreshCw, X } from 'lucide-react'

const UpdateToast = ({ isVisible, onUpdate, onClose }) => {
  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 left-4 right-4 z-[101] animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="max-w-md mx-auto bg-gray-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl">
            <RefreshCw className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-tight">Nueva versión disponible</p>
            <p className="text-[11px] text-gray-400">Vamos a actualizar...</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onUpdate}
            className="bg-white text-black text-[11px] font-black px-4 py-2 rounded-lg uppercase hover:bg-gray-200 active:scale-95 transition-all"
          >
            OK
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default UpdateToast