import React, { useState } from 'react';
import { ArrowRight, Image as ImageIcon, Sparkles, Download, Zap, Palette, Camera, RefreshCw, Settings } from 'lucide-react';
import Navbar from '../components/Navbar';

interface GenerationOptions {
  model: string;
  style: string;
  aspectRatio: string;
  quality: string;
  steps: number;
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  timestamp: Date;
}

const ImageGeneratorPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [options, setOptions] = useState<GenerationOptions>({
    model: 'flux-1.2-pro',
    style: 'photorealistic',
    aspectRatio: '1:1',
    quality: 'high',
    steps: 30
  });

  const models = [
    { id: 'flux-1.2-pro', name: 'FLUX.1.2 Pro', description: 'Latest FLUX model, best quality and consistency' },
    { id: 'dall-e-3-hd', name: 'DALL-E 3 HD', description: 'OpenAI\'s latest high-resolution model' },
    { id: 'midjourney-v7', name: 'Midjourney v7', description: 'Cutting-edge artistic generation (2025)' },
    { id: 'stable-diffusion-4', name: 'Stable Diffusion 4.0', description: 'Latest open source model with enhanced quality' },
    { id: 'imagen-3-turbo', name: 'Google Imagen 3 Turbo', description: 'Ultra-fast photorealistic generation' },
    { id: 'firefly-3', name: 'Adobe Firefly 3', description: 'Commercial-safe AI image generation' },
    { id: 'ideogram-2', name: 'Ideogram 2.0', description: 'Perfect for text in images and logos' }
  ];

  const styles = [
    'Photorealistic', 'Digital Art', 'Oil Painting', 'Watercolor', 'Anime/Manga',
    'Cyberpunk', 'Fantasy', 'Minimalist', 'Vintage', 'Abstract', 'Cinematic', 'Portrait'
  ];

  const aspectRatios = [
    { value: '1:1', label: 'Square (1:1)' },
    { value: '16:9', label: 'Landscape (16:9)' },
    { value: '9:16', label: 'Portrait (9:16)' },
    { value: '4:3', label: 'Classic (4:3)' },
    { value: '3:2', label: 'Photo (3:2)' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    // Simulate API call - in real implementation, integrate with actual AI APIs
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: `https://picsum.photos/800/800?random=${Date.now()}`, // Placeholder
        prompt,
        model: options.model,
        timestamp: new Date()
      };
      
      setGeneratedImages(prev => [newImage, ...prev]);
      
      // In real implementation:
      // const response = await fetch('/api/generate-image', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ prompt, ...options })
      // });
      // const result = await response.json();
      
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="flex size-full min-h-screen flex-col bg-[#f6f0e4] group/design-root overflow-x-hidden" 
      style={{ 
        fontFamily: '"Space Grotesk", "Noto Sans", sans-serif',
        backgroundImage: 'url("/images/bg_image.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Full page overlay for text readability */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none"></div>
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5 pt-20">
          <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1">
            {/* Page Header */}
            <div className="flex flex-wrap justify-between gap-3 p-4 mb-4">
              <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4 border border-white/40 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100/80 rounded-lg backdrop-blur-sm">
                    <ImageIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h1 className="text-[#1a1a1a] tracking-light text-[32px] font-bold leading-tight drop-shadow-lg">AI Image Generator</h1>
                    <p className="text-[#2a2a2a] text-sm drop-shadow-sm">Create stunning images with advanced AI models</p>
                  </div>
                </div>
              </div>
            </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generation Panel */}
                      <div className="lg:col-span-1">
            <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl shadow-xl p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-[#1a1a1a] drop-shadow-sm">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Generate Image
              </h2>

              {/* Prompt Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your image
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A majestic lion standing on a rocky cliff at sunset, cinematic lighting, ultra detailed, 4K"
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {prompt.length}/500 characters
                </p>
              </div>

              {/* Model Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Model
                </label>
                <select
                  value={options.model}
                  onChange={(e) => setOptions(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Style Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style
                </label>
                <select
                  value={options.style}
                  onChange={(e) => setOptions(prev => ({ ...prev, style: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {styles.map((style) => (
                    <option key={style} value={style.toLowerCase()}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              {/* Aspect Ratio */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aspect Ratio
                </label>
                <select
                  value={options.aspectRatio}
                  onChange={(e) => setOptions(prev => ({ ...prev, aspectRatio: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {aspectRatios.map((ratio) => (
                    <option key={ratio.value} value={ratio.value}>
                      {ratio.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Advanced Settings */}
              <div className="mb-6">
                <details className="group">
                  <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    <Settings className="w-4 h-4" />
                    Advanced Settings
                  </summary>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quality
                      </label>
                      <select
                        value={options.quality}
                        onChange={(e) => setOptions(prev => ({ ...prev, quality: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="standard">Standard</option>
                        <option value="high">High Quality</option>
                        <option value="ultra">Ultra High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Steps: {options.steps}
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="50"
                        value={options.steps}
                        onChange={(e) => setOptions(prev => ({ ...prev, steps: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </details>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Generate Image
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Generation typically takes 10-30 seconds
              </p>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Generated Images</h2>
              <p className="text-gray-600">Your AI-generated masterpieces will appear here</p>
            </div>

            {generatedImages.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-12 h-12 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No images generated yet</h3>
                <p className="text-gray-600 mb-6">Enter a prompt and click "Generate Image" to create your first AI image</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">Try: "Sunset over mountains"</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">Try: "Futuristic city"</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">Try: "Abstract art"</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedImages.map((image) => (
                  <div key={image.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="aspect-square relative group">
                      <img
                        src={image.url}
                        alt={image.prompt}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => downloadImage(image.url, `ai-image-${image.id}.png`)}
                          className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{image.prompt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {models.find(m => m.id === image.model)?.name || image.model}
                        </span>
                        <span>{image.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful AI Image Generation</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create stunning images with the latest AI models from leading providers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Generate high-quality images in 10-30 seconds</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Multiple Styles</h3>
              <p className="text-gray-600">From photorealistic to artistic styles</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Full Control</h3>
              <p className="text-gray-600">Advanced settings for perfect results</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">High Quality</h3>
              <p className="text-gray-600">Download in multiple formats and resolutions</p>
            </div>
          </div>
        </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ImageGeneratorPage; 