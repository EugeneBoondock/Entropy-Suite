import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import Navbar from '../components/Navbar';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface Annotation {
  id: string;
  type: 'text' | 'highlight' | 'replace';
  x: number;
  y: number;
  content: string;
  color: string;
  fontSize: number;
  fontFamily: 'Helvetica' | 'TimesRoman' | 'Courier';
}

const PDFEditorPage: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedTool, setSelectedTool] = useState<'select' | 'text' | 'highlight' | 'replace'>('select');
  const [selectedColor, setSelectedColor] = useState('#00b4ff');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [clickPosition, setClickPosition] = useState<{x:number,y:number}>({x:0,y:0});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{x:number,y:number}>({x:0,y:0});
  const [currentFontSize, setCurrentFontSize] = useState<number>(12);
  const [currentFontFamily, setCurrentFontFamily] = useState<'Helvetica' | 'TimesRoman' | 'Courier'>('Helvetica');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  /* ---------- File upload ---------- */
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }
    setPdfFile(file);
    setPdfUrl(URL.createObjectURL(file));
    setError(null);
  }, []);

  /* ---------- Annotation helpers ---------- */
  const addAnnotation = useCallback((x: number, y: number) => {
    if (selectedTool === 'text' || selectedTool === 'replace') {
      setClickPosition({x,y});
      setShowTextInput(true);
    } else if (selectedTool === 'highlight') {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: 'highlight',
        x,
        y,
        content: '',
        color: selectedColor,
        fontSize: currentFontSize,
        fontFamily: currentFontFamily,
      };
      setAnnotations(prev => [...prev, newAnnotation]);
    }
  }, [selectedTool, selectedColor, currentFontSize, currentFontFamily]);

  const handleTextSubmit = () => {
    if (!newText.trim()) return;
    if(editingId){
      setAnnotations(prev=> prev.map(a=> a.id===editingId? {...a, content:newText}: a));
      setEditingId(null);
      setShowTextInput(false);
      setNewText('');
      return;
    }
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: selectedTool === 'replace' ? 'replace' : 'text',
      x: clickPosition.x,
      y: clickPosition.y,
      content: newText,
      color: selectedColor,
      fontSize: currentFontSize,
      fontFamily: currentFontFamily,
    };
    setAnnotations(prev => [...prev, newAnnotation]);
    setNewText('');
    setShowTextInput(false);
  };

  /* ---------- Save (simulated) ---------- */
  const hexToRgb = (hex:string)=>{
    const bigint=parseInt(hex.replace('#',''),16);
    return [(bigint>>16)&255,(bigint>>8)&255,bigint&255];
  };

  const savePDF = useCallback(async () => {
    if (!pdfFile) return;
    setIsLoading(true);
    try {
      const buf = await pdfFile.arrayBuffer();
      // @ts-ignore dynamic import of ESM module
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.load(buf);
      const fontCache: Record<string, any> = {};
      const firstPage = pdfDoc.getPage(0);
      const pageWidth = firstPage.getWidth();
      const pageHeight = firstPage.getHeight();
      const canvasWidth = canvasWrapperRef.current?.clientWidth || pageWidth;
      const scale = pageWidth / canvasWidth;

      annotations.filter(a=>a.type==='replace').forEach(async a=>{
        const [r,g,b] = hexToRgb(a.color);
        const fontSize = a.fontSize;
        if(!fontCache[a.fontFamily]){
          fontCache[a.fontFamily] = await pdfDoc.embedFont(StandardFonts[a.fontFamily]);
        }
        const usedFont = fontCache[a.fontFamily];
        const textWidth = usedFont.widthOfTextAtSize(a.content, fontSize);
        const pdfX = a.x * scale;
        const pdfY = pageHeight - a.y * scale - fontSize;
        // white-out rectangle
        firstPage.drawRectangle({x:pdfX-2,y:pdfY-2,width:textWidth+4,height:fontSize+4,color:rgb(1,1,1)});
        firstPage.drawText(a.content,{x:pdfX,y:pdfY,size:fontSize,font:usedFont,color:rgb(r/255,g/255,b/255)});
      });

      const editedBytes = await pdfDoc.save();
      const blob = new Blob([editedBytes],{type:'application/pdf'});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `edited_${pdfFile.name}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch(e){
      setError('Failed to save PDF');
    } finally { setIsLoading(false);}  
  },[pdfFile, annotations]);

  /* ---------- Drag handlers ---------- */
  useEffect(()=>{
    if(!draggingId) return;
    const handleMove = (e:MouseEvent)=>{
      const rect = canvasWrapperRef.current?.getBoundingClientRect();
      if(!rect) return;
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;
      setAnnotations(prev=> prev.map(a=> a.id===draggingId? {...a, x, y}: a));
    };
    const handleUp = ()=> setDraggingId(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return ()=>{window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp);};
  },[draggingId, dragOffset]);

  /* ---------- JSX ---------- */
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{backgroundImage:"url('/images/bg_image.png')"}}
    >
      <Navbar />
      <div className="h-16" />
      <main className="px-4 sm:px-8 md:px-20 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow mb-2">📄 PDF Editor</h1>
            <p className="text-white/70">Add text or highlight directly on your PDF</p>
          </div>

          {/* Upload card */}
          {!pdfUrl && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-10 text-center shadow-xl">
              <div
                className="border-2 border-dashed border-white/30 rounded-2xl p-12 cursor-pointer hover:border-blue-400/50 transition"
                onClick={()=>fileInputRef.current?.click()}
              >
                <div className="text-6xl mb-4 select-none">📄</div>
                <h3 className="text-xl font-semibold text-white mb-2">Upload PDF File</h3>
                <p className="text-white/70 mb-6">Click to choose a PDF to start editing</p>
                <button className="px-6 py-3 bg-blue-600/80 text-white rounded-xl hover:bg-blue-700/80 transition">Choose File</button>
              </div>
              <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
            </div>
          )}

          {/* Editor */}
          {pdfUrl && (
            <>
              {/* Toolbar */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4 overflow-x-auto whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {(['select','text','highlight','replace'] as const).map(tool=> (
                    <button
                      key={tool}
                      onClick={()=>setSelectedTool(tool)}
                      className={`px-4 py-2 rounded-lg text-sm ${selectedTool===tool?'bg-blue-600/80 text-white':'bg-white/20 text-white hover:bg-white/30'}`}
                    >{tool.charAt(0).toUpperCase()+tool.slice(1)}</button>
                  ))}
                  <select value={currentFontFamily} onChange={e=>setCurrentFontFamily(e.target.value as any)} className="bg-white/20 text-white px-2 py-1 rounded">
                    <option value="Helvetica">Helvetica</option>
                    <option value="TimesRoman">Times</option>
                    <option value="Courier">Courier</option>
                  </select>
                  <select value={currentFontSize} onChange={e=>setCurrentFontSize(parseInt(e.target.value))} className="bg-white/20 text-white px-2 py-1 rounded">
                    {[8,10,12,14,16,18,24,32].map(s=> <option key={s} value={s}>{s}px</option>)}
                  </select>
                  <input type="color" value={selectedColor} onChange={e=>setSelectedColor(e.target.value)} className="w-8 h-8 rounded border-0 p-0 bg-transparent" />
                </div>
                <button onClick={savePDF} disabled={isLoading} className="px-6 py-2 bg-green-600/80 text-white rounded-xl hover:bg-green-700/80 disabled:opacity-50 shadow">
                  {isLoading? 'Saving…':'Save PDF'}
                </button>
              </div>

              {/* Viewer */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-4">
                <div
                  ref={canvasWrapperRef}
                  className="relative mx-auto max-w-full overflow-auto"
                  style={{width:'100%'}}
                >
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={({numPages})=>setNumPages(numPages)}
                    loading={<div className="text-center text-white p-8">Loading PDF…</div>}
                    error={<div className="text-center text-red-400 p-8">Failed to load PDF</div>}
                  >
                    <Page pageNumber={1} width={canvasWrapperRef.current?.clientWidth ?? undefined} renderAnnotationLayer={false} renderTextLayer={false} />
                  </Document>

                  {/* Annotation overlay */}
                  <div
                    className="absolute inset-0"
                    onClick={(e)=>{
                      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                      addAnnotation(e.clientX-rect.left, e.clientY-rect.top);
                    }}
                  >
                    {annotations.map(a=> (
                      <div key={a.id}
                        className="absolute select-none cursor-move"
                        onMouseDown={(e)=>{
                          e.stopPropagation();
                          if(a.type==='highlight') return;
                          const rect = canvasWrapperRef.current?.getBoundingClientRect();
                          if(rect){
                            setDraggingId(a.id);
                            setDragOffset({x:e.clientX - rect.left - a.x, y:e.clientY - rect.top - a.y});
                          }
                        }}
                        onDoubleClick={(e)=>{
                          e.stopPropagation();
                          if(a.type==='highlight') return;
                          setEditingId(a.id);
                          setNewText(a.content);
                          setShowTextInput(true);
                        }}
                        style={{left:a.x, top:a.y, color:a.color, background:a.type==='highlight'? a.color+'33':'white', padding:'2px 4px', borderRadius: a.type==='highlight'?4:0, fontSize:a.fontSize, fontFamily:a.fontFamily}}
                      >{a.type!=='highlight'? a.content: ''}</div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {error && <div className="bg-red-500/20 text-red-300 backdrop-blur-md border border-red-400/20 rounded-2xl p-4">{error}</div>}
        </div>
      </main>

      {/* Text input modal */}
      {showTextInput && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-80 max-w-full text-white shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Add Text</h3>
            <input className="w-full mb-4 px-3 py-2 rounded bg-white/20 focus:bg-white/30 outline-none" placeholder="Enter text…" value={newText} onChange={e=>setNewText(e.target.value)} autoFocus />
            <div className="flex gap-2 justify-end">
              <button onClick={handleTextSubmit} className="px-4 py-2 bg-blue-600/80 rounded-lg hover:bg-blue-700/80">Add</button>
              <button onClick={()=>setShowTextInput(false)} className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFEditorPage; 