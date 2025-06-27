import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import Navbar from '../components/Navbar';

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFDocument {
  id: string;
  name: string;
  file: File;
  url: string;
  pageCount: number;
  uploadedAt: Date;
}

const PDFReaderPage: React.FC = () => {
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<PDFDocument | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState(1.0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = URL.createObjectURL(file);
      const doc: PDFDocument = {
        id: Date.now().toString(),
        name: file.name,
        file,
        url,
        pageCount: 0, // Will be set when document loads
        uploadedAt: new Date(),
      };

      setDocuments(prev => [...prev, doc]);
      setSelectedDoc(doc);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError('Failed to load PDF file.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    if (selectedDoc) {
      const updatedDoc = { ...selectedDoc, pageCount: numPages };
      setSelectedDoc(updatedDoc);
      setDocuments(prev => 
        prev.map(doc => doc.id === selectedDoc.id ? updatedDoc : doc)
      );
    }
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF. Please try a different file.');
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
      handleFileSelect(file);
    }
  };

  const deleteDocument = (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (doc) {
      URL.revokeObjectURL(doc.url);
      setDocuments(prev => prev.filter(d => d.id !== id));
      if (selectedDoc?.id === id) {
        setSelectedDoc(null);
        setNumPages(0);
        setCurrentPage(1);
      }
    }
  };

  const nextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(3.0, prev + 0.25));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.25, prev - 0.25));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  const downloadPDF = () => {
    if (selectedDoc) {
      const link = document.createElement('a');
      link.href = selectedDoc.url;
      link.download = selectedDoc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
      {/* Add necessary styles for react-pdf */}
      <style>{`
        .react-pdf__Page {
          position: relative;
          display: block;
        }
        
        .react-pdf__Page__canvas {
          display: block;
          user-select: none;
        }
        
        /* Text Layer Styles */
        .react-pdf__Page__textContent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0;
          user-select: text;
          pointer-events: none;
          line-height: 1;
        }
        
        .react-pdf__Page__textContent span {
          position: absolute;
          color: transparent;
          font-size: 1px;
          font-family: sans-serif;
          transform-origin: 0% 0%;
          white-space: pre;
        }
        
        .react-pdf__Page__textContent::selection {
          background: rgba(0, 100, 255, 0.3);
        }
        
        .react-pdf__Page__textContent span::selection {
          background: rgba(0, 100, 255, 0.3);
        }
        
        /* Annotation Layer Styles */
        .react-pdf__Page__annotations {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        
        .react-pdf__Page__annotations .linkAnnotation > a {
          position: absolute;
          font-size: 1em;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .react-pdf__Page__annotations .linkAnnotation > a:hover {
          opacity: 0.2;
          background: yellow;
          box-shadow: 0px 2px 10px #ff0;
        }
        
        .react-pdf__Page__annotations .textWidgetAnnotation input,
        .react-pdf__Page__annotations .textWidgetAnnotation textarea,
        .react-pdf__Page__annotations .choiceWidgetAnnotation select,
        .react-pdf__Page__annotations .buttonWidgetAnnotation.checkBox input,
        .react-pdf__Page__annotations .buttonWidgetAnnotation.radioButton input {
          background: rgba(0, 54, 255, 0.13);
          border: 1px solid transparent;
          box-sizing: border-box;
          font-size: 9px;
          height: 100%;
          margin: 0;
          padding: 0 3px;
          vertical-align: top;
          width: 100%;
        }
      `}</style>

      {/* Page overlay for better contrast */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none"></div>
      
      <div className="relative z-10">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 max-w-2xl mx-auto">
              <h1 className="text-4xl font-bold text-[#1a1a1a] mb-4 drop-shadow-md">
                📄 PDF Reader
              </h1>
              <p className="text-lg text-[#1a1a1a]/80 leading-relaxed drop-shadow-sm">
                View and read PDF files directly in your browser with full functionality.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 max-w-2xl mx-auto">
              {error}
            </div>
          )}

          {/* Main Content */}
          {selectedDoc ? (
            <div className="max-w-7xl mx-auto">
              {/* Top Controls */}
              <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Document Info */}
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-[#1a1a1a] truncate max-w-xs">{selectedDoc.name}</h3>
                      <p className="text-sm text-[#1a1a1a]/70">
                        Page {currentPage} of {numPages || '...'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Navigation & Controls */}
                  <div className="flex items-center gap-2">
                    {/* Page Navigation */}
                    <div className="flex items-center gap-1 bg-white/30 rounded-lg p-1">
                      <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/50 transition-colors"
                        title="Previous Page"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <input
                        type="number"
                        min="1"
                        max={numPages}
                        value={currentPage}
                        onChange={(e) => goToPage(parseInt(e.target.value))}
                        className="w-12 px-2 py-1 text-center border-0 bg-transparent focus:outline-none focus:bg-white/50 rounded"
                      />
                      
                      <button
                        onClick={nextPage}
                        disabled={currentPage === numPages}
                        className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/50 transition-colors"
                        title="Next Page"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1 bg-white/30 rounded-lg p-1">
                      <button
                        onClick={zoomOut}
                        disabled={scale <= 0.25}
                        className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/50 transition-colors"
                        title="Zoom Out"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={resetZoom}
                        className="px-3 py-2 text-sm font-medium hover:bg-white/50 rounded-md transition-colors"
                        title="Reset Zoom"
                      >
                        {Math.round(scale * 100)}%
                      </button>
                      
                      <button
                        onClick={zoomIn}
                        disabled={scale >= 3.0}
                        className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/50 transition-colors"
                        title="Zoom In"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    {/* Download */}
                    <button
                      onClick={downloadPDF}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Download PDF"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>

                    {/* Upload New */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      title="Upload New PDF"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="bg-white/40 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="p-6 bg-gray-50/50 min-h-[600px] flex items-center justify-center">
                  <div className="bg-white shadow-2xl rounded-lg overflow-hidden max-w-full">
                    <Document
                      file={selectedDoc.url}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={
                        <div className="flex flex-col items-center justify-center p-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                          <p className="text-[#1a1a1a]">Loading PDF...</p>
                        </div>
                      }
                      error={
                        <div className="flex flex-col items-center justify-center p-8">
                          <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <p className="text-red-600">Failed to load PDF</p>
                        </div>
                      }
                    >
                      <Page
                        pageNumber={currentPage}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        loading={
                          <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        }
                        error={
                          <div className="flex items-center justify-center p-8">
                            <p className="text-red-600">Failed to load page</p>
                          </div>
                        }
                      />
                    </Document>
                  </div>
                </div>
              </div>

              {/* Document List */}
              {documents.length > 1 && (
                <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 mt-6">
                  <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">📚 Your Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map(doc => (
                      <div
                        key={doc.id}
                        className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedDoc?.id === doc.id
                            ? 'border-blue-500 bg-blue-50/50 shadow-md'
                            : 'border-white/30 hover:border-blue-400 hover:bg-white/30'
                        }`}
                        onClick={() => {
                          setSelectedDoc(doc);
                          setCurrentPage(1);
                          setError(null);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-[#1a1a1a] truncate text-sm">{doc.name}</h4>
                            <p className="text-xs text-[#1a1a1a]/70">
                              {doc.pageCount > 0 ? `${doc.pageCount} pages` : 'Loading...'}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDocument(doc.id);
                            }}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Upload Area */
            <div className="max-w-4xl mx-auto">
              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 bg-white/40 backdrop-blur-md shadow-xl border-white/20 ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50/50 scale-105' 
                    : 'hover:border-blue-400 hover:bg-white/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="text-6xl mb-6">📄</div>
                <h3 className="text-2xl font-semibold text-[#1a1a1a] mb-4">
                  {isLoading ? 'Processing PDF...' : 'Upload Your PDF'}
                </h3>
                <p className="text-[#1a1a1a]/70 mb-6 text-lg">
                  Drop your PDF file here or click to browse
                </p>
                
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-[#1a1a1a]">Loading PDF...</span>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors duration-200 text-lg"
                  >
                    Choose PDF File
                  </button>
                )}
                
                <div className="mt-6 text-sm text-[#1a1a1a]/60">
                  Supports PDF files up to 50MB
                </div>
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20 mt-8 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 text-center">✨ Features</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">📄</div>
                <h3 className="font-semibold text-[#1a1a1a] mb-2">True PDF Rendering</h3>
                <p className="text-[#1a1a1a]/70 text-sm">Powered by react-pdf for reliable document display</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="font-semibold text-[#1a1a1a] mb-2">High Quality</h3>
                <p className="text-[#1a1a1a]/70 text-sm">Crystal clear rendering with text and annotations</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🔧</div>
                <h3 className="font-semibold text-[#1a1a1a] mb-2">Zoom & Navigation</h3>
                <p className="text-[#1a1a1a]/70 text-sm">Full zoom controls and smooth page navigation</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">💾</div>
                <h3 className="font-semibold text-[#1a1a1a] mb-2">Download</h3>
                <p className="text-[#1a1a1a]/70 text-sm">Save PDFs locally for offline access</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
};

export default PDFReaderPage; 