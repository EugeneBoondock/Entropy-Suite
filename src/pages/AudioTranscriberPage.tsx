import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface TranscriptionResult {
  id: string;
  fileName: string;
  audioFile: File;
  audioUrl: string;
  transcript: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  timestamp: Date;
  language: string;
}

const AudioTranscriberPage: React.FC = () => {
  const [transcriptions, setTranscriptions] = useState<TranscriptionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!API_KEY) {
    const errorMsg = "VITE_GEMINI_API_KEY is not set. Please add it to your .env file to enable transcription.";
    console.error(errorMsg);
    // Display error in the component if it hasn't been shown yet
    if (error !== errorMsg) {
        setError(errorMsg);
    }
  }

  const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

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

  // Helper function to convert a File object to a GoogleGenerativeAI.Part
  const fileToGenerativePart = async (file: File) => {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve((reader.result as string).split(',')[1]);
        } else {
          reject(new Error("Failed to read file for base64 encoding."));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  
    return {
      inlineData: { data: base64EncodedData, mimeType: file.type },
    };
  }

  const transcribeAudio = async (file: File): Promise<string> => {
    if (!genAI) {
      throw new Error("Gemini API key not configured. Cannot transcribe.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const audioPart = await fileToGenerativePart(file);
    const prompt = "Transcribe the following audio file. Provide only the transcribed text and nothing else.";

    const result = await model.generateContent([prompt, audioPart]);
    const response = await result.response;

    return response.text();
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
        language: 'auto-detected'
      };

      setTranscriptions(prev => [...prev, newTranscription]);

      try {
        // Convert to WAV first for better compatibility
        const wavFile = await convertToWav(file);
        const transcript = await transcribeAudio(wavFile);
        
        setTranscriptions(prev => prev.map(t => 
          t.id === transcriptionId 
            ? { ...t, transcript, status: 'completed' as const }
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        <main className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5 pt-28">
          <div className="layout-content-container flex flex-col w-full max-w-4xl flex-1">
            <div className="flex flex-col items-center gap-4 p-4 text-center">
                <div className="p-3 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg inline-block">
                    <svg className="w-10 h-10 text-slate-800 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2s-2-.9-2-2V4c0-1.1.9-2 2-2zm5.3 6c0 3-2.54 5.1-5.3 5.1S6.7 11 6.7 8H5c0 3.41 2.72 6.23 6 6.72V17h-2v2h6v-2h-2v-2.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-slate-800 drop-shadow-lg tracking-tight">Audio Transcriber</h1>
                <p className="max-w-2xl text-slate-700 drop-shadow-sm font-medium">
                    Upload audio or video files to get a fast, accurate transcription. Powered by Google's Gemini AI for high-quality results.
                </p>
            </div>
            
            <div 
              id="drop-zone"
              onDrop={handleDrop} 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`mt-6 p-8 border-4 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-300
                ${dragActive ? 'border-blue-500 bg-blue-500/10 scale-105' : 'border-gray-400/50 hover:border-blue-400 hover:bg-white/20'}
                bg-white/10 backdrop-blur-sm shadow-inner`
              }
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => e.target.files && handleFiles(e.target.files)} 
                multiple
                accept="audio/*,video/mp4,video/webm"
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-4 text-slate-600">
                <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3-3 3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-lg font-semibold">Drag & drop your files here or <span className="text-blue-600">click to browse</span></p>
                <p className="text-sm text-gray-500">Supports all major audio formats and MP4/WebM video. Max 100MB per file.</p>
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-r-lg shadow" role="alert">
                <p className="font-bold">An Error Occurred</p>
                <p>{error}</p>
              </div>
            )}
            
            <div className="mt-8">
              {transcriptions.length > 0 && (
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-800">Transcription History</h2>
                  <button 
                    onClick={clearAll}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-700 rounded-lg transition-colors text-sm font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    Clear All
                  </button>
                </div>
              )}
              
              <div className="space-y-4">
                {transcriptions.map((transcription) => (
                  <div key={transcription.id} className="bg-white/50 backdrop-blur-md border border-white/30 rounded-xl shadow-lg transition-shadow hover:shadow-xl">
                    <div className="p-4 border-b border-white/20">
                      <div className="flex items-center justify-between gap-4">
                        <div className="font-semibold text-slate-800 truncate" title={transcription.fileName}>{transcription.fileName}</div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span>{formatFileSize(transcription.audioFile.size)}</span>
                          <div className={`px-2 py-0.5 rounded-full text-xs font-medium border
                            ${transcription.status === 'completed' ? 'bg-green-500/10 text-green-800 border-green-500/20' : ''}
                            ${transcription.status === 'processing' ? 'bg-yellow-500/10 text-yellow-800 border-yellow-500/20' : ''}
                            ${transcription.status === 'error' ? 'bg-red-500/10 text-red-800 border-red-500/20' : ''}
                          `}>
                            {transcription.status}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      {transcription.status === 'processing' ? (
                        <div className="flex items-center justify-center p-8">
                          <div className="flex flex-col items-center gap-2">
                            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-slate-600 font-medium">Processing...</span>
                          </div>
                        </div>
                      ) : (
                        <textarea
                          readOnly={transcription.status !== 'completed'}
                          value={transcription.transcript}
                          onChange={(e) => updateTranscript(transcription.id, e.target.value)}
                          className="w-full h-32 p-2 bg-slate-50/50 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder={transcription.status === 'error' ? 'Transcription failed.' : 'No transcript available.'}
                        />
                      )}
                    </div>
                    <div className="px-4 py-3 bg-white/20 border-t border-white/20 flex flex-wrap items-center justify-between gap-2">
                       <div className="flex items-center gap-2">
                          <audio controls src={transcription.audioUrl} className="h-8 max-w-xs"></audio>
                       </div>
                       <div className="flex items-center gap-2">
                         <button onClick={() => downloadTranscript(transcription)} className="p-2 rounded-md hover:bg-gray-400/20 transition-colors" title="Download TXT">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download-cloud"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg>
                         </button>
                         <button onClick={() => copyToClipboard(transcription.transcript)} className="p-2 rounded-md hover:bg-gray-400/20 transition-colors" title="Copy to Clipboard">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                         </button>
                         <button onClick={() => deleteTranscription(transcription.id)} className="p-2 rounded-md text-red-600 hover:bg-red-500/10 transition-colors" title="Delete">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                         </button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AudioTranscriberPage; 