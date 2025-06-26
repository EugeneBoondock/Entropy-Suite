// Python Engine using Pyodide WebAssembly
export class PythonEngine {
  private pyodide: any = null;
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
      // Load Pyodide dynamically
      const pyodideModule = await import('pyodide');
      this.pyodide = await pyodideModule.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/',
        stdout: (text: string) => console.log('Python:', text),
        stderr: (text: string) => console.error('Python Error:', text),
      });

      // Install common packages
      await this.pyodide.loadPackage(['numpy', 'pandas', 'matplotlib', 'requests']);
      
      // Set up file system integration
      this.pyodide.runPython(`
import sys
import os
from pathlib import Path

# Custom print function that captures output
import io
import contextlib

class OutputCapture:
    def __init__(self):
        self.stdout = io.StringIO()
        self.stderr = io.StringIO()
    
    def get_output(self):
        return {
            'stdout': self.stdout.getvalue(),
            'stderr': self.stderr.getvalue()
        }
    
    def clear(self):
        self.stdout = io.StringIO()
        self.stderr = io.StringIO()

output_capture = OutputCapture()
      `);

      this.isInitialized = true;
      console.log('✅ Python engine initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Python engine:', error);
      throw new Error(`Python initialization failed: ${error}`);
    }
  }

  async executeCode(code: string, workingDir: string = '/'): Promise<{ output: string; error?: string }> {
    await this.initialize();

    try {
      // Set working directory
      this.pyodide.runPython(`
import os
os.chdir('${workingDir}')
output_capture.clear()
      `);

      // Capture output
      const result = this.pyodide.runPython(`
import sys
import contextlib

with contextlib.redirect_stdout(output_capture.stdout), \\
     contextlib.redirect_stderr(output_capture.stderr):
    try:
        ${this.wrapCodeForExecution(code)}
    except Exception as e:
        import traceback
        print(f"Error: {e}", file=sys.stderr)
        traceback.print_exc()

output_capture.get_output()
      `);

      const output = result.toJs();
      
      if (output.stderr) {
        return {
          output: output.stdout || '',
          error: output.stderr
        };
      }

      return {
        output: output.stdout || 'Code executed successfully'
      };

    } catch (error) {
      return {
        output: '',
        error: `Python execution error: ${error}`
      };
    }
  }

  private wrapCodeForExecution(code: string): string {
    // Handle special cases and imports
    const lines = code.split('\n');
    const wrappedLines: string[] = [];

    let inMainBlock = false;
    
    for (let line of lines) {
      const trimmed = line.trim();
      
      // Handle if __name__ == "__main__" blocks
      if (trimmed === 'if __name__ == "__main__":') {
        inMainBlock = true;
        continue;
      }
      
      if (inMainBlock && line.startsWith('    ')) {
        // Remove indentation from main block
        wrappedLines.push(line.substring(4));
      } else if (inMainBlock && !line.startsWith('    ') && trimmed !== '') {
        inMainBlock = false;
        wrappedLines.push(line);
      } else if (!inMainBlock) {
        wrappedLines.push(line);
      }
    }

    return wrappedLines.join('\n');
  }

  async installPackage(packageName: string): Promise<string> {
    await this.initialize();

    try {
      await this.pyodide.loadPackage([packageName]);
      return `✅ Successfully installed ${packageName}`;
    } catch (error) {
      // Try micropip for pure Python packages
      try {
        await this.pyodide.runPython(`
import micropip
await micropip.install('${packageName}')
        `);
        return `✅ Successfully installed ${packageName} via micropip`;
      } catch (micropipError) {
        return `❌ Failed to install ${packageName}: ${error}`;
      }
    }
  }

  async listPackages(): Promise<string[]> {
    await this.initialize();

    try {
      const result = this.pyodide.runPython(`
import pkg_resources
[pkg.project_name for pkg in pkg_resources.working_set]
      `);
      return result.toJs();
    } catch (error) {
      console.error('Failed to list packages:', error);
      return [];
    }
  }

  async createVirtualEnv(name: string): Promise<string> {
    // Pyodide doesn't support traditional virtual environments
    // but we can simulate package isolation
    return `✅ Virtual environment concept simulated for ${name}`;
  }

  async runScript(scriptPath: string, args: string[] = []): Promise<{ output: string; error?: string }> {
    await this.initialize();

    try {
      // Set up sys.argv
      const argsString = args.map(arg => `"${arg}"`).join(', ');
      this.pyodide.runPython(`
import sys
sys.argv = ["${scriptPath}", ${argsString}]
output_capture.clear()
      `);

      // Read and execute the script
      const result = this.pyodide.runPython(`
import contextlib
import sys

try:
    with open('${scriptPath}', 'r') as f:
        script_content = f.read()
    
    with contextlib.redirect_stdout(output_capture.stdout), \\
         contextlib.redirect_stderr(output_capture.stderr):
        exec(script_content)
        
except FileNotFoundError:
    print(f"Error: Script '{scriptPath}' not found", file=sys.stderr)
except Exception as e:
    import traceback
    print(f"Error: {e}", file=sys.stderr)
    traceback.print_exc()

output_capture.get_output()
      `);

      const output = result.toJs();
      
      if (output.stderr) {
        return {
          output: output.stdout || '',
          error: output.stderr
        };
      }

      return {
        output: output.stdout || 'Script executed successfully'
      };

    } catch (error) {
      return {
        output: '',
        error: `Failed to run script: ${error}`
      };
    }
  }

  async getVersion(): Promise<string> {
    await this.initialize();
    
    try {
      const version = this.pyodide.runPython('import sys; sys.version');
      return version;
    } catch (error) {
      return `Error getting Python version: ${error}`;
    }
  }

  async saveToFile(filename: string, content: string): Promise<void> {
    await this.initialize();
    
    this.pyodide.FS.writeFile(filename, content);
  }

  async loadFromFile(filename: string): Promise<string> {
    await this.initialize();
    
    try {
      return this.pyodide.FS.readFile(filename, { encoding: 'utf8' });
    } catch (error) {
      throw new Error(`File not found: ${filename}`);
    }
  }

  // Interactive Python REPL
  async startREPL(): Promise<PythonREPL> {
    await this.initialize();
    return new PythonREPL(this.pyodide);
  }
}

export class PythonREPL {
  private pyodide: any;
  private replGlobals: any;

  constructor(pyodide: any) {
    this.pyodide = pyodide;
    this.replGlobals = this.pyodide.globals.get('dict')();
  }

  async execute(code: string): Promise<{ output: string; error?: string }> {
    try {
      this.pyodide.runPython(`
output_capture.clear()
      `);

      const result = this.pyodide.runPython(`
import sys
import contextlib

with contextlib.redirect_stdout(output_capture.stdout), \\
     contextlib.redirect_stderr(output_capture.stderr):
    try:
        result = eval(compile('${this.escapeCode(code)}', '<stdin>', 'single'), globals())
        if result is not None:
            print(repr(result))
    except SyntaxError:
        # Try as exec instead of eval
        try:
            exec(compile('${this.escapeCode(code)}', '<stdin>', 'exec'), globals())
        except Exception as e:
            import traceback
            print(f"Error: {e}", file=sys.stderr)
            traceback.print_exc()
    except Exception as e:
        import traceback
        print(f"Error: {e}", file=sys.stderr)
        traceback.print_exc()

output_capture.get_output()
      `);

      const output = result.toJs();
      
      if (output.stderr) {
        return {
          output: output.stdout || '',
          error: output.stderr
        };
      }

      return {
        output: output.stdout || ''
      };

    } catch (error) {
      return {
        output: '',
        error: `REPL error: ${error}`
      };
    }
  }

  private escapeCode(code: string): string {
    return code.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
  }

  getGlobals(): any {
    return this.replGlobals;
  }

  reset(): void {
    this.replGlobals = this.pyodide.globals.get('dict')();
  }
} 