import React, { useState, useEffect, useRef } from 'react';
import XTerminal, { Terminal } from '../components/XTerminal';
import { TerminalCommandHandler } from '../services/terminalCommands';

export default function RealTerminalPageNew() {
  const [commandHandler] = useState(() => new TerminalCommandHandler());
  const [isInitialized, setIsInitialized] = useState(false);
  const terminalRef = useRef<Terminal | null>(null);

  useEffect(() => {
    const initializeTerminal = async () => {
      try {
        const initResult = await commandHandler.initialize();
        if (terminalRef.current) {
          // Display initialization results
          const lines = initResult.split('\n');
          lines.forEach(line => {
            if (line.startsWith('✅')) {
              terminalRef.current?.writeln(`\x1b[32m${line}\x1b[0m`); // Green
            } else if (line.startsWith('❌')) {
              terminalRef.current?.writeln(`\x1b[31m${line}\x1b[0m`); // Red
            } else {
              terminalRef.current?.writeln(line);
            }
          });
          terminalRef.current?.writeln('');
        }
        setIsInitialized(true);
      } catch (error) {
        if (terminalRef.current) {
          terminalRef.current.writeln(`\x1b[31m❌ Failed to initialize: ${error}\x1b[0m`);
        }
      }
    };

    if (terminalRef.current && !isInitialized) {
      initializeTerminal();
    }
  }, [commandHandler, isInitialized]);

  const handleCommand = async (command: string): Promise<string> => {
    try {
      const result = await commandHandler.executeCommand(command);
      return result;
    } catch (error) {
      return `ERROR: ${error}`;
    }
  };

  const handleTerminalInit = (terminal: Terminal) => {
    terminalRef.current = terminal;
  };

  const getCurrentPath = () => {
    return commandHandler.getState().currentPath;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 font-mono overflow-hidden">
      {/* Terminal Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-gray-300 font-semibold">
            Entropy Real Terminal (XTerm.js)
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          {(() => {
            const state = commandHandler.getState();
            return (
              <>
                <span className={`flex items-center ${state.engines.filesystem ? 'text-green-400' : 'text-red-400'}`}>
                  📁 FS
                </span>
                <span className={`flex items-center ${state.engines.python ? 'text-green-400' : 'text-gray-500'}`}>
                  🐍 Py
                </span>
                <span className={`flex items-center ${state.engines.node ? 'text-green-400' : 'text-gray-500'}`}>
                  📦 Node
                </span>
                <span className={`flex items-center ${state.engines.git ? 'text-green-400' : 'text-gray-500'}`}>
                  🔧 Git
                </span>
                <span className={`flex items-center ${state.engines.ai ? 'text-green-400' : 'text-gray-500'}`}>
                  🤖 AI
                </span>
              </>
            );
          })()}
        </div>
      </div>

      {/* Terminal Content */}
      <div className="h-[calc(100vh-60px)]">
        <XTerminal
          onCommand={handleCommand}
          onInit={handleTerminalInit}
          getCurrentPath={getCurrentPath}
          className="w-full h-full"
        />
      </div>
    </div>
  );
} 