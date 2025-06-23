import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { summarizeText } from '../tools/SummarizerTool/summarizerService';
import { LoadingSpinner } from '../tools/SlideTool/components/LoadingSpinner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import htmlDocx from 'html-docx-fixed/dist/html-docx';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { FontSize } from 'tiptap-extension-font-size';
import { marked } from 'marked';

const EditorToolbar: React.FC<{ editor: Editor | null }> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="bg-gray-200 p-2 rounded-t-md border-b border-gray-300 flex items-center gap-2 flex-wrap">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-3 py-1 bg-white rounded shadow-sm hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}><b>B</b></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-3 py-1 bg-white rounded shadow-sm hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}><i>I</i></button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`px-3 py-1 bg-white rounded shadow-sm hover:bg-gray-100 ${editor.isActive('underline') ? 'bg-gray-300' : ''}`}><u>U</u></button>
      
      <select 
        onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
        value={editor.getAttributes('textStyle').fontFamily || ''}
        className="p-1 bg-white rounded shadow-sm hover:bg-gray-100 focus:outline-none"
      >
        <option value="">Font</option>
        <option value="Arial">Arial</option>
        <option value="Courier New">Courier New</option>
        <option value="Georgia">Georgia</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Verdana">Verdana</option>
        <option value="Comic Sans MS">Comic Sans MS</option>
        <option value="Impact">Impact</option>
        <option value="Tahoma">Tahoma</option>
        <option value="Trebuchet MS">Trebuchet MS</option>
      </select>

      <select
        onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
        value={editor.getAttributes('textStyle').fontSize || ''}
        className="p-1 bg-white rounded shadow-sm hover:bg-gray-100 focus:outline-none"
      >
        <option value="">Size</option>
        <option value="8pt">8</option>
        <option value="10pt">10</option>
        <option value="12pt">12</option>
        <option value="14pt">14</option>
        <option value="18pt">18</option>
        <option value="24pt">24</option>
        <option value="36pt">36</option>
      </select>

      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 bg-white rounded shadow-sm hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-300' : ''}`}>
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008h-.007V6.75zm0 5.25h.007v.008h-.007v-.008zm0 5.25h.007v.008h-.007v-.008z" />
        </svg>
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 bg-white rounded shadow-sm hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-300' : ''}`}>
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 6h12M8 12h12M8 18h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4.5 7.5l-1-1v-2h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.5 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4.5 11v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.5 16.5h1.5a1 1 0 010 2H4a1 1 0 01-1-1v-1a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="flex items-center bg-white rounded shadow-sm p-1">
        <input type="color" onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} value={editor.getAttributes('textStyle').color || '#000000'} className="w-6 h-6 border-none bg-transparent"/>
      </div>
    </div>
  );
};

const SummarizerPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'custom-editor h-full p-4 focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (editor) {
      outputRef.current = editor.view.dom as HTMLDivElement;
    }
  }, [editor]);

  const handleSummarize = async () => {
    if (!inputText.trim() || !editor) {
      setError('Please enter some text to summarize.');
      return;
    }

    setIsLoading(true);
    setError(null);
    editor.commands.clearContent();

    try {
      const result = await summarizeText(inputText);
      const html = await marked.parse(result, { gfm: true, breaks: true });
      editor.commands.setContent(html);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'docx' | 'doc') => {
    if (!outputRef.current) return;

    const content = outputRef.current;

    if (format === 'pdf') {
      const canvas = await html2canvas(content);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('summary.pdf');
    } else {
        const htmlString = `<!DOCTYPE html><html><head><style></style></head><body>${editor?.getHTML()}</body></html>`;
        const data = htmlDocx.asBlob(htmlString);
        saveAs(data, `summary.${format}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f0e4]">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 flex flex-col">
        <div className="text-center my-8">
          <h1 className="text-3xl font-bold text-[#382f29]">
            AI Text Summarizer
          </h1>
          <p className="text-[#5d4633] mt-2">
            Paste your text below to get a concise summary.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
          <div className="flex flex-col min-h-0">
            <textarea
              className="w-full h-full p-4 border border-[#382f29] rounded-md resize-none focus:ring-2 focus:ring-[#e67722] focus:outline-none"
              placeholder="Enter text to summarize..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
          <div className="flex flex-col min-h-0">
            <EditorToolbar editor={editor} />
            <div className="relative flex-grow bg-white border border-t-0 border-[#382f29] rounded-b-md overflow-hidden">
              <EditorContent editor={editor} className="h-full overflow-y-auto" />
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75">
                  <LoadingSpinner />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center my-8 flex justify-center items-center gap-4">
          <button
            className="px-8 py-3 bg-[#e67722] text-[#382f29] font-bold rounded-md hover:bg-opacity-90 transition-all disabled:bg-gray-400"
            onClick={handleSummarize}
            disabled={isLoading}
          >
            {isLoading ? 'Summarizing...' : 'Summarize'}
          </button>
          <div className="relative inline-block text-left">
            <div className="group">
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Download
              </button>
              <div
                className="origin-top-right absolute right-0 bottom-full mb-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200"
              >
                <div className="py-1">
                  <button onClick={() => handleDownload('pdf')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">PDF</button>
                  <button onClick={() => handleDownload('docx')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">DOCX</button>
                  <button onClick={() => handleDownload('doc')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">DOC</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <style>{`
        .custom-editor ul {
          list-style-type: disc;
          padding-left: 2rem;
        }
        .custom-editor ol {
          list-style-type: decimal;
          padding-left: 2rem;
        }
      `}</style>
    </div>
  );
};

export default SummarizerPage; 