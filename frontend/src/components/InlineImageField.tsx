import React, { useState, useRef, useCallback, memo, useEffect } from 'react';
import { TradeImage } from '../types/trading';
import { X, Plus, ImageIcon } from 'lucide-react';

interface InlineImageFieldProps {
  images: TradeImage[];
  onAddImage: (image: TradeImage) => void;
  onRemoveImage: (imageId: string) => void;
  maxImages?: number;
  readOnly?: boolean;
}

const InlineImageFieldComponent = ({ 
  images, 
  onAddImage, 
  onRemoveImage, 
  maxImages = 3,
  readOnly = false
}: InlineImageFieldProps) => {
  // DEBUG LOGGING (REDUCED)
  // console.log('[DEBUG] InlineImageField render - images:', images?.length || 0);
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Safe images array to prevent undefined errors
  const safeImages = images || [];

  // DEBUG: Monitor images changes (REDUCED)
  // useEffect(() => {
  //   console.log('[DEBUG] InlineImageField images changed:', safeImages.length);
  // }, [safeImages.length]);

  // Función para generar ID único (OPTIMIZADA)
  const generateId = useCallback(() => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }, []);

  const createThumbnail = useCallback((originalUrl: string, fileName: string) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Thumbnail fijo de 60x60
        const maxSize = 60;
        canvas.width = maxSize;
        canvas.height = maxSize;
        
        if (ctx) {
          // Dibujar imagen centrada y recortada
          const { width, height } = img;
          const size = Math.min(width, height);
          const x = (width - size) / 2;
          const y = (height - size) / 2;
          
          ctx.drawImage(img, x, y, size, size, 0, 0, maxSize, maxSize);
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          const newImage: TradeImage = {
            id: generateId(),
            name: fileName,
            url: originalUrl,
            thumbnail: thumbnailUrl,
          };
          
          onAddImage(newImage);
        }
      };
      
      img.onerror = () => {
        console.error('[DEBUG] Error loading image for thumbnail');
      };
      
      img.src = originalUrl;
    } catch (error) {
      console.error('[DEBUG] Error in createThumbnail:', error);
    }
  }, [generateId, onAddImage]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || readOnly) return;

      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/') && safeImages.length < maxImages) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
              createThumbnail(result, file.name);
            }
          };
          reader.readAsDataURL(file);
        }
      });
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('[DEBUG] Error in handleFileUpload:', error);
    }
  }, [readOnly, safeImages.length, maxImages, createThumbnail]);



  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (readOnly || safeImages.length >= maxImages) return;
    
    try {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const result = event.target?.result as string;
              if (result) {
                createThumbnail(result, `pasted-image-${Date.now()}.png`);
              }
            };
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    } catch (error) {
      console.error('[DEBUG] Error in handlePaste:', error);
    }
  }, [readOnly, safeImages.length, maxImages, createThumbnail]);

  return (
    <div className="inline-image-field">
      {/* Imágenes existentes */}
      <div className="flex flex-wrap gap-1 items-center h-full">
        {safeImages.map((image) => (
          <div 
            key={image.id} 
            className="relative group flex-shrink-0"
            onMouseEnter={() => setPreviewImage(image.url)}
            onMouseLeave={() => setPreviewImage(null)}
          >
            <img
              src={image.thumbnail}
              alt={image.name}
              className="w-14 h-14 object-cover rounded border border-gray-600 hover:border-blue-500 transition-colors cursor-pointer"
            />
            
            {!readOnly && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(image.id);
                }}
                className="absolute -top-1 -right-1 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 text-xs"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            )}
          </div>
        ))}

        {/* Botón agregar imagen */}
        {!readOnly && safeImages.length < maxImages && (
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 border-2 border-dashed border-gray-600 rounded hover:border-blue-500 transition-colors flex items-center justify-center text-gray-400 hover:text-blue-400"
              title="Agregar imagen o pegar con Ctrl+V"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Input invisible para archivos */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Área de paste invisible */}
        {!readOnly && (
          <div
            contentEditable
            suppressContentEditableWarning
            onPaste={handlePaste}
            className="opacity-0 absolute inset-0 cursor-default"
            style={{ fontSize: 0, lineHeight: 0 }}
          />
        )}
      </div>

      {/* Modal de preview */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {/* Empty state cuando no hay imágenes */}
      {safeImages.length === 0 && readOnly && (
        <div className="flex items-center text-gray-500 text-xs">
          <ImageIcon className="h-3 w-3 mr-1" />
          Sin imágenes
        </div>
      )}
    </div>
  );
};

// Export optimized component with React.memo for performance
export const InlineImageField = memo(InlineImageFieldComponent);
