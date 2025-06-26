import React, { useState, useRef, useEffect, useCallback } from 'react';

interface TextEditorProps {
  filename: string;
  initialContent?: string;
  onSave: (content: string) => Promise<void>;
  onClose: () => void;
  mode?: 'vim' | 'nano' | 'emacs';
}

type VimMode = 'normal' | 'insert' | 'visual' | 'command';

interface CursorPosition {
  line: number;
  column: number;
}

export default function TextEditor({ 
  filename, 
  initialContent = '', 
  onSave, 
  onClose, 
  mode = 'vim' 
}: TextEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [lines, setLines] = useState(initialContent.split('\n'));
  const [cursor, setCursor] = useState<CursorPosition>({ line: 0, column: 0 });
  const [vimMode, setVimMode] = useState<VimMode>('normal');
  const [commandBuffer, setCommandBuffer] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceWith, setReplaceWith] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [visualStart, setVisualStart] = useState<CursorPosition | null>(null);
  const [undoHistory, setUndoHistory] = useState<string[]>([initialContent]);
  const [undoIndex, setUndoIndex] = useState(0);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState(false);
  const [syntaxHighlight, setSyntaxHighlight] = useState(true);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const vimInputRef = useRef<HTMLInputElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  // Update lines when content changes
  useEffect(() => {
    setLines(content.split('\n'));
  }, [content]);

  // Auto-save to undo history
  const addToUndoHistory = useCallback((newContent: string) => {
    setUndoHistory(prev => {
      const newHistory = prev.slice(0, undoIndex + 1);
      newHistory.push(newContent);
      if (newHistory.length > 100) {
        newHistory.shift();
      }
      return newHistory;
    });
    setUndoIndex(prev => Math.min(prev + 1, 99));
  }, [undoIndex]);

  // Undo function
  const undo = useCallback(() => {
    if (undoIndex > 0) {
      setUndoIndex(prev => prev - 1);
      setContent(undoHistory[undoIndex - 1]);
      setStatusMessage('Undo');
    }
  }, [undoIndex, undoHistory]);

  // Redo function
  const redo = useCallback(() => {
    if (undoIndex < undoHistory.length - 1) {
      setUndoIndex(prev => prev + 1);
      setContent(undoHistory[undoIndex + 1]);
      setStatusMessage('Redo');
    }
  }, [undoIndex, undoHistory]);

  // Move cursor
  const moveCursor = useCallback((direction: 'up' | 'down' | 'left' | 'right' | 'home' | 'end') => {
    setCursor(prev => {
      let newLine = prev.line;
      let newColumn = prev.column;

      switch (direction) {
        case 'up':
          newLine = Math.max(0, prev.line - 1);
          newColumn = Math.min(prev.column, lines[newLine]?.length || 0);
          break;
        case 'down':
          newLine = Math.min(lines.length - 1, prev.line + 1);
          newColumn = Math.min(prev.column, lines[newLine]?.length || 0);
          break;
        case 'left':
          if (prev.column > 0) {
            newColumn = prev.column - 1;
          } else if (prev.line > 0) {
            newLine = prev.line - 1;
            newColumn = lines[newLine]?.length || 0;
          }
          break;
        case 'right':
          if (prev.column < (lines[prev.line]?.length || 0)) {
            newColumn = prev.column + 1;
          } else if (prev.line < lines.length - 1) {
            newLine = prev.line + 1;
            newColumn = 0;
          }
          break;
        case 'home':
          newColumn = 0;
          break;
        case 'end':
          newColumn = lines[prev.line]?.length || 0;
          break;
      }

      return { line: newLine, column: newColumn };
    });
  }, [lines]);

  // Insert text at cursor position
  const insertText = useCallback((text: string) => {
    const newLines = [...lines];
    const currentLine = newLines[cursor.line] || '';
    const before = currentLine.substring(0, cursor.column);
    const after = currentLine.substring(cursor.column);
    
    if (text === '\n') {
      newLines[cursor.line] = before;
      newLines.splice(cursor.line + 1, 0, after);
      setCursor({ line: cursor.line + 1, column: 0 });
    } else {
      newLines[cursor.line] = before + text + after;
      setCursor(prev => ({ ...prev, column: prev.column + text.length }));
    }
    
    const newContent = newLines.join('\n');
    setContent(newContent);
    setIsModified(true);
    addToUndoHistory(newContent);
  }, [lines, cursor, addToUndoHistory]);

  // Delete character
  const deleteChar = useCallback((direction: 'backspace' | 'delete') => {
    const newLines = [...lines];
    
    if (direction === 'backspace') {
      if (cursor.column > 0) {
        const currentLine = newLines[cursor.line];
        newLines[cursor.line] = currentLine.substring(0, cursor.column - 1) + currentLine.substring(cursor.column);
        setCursor(prev => ({ ...prev, column: prev.column - 1 }));
      } else if (cursor.line > 0) {
        const currentLine = newLines[cursor.line];
        const prevLine = newLines[cursor.line - 1];
        newLines[cursor.line - 1] = prevLine + currentLine;
        newLines.splice(cursor.line, 1);
        setCursor({ line: cursor.line - 1, column: prevLine.length });
      }
    } else {
      const currentLine = newLines[cursor.line] || '';
      if (cursor.column < currentLine.length) {
        newLines[cursor.line] = currentLine.substring(0, cursor.column) + currentLine.substring(cursor.column + 1);
      } else if (cursor.line < newLines.length - 1) {
        const nextLine = newLines[cursor.line + 1];
        newLines[cursor.line] = currentLine + nextLine;
        newLines.splice(cursor.line + 1, 1);
      }
    }
    
    const newContent = newLines.join('\n');
    setContent(newContent);
    setIsModified(true);
    addToUndoHistory(newContent);
  }, [lines, cursor, addToUndoHistory]);

  // Handle vim commands
  const executeVimCommand = useCallback(async (command: string) => {
    const cmd = command.toLowerCase();
    
    if (cmd === 'w' || cmd === 'write') {
      await onSave(content);
      setIsModified(false);
      setStatusMessage(`"${filename}" ${lines.length}L, ${content.length}C written`);
    } else if (cmd === 'q' || cmd === 'quit') {
      if (isModified) {
        setStatusMessage('No write since last change (use :q! to override)');
      } else {
        onClose();
      }
    } else if (cmd === 'q!' || cmd === 'quit!') {
      onClose();
    } else if (cmd === 'wq' || cmd === 'x') {
      await onSave(content);
      onClose();
    } else if (cmd.startsWith('/')) {
      setSearchTerm(cmd.substring(1));
      search(cmd.substring(1));
    } else if (cmd.startsWith('s/')) {
      const parts = cmd.split('/');
      if (parts.length >= 3) {
        setSearchTerm(parts[1]);
        setReplaceWith(parts[2]);
        replace(parts[1], parts[2], parts[3] === 'g');
      }
    } else if (cmd === 'set nu' || cmd === 'set number') {
      setLineNumbers(true);
      setStatusMessage('Line numbers enabled');
    } else if (cmd === 'set nonu' || cmd === 'set nonumber') {
      setLineNumbers(false);
      setStatusMessage('Line numbers disabled');
    } else if (cmd === 'set wrap') {
      setWordWrap(true);
      setStatusMessage('Word wrap enabled');
    } else if (cmd === 'set nowrap') {
      setWordWrap(false);
      setStatusMessage('Word wrap disabled');
    } else if (cmd === 'syntax on') {
      setSyntaxHighlight(true);
      setStatusMessage('Syntax highlighting enabled');
    } else if (cmd === 'syntax off') {
      setSyntaxHighlight(false);
      setStatusMessage('Syntax highlighting disabled');
    } else {
      setStatusMessage(`E492: Not an editor command: ${command}`);
    }
    
    setCommandBuffer('');
    setTimeout(() => setStatusMessage(''), 3000);
  }, [content, isModified, onSave, onClose, filename, lines.length]);

  // Handle search
  const search = useCallback((term: string, direction: 'forward' | 'backward' = 'forward') => {
    if (!term) return;
    
    const text = content.toLowerCase();
    const searchTerm = term.toLowerCase();
    let searchStart = 0;
    
    for (let i = 0; i < cursor.line; i++) {
      searchStart += lines[i].length + 1;
    }
    searchStart += cursor.column;
    
    let foundIndex = -1;
    if (direction === 'forward') {
      foundIndex = text.indexOf(searchTerm, searchStart + 1);
      if (foundIndex === -1) {
        foundIndex = text.indexOf(searchTerm, 0);
      }
    } else {
      foundIndex = text.lastIndexOf(searchTerm, searchStart - 1);
      if (foundIndex === -1) {
        foundIndex = text.lastIndexOf(searchTerm);
      }
    }
    
    if (foundIndex !== -1) {
      let line = 0;
      let lineStart = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const lineEnd = lineStart + lines[i].length;
        if (foundIndex >= lineStart && foundIndex <= lineEnd) {
          line = i;
          break;
        }
        lineStart = lineEnd + 1;
      }
      
      const column = foundIndex - lineStart;
      setCursor({ line, column });
      setStatusMessage(`search hit BOTTOM, continuing at TOP`);
    } else {
      setStatusMessage(`Pattern not found: ${term}`);
    }
  }, [content, cursor, lines]);

  // Handle replace
  const replace = useCallback((searchTerm: string, replaceWith: string, replaceAll: boolean = false) => {
    if (!searchTerm) return;
    
    let newContent = content;
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), replaceAll ? 'g' : '');
    const matches = newContent.match(regex);
    
    if (matches) {
      newContent = newContent.replace(regex, replaceWith);
      setContent(newContent);
      setIsModified(true);
      addToUndoHistory(newContent);
      setStatusMessage(`${matches.length} substitution${matches.length > 1 ? 's' : ''} on ${matches.length} line${matches.length > 1 ? 's' : ''}`);
    } else {
      setStatusMessage(`Pattern not found: ${searchTerm}`);
    }
  }, [content, addToUndoHistory]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (mode === 'vim') {
      if (vimMode === 'command') {
        if (e.key === 'Enter') {
          executeVimCommand(commandBuffer);
          setVimMode('normal');
        } else if (e.key === 'Escape') {
          setCommandBuffer('');
          setVimMode('normal');
        }
        return;
      }

      if (vimMode === 'normal') {
        e.preventDefault();
        
        switch (e.key) {
          case 'i':
            setVimMode('insert');
            setStatusMessage('-- INSERT --');
            break;
          case 'a':
            setVimMode('insert');
            moveCursor('right');
            setStatusMessage('-- INSERT --');
            break;
          case 'A':
            setVimMode('insert');
            moveCursor('end');
            setStatusMessage('-- INSERT --');
            break;
          case 'o':
            moveCursor('end');
            insertText('\n');
            setVimMode('insert');
            setStatusMessage('-- INSERT --');
            break;
          case 'O':
            moveCursor('home');
            insertText('\n');
            moveCursor('up');
            setVimMode('insert');
            setStatusMessage('-- INSERT --');
            break;
          case 'h':
          case 'ArrowLeft':
            moveCursor('left');
            break;
          case 'j':
          case 'ArrowDown':
            moveCursor('down');
            break;
          case 'k':
          case 'ArrowUp':
            moveCursor('up');
            break;
          case 'l':
          case 'ArrowRight':
            moveCursor('right');
            break;
          case '0':
            moveCursor('home');
            break;
          case '$':
            moveCursor('end');
            break;
          case 'x':
            deleteChar('delete');
            break;
          case 'X':
            deleteChar('backspace');
            break;
          case 'u':
            undo();
            break;
          case 'r':
            if (e.ctrlKey) redo();
            break;
          case 'v':
            setVimMode('visual');
            setVisualStart(cursor);
            setStatusMessage('-- VISUAL --');
            break;
          case ':':
            setVimMode('command');
            setCommandBuffer('');
            break;
          case '/':
            setVimMode('command');
            setCommandBuffer('/');
            break;
          case 'n':
            search(searchTerm, 'forward');
            break;
          case 'N':
            search(searchTerm, 'backward');
            break;
          case 'Escape':
            setVimMode('normal');
            setVisualStart(null);
            setStatusMessage('');
            break;
        }
      } else if (vimMode === 'insert') {
        if (e.key === 'Escape') {
          e.preventDefault();
          setVimMode('normal');
          setStatusMessage('');
        }
      }
    }
  }, [mode, vimMode, commandBuffer, cursor, moveCursor, insertText, deleteChar, undo, redo, executeVimCommand, search, searchTerm]);

  // Get syntax highlighting
  const getSyntaxHighlightedContent = useCallback((text: string) => {
    if (!syntaxHighlight) return text;
    
    const ext = filename.split('.').pop()?.toLowerCase();
    
    if (ext === 'js' || ext === 'ts' || ext === 'jsx' || ext === 'tsx') {
      return text
        .replace(/(const|let|var|function|if|else|for|while|return|import|export|class)/g, '<span style="color: #60a5fa;">$1</span>')
        .replace(/(true|false|null|undefined)/g, '<span style="color: #a78bfa;">$1</span>')
        .replace(/('[^']*'|"[^"]*")/g, '<span style="color: #34d399;">$1</span>')
        .replace(/(\/\/.*$)/gm, '<span style="color: #6b7280;">$1</span>');
    } else if (ext === 'py') {
      return text
        .replace(/(def|class|if|else|elif|for|while|return|import|from|try|except|with)/g, '<span style="color: #60a5fa;">$1</span>')
        .replace(/(True|False|None)/g, '<span style="color: #a78bfa;">$1</span>')
        .replace(/(#.*$)/gm, '<span style="color: #6b7280;">$1</span>');
    } else if (ext === 'html') {
      return text
        .replace(/(&lt;\/?[^&gt;]+&gt;)/g, '<span style="color: #f59e0b;">$1</span>');
    } else if (ext === 'css') {
      return text
        .replace(/([a-zA-Z-]+)(\s*:\s*)/g, '<span style="color: #60a5fa;">$1</span>$2')
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6b7280;">$1</span>');
    }
    
    return text;
  }, [filename, syntaxHighlight]);

  // Handle standard text area change for nano/emacs modes
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (mode !== 'vim' || vimMode === 'insert') {
      setContent(e.target.value);
      setIsModified(true);
      addToUndoHistory(e.target.value);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 text-green-400 font-mono flex flex-col z-50">
      {/* Editor Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-white font-semibold">
            {mode.toUpperCase()} Editor: {filename}
          </span>
          {isModified && <span className="text-yellow-400">●</span>}
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <span>Line {cursor.line + 1}, Col {cursor.column + 1}</span>
          {mode === 'vim' && (
            <span className="text-blue-400">
              {vimMode.toUpperCase()}
            </span>
          )}
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex">
        {/* Line Numbers */}
        {lineNumbers && (
          <div className="bg-gray-800 border-r border-gray-700 px-2 py-1 text-right text-gray-500 select-none min-w-[4rem]">
            {lines.map((_, index) => (
              <div key={index} className="leading-6 h-6">
                {index + 1}
              </div>
            ))}
          </div>
        )}

        {/* Text Area */}
        <div className="flex-1 relative">
          {mode === 'vim' ? (
            // Vim mode - custom rendering
            <div className="absolute inset-0 p-4 overflow-auto">
              <div className="relative">
                <pre
                  className={`whitespace-pre font-mono leading-6 text-green-400 ${wordWrap ? 'whitespace-pre-wrap' : ''}`}
                  dangerouslySetInnerHTML={{ 
                    __html: getSyntaxHighlightedContent(content.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
                  }}
                />
                
                {/* Cursor */}
                <div
                  className="absolute bg-green-400 w-2 h-6"
                  style={{
                    top: `${cursor.line * 1.5}rem`,
                    left: `${cursor.column * 0.6}rem`,
                    opacity: vimMode === 'insert' ? 0.7 : 1,
                  }}
                />
                
                {/* Visual selection */}
                {vimMode === 'visual' && visualStart && (
                  <div
                    className="absolute bg-blue-600 bg-opacity-30"
                    style={{
                      top: `${Math.min(visualStart.line, cursor.line) * 1.5}rem`,
                      left: `${Math.min(visualStart.column, cursor.column) * 0.6}rem`,
                      width: `${Math.abs(cursor.column - visualStart.column) * 0.6}rem`,
                      height: `${(Math.abs(cursor.line - visualStart.line) + 1) * 1.5}rem`,
                    }}
                  />
                )}
              </div>
              
              {/* Invisible input for vim key handling */}
              <input
                ref={vimInputRef}
                className="absolute opacity-0 w-full h-full"
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          ) : (
            // Nano/Emacs mode - standard textarea
            <textarea
              ref={editorRef}
              className="w-full h-full p-4 bg-transparent text-green-400 font-mono resize-none outline-none"
              value={content}
              onChange={handleTextAreaChange}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{ 
                whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
                lineHeight: '1.5rem'
              }}
            />
          )}
        </div>
      </div>

      {/* Command Line (Vim mode) */}
      {mode === 'vim' && vimMode === 'command' && (
        <div className="bg-gray-800 border-t border-gray-700 p-2">
          <div className="flex items-center">
            <span className="mr-2 text-white">:</span>
            <input
              ref={commandInputRef}
              type="text"
              value={commandBuffer}
              onChange={(e) => setCommandBuffer(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-white outline-none"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Search/Replace Dialog */}
      {(showSearch || showReplace) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded p-4 w-96">
            <h3 className="text-white mb-4">
              {showReplace ? 'Find & Replace' : 'Search'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Find:</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700 text-white p-2 rounded outline-none"
                  autoFocus
                />
              </div>
              
              {showReplace && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Replace with:</label>
                  <input
                    type="text"
                    value={replaceWith}
                    onChange={(e) => setReplaceWith(e.target.value)}
                    className="w-full bg-gray-700 text-white p-2 rounded outline-none"
                  />
                </div>
              )}
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    if (showReplace) {
                      replace(searchTerm, replaceWith, false);
                    } else {
                      search(searchTerm);
                    }
                    setShowSearch(false);
                    setShowReplace(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  {showReplace ? 'Replace' : 'Find'}
                </button>
                
                {showReplace && (
                  <button
                    onClick={() => {
                      replace(searchTerm, replaceWith, true);
                      setShowSearch(false);
                      setShowReplace(false);
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
                  >
                    Replace All
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setShowReplace(false);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 p-2 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          {statusMessage && (
            <span className="text-yellow-400">{statusMessage}</span>
          )}
          {!statusMessage && mode === 'vim' && vimMode !== 'normal' && (
            <span className="text-blue-400">-- {vimMode.toUpperCase()} --</span>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {mode === 'vim' ? (
            <span className="text-gray-400">
              ESC: Normal | i: Insert | :: Command | :wq: Save & Exit | :q!: Force Quit
            </span>
          ) : (
            <span className="text-gray-400">
              Ctrl+S: Save | Ctrl+X: Exit | Ctrl+Z: Undo | Ctrl+Y: Redo
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
