import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';

interface Command {
  input: string;
  output: string[];
  timestamp: Date;
}

interface FileSystemItem {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: { [key: string]: FileSystemItem };
}

const TerminalPage: React.FC = () => {
  const [commands, setCommands] = useState<Command[]>([
    {
      input: 'Welcome to Entropy Terminal!',
      output: ['Type "help" to see available commands.'],
      timestamp: new Date()
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState('/home/user');
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Simulate a basic file system
  const [fileSystem] = useState<{ [key: string]: FileSystemItem }>({
    '/': {
      name: '/',
      type: 'directory',
      children: {
        'home': {
          name: 'home',
          type: 'directory',
          children: {
            'user': {
              name: 'user',
              type: 'directory',
              children: {
                'documents': {
                  name: 'documents',
                  type: 'directory',
                  children: {
                    'readme.txt': {
                      name: 'readme.txt',
                      type: 'file',
                      content: 'Welcome to the Entropy Terminal! This is a simulated file system.'
                    }
                  }
                },
                'projects': {
                  name: 'projects',
                  type: 'directory',
                  children: {}
                },
                'profile.txt': {
                  name: 'profile.txt',
                  type: 'file',
                  content: 'User profile configuration file.'
                }
              }
            }
          }
        },
        'etc': {
          name: 'etc',
          type: 'directory',
          children: {
            'config.txt': {
              name: 'config.txt',
              type: 'file',
              content: 'System configuration file.'
            }
          }
        }
      }
    }
  });

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [commands]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const getCurrentDir = (): FileSystemItem | null => {
    const pathParts = currentPath.split('/').filter(part => part !== '');
    let current = fileSystem['/'];
    
    for (const part of pathParts) {
      if (current.children && current.children[part]) {
        current = current.children[part];
      } else {
        return null;
      }
    }
    return current;
  };

  const getItemAtPath = (path: string): FileSystemItem | null => {
    const normalizedPath = path.startsWith('/') ? path : `${currentPath}/${path}`;
    const pathParts = normalizedPath.split('/').filter(part => part !== '');
    let current = fileSystem['/'];
    
    for (const part of pathParts) {
      if (current.children && current.children[part]) {
        current = current.children[part];
      } else {
        return null;
      }
    }
    return current;
  };

  const executeCommand = (input: string) => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const [command, ...args] = trimmedInput.split(' ');
    let output: string[] = [];

    switch (command.toLowerCase()) {
      case 'help':
        output = [
          'Available commands:',
          '  help       - Show this help message',
          '  ls         - List directory contents',
          '  cd <dir>   - Change directory',
          '  pwd        - Print working directory',
          '  cat <file> - Display file contents',
          '  mkdir <dir>- Create directory',
          '  touch <file>- Create empty file',
          '  echo <text>- Print text',
          '  clear      - Clear terminal',
          '  date       - Show current date and time',
          '  whoami     - Show current user',
          '  ps         - Show running processes',
          '  uname      - Show system information'
        ];
        break;

      case 'ls':
        const currentDir = getCurrentDir();
        if (currentDir && currentDir.children) {
          const items = Object.values(currentDir.children);
          if (items.length === 0) {
            output = ['(empty directory)'];
          } else {
            output = items.map(item => 
              item.type === 'directory' ? `📁 ${item.name}/` : `📄 ${item.name}`
            );
          }
        } else {
          output = ['Directory not found'];
        }
        break;

      case 'pwd':
        output = [currentPath];
        break;

      case 'cd':
        if (args.length === 0) {
          setCurrentPath('/home/user');
          output = ['Changed to home directory'];
        } else {
          const targetPath = args[0];
          let newPath: string;
          
          if (targetPath === '..') {
            const pathParts = currentPath.split('/').filter(part => part !== '');
            pathParts.pop();
            newPath = pathParts.length === 0 ? '/' : '/' + pathParts.join('/');
          } else if (targetPath.startsWith('/')) {
            newPath = targetPath;
          } else {
            newPath = currentPath === '/' ? `/${targetPath}` : `${currentPath}/${targetPath}`;
          }

          const targetDir = getItemAtPath(newPath);
          if (targetDir && targetDir.type === 'directory') {
            setCurrentPath(newPath);
            output = [`Changed directory to ${newPath}`];
          } else {
            output = [`cd: ${targetPath}: No such directory`];
          }
        }
        break;

      case 'cat':
        if (args.length === 0) {
          output = ['cat: missing file argument'];
        } else {
          const file = getItemAtPath(args[0]);
          if (file && file.type === 'file') {
            output = file.content ? file.content.split('\n') : ['(empty file)'];
          } else {
            output = [`cat: ${args[0]}: No such file`];
          }
        }
        break;

      case 'echo':
        output = [args.join(' ')];
        break;

      case 'date':
        output = [new Date().toString()];
        break;

      case 'whoami':
        output = ['user'];
        break;

      case 'ps':
        output = [
          'PID  TTY      TIME CMD',
          '1    pts/0    00:00:01 bash',
          '42   pts/0    00:00:00 entropy-terminal',
          '100  pts/0    00:00:00 ps'
        ];
        break;

      case 'uname':
        output = ['Entropy Terminal v1.0 (Web-based Linux simulation)'];
        break;

      case 'clear':
        setCommands([]);
        return;

      case 'mkdir':
        output = args.length === 0 ? ['mkdir: missing directory name'] : [`Directory '${args[0]}' created (simulated)`];
        break;

      case 'touch':
        output = args.length === 0 ? ['touch: missing file name'] : [`File '${args[0]}' created (simulated)`];
        break;

      default:
        output = [`bash: ${command}: command not found`];
        break;
    }

    const newCommand: Command = {
      input: trimmedInput,
      output,
      timestamp: new Date()
    };

    setCommands(prev => [...prev, newCommand]);
    setCommandHistory(prev => [...prev, trimmedInput]);
    setHistoryIndex(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(currentInput);
    setCurrentInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    <div className="flex size-full min-h-screen flex-col bg-[#f6f0e4]" style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}>
      <Navbar />
      
      <main className="flex-1 px-4 sm:px-10 md:px-20 lg:px-40 py-5">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[#382f29] text-3xl font-bold">Terminal</h1>
            <p className="text-[#b8a99d] text-lg mt-2">Web-based terminal emulator with filesystem simulation</p>
          </div>

          {/* Terminal Container */}
          <div className="flex-1 bg-[#1a1a1a] rounded-xl shadow-lg border border-[#333] overflow-hidden flex flex-col">
            {/* Terminal Header */}
            <div className="bg-[#2d2d2d] px-4 py-3 flex items-center gap-2 border-b border-[#333]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27ca3f]"></div>
              </div>
              <span className="text-[#888] text-sm ml-4">Terminal — user@entropy:~</span>
            </div>

            {/* Terminal Content */}
            <div 
              ref={terminalRef}
              className="flex-1 p-4 overflow-y-auto text-[#00ff00] font-mono text-sm leading-relaxed"
              style={{ maxHeight: 'calc(100vh - 400px)' }}
            >
              {commands.map((command, index) => (
                <div key={index} className="mb-4">
                  {command.input !== 'Welcome to Entropy Terminal!' && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#00aaff]">user@entropy</span>
                      <span className="text-[#888]">:</span>
                      <span className="text-[#ffaa00]">{currentPath}</span>
                      <span className="text-[#888]">$</span>
                      <span className="text-[#fff]">{command.input}</span>
                    </div>
                  )}
                  {command.output.map((line, lineIndex) => (
                    <div key={lineIndex} className="text-[#00ff00] pl-0">
                      {line}
                    </div>
                  ))}
                </div>
              ))}
              
              {/* Current Input Line */}
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <span className="text-[#00aaff]">user@entropy</span>
                <span className="text-[#888]">:</span>
                <span className="text-[#ffaa00]">{currentPath}</span>
                <span className="text-[#888]">$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-[#fff] outline-none font-mono"
                  placeholder="Type a command..."
                  autoComplete="off"
                />
              </form>
            </div>
          </div>

          {/* Terminal Info */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-[#e0d5c7]">
              <h3 className="text-[#382f29] font-semibold mb-2">Quick Tips</h3>
              <ul className="text-[#b8a99d] text-sm space-y-1">
                <li>• Use arrow keys for command history</li>
                <li>• Type "help" for available commands</li>
                <li>• Try "ls", "cd", "pwd", "cat"</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-[#e0d5c7]">
              <h3 className="text-[#382f29] font-semibold mb-2">Current Directory</h3>
              <p className="text-[#b8a99d] text-sm font-mono">{currentPath}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-[#e0d5c7]">
              <h3 className="text-[#382f29] font-semibold mb-2">Commands Run</h3>
              <p className="text-[#b8a99d] text-sm">{commandHistory.length} commands executed</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TerminalPage; 