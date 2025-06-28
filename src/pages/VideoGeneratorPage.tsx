import React, { useState } from 'react';
import { Video, Sparkles, Play, Download, Upload, FileVideo, Settings, Clock, Film, Zap, Edit3, Camera } from 'lucide-react';
import Navbar from '../components/Navbar';

interface VideoOptions {
  model: string;
  duration: number;
  aspectRatio: string;
  quality: string;
  fps: number;
  style: string;
}

interface GeneratedVideo {
  id: string;
  url: string;
  thumbnail: string;
  prompt: string;
  model: string;
  duration: number;
  timestamp: Date;
}

const VideoGeneratorPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [activeTab, setActiveTab] = useState<'text-to-video' | 'image-to-video' | 'video-to-video'>('text-to-video');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [options, setOptions] = useState<VideoOptions>({
    model: 'runway-gen5',
    duration: 5,
    aspectRatio: '16:9',
    quality: 'HD',
    fps: 24,
    style: 'cinematic'
  });

  const models = [
    { id: 'runway-gen5', name: 'Runway Gen-5', description: 'Latest motion model with enhanced consistency (2025)', maxDuration: 30 },
    { id: 'sora-2', name: 'OpenAI Sora 2.0', description: 'Revolutionary cinematic video generation', maxDuration: 60 },
    { id: 'kling-3', name: 'Kling AI 3.0', description: 'Professional filmmaking with director controls', maxDuration: 20 },
    { id: 'pika-3', name: 'Pika 3.0', description: 'Advanced effects and seamless style transfer', maxDuration: 30 },
    { id: 'luma-ray-2', name: 'Luma Ray 2.0', description: 'Ultra-fast photorealistic generation', maxDuration: 15 },
    { id: 'veo-4', name: 'Google Veo 4', description: 'Ultra-realistic with synchronized audio', maxDuration: 180 },
    { id: 'stability-video', name: 'Stability Video Diffusion', description: 'Open source high-quality video generation', maxDuration: 25 },
    { id: 'meta-movie-gen', name: 'Meta Movie Gen', description: 'Hollywood-quality video generation', maxDuration: 45 }
  ];

  const styles = [
    'Cinematic', 'Realistic', 'Animated', 'Cartoon', 'Artistic', 'Documentary',
    'Music Video', 'Commercial', 'Sci-Fi', 'Fantasy', 'Vintage', 'Modern'
  ];

  const aspectRatios = [
    { value: '16:9', label: 'Landscape (16:9)' },
    { value: '9:16', label: 'Portrait (9:16)' },
    { value: '1:1', label: 'Square (1:1)' },
    { value: '4:3', label: 'Classic (4:3)' },
    { value: '21:9', label: 'Cinematic (21:9)' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() && activeTab === 'text-to-video') return;
    if (!uploadedImage && activeTab === 'image-to-video') return;

    setIsGenerating(true);
    
    try {
      // Simulate API call - in real implementation, integrate with actual AI APIs
      await new Promise(resolve => setTimeout(resolve, 15000)); // Longer for video generation
      
      const newVideo: GeneratedVideo = {
        id: Date.now().toString(),
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Placeholder
        thumbnail: `https://picsum.photos/400/225?random=${Date.now()}`,
        prompt: prompt || 'Image to video generation',
        model: options.model,
        duration: options.duration,
        timestamp: new Date()
      };
      
      setGeneratedVideos(prev => [newVideo, ...prev]);
      
      // In real implementation:
      // const formData = new FormData();
      // formData.append('prompt', prompt);
      // if (uploadedImage) formData.append('image', uploadedImage);
      // formData.append('options', JSON.stringify(options));
      // 
      // const response = await fetch('/api/generate-video', {
      //   method: 'POST',
      //   body: formData
      // });
      // const result = await response.json();
      
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
    }
  };

  const downloadVideo = (videoUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedModel = models.find(m => m.id === options.model);

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
      <div className="absolute inset-0 bg-black/15 pointer-events-none"></div>
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5 pt-20">
          <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4 mb-4">
              <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4 border border-white/40 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100/80 rounded-lg backdrop-blur-sm">
                    <Video className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-[#1a1a1a] tracking-light text-[32px] font-bold leading-tight drop-shadow-lg">AI Video Generator</h1>
                    <p className="text-[#2a2a2a] text-sm drop-shadow-sm">Create professional videos with cutting-edge AI technology</p>
                  </div>
                </div>
              </div>
            </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generation Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl shadow-xl p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                Generate Video
              </h2>

              {/* Tab Selection */}
              <div className="mb-6">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('text-to-video')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'text-to-video'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Text to Video
                  </button>
                  <button
                    onClick={() => setActiveTab('image-to-video')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'image-to-video'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Image to Video
                  </button>
                </div>
              </div>

              {/* Text to Video */}
              {activeTab === 'text-to-video' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe your video
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A drone shot flying over a futuristic city at sunset, with flying cars and neon lights, cinematic style"
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {prompt.length}/500 characters
                  </p>
                </div>
              )}

              {/* Image to Video */}
              {activeTab === 'image-to-video' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload image to animate
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {uploadedImage ? (
                      <div>
                        <img
                          src={URL.createObjectURL(uploadedImage)}
                          alt="Uploaded"
                          className="max-w-full h-32 object-contain mx-auto mb-2"
                        />
                        <p className="text-sm text-gray-600">{uploadedImage.name}</p>
                        <button
                          onClick={() => setUploadedImage(null)}
                          className="text-red-600 text-sm hover:text-red-700 mt-2"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Click to upload an image</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-100 transition-colors"
                        >
                          Choose Image
                        </label>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Animation description (optional)
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe how you want the image to move or animate"
                      className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Model Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Model
                </label>
                <select
                  value={options.model}
                  onChange={(e) => {
                    const newModel = e.target.value;
                    const modelData = models.find(m => m.id === newModel);
                    setOptions(prev => ({ 
                      ...prev, 
                      model: newModel,
                      duration: Math.min(prev.duration, modelData?.maxDuration || 10)
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration: {options.duration}s (max: {selectedModel?.maxDuration}s)
                </label>
                <input
                  type="range"
                  min="3"
                  max={selectedModel?.maxDuration || 10}
                  value={options.duration}
                  onChange={(e) => setOptions(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              {/* Style */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style
                </label>
                <select
                  value={options.style}
                  onChange={(e) => setOptions(prev => ({ ...prev, style: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {styles.map((style) => (
                    <option key={style} value={style.toLowerCase()}>
                      {style}
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
                        Aspect Ratio
                      </label>
                      <select
                        value={options.aspectRatio}
                        onChange={(e) => setOptions(prev => ({ ...prev, aspectRatio: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {aspectRatios.map((ratio) => (
                          <option key={ratio.value} value={ratio.value}>
                            {ratio.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quality
                      </label>
                      <select
                        value={options.quality}
                        onChange={(e) => setOptions(prev => ({ ...prev, quality: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="SD">Standard (720p)</option>
                        <option value="HD">High Definition (1080p)</option>
                        <option value="4K">Ultra HD (4K)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frame Rate: {options.fps} FPS
                      </label>
                      <input
                        type="range"
                        min="24"
                        max="60"
                        step="12"
                        value={options.fps}
                        onChange={(e) => setOptions(prev => ({ ...prev, fps: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </details>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={
                  isGenerating ||
                  (activeTab === 'text-to-video' && !prompt.trim()) ||
                  (activeTab === 'image-to-video' && !uploadedImage)
                }
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Generating Video...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Generate Video
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Generation takes 30 seconds to 2 minutes depending on duration
              </p>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Generated Videos</h2>
              <p className="text-gray-600">Your AI-generated videos will appear here</p>
            </div>

            {generatedVideos.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Film className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos generated yet</h3>
                <p className="text-gray-600 mb-6">Create your first AI video by entering a prompt or uploading an image</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">Try: "Flying through clouds"</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">Try: "Ocean waves at sunset"</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">Try: "City traffic time-lapse"</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {generatedVideos.map((video) => (
                  <div key={video.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="aspect-video relative group">
                      <video
                        controls
                        poster={video.thumbnail}
                        className="w-full h-full object-cover"
                      >
                        <source src={video.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => downloadVideo(video.url, `ai-video-${video.id}.mp4`)}
                          className="bg-white bg-opacity-90 text-gray-900 p-2 rounded-lg hover:bg-opacity-100 transition-all"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.prompt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {models.find(m => m.id === video.model)?.name || video.model}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {video.duration}s
                          </span>
                        </div>
                        <span>{video.timestamp.toLocaleTimeString()}</span>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Professional AI Video Generation</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create cinema-quality videos with the most advanced AI models available in 2025
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ultra Fast</h3>
              <p className="text-gray-600">Generate videos in 30 seconds to 2 minutes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Multiple Modes</h3>
              <p className="text-gray-600">Text-to-video and image-to-video generation</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit3 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Full Control</h3>
              <p className="text-gray-600">Customize style, duration, and quality</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileVideo className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">HD Quality</h3>
              <p className="text-gray-600">Export in HD, 4K, and multiple formats</p>
            </div>
          </div>
        </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VideoGeneratorPage; 