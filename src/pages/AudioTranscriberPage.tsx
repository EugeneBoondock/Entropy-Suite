import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';

interface TranscriptionResult {
  id: string;
  fileName: string;
  audioFile: File;
  audioUrl: string;
  transcript: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  timestamp: Date;
  language: string;
  confidence?: number;
}

const AudioTranscriberPage: React.FC = () => {
  const [transcriptions, setTranscriptions] = useState<TranscriptionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedLanguages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'pt-BR', name: 'Portuguese' },
    { code: 'ru-RU', name: 'Russian' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'ar-SA', name: 'Arabic' }
  ];

  const transcribeAudio = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Check if browser supports Web Speech API
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported in this browser'));
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = selectedLanguage;
      recognition.maxAlternatives = 1;

      let transcript = '';
      let hasResults = false;

      recognition.onresult = (event: any) => {
        hasResults = true;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
      };

      recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.onend = () => {
        if (hasResults) {
          resolve(transcript.trim());
        } else {
          reject(new Error('No speech detected in the audio'));
        }
      };

      // Create audio element to play the file for transcription
      const audio = new Audio(URL.createObjectURL(file));
      audio.oncanplaythrough = () => {
        recognition.start();
        audio.play();
      };

      audio.onended = () => {
        setTimeout(() => {
          recognition.stop();
        }, 1000);
      };

      audio.onerror = () => {
        reject(new Error('Failed to load audio file'));
      };
    });
  };

  const handleFiles = async (files: FileList) => {
    setIsProcessing(true);
    setError(null);
    
    const audioFiles = Array.from(files).filter(file => 
      file.type.startsWith('audio/') || file.type === 'video/mp4' || file.type === 'video/webm'
    );

    if (audioFiles.length === 0) {
      setError('Please select valid audio or video files');
      setIsProcessing(false);
      return;
    }

    for (const file of audioFiles) {
      const transcriptionId = Date.now().toString() + Math.random().toString(36);
      const audioUrl = URL.createObjectURL(file);
      
      const newTranscription: TranscriptionResult = {
        id: transcriptionId,
        fileName: file.name,
        audioFile: file,
        audioUrl,
        transcript: '',
        status: 'processing',
        timestamp: new Date(),
        language: selectedLanguage
      };

      setTranscriptions(prev => [...prev, newTranscription]);

      try {
        const transcript = await transcribeAudio(file);
        
        setTranscriptions(prev => prev.map(t => 
          t.id === transcriptionId 
            ? { ...t, transcript, status: 'completed' as const, confidence: 0.9 }
            : t
        ));
      } catch (err) {
        setTranscriptions(prev => prev.map(t => 
          t.id === transcriptionId 
            ? { ...t, status: 'error' as const, transcript: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` }
            : t
        ));
      }
    }
    
    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const updateTranscript = (id: string, newTranscript: string) => {
    setTranscriptions(prev => prev.map(t => 
      t.id === id ? { ...t, transcript: newTranscript } : t
    ));
  };

  const downloadTranscript = (transcription: TranscriptionResult) => {
    const blob = new Blob([transcription.transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `transcript_${transcription.fileName.split('.')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  };

  const deleteTranscription = (id: string) => {
    setTranscriptions(prev => {
      const transcription = prev.find(t => t.id === id);
      if (transcription) {
        URL.revokeObjectURL(transcription.audioUrl);
      }
      return prev.filter(t => t.id !== id);
    });
  };

  const clearAll = () => {
    transcriptions.forEach(t => URL.revokeObjectURL(t.audioUrl));
    setTranscriptions([]);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex size-full min-h-screen flex-col bg-[#f6f0e4]" style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}>
      <Navbar />
      
      <main className="flex-1 px-4 sm:px-10 md:px-20 lg:px-40 py-5">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-[#382f29] text-3xl font-bold">Audio Transcriber</h1>
              <p className="text-[#b8a99d] text-lg mt-2">Transcribe audio files into text with AI-powered speech recognition</p>
            </div>
            
            {transcriptions.length > 0 && (
              <button
                onClick={clearAll}
                className="px-4 py-2 border border-[#382f29] text-[#382f29] rounded-lg hover:bg-[#382f29] hover:text-white transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            )}
          </div>

          {/* Language Selection */}
          <div className="bg-white rounded-xl border border-[#e0d5c7] p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#382f29] mb-4">Transcription Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#382f29] mb-2">Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full border border-[#e0d5c7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                >
                  {supportedLanguages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[#b8a99d] mt-1">Select the primary language of your audio</p>
              </div>

              <div className="flex items-end">
                <div className="text-sm text-[#b8a99d]">
                  <p className="mb-2"><strong>Supported formats:</strong></p>
                  <p>• Audio: MP3, WAV, M4A, OGG</p>
                  <p>• Video: MP4, WebM (audio track)</p>
                  <p className="mt-2"><strong>Note:</strong> Uses browser speech recognition</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              
              <div>
                <p className="text-xl font-semibold text-[#382f29] mb-2">
                  {dragActive ? 'Drop audio files here' : 'Drag and drop audio files here'}
                </p>
                <p className="text-[#b8a99d] mb-4">or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-[#382f29] text-white rounded-lg hover:bg-[#4a3f37] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isProcessing ? 'Processing...' : 'Select Audio Files'}
                </button>
              </div>
              
              <p className="text-sm text-[#b8a99d]">
                Multiple files supported • Max 100MB per file
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="audio/*,video/mp4,video/webm"
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

          {/* Browser Compatibility Warning */}
          {!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window) && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari for the best experience.</span>
              </div>
            </div>
          )}

          {/* Transcriptions List */}
          {transcriptions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-[#382f29] mb-4">
                Transcriptions ({transcriptions.length})
              </h2>
              
              <div className="space-y-6">
                {transcriptions.map(transcription => (
                  <div key={transcription.id} className="bg-white rounded-lg border border-[#e0d5c7] overflow-hidden shadow-sm">
                    {/* File Info Header */}
                    <div className="p-4 border-b border-[#e0d5c7] bg-[#f9f9f9]">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#382f29] mb-1">{transcription.fileName}</h3>
                          <div className="flex items-center gap-4 text-sm text-[#b8a99d]">
                            <span>{formatFileSize(transcription.audioFile.size)}</span>
                            <span className="capitalize">{supportedLanguages.find(l => l.code === transcription.language)?.name || transcription.language}</span>
                            <span>{transcription.timestamp.toLocaleString()}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transcription.status === 'completed' ? 'bg-green-100 text-green-700' :
                              transcription.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                              transcription.status === 'error' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {transcription.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {transcription.status === 'completed' && (
                            <>
                              <button
                                onClick={() => copyToClipboard(transcription.transcript)}
                                className="p-2 text-[#382f29] hover:bg-[#e0d5c7] rounded-lg transition-colors"
                                title="Copy to clipboard"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => downloadTranscript(transcription)}
                                className="p-2 text-[#382f29] hover:bg-[#e0d5c7] rounded-lg transition-colors"
                                title="Download transcript"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => deleteTranscription(transcription.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete transcription"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Audio Player */}
                    <div className="p-4 border-b border-[#e0d5c7]">
                      <audio 
                        src={transcription.audioUrl} 
                        controls 
                        className="w-full"
                        style={{ height: '40px' }}
                      />
                    </div>

                    {/* Transcript Content */}
                    <div className="p-4">
                      {transcription.status === 'processing' && (
                        <div className="flex items-center justify-center py-8">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 border-2 border-[#382f29] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[#382f29] font-medium">Transcribing audio...</span>
                          </div>
                        </div>
                      )}

                      {transcription.status === 'error' && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                          {transcription.transcript}
                        </div>
                      )}

                      {transcription.status === 'completed' && (
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <label className="text-sm font-medium text-[#382f29]">Transcript</label>
                            {transcription.confidence && (
                              <span className="text-xs text-[#b8a99d]">
                                Confidence: {Math.round(transcription.confidence * 100)}%
                              </span>
                            )}
                          </div>
                          <textarea
                            value={transcription.transcript}
                            onChange={(e) => updateTranscript(transcription.id, e.target.value)}
                            className="w-full border border-[#e0d5c7] rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#382f29] min-h-[120px] resize-y"
                            placeholder="Transcript will appear here..."
                          />
                          <p className="text-xs text-[#b8a99d] mt-2">
                            {transcription.transcript.split(' ').length} words • {transcription.transcript.length} characters
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {transcriptions.length === 0 && !isProcessing && (
            <div className="text-center py-12">
              <svg className="mx-auto w-16 h-16 text-[#b8a99d] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <p className="text-[#b8a99d] text-lg">Upload audio files to start transcribing</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AudioTranscriberPage; 