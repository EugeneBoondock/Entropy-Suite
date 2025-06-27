import React, { useState, useRef } from 'react';
import { removeBackground } from '@imgly/background-removal';
import Navbar from '../components/Navbar';

const BackgroundRemoverPage: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Preview original image
    const originalUrl = URL.createObjectURL(file);
    setOriginalImage(originalUrl);
    setProcessedImage(null);

    try {
      setIsProcessing(true);
      
      // Remove background
      const imageBlob = await removeBackground(file);
      const processedUrl = URL.createObjectURL(imageBlob);
      setProcessedImage(processedUrl);
      
    } catch (error) {
      console.error('Error removing background:', error);
      alert('Failed to remove background. Please try with a different image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const downloadImage = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'background-removed.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetImages = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
      style={{ 
        backgroundImage: 'url("/images/bg_image.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Page overlay for better contrast */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none"></div>
      
      <div className="relative z-10">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 max-w-2xl mx-auto">
              <h1 className="text-4xl font-bold text-[#1a1a1a] mb-4 drop-shadow-md">
                🎨 Background Remover
              </h1>
              <p className="text-lg text-[#1a1a1a]/80 leading-relaxed drop-shadow-sm">
                Remove backgrounds from images instantly using AI. Perfect for profile pictures, product photos, and creative projects.
              </p>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Upload Area */}
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20 mb-8">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50/50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="text-6xl mb-4">📷</div>
                <h3 className="text-xl font-semibold text-[#1a1a1a] mb-2">
                  Drop your image here or click to upload
                </h3>
                <p className="text-[#1a1a1a]/70 mb-4">
                  Supports JPG, PNG, and WebP formats
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Choose Image'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Processing Status */}
            {isProcessing && (
              <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 mb-8">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-lg font-medium text-[#1a1a1a]">
                    Removing background... This may take a few seconds
                  </span>
                </div>
                <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-full animate-pulse"></div>
                </div>
              </div>
            )}

            {/* Results */}
            {(originalImage || processedImage) && (
              <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-[#1a1a1a]">Results</h2>
                  <div className="space-x-4">
                    {processedImage && (
                      <button
                        onClick={downloadImage}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        📥 Download
                      </button>
                    )}
                    <button
                      onClick={resetImages}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      🔄 New Image
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Original Image */}
                  {originalImage && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Original</h3>
                      <div className="bg-white rounded-lg p-4 shadow-md">
                        <img
                          src={originalImage}
                          alt="Original"
                          className="w-full h-auto max-h-96 object-contain rounded"
                        />
                      </div>
                    </div>
                  )}

                  {/* Processed Image */}
                  {processedImage && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Background Removed</h3>
                      <div className="bg-transparent rounded-lg p-4 shadow-md relative">
                        {/* Checkered background to show transparency */}
                        <div 
                          className="absolute inset-4 rounded"
                          style={{
                            backgroundImage: `
                              linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
                              linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
                              linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
                              linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                            `,
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                          }}
                        />
                        <img
                          src={processedImage}
                          alt="Background Removed"
                          className="relative w-full h-auto max-h-96 object-contain rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20 mt-8">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">✨ Features</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">🤖</div>
                  <h3 className="font-semibold text-[#1a1a1a] mb-2">AI-Powered</h3>
                  <p className="text-[#1a1a1a]/70">Advanced machine learning algorithms for precise background removal</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">⚡</div>
                  <h3 className="font-semibold text-[#1a1a1a] mb-2">Lightning Fast</h3>
                  <p className="text-[#1a1a1a]/70">Process images in seconds, no waiting required</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🔒</div>
                  <h3 className="font-semibold text-[#1a1a1a] mb-2">Privacy First</h3>
                  <p className="text-[#1a1a1a]/70">All processing happens locally in your browser</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundRemoverPage; 