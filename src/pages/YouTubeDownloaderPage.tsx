import React, { useState } from "react";
import { Download, Play, Clock, FileVideo, Music, AlertCircle, CheckCircle, Video, Volume2, Scissors, Users } from "lucide-react";
import Navbar from "../components/Navbar";

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  durationSeconds: number;
  uploader: string;
  description: string;
  viewCount: string;
  uploadDate: string;
  formats: VideoFormat[];
}

interface VideoFormat {
  format_id: string;
  ext: string;
  quality: string;
  filesize: number;
  format_note: string;
  acodec?: string;
  vcodec?: string;
  abr?: number;
  vbr?: number;
  height?: number;
}

interface TrimSettings {
  startTime: number;
  endTime: number;
}

const YouTubeDownloaderPage: React.FC = () => {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedFormat, setSelectedFormat] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [trimSettings, setTrimSettings] = useState<TrimSettings>({
    startTime: 0,
    endTime: 0
  });
  const [enableTrimming, setEnableTrimming] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("video");

  const validateYouTubeURL = (url: string) => {
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^https?:\/\/(www\.)?youtu\.be\/[\w-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const extractVideoId = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "Unknown size";
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseTimeInput = (timeString: string) => {
    const parts = timeString.split(':').map(part => parseInt(part) || 0);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return parts[0] || 0;
  };

  const handleGetVideoInfo = async () => {
    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    if (!validateYouTubeURL(url)) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setIsLoading(true);
    setError("");
    setVideoInfo(null);

    try {
      const response = await fetch('/api/youtube/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch video information');
      }

      const data = await response.json();
      
      // Process formats to include MP3 and various qualities
      const processedFormats: VideoFormat[] = [
        // Video formats
        ...data.formats.filter((f: any) => f.vcodec && f.vcodec !== 'none').map((f: any) => ({
          format_id: f.format_id,
          ext: f.ext,
          quality: f.height ? `${f.height}p` : f.format_note || 'Unknown',
          filesize: f.filesize || f.filesize_approx || 0,
          format_note: f.format_note || `${f.height}p ${f.ext.toUpperCase()}`,
          height: f.height,
          vcodec: f.vcodec,
          acodec: f.acodec
        })),
        // Audio formats
        ...data.formats.filter((f: any) => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none')).map((f: any) => ({
          format_id: f.format_id,
          ext: f.ext === 'm4a' ? 'mp3' : f.ext, // Convert to MP3
          quality: 'audio',
          filesize: f.filesize || f.filesize_approx || 0,
          format_note: `Audio Only (${f.ext === 'm4a' ? 'MP3' : f.ext.toUpperCase()})`,
          acodec: f.acodec,
          abr: f.abr
        }))
      ];

      const videoData: VideoInfo = {
        title: data.title,
        thumbnail: data.thumbnail,
        duration: formatTime(data.duration),
        durationSeconds: data.duration,
        uploader: data.uploader,
        description: data.description || '',
        viewCount: data.view_count?.toLocaleString() || 'Unknown',
        uploadDate: data.upload_date,
        formats: processedFormats.sort((a, b) => {
          if (a.quality === 'audio' && b.quality !== 'audio') return 1;
          if (a.quality !== 'audio' && b.quality === 'audio') return -1;
          if (a.height && b.height) return b.height - a.height;
          return 0;
        })
      };

      setVideoInfo(videoData);
      setSelectedFormat(videoData.formats[0]?.format_id || '');
      setTrimSettings({
        startTime: 0,
        endTime: videoData.durationSeconds
      });

    } catch (err) {
      setError("Failed to fetch video information. Please check the URL and try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo || !selectedFormat) {
      setError("Please select a format to download");
      return;
    }

    const selectedFormatData = videoInfo.formats.find(f => f.format_id === selectedFormat);
    if (!selectedFormatData) {
      setError("Invalid format selected");
      return;
    }

    if (enableTrimming) {
      if (trimSettings.startTime >= trimSettings.endTime) {
        setError("End time must be greater than start time");
        return;
      }
      if (trimSettings.endTime > videoInfo.durationSeconds) {
        setError("End time cannot exceed video duration");
        return;
      }
    }

    setIsDownloading(true);
    setError("");
    setDownloadProgress(0);

    try {
      const downloadParams = {
        url: url,
        format_id: selectedFormat,
        format_ext: selectedFormatData.ext,
        trim: enableTrimming ? trimSettings : null,
        filename: `${videoInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}.${selectedFormatData.ext}`
      };

      const response = await fetch('/api/youtube/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(downloadParams)
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 500);

      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = downloadParams.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      setDownloadProgress(100);
      clearInterval(progressInterval);

    } catch (err) {
      setError("Download failed. Please try again.");
      console.error(err);
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadProgress(0), 2000);
    }
  };

  const filteredFormats = videoInfo?.formats.filter(format => {
    if (selectedQuality === 'audio') {
      return format.quality === 'audio';
    }
    return format.quality !== 'audio';
  }) || [];

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
            {/* Page Header */}
            <div className="flex flex-wrap justify-between gap-3 p-4 mb-4">
              <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4 border border-white/40 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-100/80 rounded-lg backdrop-blur-sm">
                    <Download className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h1 className="text-[#1a1a1a] tracking-light text-[32px] font-bold leading-tight drop-shadow-lg">YouTube Downloader</h1>
                    <p className="text-[#2a2a2a] text-sm drop-shadow-sm">Download videos and audio from YouTube in various formats</p>
                  </div>
                </div>
              </div>
            </div>

            {/* URL Input Section */}
            <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl shadow-xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#1a1a1a] drop-shadow-sm">
                <Video className="w-5 h-5 text-red-500" />
                Enter YouTube URL
              </h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-400 text-[#1a1a1a] placeholder-gray-500 transition-all duration-200 shadow-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleGetVideoInfo()}
                  />
                </div>
                
                <button
                  onClick={handleGetVideoInfo}
                  disabled={isLoading || !url.trim()}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Fetching Video Info...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Get Video Info</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50/80 border border-red-200/50 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}
            </div>

            {/* Video Info Section */}
            {videoInfo && (
              <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl shadow-xl p-6 mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Video Preview */}
                  <div className="lg:col-span-1">
                    <div className="relative rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src={videoInfo.thumbnail} 
                        alt={videoInfo.title}
                        className="w-full aspect-video object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                        {videoInfo.duration}
                      </div>
                    </div>
                  </div>

                  {/* Video Details */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2 drop-shadow-sm">{videoInfo.title}</h3>
                    <div className="space-y-2 text-sm text-[#2a2a2a]">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{videoInfo.uploader}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{videoInfo.duration} • {videoInfo.viewCount} views</span>
                      </div>
                    </div>

                    {/* Quality Selection */}
                    <div className="mt-4">
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => setSelectedQuality('video')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                            selectedQuality === 'video'
                              ? 'bg-red-500 text-white'
                              : 'bg-white/50 text-[#2a2a2a] hover:bg-white/70'
                          }`}
                        >
                          <FileVideo className="w-4 h-4" />
                          Video
                        </button>
                        <button
                          onClick={() => setSelectedQuality('audio')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                            selectedQuality === 'audio'
                              ? 'bg-red-500 text-white'
                              : 'bg-white/50 text-[#2a2a2a] hover:bg-white/70'
                          }`}
                        >
                          <Volume2 className="w-4 h-4" />
                          Audio (MP3)
                        </button>
                      </div>

                      <select
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(e.target.value)}
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-400 text-[#1a1a1a] transition-all duration-200 shadow-sm"
                      >
                        {filteredFormats.map((format) => (
                          <option key={format.format_id} value={format.format_id}>
                            {format.format_note} - {formatFileSize(format.filesize)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Trimming Section */}
                <div className="mt-6 pt-6 border-t border-white/30">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="enableTrimming"
                      checked={enableTrimming}
                      onChange={(e) => setEnableTrimming(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <label htmlFor="enableTrimming" className="flex items-center gap-2 text-[#1a1a1a] font-medium">
                      <Scissors className="w-4 h-4" />
                      Trim Video
                    </label>
                  </div>

                  {enableTrimming && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Start Time</label>
                        <input
                          type="text"
                          placeholder="0:00"
                          value={formatTime(trimSettings.startTime)}
                          onChange={(e) => setTrimSettings(prev => ({ ...prev, startTime: parseTimeInput(e.target.value) }))}
                          className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/40 rounded-lg focus:ring-2 focus:ring-red-500 text-[#1a1a1a]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#1a1a1a] mb-2">End Time</label>
                        <input
                          type="text"
                          placeholder={videoInfo.duration}
                          value={formatTime(trimSettings.endTime)}
                          onChange={(e) => setTrimSettings(prev => ({ ...prev, endTime: parseTimeInput(e.target.value) }))}
                          className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/40 rounded-lg focus:ring-2 focus:ring-red-500 text-[#1a1a1a]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Download Section */}
                <div className="mt-6">
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading || !selectedFormat}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    {isDownloading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Downloading... {Math.round(downloadProgress)}%</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Download {selectedQuality === 'audio' ? 'Audio (MP3)' : 'Video'}</span>
                      </>
                    )}
                  </button>

                  {downloadProgress > 0 && downloadProgress < 100 && (
                    <div className="mt-3 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${downloadProgress}%` }}
                      ></div>
                    </div>
                  )}

                  {downloadProgress === 100 && (
                    <div className="mt-3 p-3 bg-green-50/80 border border-green-200/50 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-700 text-sm">Download completed successfully!</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default YouTubeDownloaderPage; 