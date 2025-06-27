import { RealFileSystem } from './realTerminal/fileSystem';
import { PythonEngine } from './realTerminal/pythonEngine';
import { GitEngine } from './realTerminal/gitEngine';
import { NodeEngine } from './realTerminal/nodeEngine';
import { AIProviderService, AITools } from './aiProviders';

export interface TerminalState {
  currentPath: string;
  isLoading: boolean;
  engines: {
    filesystem: boolean;
    python: boolean;
    node: boolean;
    git: boolean;
    ai: boolean;
  };
  activeSession: {
    type: 'python' | 'node' | 'ai' | null;
    repl: any;
  };
}

export class TerminalCommandHandler {
  private fileSystem: RealFileSystem;
  private pythonEngine: PythonEngine;
  private gitEngine: GitEngine;
  private nodeEngine: NodeEngine;
  private aiService: AIProviderService;
  private tools: AITools;
  private state: TerminalState;
  private commandHistory: string[] = [];

  constructor() {
    this.state = {
      currentPath: '/home/user',
      isLoading: false,
      engines: {
        filesystem: false,
        python: false,
        node: false,
        git: false,
        ai: false
      },
      activeSession: {
        type: null,
        repl: null
      }
    };

    this.fileSystem = new RealFileSystem();
    this.pythonEngine = new PythonEngine();
    this.gitEngine = new GitEngine(this.fileSystem);
    this.nodeEngine = new NodeEngine();

    // Set up tools for AI
    this.tools = {
      executeCode: async (code: string, language: string) => {
        if (language === 'python') {
          const result = await this.pythonEngine.executeCode(code);
          return result.output || result.error || 'Code executed';
        } else if (language === 'javascript' || language === 'js') {
          const result = await this.nodeEngine.runScript(code, 'temp.js');
          return result.output || result.error || 'Code executed';
        }
        return 'Unsupported language';
      },
      editFile: async (filename: string, content: string) => {
        await this.fileSystem.writeFile(filename, content);
      },
      readFile: async (filename: string) => {
        const content = await this.fileSystem.readFile(filename);
        return typeof content === 'string' ? content : new TextDecoder().decode(content);
      },
      listFiles: async (path?: string) => {
        const items = await this.fileSystem.listDirectory(path || this.state.currentPath);
        return items.map(item => `${item.type === 'directory' ? '📁' : '📄'} ${item.name}`);
      },
      runCommand: async (command: string) => {
        return await this.executeCommand(command);
      }
    };

    this.aiService = new AIProviderService(this.tools);
  }

  async initialize(): Promise<string> {
    try {
      // Initialize file system
      await this.fileSystem.initialize();
      this.fileSystem.setCurrentPath('/home/user');
      this.state.engines.filesystem = true;
      
      // Create initial directory structure
      await this.fileSystem.createDirectory('/home/user/projects');
      await this.fileSystem.createDirectory('/home/user/downloads');
      await this.fileSystem.writeFile('/home/user/welcome.txt', 
        'Welcome to Entropy Real Terminal!\n\n' +
        'This is a fully functional development environment running in your browser.\n' +
        'You can:\n' +
        '- Create and edit files that persist across sessions\n' +
        '- Run Python scripts with NumPy, Pandas, Matplotlib\n' +
        '- Execute Node.js applications and install npm packages\n' +
        '- Use Git for version control\n' +
        '- Build and deploy projects\n\n' +
        'Try: cat welcome.txt, python3, node, git status\n'
      );

      this.state.engines.git = true;
      this.state.engines.ai = true;

      return '✅ File system initialized with OPFS\n✅ Git engine ready\n✅ AI ready: Google Gemini 2.0 Flash Lite (Free Tier)';
    } catch (error) {
      return `❌ Initialization failed: ${error}`;
    }
  }

  async executeCommand(command: string): Promise<string> {
    if (!command.trim()) return '';

    this.commandHistory.push(command);
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    try {
      // Handle active REPL sessions
      if (this.state.activeSession.repl && this.state.activeSession.type) {
        if (command.trim() === 'exit' || command.trim() === 'quit') {
          if (this.state.activeSession.type === 'node' && 'close' in this.state.activeSession.repl) {
            await this.state.activeSession.repl.close();
          }
          this.state.activeSession = { type: null, repl: null };
          return `Exited ${this.state.activeSession.type} REPL`;
        } else {
          const result = await this.state.activeSession.repl.execute(command);
          return (result.output || '') + (result.error ? `\nERROR: ${result.error}` : '');
        }
      }

      // Handle AI session
      if (this.state.activeSession.type === 'ai') {
        if (command.trim() === 'exit' || command.trim() === 'quit') {
          this.state.activeSession = { type: null, repl: null };
          return 'Exited AI session';
        } else {
          return await this.handleAIMessage(command);
        }
      }

      // Built-in commands
      switch (cmd) {
        case 'help':
          return this.getHelpText();

        case 'engines':
          return this.getEngineStatus();

        case 'clear':
          return '\x1b[2J\x1b[H'; // ANSI clear screen

        case 'pwd':
          return this.state.currentPath;

        case 'cd':
          return await this.handleCd(args[0] || '/home/user');

        case 'ls':
        case 'dir':
          return await this.handleLs(args[0]);

        case 'mkdir':
          if (args[0]) {
            try {
              await this.fileSystem.createDirectory(args[0]);
              return `✅ Created directory: ${args[0]}`;
            } catch (error) {
              return `ERROR: mkdir: ${error}`;
            }
          } else {
            return 'ERROR: mkdir: missing directory name';
          }

        case 'touch':
          if (args[0]) {
            try {
              await this.fileSystem.writeFile(args[0], '');
              return `✅ Created file: ${args[0]}`;
            } catch (error) {
              return `ERROR: touch: ${error}`;
            }
          } else {
            return 'ERROR: touch: missing file name';
          }

        case 'cat':
          if (args[0]) {
            try {
              const content = await this.fileSystem.readFile(args[0]);
              return typeof content === 'string' ? content : '[Binary file]';
            } catch (error) {
              return `ERROR: cat: ${error}`;
            }
          } else {
            return 'ERROR: cat: missing file name';
          }

        case 'rm':
          if (args[0]) {
            try {
              await this.fileSystem.deleteFile(args[0]);
              return `✅ Removed: ${args[0]}`;
            } catch (error) {
              return `ERROR: rm: ${error}`;
            }
          } else {
            return 'ERROR: rm: missing file name';
          }

        case 'echo':
          return args.join(' ');

        case 'test':
          return 'Terminal is working! ✅';

        case 'python':
        case 'python3':
          return await this.handlePython(args);

        case 'node':
          return await this.handleNode(args);

        case 'npm':
          return await this.handleNpm(args);

        case 'git':
          return await this.handleGit(args);

        case 'ai':
          return await this.handleAICommand(args);

        case 'history':
          return this.commandHistory.map((cmd, i) => `${i + 1}  ${cmd}`).join('\n');

        case 'date':
          return new Date().toString();

        case 'whoami':
          return 'entropy-user';

        case 'uname':
          return 'Entropy-OS Browser x86_64';

        default:
          // Try to execute as a script file
          if (await this.fileSystem.exists(cmd)) {
            const content = await this.fileSystem.readFile(cmd);
            if (typeof content === 'string') {
              if (cmd.endsWith('.py')) {
                const result = await this.pythonEngine.executeCode(content, this.state.currentPath);
                return (result.output || '') + (result.error ? `\nERROR: ${result.error}` : '');
              } else if (cmd.endsWith('.js')) {
                const result = await this.nodeEngine.runScript(content, cmd);
                return (result.output || '') + (result.error ? `\nERROR: ${result.error}` : '');
              } else {
                return content;
              }
            }
          } else {
            return `ERROR: Command not found: ${cmd}\nType 'help' for available commands`;
          }
          break;
      }

    } catch (error) {
      return `ERROR: ${error}`;
    }

    return '';
  }

  private async handleCd(path: string): Promise<string> {
    try {
      // Handle special cases
      if (path === '~' || path === '') {
        this.fileSystem.setCurrentPath('/home/user');
        this.state.currentPath = this.fileSystem.getCurrentPath();
        return '';
      }
      
      if (path === '..') {
        const currentDir = this.fileSystem.getCurrentPath();
        const parentPath = currentDir === '/' ? '/' : currentDir.substring(0, currentDir.lastIndexOf('/')) || '/';
        this.fileSystem.setCurrentPath(parentPath);
        this.state.currentPath = this.fileSystem.getCurrentPath();
        return '';
      }

      // Resolve relative/absolute path
      let targetPath: string;
      if (path.startsWith('/')) {
        targetPath = path;
      } else {
        const currentDir = this.fileSystem.getCurrentPath();
        targetPath = currentDir === '/' ? `/${path}` : `${currentDir}/${path}`;
      }
      
      // Check if directory exists before changing
      if (await this.fileSystem.exists(targetPath)) {
        await this.fileSystem.listDirectory(targetPath); // Test if it's a directory
        this.fileSystem.setCurrentPath(targetPath);
        this.state.currentPath = this.fileSystem.getCurrentPath();
        return '';
      } else {
        return `ERROR: cd: ${path}: No such file or directory`;
      }
    } catch (error) {
      return `ERROR: cd: ${path}: No such file or directory`;
    }
  }

  private async handleLs(path?: string): Promise<string> {
    try {
      const items = await this.fileSystem.listDirectory(path || this.state.currentPath);
      return items.map(item => {
        const prefix = item.type === 'directory' ? 'd' : '-';
        const name = item.type === 'directory' ? `${item.name}/` : item.name;
        const size = item.size ? item.size.toString().padStart(8) : '       -';
        const date = item.lastModified?.toLocaleDateString() || 'unknown';
        return `${prefix}rwxr-xr-x 1 user user ${size} ${date} ${name}`;
      }).join('\n') || 'Directory is empty';
    } catch (error) {
      return `ERROR: ls: ${error}`;
    }
  }

  private async handlePython(args: string[]): Promise<string> {
    try {
      if (!this.state.engines.python) {
        await this.pythonEngine.initialize();
        this.state.engines.python = true;
      }

      if (args.length === 0) {
        // Start Python REPL
        const repl = await this.pythonEngine.startREPL();
        this.state.activeSession = { type: 'python', repl };
        const version = await this.pythonEngine.getVersion();
        return `Python ${version} (Pyodide) on WebAssembly\nType "exit" or "quit" to exit the REPL.`;
      } else if (args[0] === '-c') {
        // Execute Python code
        const code = args.slice(1).join(' ');
        const result = await this.pythonEngine.executeCode(code, this.state.currentPath);
        return (result.output || '') + (result.error ? `\nERROR: ${result.error}` : '');
      } else {
        // Execute Python file
        try {
          const filePath = args[0];
          const fileContent = await this.fileSystem.readFile(filePath);
          if (typeof fileContent === 'string') {
            const result = await this.pythonEngine.executeCode(fileContent, this.state.currentPath);
            return (result.output || '') + (result.error ? `\nERROR: ${result.error}` : '');
          } else {
            return `ERROR: ${filePath}: binary file or unreadable`;
          }
        } catch (error) {
          return `ERROR: python: ${error}`;
        }
      }
    } catch (error) {
      return `ERROR: Python error: ${error}`;
    }
  }

  private async handleNode(args: string[]): Promise<string> {
    try {
      if (!this.state.engines.node) {
        await this.nodeEngine.initialize();
        this.state.engines.node = true;
      }

      if (args.length === 0) {
        // Start Node REPL
        const repl = await this.nodeEngine.startREPL();
        if (repl) {
          this.state.activeSession = { type: 'node', repl };
          const version = await this.nodeEngine.getNodeVersion();
          return `Node.js ${version} (WebContainers)\nType "exit" or "quit" to exit the REPL.`;
        } else {
          return 'ERROR: Failed to start Node.js REPL';
        }
      } else if (args[0] === '--version') {
        const version = await this.nodeEngine.getNodeVersion();
        return `v${version}`;
      } else {
        // Execute Node.js file
        try {
          const content = await this.fileSystem.readFile(args[0]);
          if (typeof content === 'string') {
            const result = await this.nodeEngine.runScript(content, args[0]);
            return (result.output || '') + (result.error ? `\nERROR: ${result.error}` : '');
          }
          return `ERROR: ${args[0]}: binary file or unreadable`;
        } catch (error) {
          return `ERROR: node: ${error}`;
        }
      }
    } catch (error) {
      return `ERROR: Node error: ${error}`;
    }
  }

  private async handleNpm(args: string[]): Promise<string> {
    try {
      if (!this.state.engines.node) {
        await this.nodeEngine.initialize();
        this.state.engines.node = true;
      }

      const subcommand = args[0];
      
      switch (subcommand) {
        case 'install':
        case 'i':
          if (args[1]) {
            const isDev = args.includes('--save-dev') || args.includes('-D');
            const result = await this.nodeEngine.installPackage(args[1], isDev);
            return result;
          } else {
            const result = await this.nodeEngine.executeCommand('npm', ['install']);
            return (result.output || '') + (result.error ? `\nERROR: ${result.error}` : '');
          }

        case 'run':
          if (args[1]) {
            const result = await this.nodeEngine.runNpmScript(args[1]);
            return (result.output || '') + (result.error ? `\nERROR: ${result.error}` : '');
          } else {
            return 'ERROR: npm run: missing script name';
          }

        case '--version':
          const version = await this.nodeEngine.getNpmVersion();
          return version;

        default:
          const cmdResult = await this.nodeEngine.executeCommand('npm', args);
          return (cmdResult.output || '') + (cmdResult.error ? `\nERROR: ${cmdResult.error}` : '');
      }
    } catch (error) {
      return `ERROR: npm error: ${error}`;
    }
  }

  private async handleGit(args: string[]): Promise<string> {
    const subcommand = args[0];
    
    try {
      switch (subcommand) {
        case 'init':
          const result = await this.gitEngine.init(args[1]);
          return result;

        case 'status':
          const status = await this.gitEngine.status();
          return status;

        case 'add':
          if (args[1]) {
            const result = await this.gitEngine.add(args.slice(1));
            return result;
          } else {
            return 'ERROR: git add: missing file specification';
          }

        case 'commit':
          if (args.includes('-m') && args[args.indexOf('-m') + 1]) {
            const messageIndex = args.indexOf('-m') + 1;
            const message = args.slice(messageIndex).join(' ');
            const result = await this.gitEngine.commit(message, { all: args.includes('-a') });
            return result;
          } else {
            return 'ERROR: git commit: missing commit message (-m)';
          }

        default:
          return `ERROR: git: '${subcommand}' is not a git command. See 'git help'`;
      }
    } catch (error) {
      return `ERROR: git error: ${error}`;
    }
  }

  private async handleAICommand(args: string[]): Promise<string> {
    if (args.length === 0) {
      // Start AI session
      const currentProvider = this.aiService.getCurrentProvider();
      if (!currentProvider) {
        return 'ERROR: No AI provider configured. Use "ai add-key <provider> <api-key>" to set up providers.';
      }
      
      this.state.activeSession = { type: 'ai', repl: null };
      return `🤖 AI session started with ${currentProvider.name} (${currentProvider.model})\nAI Agent has access to file system, code execution, and terminal commands.\nType your message or "exit" to quit.`;
    } else {
      // Direct AI message
      const message = args.join(' ');
      return await this.handleAIMessage(message);
    }
  }

  private async parseAndExecuteAITools(aiResponse: string): Promise<Array<{filename?: string; type?: string; language?: string; result: string; error?: string}>> {
    const pythonFileRegex = /```python:([^\s]+)\s*\n(.*?)```/gs;
    const jsFileRegex = /```(?:javascript|js):([^\s]+)\s*\n(.*?)```/gs;
    const pythonCodeRegex = /```python\s*\n(.*?)```/gs;
    const jsCodeRegex = /```(?:javascript|js)\s*\n(.*?)```/gs;
    const executeCodeRegex = /executeCode\(code=['"`](.*?)['"`],\s*language=['"`](.*?)['"`]\)/gs;
    const editFileRegex = /editFile\(['"`]([^'"`]+)['"`],\s*['"`](.*?)['"`]\)/gs;
    
    const executionResults: Array<{filename?: string; type?: string; language?: string; result: string; error?: string}> = [];
    let match;
    
    // Handle Python files (code with filename)
    while ((match = pythonFileRegex.exec(aiResponse)) !== null) {
      const filename = match[1];
      const code = match[2];
      
      try {
        await this.tools.editFile(filename, code);
        
        if (filename.endsWith('.py')) {
          const result = await this.tools.executeCode(code, 'python');
          executionResults.push({ filename, result });
        } else {
          executionResults.push({ filename, result: 'File created successfully' });
        }
      } catch (error) {
        executionResults.push({ filename, result: '', error: String(error) });
      }
    }
    
    // Handle JavaScript files (code with filename)
    while ((match = jsFileRegex.exec(aiResponse)) !== null) {
      const filename = match[1];
      const code = match[2];
      
      try {
        await this.tools.editFile(filename, code);
        
        if (filename.endsWith('.js')) {
          const result = await this.tools.executeCode(code, 'javascript');
          executionResults.push({ filename, result });
        } else {
          executionResults.push({ filename, result: 'File created successfully' });
        }
      } catch (error) {
        executionResults.push({ filename, result: '', error: String(error) });
      }
    }
    
    // Handle explicit editFile calls
    while ((match = editFileRegex.exec(aiResponse)) !== null) {
      const filename = match[1];
      const content = match[2].replace(/\\n/g, '\n').replace(/\\'/g, "'");
      
      try {
        await this.tools.editFile(filename, content);
        executionResults.push({ filename, result: 'File saved successfully' });
      } catch (error) {
        executionResults.push({ filename, result: '', error: String(error) });
      }
    }
    
    // Handle Python code blocks (execute only, don't save)
    pythonCodeRegex.lastIndex = 0;
    while ((match = pythonCodeRegex.exec(aiResponse)) !== null) {
      const code = match[1];
      
      // Check if code starts with a filename comment (e.g., # filename.py)
      const filenameMatch = code.match(/^#\s*([a-zA-Z0-9_-]+\.py)/);
      
      if (filenameMatch && code.trim().length > 20) {
        // This looks like a file that should be saved
        const filename = filenameMatch[1];
        try {
          await this.tools.editFile(filename, code);
          const result = await this.tools.executeCode(code, 'python');
          executionResults.push({ filename, result });
        } catch (error) {
          executionResults.push({ filename, result: '', error: String(error) });
        }
      } else if (code.trim().length > 10 && (!pythonFileRegex.test(aiResponse) || !aiResponse.includes(code))) {
        // Regular code execution
        try {
          const result = await this.tools.executeCode(code, 'python');
          executionResults.push({ type: 'execution', result });
        } catch (error) {
          executionResults.push({ type: 'execution', result: '', error: String(error) });
        }
      }
    }
    
    // Handle executeCode calls
    while ((match = executeCodeRegex.exec(aiResponse)) !== null) {
      const code = match[1].replace(/\\n/g, '\n').replace(/\\'/g, "'");
      const language = match[2];
      
      try {
        const result = await this.tools.executeCode(code, language);
        executionResults.push({ type: 'tool_call', language, result });
      } catch (error) {
        executionResults.push({ type: 'tool_call', language, result: '', error: String(error) });
      }
    }
    
    return executionResults;
  }

  private async handleAIMessage(message: string): Promise<string> {
    try {
      const currentProvider = this.aiService.getCurrentProvider();
      if (!currentProvider) {
        return 'ERROR: No AI provider configured';
      }

      // Add context about current directory and recent files
      const currentFiles = await this.tools.listFiles(this.state.currentPath);
      const contextMessage = `${message}\n\nContext:\n- Current directory: ${this.state.currentPath}\n- Files: ${currentFiles.slice(0, 10).join(', ')}${currentFiles.length > 10 ? '...' : ''}`;
      
      const response = await this.aiService.sendMessage([{ role: 'user', content: contextMessage }]);
      
      // Parse and execute AI tools
      const executionResults = await this.parseAndExecuteAITools(response.content);
      
      // Build result string
      let result = `🤖 ${currentProvider.name}:\n\n${response.content}`;
      
      if (executionResults.length > 0) {
        result += '\n\n--- EXECUTION RESULTS ---\n';
        executionResults.forEach((execResult, index) => {
          if (execResult.filename) {
            if (execResult.error) {
              result += `❌ File ${execResult.filename}: ${execResult.error}\n`;
            } else {
              result += `✅ File ${execResult.filename} created and executed\n`;
              if (execResult.result) result += `Output: ${execResult.result}\n`;
            }
          } else {
            if (execResult.error) {
              result += `❌ Execution ${index + 1}: ${execResult.error}\n`;
            } else {
              result += `✅ Execution ${index + 1}: ${execResult.result}\n`;
            }
          }
        });
      }
      
      result += `\n💰 Cost: $${response.usage.cost.toFixed(6)} (${response.usage.input_tokens} in, ${response.usage.output_tokens} out)`;
      
      return result;
    } catch (error) {
      return `ERROR: AI Error: ${error}`;
    }
  }

  private getHelpText(): string {
    return `
🚀 Entropy Real Terminal - Professional Grade Terminal

📁 FILE SYSTEM:
  ls, dir          - List directory contents
  cd <path>        - Change directory  
  pwd              - Print working directory
  mkdir <name>     - Create directory
  touch <file>     - Create empty file
  cat <file>       - Display file contents
  rm <file>        - Remove file
  echo <text>      - Print text

🐍 PYTHON (Pyodide):
  python           - Start Python REPL
  python <file>    - Execute Python file
  python -c <code> - Execute Python code

📦 NODE.JS (WebContainers):
  node             - Start Node.js REPL
  node <file>      - Execute JavaScript file
  npm install <pkg> - Install npm package
  npm run <script> - Run npm script

🔧 GIT:
  git init         - Initialize repository
  git status       - Show status
  git add <files>  - Stage files
  git commit -m "msg" - Commit changes

🤖 AI INTEGRATION:
  ai               - Start AI chat session
  ai <message>     - Send message to AI

🛠️ SYSTEM:
  help             - Show this help
  engines          - Show engine status
  clear            - Clear terminal
  history          - Show command history
  date             - Current date/time
  whoami           - Current user
  uname            - System information
`;
  }

  private getEngineStatus(): string {
    return `
🔧 Engine Status:

📁 File System (OPFS): ${this.state.engines.filesystem ? '✅ Ready' : '❌ Not initialized'}
🐍 Python (Pyodide): ${this.state.engines.python ? '✅ Ready' : '⏳ Initialize with: python'}
📦 Node.js (WebContainers): ${this.state.engines.node ? '✅ Ready' : '⏳ Initialize with: node'}
🔧 Git (isomorphic-git): ${this.state.engines.git ? '✅ Ready' : '❌ Not initialized'}
🤖 AI Providers: ${this.state.engines.ai ? '✅ Ready' : '⏳ Configure with: ai add-key'}

💾 Storage: Browser OPFS (Origin Private File System)
🌐 Network: Git clone/push/pull, npm packages, AI APIs
⚡ Performance: WebAssembly + native browser APIs
`;
  }

  getState(): TerminalState {
    return { ...this.state };
  }
} 