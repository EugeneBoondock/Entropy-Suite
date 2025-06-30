import React, { useState } from 'react';
import { Music, Sparkles, Play, Download, Pause, SkipBack, SkipForward, Volume2, Settings, Clock, Mic, Music2 } from 'lucide-react';
import Navbar from '../components/Navbar';

interface MusicOptions {
  model: string;
  duration: number;
  genre: string;
  mood: string;
  style: string;
  bpm: number;
  key: string;
  includeVocals: boolean;
}

interface GeneratedTrack {
  id: string;
  url: string;
  title: string;
  prompt: string;
  model: string;
  duration: number;
  genre: string;
  timestamp: Date;
  lyrics?: string;
}

const MusicGeneratorPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTracks, setGeneratedTracks] = useState<GeneratedTrack[]>([]);
  const [activeTab, setActiveTab] = useState<'text-to-music' | 'lyrics-to-song' | 'instrumental'>('text-to-music');
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [options, setOptions] = useState<MusicOptions>({
    model: 'suno-v5',
    duration: 120,
    genre: 'pop',
    mood: 'upbeat',
    style: 'modern',
    bpm: 120,
    key: 'C',
    includeVocals: true
  });

  const models = [
    { id: 'suno-v5', name: 'Suno AI v5.0', description: 'Revolutionary music and vocals with extended duration (2025)' },
    { id: 'udio-v3', name: 'Udio v3.0', description: 'Professional studio-quality music production' },
    { id: 'musicgen-3', name: 'Meta MusicGen 3', description: 'Advanced open source with multi-track support' },
    { id: 'elevenlabs-music', name: 'ElevenLabs Music', description: 'High-fidelity voice and music synthesis' },
    { id: 'stability-audio', name: 'Stability Audio 2.0', description: 'Open source high-quality audio generation' },
    { id: 'beatoven-pro', name: 'Beatoven AI Pro', description: 'Adaptive background music with stems' },
    { id: 'mubert-gen2', name: 'Mubert Genesis 2', description: 'Real-time AI music streaming with genres' },
    { id: 'boomy-2025', name: 'Boomy 2025', description: 'AI songwriting with commercial rights' }
  ];

  const genres = [
    'Pop', 'Rock', 'Jazz', 'Classical', 'Electronic', 'Hip Hop', 'Country',
    'Blues', 'Reggae', 'Folk', 'R&B', 'Funk', 'Metal', 'Ambient', 'Lo-fi'
  ];

  const moods = [
    'Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Mysterious', 'Epic',
    'Peaceful', 'Dramatic', 'Uplifting', 'Dark', 'Nostalgic', 'Festive'
  ];

  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const handleGenerate = async () => {
    if (!prompt.trim() && activeTab !== 'instrumental') return;

    setIsGenerating(true);
    
    try {
      // Simulate API call - in real implementation, integrate with actual AI APIs
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      const newTrack: GeneratedTrack = {
        id: Date.now().toString(),
        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder
        title: prompt.slice(0, 30) || 'AI Generated Track',
        prompt: prompt || 'Instrumental track',
        model: options.model,
        duration: options.duration,
        genre: options.genre,
        timestamp: new Date(),
        lyrics: activeTab === 'lyrics-to-song' ? lyrics : undefined
      };
      
      setGeneratedTracks(prev => [newTrack, ...prev]);
      
      // In real implementation:
      // const response = await fetch('/api/generate-music', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     prompt,
      //     lyrics: activeTab === 'lyrics-to-song' ? lyrics : undefined,
      //     type: activeTab,
      //     options
      //   })
      // });
      // const result = await response.json();
      
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = (trackId: string) => {
    if (playingTrack === trackId) {
      setPlayingTrack(null);
    } else {
      setPlayingTrack(trackId);
    }
  };

  const downloadTrack = (trackUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = trackUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
      <div className="absolute inset-0 bg-black/15 pointer-events-none"></div>
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5 pt-20">
          <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4 mb-4">
              <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4 border border-white/40 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100/80 rounded-lg backdrop-blur-sm">
                    <Music className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-[#1a1a1a] tracking-light text-[32px] font-bold leading-tight drop-shadow-lg">AI Music Generator</h1>
                    <p className="text-[#2a2a2a] text-sm drop-shadow-sm">Create professional music and songs with AI</p>
                  </div>
                </div>
              </div>
            </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generation Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl shadow-xl p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-[#1a1a1a] drop-shadow-sm">
                <Sparkles className="w-5 h-5 text-green-500" />
                Generate Music
              </h2>

              {/* Tab Selection */}
              <div className="mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1 border border-white/30">
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => setActiveTab('text-to-music')}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        activeTab === 'text-to-music'
                          ? 'bg-green-500 text-white shadow-md'
                          : 'text-[#2a2a2a] hover:bg-white/30'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Music className="w-4 h-4" />
                        <span className="text-xs">Text to Music</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('lyrics-to-song')}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        activeTab === 'lyrics-to-song'
                          ? 'bg-green-500 text-white shadow-md'
                          : 'text-[#2a2a2a] hover:bg-white/30'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Mic className="w-4 h-4" />
                        <span className="text-xs">Lyrics to Song</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('instrumental')}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        activeTab === 'instrumental'
                          ? 'bg-green-500 text-white shadow-md'
                          : 'text-[#2a2a2a] hover:bg-white/30'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Music2 className="w-4 h-4" />
                        <span className="text-xs">Instrumental</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Text to Music */}
              {activeTab === 'text-to-music' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-3 drop-shadow-sm flex items-center gap-2">
                    <Music2 className="w-4 h-4" />
                    Song description
                  </label>
                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="An upbeat pop song with electric guitar and synthesizers, perfect for a summer road trip"
                      className="w-full h-32 px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-400 resize-none text-[#1a1a1a] placeholder-gray-500 transition-all duration-200 shadow-sm"
                    />
                    <div className="absolute bottom-2 right-3 text-xs text-gray-500 bg-white/70 px-2 py-1 rounded-full">
                      {prompt.length}/500
                    </div>
                  </div>
                </div>
              )}

              {/* Lyrics to Song */}
              {activeTab === 'lyrics-to-song' && (
                <div className="mb-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-3 drop-shadow-sm flex items-center gap-2">
                      <Music2 className="w-4 h-4" />
                      Song description
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="A heartfelt ballad about friendship, acoustic guitar style"
                      className="w-full h-20 px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-400 resize-none text-[#1a1a1a] placeholder-gray-500 transition-all duration-200 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-3 drop-shadow-sm flex items-center gap-2">
                      <Mic className="w-4 h-4" />
                      Lyrics
                    </label>
                    <textarea
                      value={lyrics}
                      onChange={(e) => setLyrics(e.target.value)}
                      placeholder="[Verse 1]&#10;Walking down this empty road&#10;Thinking about the times we shared&#10;&#10;[Chorus]&#10;Friends forever, through the storms&#10;We'll always be there for each other"
                      className="w-full h-40 px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-400 resize-none font-mono text-sm text-[#1a1a1a] placeholder-gray-500 transition-all duration-200 shadow-sm"
                    />
                    <div className="bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-lg p-3 mt-2">
                      <p className="text-sm text-green-700 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Use [Verse], [Chorus], [Bridge] to structure your song
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Instrumental */}
              {activeTab === 'instrumental' && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Generate instrumental music based on genre and mood settings below.
                  </p>
                </div>
              )}

              {/* Model Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#1a1a1a] mb-3 drop-shadow-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  AI Model
                </label>
                <select
                  value={options.model}
                  onChange={(e) => setOptions(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-400 text-[#1a1a1a] transition-all duration-200 shadow-sm"
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Genre and Mood */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-3 drop-shadow-sm flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Genre
                  </label>
                  <select
                    value={options.genre}
                    onChange={(e) => setOptions(prev => ({ ...prev, genre: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-400 text-[#1a1a1a] transition-all duration-200 shadow-sm"
                  >
                    {genres.map((genre) => (
                      <option key={genre} value={genre.toLowerCase()}>
                        {genre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-3 drop-shadow-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Mood
                  </label>
                  <select
                    value={options.mood}
                    onChange={(e) => setOptions(prev => ({ ...prev, mood: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-400 text-[#1a1a1a] transition-all duration-200 shadow-sm"
                  >
                    {moods.map((mood) => (
                      <option key={mood} value={mood.toLowerCase()}>
                        {mood}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#1a1a1a] mb-3 drop-shadow-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duration: <span className="text-green-600 font-semibold">{formatTime(options.duration)}</span>
                </label>
                <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="30"
                    value={options.duration}
                    onChange={(e) => setOptions(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gradient-to-r from-green-200 to-green-400 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #10b981 ${((options.duration - 30) / 270) * 100}%, #e5e7eb ${((options.duration - 30) / 270) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>30s</span>
                    <span>1:30</span>
                    <span>3:00</span>
                    <span>5:00</span>
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="mb-6">
                <details className="group">
                  <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    <Settings className="w-4 h-4" />
                    Advanced Settings
                  </summary>
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          BPM: {options.bpm}
                        </label>
                        <input
                          type="range"
                          min="60"
                          max="180"
                          value={options.bpm}
                          onChange={(e) => setOptions(prev => ({ ...prev, bpm: parseInt(e.target.value) }))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Key
                        </label>
                        <select
                          value={options.key}
                          onChange={(e) => setOptions(prev => ({ ...prev, key: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          {keys.map((key) => (
                            <option key={key} value={key}>
                              {key} Major
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {activeTab !== 'lyrics-to-song' && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="vocals"
                          checked={options.includeVocals}
                          onChange={(e) => setOptions(prev => ({ ...prev, includeVocals: e.target.checked }))}
                          className="mr-2"
                        />
                        <label htmlFor="vocals" className="text-sm text-gray-700">
                          Include vocals (humming/vocalization)
                        </label>
                      </div>
                    )}
                  </div>
                </details>
              </div>

              {/* Generate Button */}
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-white/40 mb-4">
                <button
                  onClick={handleGenerate}
                  disabled={
                    isGenerating ||
                    (activeTab === 'text-to-music' && !prompt.trim()) ||
                    (activeTab === 'lyrics-to-song' && !lyrics.trim())
                  }
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating Music...</span>
                    </>
                  ) : (
                    <>
                      <Music2 className="w-5 h-5" />
                      <span>Generate Music</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-2 text-xs text-green-700 mt-3">
                  <Clock className="w-3 h-3" />
                  <span>Generation takes 30 seconds to 1 minute</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4 border border-white/40 shadow-lg">
                <h2 className="text-xl font-semibold text-[#1a1a1a] mb-2 drop-shadow-sm flex items-center gap-2">
                  <Music className="w-5 h-5 text-green-600" />
                  Generated Music
                </h2>
                <p className="text-[#2a2a2a] drop-shadow-sm">Your AI-generated tracks will appear here</p>
              </div>
            </div>

            {generatedTracks.length === 0 ? (
              <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl shadow-xl p-12 text-center">
                <div className="w-24 h-24 bg-green-100/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200/50">
                  <Music2 className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-[#1a1a1a] mb-3 drop-shadow-sm">No music generated yet</h3>
                <p className="text-[#2a2a2a] mb-6 drop-shadow-sm">Create your first AI track by describing the music you want or adding lyrics</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => setPrompt("Upbeat pop song")}
                    className="px-4 py-2 bg-green-100/80 backdrop-blur-sm text-green-700 rounded-full text-sm hover:bg-green-200/80 transition-all duration-200 border border-green-200/50"
                  >
                    Try: "Upbeat pop song"
                  </button>
                  <button
                    onClick={() => setPrompt("Relaxing piano")}
                    className="px-4 py-2 bg-blue-100/80 backdrop-blur-sm text-blue-700 rounded-full text-sm hover:bg-blue-200/80 transition-all duration-200 border border-blue-200/50"
                  >
                    Try: "Relaxing piano"
                  </button>
                  <button
                    onClick={() => setPrompt("Epic orchestral")}
                    className="px-4 py-2 bg-purple-100/80 backdrop-blur-sm text-purple-700 rounded-full text-sm hover:bg-purple-200/80 transition-all duration-200 border border-purple-200/50"
                  >
                    Try: "Epic orchestral"
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {generatedTracks.map((track) => (
                  <div key={track.id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{track.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{track.prompt}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                            {models.find(m => m.id === track.model)?.name || track.model}
                          </span>
                          <span className="capitalize">{track.genre}</span>
                          <span>{formatTime(track.duration)}</span>
                          <span>{track.timestamp.toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadTrack(track.url, `${track.title.replace(/\s+/g, '-')}.mp3`)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Audio Player */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-4 mb-3">
                        <button
                          onClick={() => togglePlay(track.id)}
                          className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
                        >
                          {playingTrack === track.id ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5 ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="h-2 bg-gray-200 rounded-full">
                            <div className="h-2 bg-green-600 rounded-full" style={{ width: '0%' }}></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>0:00</span>
                          <span>/</span>
                          <span>{formatTime(track.duration)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                            <SkipBack className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                            <SkipForward className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-gray-400" />
                          <div className="w-16 h-1 bg-gray-200 rounded-full">
                            <div className="w-12 h-1 bg-gray-400 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lyrics Display */}
                    {track.lyrics && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Mic className="w-4 h-4" />
                          Lyrics
                        </h4>
                        <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans">
                          {track.lyrics}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Advanced AI Music Creation</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Generate professional-quality music with the most advanced AI models available in 2025
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Multiple Formats</h3>
              <p className="text-gray-600">Text-to-music, lyrics-to-song, and instrumental</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Vocals</h3>
              <p className="text-gray-600">Generate songs with realistic vocals and lyrics</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Full Control</h3>
              <p className="text-gray-600">Customize genre, mood, BPM, and key</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Commercial Use</h3>
              <p className="text-gray-600">Royalty-free music for any project</p>
            </div>
          </div>
        </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MusicGeneratorPage; 