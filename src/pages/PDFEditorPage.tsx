import React, { useState, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';

interface Annotation {
  id: string;
  type: 'text' | 'highlight';
  x: number;
  y: number;
  content: string;
  color: string;
}

const PDFEditorPage: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedTool, setSelectedTool] = useState<'select' | 'text' | 'highlight'>('select');
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [newText, setNewText] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }
    setPdfFile(file);
    setError(null);
  }, []);

  const addAnnotation = useCallback((x: number, y: number) => {
    if (selectedTool === 'text') {
      setShowTextInput(true);
    } else if (selectedTool === 'highlight') {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: 'highlight',
        x,
        y,
        content: 'Highlighted text',
        color: selectedColor,
      };
      setAnnotations(prev => [...prev, newAnnotation]);
    }
  }, [selectedTool, selectedColor]);

  const handleTextSubmit = () => {
    if (!newText.trim()) return;
    
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: 'text',
      x: 100,
      y: 100,
      content: newText,
      color: selectedColor,
    };
    
    setAnnotations(prev => [...prev, newAnnotation]);
    setNewText('');
    setShowTextInput(false);
  };

  const savePDF = useCallback(async () => {
    if (!pdfFile) return;
    
    setIsLoading(true);
    try {
      // In a real implementation, would use PDF-lib to apply annotations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const blob = new Blob([pdfFile], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `edited_${pdfFile.name}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to save PDF');
    } finally {
      setIsLoading(false);
    }
  }, [pdfFile]);

  return (
    <div className="min-h-screen bg-[#f6f0e4]">
      <Navbar />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#382f29] mb-4">PDF Editor</h1>
            <p className="text-lg text-[#5c5349]">
              Edit and annotate your PDF documents with powerful tools
            </p>
          </div>

          {!pdfFile ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#e5dcc9]">
              <div 
                className="border-2 border-dashed border-[#8b7355] rounded-xl p-12 text-center cursor-pointer hover:border-[#6b5635] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-[#382f29] mb-2">Upload PDF File</h3>
                <p className="text-[#5c5349] mb-4">Click to select a PDF file to edit</p>
                <button className="bg-[#382f29] text-white px-6 py-3 rounded-lg hover:bg-[#2a211c] transition-colors">
                  Choose File
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="bg-white rounded-xl shadow-lg p-4 border border-[#e5dcc9]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedTool('select')}
                      className={`px-4 py-2 rounded-lg ${selectedTool === 'select' ? 'bg-[#382f29] text-white' : 'bg-gray-100 text-[#382f29]'}`}
                    >
                      Select
                    </button>
                    <button
                      onClick={() => setSelectedTool('text')}
                      className={`px-4 py-2 rounded-lg ${selectedTool === 'text' ? 'bg-[#382f29] text-white' : 'bg-gray-100 text-[#382f29]'}`}
                    >
                      Add Text
                    </button>
                    <button
                      onClick={() => setSelectedTool('highlight')}
                      className={`px-4 py-2 rounded-lg ${selectedTool === 'highlight' ? 'bg-[#382f29] text-white' : 'bg-gray-100 text-[#382f29]'}`}
                    >
                      Highlight
                    </button>
                    
                    <input
                      type="color"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-8 h-8 rounded border"
                    />
                  </div>
                  
                  <button
                    onClick={savePDF}
                    disabled={isLoading}
                    className="bg-[#382f29] text-white px-6 py-2 rounded-lg hover:bg-[#2a211c] disabled:opacity-50"
                  >
                    Save PDF
                  </button>
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-[#e5dcc9]">
                <div className="relative min-h-96 border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <p className="text-center text-gray-500 mb-4">PDF Preview: {pdfFile.name}</p>
                  
                  {/* Simulated PDF content area */}
                  <div 
                    className="min-h-80 bg-gray-50 rounded cursor-crosshair relative"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      addAnnotation(x, y);
                    }}
                  >
                    {annotations.map(annotation => (
                      <div
                        key={annotation.id}
                        className="absolute p-2 border rounded"
                        style={{
                          left: annotation.x,
                          top: annotation.y,
                          backgroundColor: annotation.type === 'highlight' ? annotation.color + '40' : 'white',
                          borderColor: annotation.color,
                          color: annotation.type === 'text' ? annotation.color : 'black'
                        }}
                      >
                        {annotation.content}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Text Input Modal */}
          {showTextInput && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-[#382f29] mb-4">Add Text</h3>
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e5dcc9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#382f29] mb-4"
                  placeholder="Enter text..."
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleTextSubmit}
                    className="bg-[#382f29] text-white px-4 py-2 rounded-lg hover:bg-[#2a211c]"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowTextInput(false)}
                    className="bg-gray-200 text-[#382f29] px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFEditorPage; 