import React, { useState, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { translateText as translateTextWithGemini } from '../tools/SummarizerTool/translationService';

interface TranslationJob {
  id: string;
  file: File;
  originalText: string;
  translatedText?: string;
  sourceLanguage: string;
  targetLanguage: string;
  status: 'pending' | 'translating' | 'completed' | 'error';
  progress: number;
}

const DocumentTranslatorPage: React.FC = () => {
  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages = [
    { code: 'auto', name: 'Auto-detect' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
  ];

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newJobs: TranslationJob[] = [];
    
    for (const file of Array.from(files)) {
      if (!file.type.includes('text') && !file.name.match(/\.(txt|doc|docx|pdf)$/i)) {
        setError(`Unsupported file type: ${file.name}`);
        continue;
      }

      try {
        let text = '';
        if (file.type === 'text/plain') {
          text = await file.text();
        } else {
          // For other file types, simulate text extraction
          text = `Sample text extracted from ${file.name}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`;
        }

        const job: TranslationJob = {
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          file,
          originalText: text,
          sourceLanguage,
          targetLanguage,
          status: 'pending',
          progress: 0,
        };

        newJobs.push(job);
      } catch (err) {
        setError(`Failed to read file: ${file.name}`);
      }
    }

    setJobs(prev => [...prev, ...newJobs]);
    setError(null);
  }, [sourceLanguage, targetLanguage]);

  const translateText = useCallback(async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
    return await translateTextWithGemini(text, sourceLang, targetLang);
  }, []);

  const startTranslation = useCallback(async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    setJobs(prev => prev.map(j => 
      j.id === jobId ? { ...j, status: 'translating', progress: 0 } : j
    ));

    try {
      const progressInterval = setInterval(() => {
        setJobs(prev => prev.map(j => {
          if (j.id === jobId && j.progress < 90) {
            return { ...j, progress: j.progress + 10 };
          }
          return j;
        }));
      }, 200);

      const translatedText = await translateText(job.originalText, job.sourceLanguage, job.targetLanguage);

      clearInterval(progressInterval);

      setJobs(prev => prev.map(j => 
        j.id === jobId 
          ? { ...j, translatedText, status: 'completed', progress: 100 }
          : j
      ));
    } catch (err) {
      setJobs(prev => prev.map(j => 
        j.id === jobId ? { ...j, status: 'error', progress: 0 } : j
      ));
    }
  }, [jobs, translateText]);

  const downloadTranslation = useCallback((job: TranslationJob) => {
    if (!job.translatedText) return;

    const blob = new Blob([job.translatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `translated_${job.file.name}.txt`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f0e4]">
      <Navbar />
      
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#382f29] mb-4">Document Translator</h1>
            <p className="text-lg text-[#5c5349]">
              Translate your documents into multiple languages
            </p>
          </div>

          {/* Language Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-[#e5dcc9]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#382f29] mb-2">
                  From Language
                </label>
                <select
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e5dcc9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#382f29] mb-2">
                  To Language
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e5dcc9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                >
                  {languages.filter(lang => lang.code !== 'auto').map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-[#e5dcc9]">
            <div 
              className="border-2 border-dashed border-[#8b7355] rounded-xl p-8 text-center cursor-pointer hover:border-[#6b5635] transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-6xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold text-[#382f29] mb-2">Upload Documents</h3>
              <p className="text-[#5c5349] mb-4">
                Supported formats: TXT, DOC, DOCX, PDF
              </p>
              <button className="bg-[#382f29] text-white px-6 py-3 rounded-lg hover:bg-[#2a211c] transition-colors">
                Choose Files
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.doc,.docx,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Translation Jobs */}
          {jobs.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#e5dcc9]">
              <h2 className="text-xl font-semibold text-[#382f29] mb-4">
                Translation Jobs ({jobs.length})
              </h2>

              <div className="space-y-4">
                {jobs.map(job => (
                  <div key={job.id} className="border border-[#e5dcc9] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📄</span>
                        <div>
                          <h3 className="font-medium text-[#382f29]">{job.file.name}</h3>
                          <p className="text-sm text-[#5c5349]">
                            {languages.find(l => l.code === job.sourceLanguage)?.name} → {' '}
                            {languages.find(l => l.code === job.targetLanguage)?.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {job.status === 'pending' && (
                          <button
                            onClick={() => startTranslation(job.id)}
                            className="bg-[#382f29] text-white px-3 py-1 rounded text-sm hover:bg-[#2a211c]"
                          >
                            Translate
                          </button>
                        )}
                        {job.status === 'completed' && (
                          <button
                            onClick={() => downloadTranslation(job)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Download
                          </button>
                        )}
                      </div>
                    </div>

                    {job.status === 'translating' && (
                      <div className="mb-2">
                        <div className="flex justify-between text-sm text-[#5c5349] mb-1">
                          <span>Translating...</span>
                          <span>{job.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#382f29] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${job.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {job.translatedText && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="text-sm font-medium text-[#382f29] mb-2">Original</h4>
                          <div className="text-sm text-[#5c5349] bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                            {job.originalText.substring(0, 200)}
                            {job.originalText.length > 200 && '...'}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[#382f29] mb-2">Translation</h4>
                          <div className="text-sm text-[#5c5349] bg-green-50 p-3 rounded border max-h-32 overflow-y-auto">
                            {job.translatedText.substring(0, 200)}
                            {job.translatedText.length > 200 && '...'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentTranslatorPage; 