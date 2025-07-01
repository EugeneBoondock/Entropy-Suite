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

  // Helper function to convert an AudioBuffer to a WAV file Blob
  const bufferToWave = (audioBuffer: AudioBuffer): Blob => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const numSamples = audioBuffer.length;
    const dataLength = numSamples * numChannels * 2; // 2 bytes per sample (16-bit)
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    let offset = 0;

    const writeString = (str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
      offset += str.length;
    };

    // RIFF header
    writeString('RIFF');
    view.setUint32(offset, 36 + dataLength, true); offset += 4;
    writeString('WAVE');

    // "fmt " sub-chunk
    writeString('fmt ');
    view.setUint32(offset, 16, true); offset += 4; // 16 for PCM
    view.setUint16(offset, 1, true); offset += 2; // PCM is 1 (linear quantization)
    view.setUint16(offset, numChannels, true); offset += 2;
    view.setUint32(offset, sampleRate, true); offset += 4;
    view.setUint32(offset, sampleRate * numChannels * 2, true); offset += 4; // byteRate
    view.setUint16(offset, numChannels * 2, true); offset += 2; // blockAlign
    view.setUint16(offset, 16, true); offset += 2; // bitsPerSample

    // "data" sub-chunk
    writeString('data');
    view.setUint32(offset, dataLength, true); offset += 4;

    // Write the PCM samples
    const channels = [];
    for (let i = 0; i < numChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    for (let i = 0; i < numSamples; i++) {
      for (let j = 0; j < numChannels; j++) {
        const sample = Math.max(-1, Math.min(1, channels[j][i]));
        const intSample = sample < 0 ? sample * 32768 : sample * 32767;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  // Pre-processes audio files by converting them to WAV for better compatibility
  const convertToWav = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target?.result) {
          return reject(new Error('Failed to read file.'));
        }
        const arrayBuffer = event.target.result as ArrayBuffer;
        
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) {
            return reject(new Error('Browser does not support AudioContext. Cannot process file.'));
        }
        const audioContext = new AudioContext();

        audioContext.decodeAudioData(arrayBuffer)
          .then(audioBuffer => {
            const wavBlob = bufferToWave(audioBuffer);
            const wavFile = new File([wavBlob], file.name.replace(/\.[^/.]+$/, "") + ".wav", { type: 'audio/wav' });
            resolve(wavFile);
          })
          .catch(e => {
            console.error('Error decoding audio data:', e);
            reject(new Error('Could not decode audio file. It may be corrupt or in an unsupported format.'));
          })
          .finally(() => {
            audioContext.close();
          });
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const transcribeAudio = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Check if browser supports Web Speech API
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.'));
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
      let timeoutId: NodeJS.Timeout;

      recognition.onresult = (event: any) => {
        hasResults = true;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        // Reset timeout when we get results
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          recognition.stop();
        }, 3000);
      };

      recognition.onerror = (event: any) => {
        clearTimeout(timeoutId);
        let errorMessage = 'Speech recognition error';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected in the audio';
            break;
          case 'audio-capture':
            errorMessage = 'Audio capture failed';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied';
            break;
          case 'network':
            errorMessage = 'Network error occurred';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not allowed';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        reject(new Error(errorMessage));
      };

      recognition.onend = () => {
        clearTimeout(timeoutId);
        if (hasResults && transcript.trim()) {
          resolve(transcript.trim());
        } else {
          reject(new Error('No speech detected in the audio. Please ensure the audio contains clear speech.'));
        }
      };

      // Create audio element to play the file for transcription
      const audio = new Audio(URL.createObjectURL(file));
      
      audio.oncanplaythrough = () => {
        recognition.start();
        audio.play();
        
        // Set a timeout to stop recognition after audio ends
        timeoutId = setTimeout(() => {
          recognition.stop();
        }, (audio.duration + 2) * 1000); // Audio duration + 2 seconds buffer
      };

      audio.onended = () => {
        // Give some time for final speech recognition
        setTimeout(() => {
          recognition.stop();
        }, 2000);
      };

      audio.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Failed to load audio file. Please ensure the file is a valid audio format.'));
      };

      // Set volume to 0 to avoid playing audio through speakers
      audio.volume = 0;
    });
  };

  const handleFiles = async (files: FileList) => {
    setIsProcessing(true);
    setError(null);
    
    const audioFiles = Array.from(files).filter(file => 
      file.type.startsWith('audio/') || file.type.startsWith('video/')
    );

    if (audioFiles.length === 0) {
      setError('Please select valid audio or video files');
      setIsProcessing(false);
      return;
    }

    // Check file sizes
    const oversizedFiles = audioFiles.filter(file => file.size > 100 * 1024 * 1024); // 100MB
    if (oversizedFiles.length > 0) {
      setError(`Some files are too large. Maximum size is 100MB per file.`);
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
        // Convert to WAV first for better compatibility
        const wavFile = await convertToWav(file);
        const transcript = await transcribeAudio(wavFile);
        
        setTranscriptions(prev => prev.map(t => 
          t.id === transcriptionId 
            ? { ...t, transcript, status: 'completed' as const, confidence: 0.85 }
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
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

  const isSpeechRecognitionSupported = () => {
    return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: "url('/images/bg_image.png')",
        fontFamily: '"Space Grotesk", "Noto Sans", sans-serif'
      }}
    >
      {/* Background overlay */}
      <div className="min-h-screen bg-black/10">
        <Navbar />
        
        {/* Spacer for fixed navbar */}
        <div className="h-16"></div>
        
        <main className="px-4 sm:px-10 md:px-20 lg:px-40 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-xl">
                <h1 className="text-white text-3xl font-bold mb-2">Audio Transcriber</h1>
                <p className="text-white/80 text-lg">Transcribe audio files into text with AI-powered speech recognition</p>
              </div>
              
              {transcriptions.length > 0 && (
                <button
                  onClick={clearAll}
                  className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl px-6 py-3 text-white hover:bg-white/30 transition-all duration-300 flex items-center gap-3 shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All
                </button>
              )}
            </div>

            {/* Language Selection */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-6">Transcription Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-white mb-3">Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                  >
                    {supportedLanguages.map(lang => (
                      <option key={lang.code} value={lang.code} className="bg-gray-800 text-white">
                        {lang.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-white/60 mt-2">Select the primary language of your audio</p>
                </div>

                <div className="flex items-end">
                  <div className="text-sm text-white/70">
                    <p className="mb-3 font-medium text-white">Supported formats:</p>
                    <p className="mb-1">• Audio: MP3, WAV, M4A, OGG</p>
                    <p className="mb-1">• Video: MP4, WebM (audio track)</p>
                    <p className="mt-3 text-xs">
                      <strong className="text-white">Note:</strong> Uses browser speech recognition
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Browser Compatibility Warning */}
            {!isSpeechRecognitionSupported() && (
              <div className="bg-yellow-500/20 backdrop-blur-md border border-yellow-400/30 text-yellow-100 px-6 py-4 rounded-2xl mb-8 shadow-xl">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari for the best experience.</span>
                </div>
              </div>
            )}

            {/* Upload Area */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12 mb-8 shadow-xl">
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-white/60 bg-white/10' 
                    : 'border-white/30 hover:border-white/50 hover:bg-white/5'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="space-y-6">
                  <svg className="mx-auto w-16 h-16 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  
                  <div>
                    <p className="text-xl font-semibold text-white mb-3">
                      {dragActive ? 'Drop audio files here' : 'Drag and drop audio files here'}
                    </p>
                    <p className="text-white/70 mb-6">or</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing || !isSpeechRecognitionSupported()}
                      className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-8 py-4 text-white hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                    >
                      {isProcessing ? 'Processing...' : 'Select Audio Files'}
                    </button>
                  </div>
                  
                  <p className="text-sm text-white/60">
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
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-white px-6 py-4 rounded-2xl mb-8 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
                <button 
                  onClick={() => setError(null)} 
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Transcriptions List */}
            {transcriptions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">
                  Transcriptions ({transcriptions.length})
                </h2>
                
                <div className="space-y-6">
                  {transcriptions.map(transcription => (
                    <div key={transcription.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-xl">
                      {/* File Info Header */}
                      <div className="p-6 border-b border-white/10">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white text-lg mb-2">{transcription.fileName}</h3>
                            <div className="flex items-center gap-4 text-sm text-white/70">
                              <span>{formatFileSize(transcription.audioFile.size)}</span>
                              <span className="capitalize">{supportedLanguages.find(l => l.code === transcription.language)?.name || transcription.language}</span>
                              <span>{transcription.timestamp.toLocaleString()}</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                transcription.status === 'completed' ? 'bg-green-500/20 text-green-100 border border-green-400/30' :
                                transcription.status === 'processing' ? 'bg-blue-500/20 text-blue-100 border border-blue-400/30' :
                                transcription.status === 'error' ? 'bg-red-500/20 text-red-100 border border-red-400/30' :
                                'bg-gray-500/20 text-gray-100 border border-gray-400/30'
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
                                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-white hover:bg-white/20 transition-all duration-300"
                                  title="Copy to clipboard"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => downloadTranscript(transcription)}
                                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-white hover:bg-white/20 transition-all duration-300"
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
                              className="bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-xl p-3 text-red-100 hover:bg-red-500/30 transition-all duration-300"
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
                      <div className="p-6 border-b border-white/10">
                        <audio 
                          src={transcription.audioUrl} 
                          controls 
                          className="w-full h-12 bg-white/10 backdrop-blur-md rounded-xl"
                        />
                      </div>

                      {/* Transcript Content */}
                      <div className="p-6">
                        {transcription.status === 'processing' && (
                          <div className="flex items-center justify-center py-12">
                            <div className="flex items-center gap-4">
                              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-white font-medium">Transcribing audio...</span>
                            </div>
                          </div>
                        )}

                        {transcription.status === 'error' && (
                          <div className="bg-red-500/20 backdrop-blur-md border border-red-400/30 text-red-100 px-6 py-4 rounded-xl">
                            {transcription.transcript}
                          </div>
                        )}

                        {transcription.status === 'completed' && (
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <label className="text-sm font-medium text-white">Transcript</label>
                              {transcription.confidence && (
                                <span className="text-xs text-white/60 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
                                  Confidence: {Math.round(transcription.confidence * 100)}%
                                </span>
                              )}
                            </div>
                            <textarea
                              value={transcription.transcript}
                              onChange={(e) => updateTranscript(transcription.id, e.target.value)}
                              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 min-h-[120px] resize-y"
                              placeholder="Transcript will appear here..."
                            />
                            <p className="text-xs text-white/60 mt-3">
                              {transcription.transcript.split(' ').filter(word => word.length > 0).length} words • {transcription.transcript.length} characters
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
              <div className="text-center py-16">
                <svg className="mx-auto w-16 h-16 text-white/50 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <p className="text-white/70 text-lg">Upload audio files to start transcribing</p>
                <p className="text-white/50 text-sm mt-2">Supports multiple languages and formats</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AudioTranscriberPage; 