import React, { useState, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';

interface PDFItem {
  id: string;
  file: File;
  name: string;
  pages: number;
  size: number;
  preview?: string;
}

const PDFMergerPage: React.FC = () => {
  const [pdfFiles, setPdfFiles] = useState<PDFItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    const newPdfFiles: PDFItem[] = [];
    
    for (const file of Array.from(files)) {
      if (file.type !== 'application/pdf') {
        setError(`${file.name} is not a valid PDF file.`);
        continue;
      }

      // Simulate PDF analysis
      const pdfItem: PDFItem = {
        id: Date.now().toString() + Math.random().toString(36).substring(7),
        file,
        name: file.name,
        pages: Math.floor(Math.random() * 20) + 1, // Mock page count
        size: file.size,
      };

      newPdfFiles.push(pdfItem);
    }

    setPdfFiles(prev => [...prev, ...newPdfFiles]);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    
    if (files && files.length > 0) {
      const fakeEvent = {
        target: { files }
      } as React.ChangeEvent<HTMLInputElement>;
      
      handleFileUpload(fakeEvent);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const removePdf = useCallback((id: string) => {
    setPdfFiles(prev => prev.filter(pdf => pdf.id !== id));
  }, []);

  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    setPdfFiles(prev => {
      const newItems = [...prev];
      const draggedItem = newItems[dragIndex];
      newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, draggedItem);
      return newItems;
    });
  }, []);

  const handleDragStart = useCallback((id: string) => {
    setDraggedItem(id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  const mergePDFs = useCallback(async () => {
    if (pdfFiles.length < 2) {
      setError('Please add at least 2 PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate PDF merging process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, would use PDF-lib to merge PDFs
      const mergedBlob = new Blob(['Mock merged PDF content'], { type: 'application/pdf' });
      const url = URL.createObjectURL(mergedBlob);
      
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `merged_document_${Date.now()}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      setError('Failed to merge PDFs. Please try again.');
      console.error('Merge error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [pdfFiles]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalPages = pdfFiles.reduce((sum, pdf) => sum + pdf.pages, 0);
  const totalSize = pdfFiles.reduce((sum, pdf) => sum + pdf.size, 0);

  return (
    <div className="min-h-screen bg-[#f6f0e4]">
      <Navbar />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#382f29] mb-4">PDF Merger</h1>
            <p className="text-lg text-[#5c5349]">
              Combine multiple PDF files into a single document
            </p>
          </div>

          {/* Upload Area */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-[#e5dcc9]">
            <div 
              className="border-2 border-dashed border-[#8b7355] rounded-xl p-8 text-center cursor-pointer hover:border-[#6b5635] transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="text-6xl mb-4">📑</div>
              <h3 className="text-xl font-semibold text-[#382f29] mb-2">Upload PDF Files</h3>
              <p className="text-[#5c5349] mb-4">
                Drag & drop PDF files here or click to browse
              </p>
              <button className="bg-[#382f29] text-white px-6 py-3 rounded-lg hover:bg-[#2a211c] transition-colors">
                Choose PDF Files
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* PDF List */}
          {pdfFiles.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-[#e5dcc9]">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-[#382f29]">
                    PDF Files ({pdfFiles.length})
                  </h2>
                  <p className="text-sm text-[#5c5349]">
                    {totalPages} total pages • {formatFileSize(totalSize)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={mergePDFs}
                    disabled={isProcessing || pdfFiles.length < 2}
                    className="bg-[#382f29] text-white px-6 py-2 rounded-lg hover:bg-[#2a211c] disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? 'Merging...' : 'Merge PDFs'}
                  </button>
                  <button
                    onClick={() => setPdfFiles([])}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pdfFiles.map((pdf, index) => (
                  <div
                    key={pdf.id}
                    draggable
                    onDragStart={() => handleDragStart(pdf.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => {
                      e.preventDefault();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const y = e.clientY - rect.top;
                      const hoverIndex = y < rect.height / 2 ? index : index + 1;
                      
                      if (draggedItem && draggedItem !== pdf.id) {
                        const dragIndex = pdfFiles.findIndex(p => p.id === draggedItem);
                        if (dragIndex !== -1 && dragIndex !== hoverIndex) {
                          moveItem(dragIndex, hoverIndex > dragIndex ? hoverIndex - 1 : hoverIndex);
                        }
                      }
                    }}
                    className={`flex items-center justify-between p-4 border border-[#e5dcc9] rounded-lg cursor-move hover:bg-gray-50 transition-colors ${
                      draggedItem === pdf.id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-gray-400 cursor-grab">
                        ⋮⋮
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📄</span>
                        <div>
                          <h3 className="font-medium text-[#382f29] truncate max-w-xs">
                            {pdf.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-[#5c5349]">
                            <span>{pdf.pages} pages</span>
                            <span>{formatFileSize(pdf.size)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#5c5349] bg-gray-100 px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                      <button
                        onClick={() => removePdf(pdf.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-[#f6f0e4] rounded-lg">
                <h3 className="font-medium text-[#382f29] mb-2">Merge Order</h3>
                <p className="text-sm text-[#5c5349]">
                  Drag and drop the files above to reorder them. The final PDF will be created in this order.
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          {pdfFiles.length === 0 && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-[#e5dcc9]">
              <h2 className="text-2xl font-semibold text-[#382f29] mb-4">How to Use PDF Merger</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">📁</div>
                  <h3 className="font-semibold text-[#382f29] mb-2">1. Upload PDFs</h3>
                  <p className="text-[#5c5349] text-sm">
                    Select multiple PDF files from your device
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🔄</div>
                  <h3 className="font-semibold text-[#382f29] mb-2">2. Reorder</h3>
                  <p className="text-[#5c5349] text-sm">
                    Drag and drop to arrange files in your preferred order
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">⬇️</div>
                  <h3 className="font-semibold text-[#382f29] mb-2">3. Download</h3>
                  <p className="text-[#5c5349] text-sm">
                    Click merge to combine and download your new PDF
                  </p>
                </div>
              </div>
            </div>
          )}

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

          {/* Processing State */}
          {isProcessing && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 shadow-xl">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#382f29] mr-4"></div>
                  <span className="text-[#382f29]">Merging PDFs...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFMergerPage; 