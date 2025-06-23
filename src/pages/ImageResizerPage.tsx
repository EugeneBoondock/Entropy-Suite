import React, { useState, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';

interface ResizeOptions {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  quality: number;
  format: 'png' | 'jpeg' | 'webp';
}

interface ProcessedImage {
  id: string;
  name: string;
  originalFile: File;
  originalSize: { width: number; height: number };
  processedDataUrl: string;
  processedSize: { width: number; height: number };
  fileSize: number;
}

const ImageResizerPage: React.FC = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resizeOptions, setResizeOptions] = useState<ResizeOptions>({
    width: 800,
    height: 600,
    maintainAspectRatio: true,
    quality: 0.9,
    format: 'jpeg'
  });

  const handleFiles = useCallback(async (files: FileList) => {
    setIsProcessing(true);
    setError(null);
    
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      setError('Please select valid image files');
      setIsProcessing(false);
      return;
    }

    try {
      const processedImages = await Promise.all(
        imageFiles.map(file => processImage(file))
      );
      
      setImages(prev => [...prev, ...processedImages]);
    } catch (err) {
      setError('Failed to process images');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const processImage = (file: File): Promise<ProcessedImage> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        try {
          const originalWidth = img.naturalWidth;
          const originalHeight = img.naturalHeight;
          
          let { width, height } = resizeOptions;
          
          if (resizeOptions.maintainAspectRatio) {
            const aspectRatio = originalWidth / originalHeight;
            if (width / height > aspectRatio) {
              width = height * aspectRatio;
            } else {
              height = width / aspectRatio;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx!.fillStyle = 'white';
          ctx!.fillRect(0, 0, width, height);
          ctx!.drawImage(img, 0, 0, width, height);

          const processedDataUrl = canvas.toDataURL(
            `image/${resizeOptions.format}`,
            resizeOptions.quality
          );

          // Calculate file size (approximate)
          const base64Length = processedDataUrl.split(',')[1].length;
          const fileSize = Math.round(base64Length * 0.75);

          resolve({
            id: Date.now().toString() + Math.random().toString(36),
            name: file.name,
            originalFile: file,
            originalSize: { width: originalWidth, height: originalHeight },
            processedDataUrl,
            processedSize: { width: Math.round(width), height: Math.round(height) },
            fileSize
          });
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const downloadImage = (image: ProcessedImage) => {
    const link = document.createElement('a');
    link.href = image.processedDataUrl;
    link.download = `resized_${image.name.split('.')[0]}.${resizeOptions.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    images.forEach(image => {
      setTimeout(() => downloadImage(image), 100);
    });
  };

  const clearAll = () => {
    setImages([]);
    setError(null);
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex size-full min-h-screen flex-col bg-[#f6f0e4]" style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}>
      <Navbar />
      
      <main className="flex-1 px-4 sm:px-10 md:px-20 lg:px-40 py-5">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-[#382f29] text-3xl font-bold">Image Resizer</h1>
              <p className="text-[#b8a99d] text-lg mt-2">Resize images to desired dimensions with quality control</p>
            </div>
            
            {images.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={downloadAll}
                  className="px-4 py-2 bg-[#382f29] text-white rounded-lg hover:bg-[#4a3f37] transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download All
                </button>
                <button
                  onClick={clearAll}
                  className="px-4 py-2 border border-[#382f29] text-[#382f29] rounded-lg hover:bg-[#382f29] hover:text-white transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Resize Options */}
          <div className="bg-white rounded-xl border border-[#e0d5c7] p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#382f29] mb-4">Resize Options</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#382f29] mb-2">Width (px)</label>
                  <input
                    type="number"
                    value={resizeOptions.width}
                    onChange={(e) => setResizeOptions(prev => ({
                      ...prev,
                      width: parseInt(e.target.value) || 0
                    }))}
                    className="w-full border border-[#e0d5c7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#382f29] mb-2">Height (px)</label>
                  <input
                    type="number"
                    value={resizeOptions.height}
                    onChange={(e) => setResizeOptions(prev => ({
                      ...prev,
                      height: parseInt(e.target.value) || 0
                    }))}
                    className="w-full border border-[#e0d5c7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#382f29] mb-2">Quality</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={resizeOptions.quality}
                    onChange={(e) => setResizeOptions(prev => ({
                      ...prev,
                      quality: parseFloat(e.target.value)
                    }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-[#b8a99d]">
                    <span>Low</span>
                    <span>{Math.round(resizeOptions.quality * 100)}%</span>
                    <span>High</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#382f29] mb-2">Format</label>
                  <select
                    value={resizeOptions.format}
                    onChange={(e) => setResizeOptions(prev => ({
                      ...prev,
                      format: e.target.value as 'png' | 'jpeg' | 'webp'
                    }))}
                    className="w-full border border-[#e0d5c7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                  >
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="aspectRatio"
                    checked={resizeOptions.maintainAspectRatio}
                    onChange={(e) => setResizeOptions(prev => ({
                      ...prev,
                      maintainAspectRatio: e.target.checked
                    }))}
                    className="mr-2"
                  />
                  <label htmlFor="aspectRatio" className="text-sm font-medium text-[#382f29]">
                    Maintain aspect ratio
                  </label>
                </div>

                <div className="text-sm text-[#b8a99d]">
                  <p className="mb-2">Quick presets:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'HD', width: 1920, height: 1080 },
                      { name: 'Square', width: 1000, height: 1000 },
                      { name: 'Thumb', width: 300, height: 300 },
                      { name: 'Banner', width: 1200, height: 400 }
                    ].map(preset => (
                      <button
                        key={preset.name}
                        onClick={() => setResizeOptions(prev => ({
                          ...prev,
                          width: preset.width,
                          height: preset.height
                        }))}
                        className="px-2 py-1 bg-[#e0d5c7] text-[#382f29] rounded text-xs hover:bg-[#d0c5b7] transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors duration-200 mb-6 ${
              dragActive 
                ? 'border-[#382f29] bg-[#382f29]/5' 
                : 'border-[#e0d5c7] hover:border-[#382f29] hover:bg-[#382f29]/5'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-4">
              <svg className="mx-auto w-16 h-16 text-[#b8a99d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              
              <div>
                <p className="text-xl font-semibold text-[#382f29] mb-2">
                  {dragActive ? 'Drop images here' : 'Drag and drop images here'}
                </p>
                <p className="text-[#b8a99d] mb-4">or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-[#382f29] text-white rounded-lg hover:bg-[#4a3f37] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isProcessing ? 'Processing...' : 'Select Images'}
                </button>
              </div>
              
              <p className="text-sm text-[#b8a99d]">
                Supports: JPG, PNG, GIF, WebP, BMP
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
              {error}
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-[#382f29] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[#382f29] font-medium">Processing images...</span>
              </div>
            </div>
          )}

          {/* Results */}
          {images.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-[#382f29] mb-4">
                Processed Images ({images.length})
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map(image => (
                  <div key={image.id} className="bg-white rounded-lg border border-[#e0d5c7] overflow-hidden shadow-sm">
                    <div className="aspect-video bg-gray-100 relative">
                      <img
                        src={image.processedDataUrl}
                        alt={image.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-medium text-[#382f29] mb-2 truncate">{image.name}</h3>
                      
                      <div className="space-y-2 text-sm text-[#b8a99d]">
                        <div className="flex justify-between">
                          <span>Original:</span>
                          <span>{image.originalSize.width} × {image.originalSize.height}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Resized:</span>
                          <span>{image.processedSize.width} × {image.processedSize.height}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span>{formatFileSize(image.fileSize)}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => downloadImage(image)}
                          className="flex-1 px-3 py-2 bg-[#382f29] text-white rounded-lg hover:bg-[#4a3f37] transition-colors duration-200 text-sm flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download
                        </button>
                        <button
                          onClick={() => removeImage(image.id)}
                          className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200 text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {images.length === 0 && !isProcessing && (
            <div className="text-center py-12">
              <svg className="mx-auto w-16 h-16 text-[#b8a99d] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-[#b8a99d] text-lg">Upload images to get started</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ImageResizerPage; 