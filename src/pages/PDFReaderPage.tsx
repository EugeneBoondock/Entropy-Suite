import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';

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
  const [zoom, setZoom] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        pageCount: 10, // Placeholder - would use pdf.js to get actual page count
        uploadedAt: new Date()
      };

      setDocuments(prev => [...prev, doc]);
      setSelectedDoc(doc);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to load PDF file');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDocument = (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (doc) {
      URL.revokeObjectURL(doc.url);
      setDocuments(prev => prev.filter(d => d.id !== id));
      if (selectedDoc?.id === id) {
        setSelectedDoc(null);
      }
    }
  };

  const nextPage = () => {
    if (selectedDoc && currentPage < selectedDoc.pageCount) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(200, prev + 25));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(50, prev - 25));
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
    <div className="flex size-full min-h-screen flex-col bg-[#f6f0e4]" style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}>
      <Navbar />
      
      <main className="flex-1 px-4 sm:px-10 md:px-20 lg:px-40 py-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-[#382f29] text-3xl font-bold">PDF Reader</h1>
              <p className="text-[#b8a99d] text-lg mt-2">View and read PDF files directly in your browser</p>
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-[#382f29] text-white rounded-lg hover:bg-[#4a3f37] transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload PDF
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-[#e0d5c7] p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#382f29] mb-4">Documents</h2>
                
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto w-12 h-12 text-[#b8a99d] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="text-[#b8a99d]">No PDFs uploaded</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map(doc => (
                      <div
                        key={doc.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedDoc?.id === doc.id
                            ? 'border-[#382f29] bg-[#382f29]/5'
                            : 'border-[#e0d5c7] hover:border-[#382f29]'
                        }`}
                        onClick={() => {
                          setSelectedDoc(doc);
                          setCurrentPage(1);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-[#382f29] truncate">{doc.name}</h3>
                            <p className="text-sm text-[#b8a99d]">{doc.pageCount} pages</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDocument(doc.id);
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="lg:col-span-3">
              {selectedDoc ? (
                <div className="bg-white rounded-xl border border-[#e0d5c7] shadow-sm overflow-hidden">
                  {/* Toolbar */}
                  <div className="border-b border-[#e0d5c7] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-[#382f29]">{selectedDoc.name}</h3>
                        <p className="text-sm text-[#b8a99d]">Page {currentPage} of {selectedDoc.pageCount}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Navigation */}
                        <button
                          onClick={prevPage}
                          disabled={currentPage === 1}
                          className="p-2 border border-[#e0d5c7] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f1f1f1] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        <input
                          type="number"
                          min="1"
                          max={selectedDoc.pageCount}
                          value={currentPage}
                          onChange={(e) => {
                            const page = parseInt(e.target.value);
                            if (page >= 1 && page <= selectedDoc.pageCount) {
                              setCurrentPage(page);
                            }
                          }}
                          className="w-16 px-2 py-1 border border-[#e0d5c7] rounded text-center focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                        />
                        
                        <button
                          onClick={nextPage}
                          disabled={currentPage === selectedDoc.pageCount}
                          className="p-2 border border-[#e0d5c7] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f1f1f1] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        {/* Zoom */}
                        <div className="border-l border-[#e0d5c7] pl-2 ml-2">
                          <button
                            onClick={zoomOut}
                            disabled={zoom === 50}
                            className="p-2 border border-[#e0d5c7] rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f1f1f1] transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          
                          <span className="inline-block px-3 py-2 border-t border-b border-[#e0d5c7] bg-[#f9f9f9] text-sm font-medium">
                            {zoom}%
                          </span>
                          
                          <button
                            onClick={zoomIn}
                            disabled={zoom === 200}
                            className="p-2 border border-[#e0d5c7] rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f1f1f1] transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        {/* Download */}
                        <button
                          onClick={downloadPDF}
                          className="p-2 bg-[#382f29] text-white rounded-lg hover:bg-[#4a3f37] transition-colors"
                          title="Download PDF"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Search */}
                    <div className="mt-4">
                      <div className="relative">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search in document..."
                          className="w-full pl-10 pr-4 py-2 border border-[#e0d5c7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                        />
                        <svg className="absolute left-3 top-2.5 w-4 h-4 text-[#b8a99d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* PDF Content */}
                  <div className="p-6 bg-[#f5f5f5] min-h-[600px] flex items-center justify-center">
                    <div 
                      className="bg-white shadow-lg"
                      style={{ 
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'top center'
                      }}
                    >
                      {/* PDF.js would render the actual PDF here */}
                      <div className="w-[595px] h-[842px] p-8 border border-gray-300 bg-white">
                        <div className="text-center mb-8">
                          <h1 className="text-2xl font-bold text-[#382f29] mb-4">PDF Viewer</h1>
                          <p className="text-[#b8a99d]">
                            This is a placeholder for PDF content. In a production environment, 
                            this would use PDF.js to render the actual PDF pages.
                          </p>
                        </div>
                        
                        <div className="space-y-4 text-[#382f29]">
                          <h2 className="text-lg font-semibold">Page {currentPage}</h2>
                          <p>Document: {selectedDoc.name}</p>
                          <p>Total Pages: {selectedDoc.pageCount}</p>
                          <p>Zoom Level: {zoom}%</p>
                          
                          {searchTerm && (
                            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                              <p className="text-sm">
                                <strong>Search:</strong> "{searchTerm}"
                              </p>
                              <p className="text-xs text-[#b8a99d] mt-1">
                                In a real implementation, this would highlight search results in the PDF.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-[#e0d5c7] p-12 text-center shadow-sm">
                  <svg className="mx-auto w-16 h-16 text-[#b8a99d] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-[#382f29] mb-2">No PDF Selected</h3>
                  <p className="text-[#b8a99d] mb-6">Upload a PDF or select one from the sidebar to start reading</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-[#382f29] text-white rounded-lg hover:bg-[#4a3f37] transition-colors duration-200"
                  >
                    Upload Your First PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
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