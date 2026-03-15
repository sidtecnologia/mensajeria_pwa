import { Download, X } from 'lucide-react';

const InstallToast = ({ isVisible, onInstall, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 z-[100] md:left-auto md:right-6 md:w-96 animate-bounce-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-xl">
          <Download className="w-6 h-6 text-primary" />
        </div>
        
        <div className="flex-grow">
          <h4 className="text-sm font-bold text-gray-900">¿Instalar App?</h4>
          <p className="text-xs text-gray-500">Accede más rápido y pide tus comidas favoritas.</p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onInstall}
            className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:brightness-110 transition-all"
          >
            Instalar
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallToast;