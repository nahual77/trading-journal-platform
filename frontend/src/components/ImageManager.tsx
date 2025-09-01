import React, { useState, useRef } from 'react';
import { TradeImage } from '../types/trading';
import { X, Upload, ImageIcon } from 'lucide-react';

interface ImageManagerProps {
  images: TradeImage[];
  onAddImage: (image: TradeImage) => void;
  onRemoveImage: (imageId: string) => void;
  maxImages?: number;
}

export function ImageManager({ images, onAddImage, onRemoveImage, maxImages = 5 }: ImageManagerProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            // Crear thumbnail (versión reducida)
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
  };

  const createThumbnail = (originalUrl: string, fileName: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular dimensiones del thumbnail (máximo 150x150 manteniendo aspecto)
      const maxSize = 150;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        const newImage: TradeImage = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: fileName,
          url: originalUrl,
          thumbnail: thumbnailUrl,
        };
        
        onAddImage(newImage);
      }
    };

    img.src = originalUrl;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) {
            createThumbnail(result, file.name);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className="border-2 border-dashed border-blue-500/30 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <Upload className="mx-auto h-8 w-8 text-blue-400 mb-2" />
          <p className="text-sm text-gold-300">
            Arrastra imágenes aquí o haz clic para seleccionar
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PNG, JPG, GIF hasta 10MB cada una
          </p>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              {/* Thumbnail */}
              <div
                className="relative w-full h-24 bg-gray-800 rounded-lg overflow-hidden cursor-pointer border border-gray-600 hover:border-blue-500 transition-colors"
                onMouseEnter={() => setPreviewImage(image.url)}
                onMouseLeave={() => setPreviewImage(null)}
              >
                <img
                  src={image.thumbnail}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage(image.id);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              
              {/* Image name */}
              <p className="text-xs text-gray-400 mt-1 truncate">
                {image.name}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
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

      {/* Empty state */}
      {images.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-600 mb-3" />
          <p className="text-sm">No hay screenshots subidos</p>
        </div>
      )}
    </div>
  );
}
