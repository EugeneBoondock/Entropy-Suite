import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { SearchAddon } from '@xterm/addon-search';
import '@xterm/xterm/css/xterm.css';

interface XTerminalProps {
  onCommand?: (command: string) => Promise<string>;
  onInit?: (terminal: Terminal) => void;
  getCurrentPath?: () => string;
  className?: string;
}

export default function XTerminal({ onCommand, onInit, getCurrentPath, className = '' }: XTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const currentLineRef = useRef('');
  const commandHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const isProcessingRef = useRef(false);

  // Get current prompt with dynamic path
  const getPrompt = useCallback(() => {
    const currentPath = getCurrentPath ? getCurrentPath() : '/home/user';
    return `\x1b[32mentropy\x1b[0m:\x1b[34m${currentPath}\x1b[0m$ `;
  }, [getCurrentPath]);

  // Handle command execution with useCallback to maintain reference
  const handleCommand = useCallback(async (command: string, term: Terminal) => {
    if (!onCommand) return;
    
    isProcessingRef.current = true;
    term.writeln('');

    try {
      const output = await onCommand(command);
      
      if (output) {
        // Handle special ANSI sequences
        if (output === '\x1b[2J\x1b[H') {
          term.clear();
        } else {
          // Handle colored output
          const lines = output.split('\n');
          lines.forEach(line => {
            if (line.startsWith('ERROR:') || line.startsWith('❌')) {
              term.writeln(`\x1b[31m${line}\x1b[0m`); // Red
            } else if (line.startsWith('✅') || line.startsWith('SUCCESS:')) {
              term.writeln(`\x1b[32m${line}\x1b[0m`); // Green
            } else if (line.startsWith('🤖') || line.startsWith('AI:')) {
              term.writeln(`\x1b[36m${line}\x1b[0m`); // Cyan
            } else if (line.startsWith('⚠️') || line.startsWith('WARNING:')) {
              term.writeln(`\x1b[33m${line}\x1b[0m`); // Yellow
            } else {
              term.writeln(line);
            }
          });
        }
      }
    } catch (error) {
      term.writeln(`\x1b[31mError: ${error}\x1b[0m`);
    } finally {
      isProcessingRef.current = false;
      // Show prompt
      term.write('\r\n' + getPrompt());
    }
  }, [onCommand, getPrompt]);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Create terminal instance
    const term = new Terminal({
      theme: {
        background: '#1a1a1a',
        foreground: '#00ff00',
        cursor: '#00ff00',
        cursorAccent: '#000000',
        selectionBackground: '#333333',
        black: '#000000',
        red: '#ff0000',
        green: '#00ff00',
        yellow: '#ffff00',
        blue: '#0000ff',
        magenta: '#ff00ff',
        cyan: '#00ffff',
        white: '#ffffff',
        brightBlack: '#555555',
        brightRed: '#ff5555',
        brightGreen: '#55ff55',
        brightYellow: '#ffff55',
        brightBlue: '#5555ff',
        brightMagenta: '#ff55ff',
        brightCyan: '#55ffff',
        brightWhite: '#ffffff'
      },
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", "Courier New", monospace',
      cursorBlink: true,
      allowTransparency: true,
      scrollback: 1000,
      tabStopWidth: 4
    });

    // Add addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    const searchAddon = new SearchAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.loadAddon(searchAddon);

    // Open terminal in DOM
    term.open(terminalRef.current);
    fitAddon.fit();

    // Initial welcome message
    term.writeln('🚀 Entropy Real Terminal v2.0 - AI-Native Development Environment');
    term.writeln('📁 OPFS File System | 🐍 Python (Pyodide) | 📦 Node.js (WebContainers) | 🔧 Git Operations | 🤖 AI Agent');
    term.writeln('🆓 AI Ready: Google Gemini 2.0 Flash Lite (Free Tier)');
    term.writeln('Type "help" for available commands or "ai" to start AI session.');
    term.writeln('');

    // Show initial prompt
    term.write(getPrompt());

    // Handle data input
    term.onData((data) => {
      if (isProcessingRef.current) return;

      const code = data.charCodeAt(0);

      // Handle Enter key
      if (code === 13) {
        if (currentLineRef.current.trim()) {
          commandHistoryRef.current = [...commandHistoryRef.current, currentLineRef.current];
          historyIndexRef.current = -1;
          handleCommand(currentLineRef.current.trim(), term);
        } else {
          term.write('\r\n' + getPrompt());
        }
        currentLineRef.current = '';
        return;
      }

      // Handle Backspace
      if (code === 127 || code === 8) {
        if (currentLineRef.current.length > 0) {
          currentLineRef.current = currentLineRef.current.slice(0, -1);
          term.write('\b \b');
        }
        return;
      }

      // Handle Ctrl+C
      if (code === 3) {
        term.writeln('^C');
        currentLineRef.current = '';
        term.write('\r\n' + getPrompt());
        return;
      }

      // Handle Ctrl+L (clear)
      if (code === 12) {
        term.clear();
        term.write(getPrompt());
        return;
      }

      // Handle Tab (could add completion later)
      if (code === 9) {
        return;
      }

      // Handle regular characters
      if (code >= 32 && code <= 126) {
        currentLineRef.current = currentLineRef.current + data;
        term.write(data);
      }
    });

    // Handle key events for arrow keys
    term.onKey(({ key, domEvent }) => {
      const ev = domEvent;
      
      // Arrow Up - Previous command
      if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        if (commandHistoryRef.current.length > 0) {
          const newIndex = historyIndexRef.current < commandHistoryRef.current.length - 1 ? historyIndexRef.current + 1 : historyIndexRef.current;
          if (newIndex !== historyIndexRef.current) {
            historyIndexRef.current = newIndex;
            const command = commandHistoryRef.current[commandHistoryRef.current.length - 1 - newIndex];
            // Clear current line and write new command
            term.write('\r\x1b[K' + getPrompt() + command);
            currentLineRef.current = command;
          }
        }
      }

      // Arrow Down - Next command
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        if (historyIndexRef.current > 0) {
          const newIndex = historyIndexRef.current - 1;
          historyIndexRef.current = newIndex;
          const command = commandHistoryRef.current[commandHistoryRef.current.length - 1 - newIndex];
          term.write('\r\x1b[K' + getPrompt() + command);
          currentLineRef.current = command;
        } else if (historyIndexRef.current === 0) {
          historyIndexRef.current = -1;
          term.write('\r\x1b[K' + getPrompt());
          currentLineRef.current = '';
        }
      }
    });

    // Resize handler
    const handleResize = () => {
      fitAddon.fit();
    };
    
    window.addEventListener('resize', handleResize);
    
    setTerminal(term);
    
    // Call onInit if provided
    if (onInit) {
      onInit(term);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, [handleCommand, onInit, getPrompt]);

  return (
    <div className={`w-full h-full ${className}`}>
      <div ref={terminalRef} className="w-full h-full" />
    </div>
  );
}

// Export terminal instance type for external use
export type { Terminal }; 