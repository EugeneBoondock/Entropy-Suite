// Node.js Engine using WebContainers
import { WebContainer } from '@webcontainer/api';

export class NodeEngine {
  private webcontainer: WebContainer | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = this.doInitialize();
    return this.initializationPromise;
  }

  private async doInitialize(): Promise<void> {
    try {
      // Check if we're in a secure context (required for WebContainers)
      if (!window.isSecureContext) {
        throw new Error('WebContainers require a secure context (HTTPS)');
      }

      this.webcontainer = await WebContainer.boot();
      
      // Create basic project structure
      await this.webcontainer.mount({
        'package.json': {
          file: {
            contents: JSON.stringify({
              name: 'entropy-workspace',
              type: 'module',
              dependencies: {},
              devDependencies: {}
            }, null, 2)
          }
        },
        'README.md': {
          file: {
            contents: '# Entropy Terminal Workspace\n\nWelcome to your browser-based Node.js environment!'
          }
        }
      });

      this.isInitialized = true;
      console.log('✅ Node.js engine initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Node.js engine:', error);
      throw new Error(`Node.js initialization failed: ${error}`);
    }
  }

  async executeCommand(command: string, args: string[] = [], options: {
    cwd?: string;
    env?: Record<string, string>;
  } = {}): Promise<{ output: string; error?: string; exitCode: number }> {
    await this.initialize();

    if (!this.webcontainer) {
      throw new Error('WebContainer not initialized');
    }

    try {
                    const spawnedProcess = await this.webcontainer.spawn(command, args, {
         cwd: options.cwd || '/',
         env: options.env || {}
       });

       let output = '';
       let error = '';

       // Capture stdout
       spawnedProcess.output.pipeTo(new WritableStream({
         write(data) {
           output += data;
         }
       }));

       // Wait for process to complete
       const exitCode = await spawnedProcess.exit;

      return {
        output: output.trim(),
        error: error.trim() || undefined,
        exitCode
      };

    } catch (err: any) {
      return {
        output: '',
        error: `Command failed: ${err.message}`,
        exitCode: 1
      };
    }
  }

  async runScript(scriptContent: string, filename: string = 'script.js'): Promise<{ output: string; error?: string }> {
    await this.initialize();

    if (!this.webcontainer) {
      throw new Error('WebContainer not initialized');
    }

    try {
      // Write script to file
      await this.webcontainer.fs.writeFile(filename, scriptContent);

      // Execute the script
      const result = await this.executeCommand('node', [filename]);
      
      return {
        output: result.output,
        error: result.error
      };

    } catch (error: any) {
      return {
        output: '',
        error: `Script execution failed: ${error.message}`
      };
    }
  }

  async installPackage(packageName: string, isDev: boolean = false): Promise<string> {
    await this.initialize();

    if (!this.webcontainer) {
      throw new Error('WebContainer not initialized');
    }

    try {
      const args = ['install', packageName];
      if (isDev) args.push('--save-dev');

      const result = await this.executeCommand('npm', args);
      
      if (result.exitCode === 0) {
        return `✅ Successfully installed ${packageName}`;
      } else {
        return `❌ Failed to install ${packageName}: ${result.error}`;
      }

    } catch (error: any) {
      return `❌ Installation failed: ${error.message}`;
    }
  }

  async runNpmScript(scriptName: string): Promise<{ output: string; error?: string }> {
    await this.initialize();

    if (!this.webcontainer) {
      throw new Error('WebContainer not initialized');
    }

    try {
      const result = await this.executeCommand('npm', ['run', scriptName]);
      
      return {
        output: result.output,
        error: result.error
      };

    } catch (error: any) {
      return {
        output: '',
        error: `Script execution failed: ${error.message}`
      };
    }
  }

  async createPackageJson(config: {
    name?: string;
    version?: string;
    description?: string;
    main?: string;
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  } = {}): Promise<string> {
    await this.initialize();

    if (!this.webcontainer) {
      throw new Error('WebContainer not initialized');
    }

    const packageJson = {
      name: config.name || 'my-project',
      version: config.version || '1.0.0',
      description: config.description || '',
      main: config.main || 'index.js',
      type: 'module',
      scripts: {
        start: 'node index.js',
        dev: 'node --watch index.js',
        test: 'echo "Error: no test specified" && exit 1',
        ...config.scripts
      },
      dependencies: config.dependencies || {},
      devDependencies: config.devDependencies || {}
    };

    try {
      await this.webcontainer.fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
      return '✅ Created package.json successfully';
    } catch (error: any) {
      return `❌ Failed to create package.json: ${error.message}`;
    }
  }

  async getNodeVersion(): Promise<string> {
    await this.initialize();

    try {
      const result = await this.executeCommand('node', ['--version']);
      return result.output.replace(/^v/, '');
    } catch (error: any) {
      return `Error getting Node.js version: ${error.message}`;
    }
  }

  async getNpmVersion(): Promise<string> {
    await this.initialize();

    try {
      const result = await this.executeCommand('npm', ['--version']);
      return result.output;
    } catch (error: any) {
      return `Error getting npm version: ${error.message}`;
    }
  }

  async listInstalledPackages(): Promise<{ output: string; error?: string }> {
    await this.initialize();

    try {
      const result = await this.executeCommand('npm', ['list', '--depth=0']);
      return {
        output: result.output,
        error: result.error
      };
    } catch (error: any) {
      return {
        output: '',
        error: `Failed to list packages: ${error.message}`
      };
    }
  }

  async createFile(path: string, content: string): Promise<string> {
    await this.initialize();

    if (!this.webcontainer) {
      throw new Error('WebContainer not initialized');
    }

    try {
      await this.webcontainer.fs.writeFile(path, content);
      return `✅ Created file: ${path}`;
    } catch (error: any) {
      return `❌ Failed to create file: ${error.message}`;
    }
  }

  async readFile(path: string): Promise<{ content?: string; error?: string }> {
    await this.initialize();

    if (!this.webcontainer) {
      throw new Error('WebContainer not initialized');
    }

    try {
      const content = await this.webcontainer.fs.readFile(path, 'utf-8');
      return { content };
    } catch (error: any) {
      return { error: `Failed to read file: ${error.message}` };
    }
  }

  async deleteFile(path: string): Promise<string> {
    await this.initialize();

    if (!this.webcontainer) {
      throw new Error('WebContainer not initialized');
    }

    try {
      await this.webcontainer.fs.rm(path);
      return `✅ Deleted file: ${path}`;
    } catch (error: any) {
      return `❌ Failed to delete file: ${error.message}`;
    }
  }

  async listDirectory(path: string = '/'): Promise<{ items: string[]; error?: string }> {
    await this.initialize();

    if (!this.webcontainer) {
      throw new Error('WebContainer not initialized');
    }

    try {
      const items = await this.webcontainer.fs.readdir(path);
      return { items };
    } catch (error: any) {
      return { items: [], error: `Failed to list directory: ${error.message}` };
    }
  }

  async createDirectory(path: string): Promise<string> {
    await this.initialize();

    if (!this.webcontainer) {
      throw new Error('WebContainer not initialized');
    }

    try {
      await this.webcontainer.fs.mkdir(path, { recursive: true });
      return `✅ Created directory: ${path}`;
    } catch (error: any) {
      return `❌ Failed to create directory: ${error.message}`;
    }
  }

  async startDevServer(port: number = 3000, command: string = 'npm run dev'): Promise<{ 
    url?: string; 
    error?: string;
    process?: any;
  }> {
    await this.initialize();

    if (!this.webcontainer) {
      throw new Error('WebContainer not initialized');
    }

    try {
      // Check if package.json has dev script
      const packageJson = await this.readFile('package.json');
      if (packageJson.error) {
        return { error: 'No package.json found' };
      }

      const [cmd, ...args] = command.split(' ');
      const process = await this.webcontainer.spawn(cmd, args);

      // Wait for server to be ready
      this.webcontainer.on('server-ready', (port, url) => {
        console.log(`✅ Dev server ready at ${url}`);
      });

      return {
        url: `http://localhost:${port}`,
        process
      };

    } catch (error: any) {
      return { error: `Failed to start dev server: ${error.message}` };
    }
  }

  async buildProject(buildCommand: string = 'npm run build'): Promise<{ output: string; error?: string }> {
    await this.initialize();

    try {
      const [cmd, ...args] = buildCommand.split(' ');
      const result = await this.executeCommand(cmd, args);
      
      return {
        output: result.output,
        error: result.error
      };

    } catch (error: any) {
      return {
        output: '',
        error: `Build failed: ${error.message}`
      };
    }
  }

  async runTests(testCommand: string = 'npm test'): Promise<{ output: string; error?: string }> {
    await this.initialize();

    try {
      const [cmd, ...args] = testCommand.split(' ');
      const result = await this.executeCommand(cmd, args);
      
      return {
        output: result.output,
        error: result.error
      };

    } catch (error: any) {
      return {
        output: '',
        error: `Tests failed: ${error.message}`
      };
    }
  }

  // Interactive REPL
  async startREPL(): Promise<NodeREPL | null> {
    await this.initialize();

    if (!this.webcontainer) {
      return null;
    }

    try {
      const process = await this.webcontainer.spawn('node', ['-i']);
      return new NodeREPL(process);
    } catch (error) {
      console.error('Failed to start Node.js REPL:', error);
      return null;
    }
  }

  getWebContainer(): WebContainer | null {
    return this.webcontainer;
  }
}

export class NodeREPL {
  private process: any;
  private inputStream: WritableStream;

  constructor(process: any) {
    this.process = process;
    this.inputStream = new WritableStream({
      write: (chunk) => {
        this.process.input.write(chunk);
      }
    });
  }

  async execute(code: string): Promise<{ output: string; error?: string }> {
    try {
      // Write code to REPL
      const writer = this.inputStream.getWriter();
      await writer.write(code + '\n');
      writer.releaseLock();

      // Wait for output (simplified - in real implementation you'd need proper output parsing)
      return new Promise((resolve) => {
        let output = '';
        let error = '';

        const timeout = setTimeout(() => {
          resolve({
            output: output.trim(),
            error: error.trim() || undefined
          });
        }, 1000);

        // This is a simplified approach - real implementation would need proper stream handling
        this.process.output.pipeTo(new WritableStream({
          write(data) {
            output += data;
            if (output.includes('> ')) {
              clearTimeout(timeout);
              resolve({
                output: output.trim(),
                error: error.trim() || undefined
              });
            }
          }
        }));
      });

    } catch (err: any) {
      return {
        output: '',
        error: `REPL error: ${err.message}`
      };
    }
  }

  async close(): Promise<void> {
    try {
      this.process.kill();
    } catch (error) {
      console.error('Error closing REPL:', error);
    }
  }
} 