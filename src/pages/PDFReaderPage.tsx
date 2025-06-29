import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import Navbar from '../components/Navbar';

// Note: TextLayer and AnnotationLayer CSS imports removed since we're not using these layers
// This prevents console warnings about missing styles

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fitToWidth, setFitToWidth] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement ||
        (document as any).mozFullScreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    // Add event listeners for all browsers
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedDoc) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevPage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextPage();
          break;
        case 'Escape':
          if (isFullscreen) {
            exitFullscreen();
          }
          break;
        case 'f':
        case 'F':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        case '+':
        case '=':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomIn();
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomOut();
          }
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            resetZoom();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedDoc, isFullscreen, currentPage, numPages, scale]);

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
    setFitToWidth(false);
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.25, prev - 0.25));
    setFitToWidth(false);
  };

  const resetZoom = () => {
    setScale(1.0);
    setFitToWidth(false);
  };

  const toggleFitToWidth = () => {
    setFitToWidth(!fitToWidth);
    if (!fitToWidth) {
      setScale(1.2); // Approximate fit-to-width scale
    } else {
      setScale(1.0);
    }
  };

  const toggleFullscreen = () => {
    const element = mainContainerRef.current;
    if (!element) return;

    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (element.requestFullscreen) {
        element.requestFullscreen().catch(err => console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`));
      } else if ((element as any).mozRequestFullScreen) { // Firefox
        (element as any).mozRequestFullScreen();
      } else if ((element as any).webkitRequestFullscreen) { // Chrome, Safari and Opera
        (element as any).webkitRequestFullscreen();
      } else if ((element as any).msRequestFullscreen) { // IE/Edge
        (element as any).msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).mozCancelFullScreen) { // Firefox
        (document as any).mozCancelFullScreen();
      } else if ((document as any).webkitExitFullscreen) { // Chrome, Safari and Opera
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) { // IE/Edge
        (document as any).msExitFullscreen();
      }
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).mozCancelFullScreen) { // Firefox
        (document as any).mozCancelFullScreen();
      } else if ((document as any).webkitExitFullscreen) { // Chrome, Safari and Opera
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) { // IE/Edge
        (document as any).msExitFullscreen();
      }
    }
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
      ref={mainContainerRef}
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: "url('/images/bg_image.png')",
        fontFamily: '"Space Grotesk", "Noto Sans", sans-serif'
      }}
    >
      {/* Add necessary styles for react-pdf */}
      <style>{`
        .react-pdf__Page {
          position: relative;
          display: block;
          margin: 0 auto;
        }
        
        .react-pdf__Page__canvas {
          display: block;
          user-select: none;
          max-width: 100%;
          height: auto;
        }

        .pdf-viewer-fullscreen {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 9999 !important;
          background: #000 !important;
          display: flex !important;
          flex-direction: column !important;
        }

        .pdf-viewer-fullscreen .pdf-controls {
          background: rgba(0, 0, 0, 0.9) !important;
          backdrop-filter: blur(10px) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
          padding: 1rem !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          flex-shrink: 0 !important;
        }

        .pdf-viewer-fullscreen .pdf-content {
          flex: 1 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          overflow: auto !important;
          padding: 1rem !important;
          background: #111 !important;
        }

        /* Ensure fullscreen works across browsers */
        .pdf-viewer-fullscreen:-webkit-full-screen {
          width: 100vw !important;
          height: 100vh !important;
        }

        .pdf-viewer-fullscreen:-moz-full-screen {
          width: 100vw !important;
          height: 100vh !important;
        }

        .pdf-viewer-fullscreen:-ms-fullscreen {
          width: 100vw !important;
          height: 100vh !important;
        }

        .pdf-viewer-fullscreen:fullscreen {
          width: 100vw !important;
          height: 100vh !important;
        }

        /* Fallback modal fullscreen */
        .pdf-modal-fullscreen {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 9999 !important;
          background: #000 !important;
          display: flex !important;
          flex-direction: column !important;
        }
      `}</style>

      {/* Background overlay */}
      <div className="min-h-screen bg-black/10">
        {!isFullscreen && <Navbar />}
        
        {/* Spacer for fixed navbar */}
        {!isFullscreen && <div className="h-16"></div>}
        
        <div>
          <main className={isFullscreen ? "pdf-viewer-fullscreen" : "px-4 sm:px-10 md:px-20 lg:px-40 py-8"}>
            {isFullscreen ? (
              <>
                <div className="pdf-controls">
                  <div className="flex items-center gap-4 text-white">
                    <h3 className="font-semibold truncate max-w-xs">{selectedDoc?.name}</h3>
                    <span className="text-sm opacity-70">
                      Page {currentPage} of {numPages}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
                      <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors text-white"
                        title="Previous Page (←)"
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
                        className="w-16 px-2 py-1 text-center bg-white/10 text-white border-0 focus:outline-none focus:bg-white/20 rounded"
                      />
                      
                      <button
                        onClick={nextPage}
                        disabled={currentPage === numPages}
                        className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors text-white"
                        title="Next Page (→)"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
                      <button
                        onClick={zoomOut}
                        disabled={scale <= 0.25}
                        className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors text-white"
                        title="Zoom Out (Ctrl+-)"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={resetZoom}
                        className="px-3 py-2 text-sm font-medium hover:bg-white/20 rounded-md transition-colors text-white"
                        title="Reset Zoom (Ctrl+0)"
                      >
                        {Math.round(scale * 100)}%
                      </button>
                      
                      <button
                        onClick={zoomIn}
                        disabled={scale >= 3.0}
                        className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors text-white"
                        title="Zoom In (Ctrl++)"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={toggleFitToWidth}
                        className={`p-2 rounded-md transition-colors text-white ${
                          fitToWidth ? 'bg-white/20' : 'hover:bg-white/20'
                        }`}
                        title="Fit to Width"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" />
                        </svg>
                      </button>
                    </div>

                    <button
                      onClick={exitFullscreen}
                      className="p-2 bg-red-600/80 text-white rounded-lg hover:bg-red-700/80 transition-colors"
                      title="Exit Fullscreen (Esc)"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="pdf-content">
                  {selectedDoc && (
                    <div className="bg-white shadow-2xl rounded-lg overflow-hidden max-w-full max-h-full">
                      <Document
                        file={selectedDoc.url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={
                          <div className="flex flex-col items-center justify-center text-white p-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                            <p>Loading PDF...</p>
                          </div>
                        }
                        error={
                          <div className="flex flex-col items-center justify-center text-white p-8">
                            <svg className="w-12 h-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <p className="text-red-400">Failed to load PDF</p>
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
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                          }
                          error={
                            <div className="flex items-center justify-center p-8">
                              <p className="text-red-400">Failed to load page</p>
                            </div>
                          }
                        />
                      </Document>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Normal View
              <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-xl">
                    <h1 className="text-white text-3xl font-bold mb-2">📄 PDF Reader</h1>
                    <p className="text-white/80 text-lg">View and read PDF files with advanced controls</p>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/20 backdrop-blur-md border border-red-400/30 text-red-200 px-6 py-4 rounded-2xl mb-6 max-w-2xl mx-auto shadow-xl">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}

                {/* Main Content */}
                {selectedDoc ? (
                  <div className="space-y-6">
                    {/* Top Controls */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Document Info */}
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold text-white truncate max-w-xs">{selectedDoc.name}</h3>
                            <p className="text-sm text-white/70">
                              Page {currentPage} of {numPages || '...'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Navigation & Controls */}
                        <div className="flex items-center gap-2">
                          {/* Page Navigation */}
                          <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1">
                            <button
                              onClick={prevPage}
                              disabled={currentPage === 1}
                              className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300 text-white"
                              title="Previous Page (←)"
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
                              className="w-14 px-2 py-1 text-center bg-white/10 text-white border-0 focus:outline-none focus:bg-white/20 rounded-lg"
                            />
                            
                            <button
                              onClick={nextPage}
                              disabled={currentPage === numPages}
                              className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300 text-white"
                              title="Next Page (→)"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>

                          {/* Zoom Controls */}
                          <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1">
                            <button
                              onClick={zoomOut}
                              disabled={scale <= 0.25}
                              className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300 text-white"
                              title="Zoom Out (Ctrl+-)"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            
                            <button
                              onClick={resetZoom}
                              className="px-3 py-2 text-sm font-medium hover:bg-white/20 rounded-lg transition-all duration-300 text-white"
                              title="Reset Zoom (Ctrl+0)"
                            >
                              {Math.round(scale * 100)}%
                            </button>
                            
                            <button
                              onClick={zoomIn}
                              disabled={scale >= 3.0}
                              className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300 text-white"
                              title="Zoom In (Ctrl++)"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                            
                            <button
                              onClick={toggleFitToWidth}
                              className={`p-2 rounded-lg transition-all duration-300 text-white ${
                                fitToWidth ? 'bg-white/20' : 'hover:bg-white/20'
                              }`}
                              title="Fit to Width"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" />
                              </svg>
                            </button>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={toggleFullscreen}
                              className="p-2 bg-blue-600/80 backdrop-blur-md text-white rounded-xl hover:bg-blue-700/80 transition-all duration-300 shadow-lg"
                              title="Fullscreen (Ctrl+F)"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" />
                              </svg>
                            </button>
                            
                            <button
                              onClick={downloadPDF}
                              className="p-2 bg-green-600/80 backdrop-blur-md text-white rounded-xl hover:bg-green-700/80 transition-all duration-300 shadow-lg"
                              title="Download PDF"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>

                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="p-2 bg-purple-600/80 backdrop-blur-md text-white rounded-xl hover:bg-purple-700/80 transition-all duration-300 shadow-lg"
                              title="Upload New PDF"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* PDF Viewer */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl overflow-hidden">
                      <div className="p-6 bg-gray-900/20 min-h-[600px] flex items-center justify-center">
                        <div className="bg-white shadow-2xl rounded-lg overflow-hidden max-w-full">
                          <Document
                            file={selectedDoc.url}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={
                              <div className="flex flex-col items-center justify-center p-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-white">Loading PDF...</p>
                              </div>
                            }
                            error={
                              <div className="flex flex-col items-center justify-center p-8">
                                <svg className="w-12 h-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <p className="text-red-400">Failed to load PDF</p>
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
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-white mb-4">📚 Your Documents</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {documents.map(doc => (
                            <div
                              key={doc.id}
                              className={`p-4 border rounded-xl cursor-pointer transition-all duration-300 ${
                                selectedDoc?.id === doc.id
                                  ? 'border-blue-400 bg-blue-500/20 shadow-lg'
                                  : 'border-white/30 hover:border-blue-400/50 hover:bg-white/10'
                              }`}
                              onClick={() => {
                                setSelectedDoc(doc);
                                setCurrentPage(1);
                                setError(null);
                              }}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-white truncate text-sm">{doc.name}</h4>
                                  <p className="text-xs text-white/60">
                                    {doc.pageCount > 0 ? `${doc.pageCount} pages` : 'Loading...'}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteDocument(doc.id);
                                  }}
                                  className="p-1 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300"
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
                      className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 bg-white/10 backdrop-blur-md shadow-xl border-white/30 ${
                        dragActive 
                          ? 'border-blue-400 bg-blue-500/20 scale-105' 
                          : 'hover:border-blue-400/50 hover:bg-white/20'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <div className="text-6xl mb-6">📄</div>
                      <h3 className="text-2xl font-semibold text-white mb-4">
                        {isLoading ? 'Processing PDF...' : 'Upload Your PDF'}
                      </h3>
                      <p className="text-white/70 mb-6 text-lg">
                        Drop your PDF file here or click to browse
                      </p>
                      
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mr-3"></div>
                          <span className="text-white">Loading PDF...</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-8 py-4 bg-blue-600/80 backdrop-blur-md hover:bg-blue-700/80 text-white rounded-xl font-medium transition-all duration-300 text-lg shadow-lg"
                        >
                          Choose PDF File
                        </button>
                      )}
                      
                      <div className="mt-6 text-sm text-white/50">
                        Supports PDF files up to 50MB • Use keyboard shortcuts: ← → for navigation, Ctrl+F for fullscreen
                      </div>
                    </div>
                  </div>
                )}

                {/* Features Section */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl mt-8">
                  <h2 className="text-2xl font-bold text-white mb-6 text-center">✨ Features</h2>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-4xl mb-3">📄</div>
                      <h3 className="font-semibold text-white mb-2">High Quality Rendering</h3>
                      <p className="text-white/60 text-sm">Crystal clear PDF display with text selection support</p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl mb-3">🔍</div>
                      <h3 className="font-semibold text-white mb-2">Advanced Zoom</h3>
                      <p className="text-white/60 text-sm">Multiple zoom levels and fit-to-width option</p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl mb-3">⌨️</div>
                      <h3 className="font-semibold text-white mb-2">Keyboard Shortcuts</h3>
                      <p className="text-white/60 text-sm">Navigate with arrow keys, zoom with Ctrl+/-, fullscreen with Ctrl+F</p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl mb-3">🖥️</div>
                      <h3 className="font-semibold text-white mb-2">Fullscreen Mode</h3>
                      <p className="text-white/60 text-sm">Immersive reading experience with fullscreen viewer</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
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