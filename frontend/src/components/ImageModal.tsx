import React from 'react';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  imageName: string | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ 
  isOpen, 
  imageUrl, 
  imageName, 
  onClose 
}) => {
  if (!isOpen || !imageUrl) return null;

  // Manejar tecla Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh] p-4">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 w-8 h-8 bg-black bg-opacity-50 text-white text-2xl rounded-full flex items-center justify-center hover:bg-opacity-75 transition-opacity"
          title="Cerrar (Esc)"
        >
          ×
        </button>
        
        {/* Imagen en resolución original */}
        <img
          src={imageUrl}
          alt={imageName || 'Imagen'}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        
        {/* Nombre de la imagen */}
        {imageName && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
            {imageName}
          </div>
        )}
      </div>
    </div>
  );
};
