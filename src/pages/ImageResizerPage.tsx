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
  originalFileSize: number;
}

const ImageResizerPage: React.FC = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
    setSuccess(null);
    
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      setError('Please select valid image files (JPG, PNG, GIF, WebP, BMP)');
      setIsProcessing(false);
      return;
    }

    if (imageFiles.length > 10) {
      setError('Maximum 10 images allowed at once');
      setIsProcessing(false);
      return;
    }

    try {
      const processedImages = await Promise.all(
        imageFiles.map(file => processImage(file))
      );
      
      setImages(prev => [...prev, ...processedImages]);
      setSuccess(`Successfully processed ${processedImages.length} image(s)!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to process images. Please try again.');
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
          
          // Validate dimensions
          if (width <= 0 || height <= 0) {
            reject(new Error('Invalid dimensions'));
            return;
          }
          
          if (resizeOptions.maintainAspectRatio) {
            const aspectRatio = originalWidth / originalHeight;
            if (width / height > aspectRatio) {
              width = height * aspectRatio;
            } else {
              height = width / aspectRatio;
            }
          }

          canvas.width = Math.round(width);
          canvas.height = Math.round(height);

          // Set white background for JPEG
          if (resizeOptions.format === 'jpeg') {
            ctx!.fillStyle = 'white';
            ctx!.fillRect(0, 0, canvas.width, canvas.height);
          }

          // Use better image smoothing
          ctx!.imageSmoothingEnabled = true;
          ctx!.imageSmoothingQuality = 'high';
          ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);

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
            processedSize: { width: canvas.width, height: canvas.height },
            fileSize,
            originalFileSize: file.size
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
    try {
      const link = document.createElement('a');
      link.href = image.processedDataUrl;
      const extension = resizeOptions.format === 'jpeg' ? 'jpg' : resizeOptions.format;
      const baseName = image.name.split('.')[0];
      link.download = `${baseName}_resized_${image.processedSize.width}x${image.processedSize.height}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Image downloaded successfully!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to download image');
      setTimeout(() => setError(null), 3000);
    }
  };

  const downloadAll = () => {
    if (images.length === 0) return;
    
    images.forEach((image, index) => {
      setTimeout(() => downloadImage(image), index * 200);
    });
    
    setSuccess(`Downloading ${images.length} images...`);
    setTimeout(() => setSuccess(null), 3000);
  };

  const clearAll = () => {
    setImages([]);
    setError(null);
    setSuccess(null);
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

  const getSizeReduction = (original: number, processed: number) => {
    const reduction = ((original - processed) / original) * 100;
    return reduction > 0 ? `${reduction.toFixed(1)}% smaller` : `${Math.abs(reduction).toFixed(1)}% larger`;
  };

  const presets = [
    { name: 'Instagram Square', width: 1080, height: 1080, icon: '📷' },
    { name: 'HD Wallpaper', width: 1920, height: 1080, icon: '🖥️' },
    { name: 'Profile Picture', width: 400, height: 400, icon: '👤' },
    { name: 'Thumbnail', width: 300, height: 200, icon: '🖼️' },
    { name: 'Banner', width: 1200, height: 400, icon: '🎯' },
    { name: 'Mobile Screen', width: 375, height: 667, icon: '📱' }
  ];

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url(/images/bg_image.png)' }}
    >
      <div className="min-h-screen bg-black/10">
        <Navbar />
        
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-white text-3xl font-bold flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  Image Resizer
                </h1>
                <p className="text-white/70 text-lg mt-2">Resize images with precision and quality control</p>
              </div>
              
              {images.length > 0 && (
                <div className="flex gap-3">
                  <button
                    onClick={downloadAll}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download All ({images.length})
                  </button>
                  <button
                    onClick={clearAll}
                    className="px-4 py-2 border border-white/40 text-white rounded-lg hover:bg-white/20 hover:border-white/60 transition-all duration-200 flex items-center gap-2 backdrop-blur-sm"
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
            <div className="bg-white/20 backdrop-blur-md rounded-xl border border-white/30 p-6 mb-8 shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Resize Settings
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Dimensions */}
                <div className="space-y-4">
                  <h3 className="text-white font-medium">Dimensions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Width (px)</label>
                      <input
                        type="number"
                        value={resizeOptions.width}
                        onChange={(e) => setResizeOptions(prev => ({
                          ...prev,
                          width: Math.max(1, parseInt(e.target.value) || 1)
                        }))}
                        className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                        min="1"
                        max="10000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Height (px)</label>
                      <input
                        type="number"
                        value={resizeOptions.height}
                        onChange={(e) => setResizeOptions(prev => ({
                          ...prev,
                          height: Math.max(1, parseInt(e.target.value) || 1)
                        }))}
                        className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                        min="1"
                        max="10000"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="aspectRatio"
                      checked={resizeOptions.maintainAspectRatio}
                      onChange={(e) => setResizeOptions(prev => ({
                        ...prev,
                        maintainAspectRatio: e.target.checked
                      }))}
                      className="w-4 h-4 text-green-500 bg-white/10 border-white/30 rounded focus:ring-green-400"
                    />
                    <label htmlFor="aspectRatio" className="text-sm text-white/80">
                      Lock aspect ratio
                    </label>
                  </div>
                </div>

                {/* Quality & Format */}
                <div className="space-y-4">
                  <h3 className="text-white font-medium">Quality & Format</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Quality: {Math.round(resizeOptions.quality * 100)}%
                    </label>
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
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-white/60 mt-1">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Output Format</label>
                    <select
                      value={resizeOptions.format}
                      onChange={(e) => setResizeOptions(prev => ({
                        ...prev,
                        format: e.target.value as 'png' | 'jpeg' | 'webp'
                      }))}
                      className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    >
                      <option value="jpeg" className="text-gray-800">JPEG (Smaller file)</option>
                      <option value="png" className="text-gray-800">PNG (Transparency)</option>
                      <option value="webp" className="text-gray-800">WebP (Modern)</option>
                    </select>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-4">
                  <h3 className="text-white font-medium">Quick Presets</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {presets.map(preset => (
                      <button
                        key={preset.name}
                        onClick={() => setResizeOptions(prev => ({
                          ...prev,
                          width: preset.width,
                          height: preset.height
                        }))}
                        className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-lg transition-all text-left"
                      >
                        <div className="text-lg mb-1">{preset.icon}</div>
                        <div className="text-white text-sm font-medium">{preset.name}</div>
                        <div className="text-white/60 text-xs">{preset.width} × {preset.height}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 mb-8 ${
                dragActive 
                  ? 'border-green-400 bg-green-400/10 backdrop-blur-md' 
                  : 'border-white/40 hover:border-green-400 hover:bg-white/10 backdrop-blur-md'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="space-y-4">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                  dragActive ? 'bg-green-400/20' : 'bg-white/20'
                }`}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                
                <div>
                  <p className="text-xl font-semibold text-white mb-2">
                    {dragActive ? 'Drop your images here!' : 'Drag & drop images here'}
                  </p>
                  <p className="text-white/70 mb-4">or click to browse</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      'Select Images'
                    )}
                  </button>
                </div>
                
                <div className="text-sm text-white/60 space-y-1">
                  <p>Supports: JPG, PNG, GIF, WebP, BMP</p>
                  <p>Maximum 10 images, up to 10MB each</p>
                </div>
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

            {/* Messages */}
            {error && (
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/40 text-red-100 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
                <button onClick={() => setError(null)} className="text-red-200 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/40 text-green-100 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {success}
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-lg px-6 py-4 border border-white/30">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white font-medium">Processing images...</span>
                </div>
              </div>
            )}

            {/* Results */}
            {images.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Processed Images ({images.length})
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {images.map(image => (
                    <div key={image.id} className="bg-white/20 backdrop-blur-md rounded-lg border border-white/30 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200">
                      <div className="aspect-video bg-black/20 relative group">
                        <img
                          src={image.processedDataUrl}
                          alt={image.name}
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => downloadImage(image)}
                            className="bg-white/20 backdrop-blur-sm border border-white/40 text-white p-2 rounded-full hover:bg-white/30 transition-all"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-medium text-white mb-3 truncate" title={image.name}>
                          {image.name}
                        </h3>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-white/80">
                            <span>Original:</span>
                            <span>{image.originalSize.width} × {image.originalSize.height}</span>
                          </div>
                          <div className="flex justify-between text-white/80">
                            <span>Resized:</span>
                            <span>{image.processedSize.width} × {image.processedSize.height}</span>
                          </div>
                          <div className="flex justify-between text-white/80">
                            <span>File size:</span>
                            <span>{formatFileSize(image.fileSize)}</span>
                          </div>
                          <div className="flex justify-between text-white/80">
                            <span>Reduction:</span>
                            <span className={image.fileSize < image.originalFileSize ? 'text-green-300' : 'text-orange-300'}>
                              {getSizeReduction(image.originalFileSize, image.fileSize)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => downloadImage(image)}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-lg"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download
                          </button>
                          <button
                            onClick={() => removeImage(image.id)}
                            className="px-3 py-2 border border-red-400/40 text-red-300 rounded-lg hover:bg-red-500/20 transition-all duration-200 text-sm"
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
              <div className="text-center py-16 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-white/70 text-lg mb-2">No images uploaded yet</p>
                <p className="text-white/50">Upload some images to get started with resizing!</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ImageResizerPage; 