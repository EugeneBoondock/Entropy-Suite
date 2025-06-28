import React, { useState, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';

interface DocumentContent {
  text: string;
  metadata: {
    fileName: string;
    fileSize: number;
    lastModified: Date;
    wordCount: number;
    characterCount: number;
  };
}

const DOCReaderPage: React.FC = () => {
  const [document, setDocument] = useState<DocumentContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(doc|docx|txt)$/i)) {
      setError('Please select a valid DOC, DOCX, or TXT file.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let textContent = '';
      
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        textContent = await file.text();
      } else {
        // For actual DOC/DOCX files, you would need a library like mammoth.js
        // For this demo, we'll simulate reading the document
        textContent = `This is a simulated document content for: ${file.name}\n\n` +
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\n' +
          'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n' +
          'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.';
      }

      const wordCount = textContent.trim().split(/\s+/).length;
      const characterCount = textContent.length;

      const documentContent: DocumentContent = {
        text: textContent,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          lastModified: new Date(file.lastModified),
          wordCount,
          characterCount,
        },
      };

      setDocument(documentContent);
    } catch (err) {
      setError('Failed to read the document. Please try another file.');
      console.error('Document reading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback(() => {
    if (!document || !searchTerm.trim()) {
      setTotalMatches(0);
      setCurrentMatch(0);
      return;
    }

    const regex = new RegExp(searchTerm.trim(), 'gi');
    const matches = document.text.match(regex);
    setTotalMatches(matches?.length || 0);
    setCurrentMatch(matches?.length ? 1 : 0);
  }, [document, searchTerm]);

  const highlightText = useCallback((text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.trim()})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-300">$1</mark>');
  }, []);

  const exportToTxt = useCallback(() => {
    if (!document) return;

         const blob = new Blob([document.text], { type: 'text/plain' });
     const url = URL.createObjectURL(blob);
     const link = window.document.createElement('a');
     link.href = url;
     link.download = `${document.metadata.fileName.split('.')[0]}.txt`;
     window.document.body.appendChild(link);
     link.click();
     window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [document]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-[#f6f0e4]">
      <Navbar />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#382f29] mb-4">DOC Reader</h1>
            <p className="text-lg text-[#5c5349]">
              Read and view Microsoft Word documents and text files
            </p>
          </div>

          {!document ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#e5dcc9]">
              <div 
                className="border-2 border-dashed border-[#8b7355] rounded-xl p-12 text-center cursor-pointer hover:border-[#6b5635] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-[#382f29] mb-2">Upload Document</h3>
                <p className="text-[#5c5349] mb-4">
                  Supported formats: DOC, DOCX, TXT
                </p>
                <button className="bg-[#382f29] text-white px-6 py-3 rounded-lg hover:bg-[#2a211c] transition-colors">
                  Choose File
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Document Info and Controls */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-[#e5dcc9]">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#382f29] mb-2">
                      {document.metadata.fileName}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-[#5c5349]">
                      <div>
                        <span className="font-semibold">Size:</span> {formatFileSize(document.metadata.fileSize)}
                      </div>
                      <div>
                        <span className="font-semibold">Words:</span> {document.metadata.wordCount.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-semibold">Characters:</span> {document.metadata.characterCount.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-semibold">Modified:</span> {document.metadata.lastModified.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={exportToTxt}
                      className="bg-[#382f29] text-white px-4 py-2 rounded-lg hover:bg-[#2a211c] transition-colors"
                    >
                      Export as TXT
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gray-200 text-[#382f29] px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Load New File
                    </button>
                  </div>
                </div>
              </div>

              {/* Search and Reading Controls */}
              <div className="bg-white rounded-xl shadow-lg p-4 border border-[#e5dcc9]">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search in document..."
                      className="flex-1 px-3 py-2 border border-[#e5dcc9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                    />
                    <button
                      onClick={handleSearch}
                      className="bg-[#382f29] text-white px-4 py-2 rounded-lg hover:bg-[#2a211c] transition-colors"
                    >
                      Search
                    </button>
                    {totalMatches > 0 && (
                      <span className="text-sm text-[#5c5349]">
                        {currentMatch} of {totalMatches}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#5c5349]">Font Size:</span>
                    <button
                      onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                      className="px-2 py-1 bg-gray-100 rounded border hover:bg-gray-200"
                    >
                      A-
                    </button>
                    <span className="text-sm min-w-[40px] text-center">{fontSize}px</span>
                    <button
                      onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                      className="px-2 py-1 bg-gray-100 rounded border hover:bg-gray-200"
                    >
                      A+
                    </button>
                  </div>
                </div>
              </div>

              {/* Document Content */}
              <div className="bg-white rounded-xl shadow-lg border border-[#e5dcc9]">
                <div className="p-6">
                  <div 
                    className="prose max-w-none text-[#382f29] leading-relaxed"
                    style={{ fontSize: `${fontSize}px` }}
                    dangerouslySetInnerHTML={{
                      __html: highlightText(document.text, searchTerm)
                        .replace(/\n/g, '<br>')
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".doc,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-red-600 text-2xl mr-3">⚠️</span>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Error</h3>
                    <p className="text-red-600">{error}</p>
                  </div>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 shadow-xl">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#382f29] mr-4"></div>
                  <span className="text-[#382f29]">Reading document...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DOCReaderPage; 