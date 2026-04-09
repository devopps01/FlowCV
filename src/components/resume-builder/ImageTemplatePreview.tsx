'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageTemplatePreviewProps {
  imageUrl?: string | null;
  className?: string;
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const ASPECT_RATIO = A4_WIDTH_MM / A4_HEIGHT_MM;

const ImageTemplatePreview: React.FC<ImageTemplatePreviewProps> = ({ 
  imageUrl, 
  className = '' 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setError(false);
  }, [imageUrl]);

  if (!imageUrl) {
    return (
      <div className={`relative bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
        style={{ aspectRatio: `${A4_WIDTH_MM}/${A4_HEIGHT_MM}` }}>
        <div className="text-center p-4">
          <div className="text-4xl mb-2">📄</div>
          <p className="text-sm text-gray-500">No preview available</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative bg-red-50 rounded-lg flex items-center justify-center ${className}`}
        style={{ aspectRatio: `${A4_WIDTH_MM}/${A4_HEIGHT_MM}` }}>
        <div className="text-center p-4">
          <div className="text-4xl mb-2">❌</div>
          <p className="text-sm text-red-500">Failed to load image</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden rounded-lg bg-white border-2 border-gray-200 ${className}`}
      style={{ aspectRatio: `${A4_WIDTH_MM}/${A4_HEIGHT_MM}` }}
    >
      <div className="absolute inset-0">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-2" 
                style={{ borderTopColor: '#7c3aed' }} />
              <p className="text-xs text-gray-500">Loading...</p>
            </div>
          </div>
        )}
        <img
          src={imageUrl}
          alt="Resume Preview"
          className={`w-full h-full object-contain ${imageLoaded ? 'block' : 'hidden'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setError(true)}
        />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-300 to-gray-400" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-300 to-gray-400" />
    </div>
  );
};

interface A4ImagePreviewProps {
  src: string;
  alt?: string;
  className?: string;
}

export const A4ImagePreview: React.FC<A4ImagePreviewProps> = ({ 
  src, 
  alt = 'Resume Preview',
  className = '' 
}) => {
  return (
    <div className="relative">
      <div className="relative bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden"
        style={{ 
          width: '210mm',
          maxWidth: '100%',
          aspectRatio: `${A4_WIDTH_MM}/${A4_HEIGHT_MM}`,
        }}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
          style={{ display: 'block' }}
        />
      </div>
      
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg -z-10 opacity-30 blur-sm" />
    </div>
  );
};

interface TemplateImageUploaderProps {
  onUpload: (file: File, previewUrl: string) => void;
  previewUrl?: string | null;
  accept?: string;
  className?: string;
}

export const TemplateImageUploader: React.FC<TemplateImageUploaderProps> = ({
  onUpload,
  previewUrl,
  accept = 'image/*',
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(previewUrl || null);

  useEffect(() => {
    setLocalPreview(previewUrl || null);
  }, [previewUrl]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string;
      setLocalPreview(previewUrl);
      onUpload(file, previewUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={className}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all ${
          dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {localPreview ? (
          <div className="relative">
            <ImageTemplatePreview imageUrl={localPreview} className="max-h-48 mx-auto" />
            <p className="mt-2 text-xs text-gray-500">Click or drag to replace</p>
          </div>
        ) : (
          <div className="py-6">
            <div className="text-4xl mb-2">🖼️</div>
            <p className="text-sm text-gray-600 font-medium">Drop image here or click to upload</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageTemplatePreview;
