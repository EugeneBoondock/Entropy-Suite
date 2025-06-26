// Git Engine using isomorphic-git for real Git operations
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import { RealFileSystem } from './fileSystem';

export class GitEngine {
  private fs: RealFileSystem;
  private gitConfig = {
    author: {
      name: 'Entropy User',
      email: 'user@entropy.tools'
    }
  };

  constructor(fileSystem: RealFileSystem) {
    this.fs = fileSystem;
  }

  async clone(url: string, dir: string, options: { 
    depth?: number;
    singleBranch?: boolean;
    branch?: string;
    username?: string;
    password?: string;
  } = {}): Promise<string> {
    try {
      const fullPath = this.fs.getCurrentPath() + '/' + dir;
      
      // Create directory if it doesn't exist
      await this.fs.createDirectory(fullPath);
      
      const cloneOptions: any = {
        fs: this.createFSAdapter(),
        http,
        dir: fullPath,
        url,
        ref: options.branch || 'main',
        singleBranch: options.singleBranch !== false,
        depth: options.depth || 1,
        onProgress: (event: any) => {
          console.log(`Clone progress: ${event.phase} ${event.loaded}/${event.total}`);
        }
      };

      if (options.username && options.password) {
        cloneOptions.onAuth = () => ({
          username: options.username,
          password: options.password
        });
      }

      await git.clone(cloneOptions);
      
      return `✅ Successfully cloned ${url} to ${dir}`;
    } catch (error: any) {
      console.error('Git clone error:', error);
      return `❌ Clone failed: ${error.message}`;
    }
  }

  async init(dir: string = '.'): Promise<string> {
    try {
      const fullPath = dir === '.' ? this.fs.getCurrentPath() : this.fs.getCurrentPath() + '/' + dir;
      
      await git.init({
        fs: this.createFSAdapter(),
        dir: fullPath,
        defaultBranch: 'main'
      });
      
      return `✅ Initialized empty Git repository in ${fullPath}`;
    } catch (error: any) {
      return `❌ Git init failed: ${error.message}`;
    }
  }

  async add(files: string | string[]): Promise<string> {
    try {
      const fileList = Array.isArray(files) ? files : [files];
      const dir = this.fs.getCurrentPath();
      
      for (const file of fileList) {
        if (file === '.') {
          // Add all files
          const allFiles = await this.getAllFiles(dir);
          for (const filepath of allFiles) {
            await git.add({
              fs: this.createFSAdapter(),
              dir,
              filepath: filepath.replace(dir + '/', '')
            });
          }
        } else {
          await git.add({
            fs: this.createFSAdapter(),
            dir,
            filepath: file
          });
        }
      }
      
      return `✅ Added ${fileList.join(', ')} to staging area`;
    } catch (error: any) {
      return `❌ Git add failed: ${error.message}`;
    }
  }

  async commit(message: string, options: { 
    author?: { name: string; email: string };
    all?: boolean;
  } = {}): Promise<string> {
    try {
      const dir = this.fs.getCurrentPath();
      
      if (options.all) {
        await this.add('.');
      }
      
      const sha = await git.commit({
        fs: this.createFSAdapter(),
        dir,
        message,
        author: options.author || this.gitConfig.author
      });
      
      return `✅ Committed changes: ${sha.substring(0, 7)} "${message}"`;
    } catch (error: any) {
      return `❌ Git commit failed: ${error.message}`;
    }
  }

  async status(): Promise<string> {
    try {
      const dir = this.fs.getCurrentPath();
      
      const status = await git.statusMatrix({
        fs: this.createFSAdapter(),
        dir
      });
      
      const results: string[] = [];
      
      for (const [filepath, headStatus, workdirStatus, stageStatus] of status) {
        if (headStatus === 1 && workdirStatus === 1 && stageStatus === 1) {
          // No changes
          continue;
        } else if (headStatus === 0 && workdirStatus === 2 && stageStatus === 0) {
          results.push(`?? ${filepath} (untracked)`);
        } else if (headStatus === 1 && workdirStatus === 2 && stageStatus === 1) {
          results.push(` M ${filepath} (modified)`);
        } else if (headStatus === 1 && workdirStatus === 2 && stageStatus === 2) {
          results.push(`M  ${filepath} (staged)`);
        } else if (headStatus === 1 && workdirStatus === 0 && stageStatus === 0) {
          results.push(` D ${filepath} (deleted)`);
        } else if (headStatus === 0 && workdirStatus === 2 && stageStatus === 2) {
          results.push(`A  ${filepath} (new file)`);
        }
      }
      
      if (results.length === 0) {
        return 'On branch main\nnothing to commit, working tree clean';
      }
      
      return `On branch main\nChanges:\n${results.join('\n')}`;
    } catch (error: any) {
      return `❌ Git status failed: ${error.message}`;
    }
  }

  async log(options: { oneline?: boolean; max?: number } = {}): Promise<string> {
    try {
      const dir = this.fs.getCurrentPath();
      
      const commits = await git.log({
        fs: this.createFSAdapter(),
        dir,
        depth: options.max || 10
      });
      
      if (options.oneline) {
        return commits
          .map(commit => `${commit.oid.substring(0, 7)} ${commit.commit.message}`)
          .join('\n');
      }
      
      return commits
        .map(commit => 
          `commit ${commit.oid}\n` +
          `Author: ${commit.commit.author.name} <${commit.commit.author.email}>\n` +
          `Date: ${new Date(commit.commit.author.timestamp * 1000).toISOString()}\n\n` +
          `    ${commit.commit.message}\n`
        )
        .join('\n');
    } catch (error: any) {
      return `❌ Git log failed: ${error.message}`;
    }
  }

  async branch(branchName?: string, options: { list?: boolean; delete?: string } = {}): Promise<string> {
    try {
      const dir = this.fs.getCurrentPath();
      
      if (options.list || !branchName) {
        const branches = await git.listBranches({
          fs: this.createFSAdapter(),
          dir
        });
        
        const currentBranch = await git.currentBranch({
          fs: this.createFSAdapter(),
          dir,
          fullname: false
        });
        
        return branches
          .map(branch => branch === currentBranch ? `* ${branch}` : `  ${branch}`)
          .join('\n');
      }
      
      if (options.delete) {
        await git.deleteBranch({
          fs: this.createFSAdapter(),
          dir,
          ref: options.delete
        });
        return `✅ Deleted branch ${options.delete}`;
      }
      
      await git.branch({
        fs: this.createFSAdapter(),
        dir,
        ref: branchName
      });
      
      return `✅ Created branch ${branchName}`;
    } catch (error: any) {
      return `❌ Git branch failed: ${error.message}`;
    }
  }

  async checkout(ref: string, options: { create?: boolean } = {}): Promise<string> {
    try {
      const dir = this.fs.getCurrentPath();
      
      if (options.create) {
        await git.branch({
          fs: this.createFSAdapter(),
          dir,
          ref
        });
      }
      
      await git.checkout({
        fs: this.createFSAdapter(),
        dir,
        ref
      });
      
      return `✅ Switched to branch '${ref}'`;
    } catch (error: any) {
      return `❌ Git checkout failed: ${error.message}`;
    }
  }

  async pull(remote: string = 'origin', branch?: string): Promise<string> {
    try {
      const dir = this.fs.getCurrentPath();
      
      const currentBranch = branch || await git.currentBranch({
        fs: this.createFSAdapter(),
        dir,
        fullname: false
      }) || 'main';
      
      await git.pull({
        fs: this.createFSAdapter(),
        http,
        dir,
        ref: currentBranch,
        author: this.gitConfig.author
      });
      
      return `✅ Successfully pulled from ${remote}/${currentBranch}`;
    } catch (error: any) {
      return `❌ Git pull failed: ${error.message}`;
    }
  }

  async push(remote: string = 'origin', branch?: string, options: {
    username?: string;
    password?: string;
    force?: boolean;
  } = {}): Promise<string> {
    try {
      const dir = this.fs.getCurrentPath();
      
      const currentBranch = branch || await git.currentBranch({
        fs: this.createFSAdapter(),
        dir,
        fullname: false
      }) || 'main';
      
      const pushOptions: any = {
        fs: this.createFSAdapter(),
        http,
        dir,
        remote,
        ref: currentBranch,
        force: options.force || false
      };

      if (options.username && options.password) {
        pushOptions.onAuth = () => ({
          username: options.username,
          password: options.password
        });
      }
      
      await git.push(pushOptions);
      
      return `✅ Successfully pushed to ${remote}/${currentBranch}`;
    } catch (error: any) {
      return `❌ Git push failed: ${error.message}`;
    }
  }

  async remote(action?: 'add' | 'remove' | 'show', name?: string, url?: string): Promise<string> {
    try {
      const dir = this.fs.getCurrentPath();
      
      if (action === 'add' && name && url) {
        await git.addRemote({
          fs: this.createFSAdapter(),
          dir,
          remote: name,
          url
        });
        return `✅ Added remote ${name}: ${url}`;
      }
      
      if (action === 'remove' && name) {
        await git.deleteRemote({
          fs: this.createFSAdapter(),
          dir,
          remote: name
        });
        return `✅ Removed remote ${name}`;
      }
      
      // List remotes
      const remotes = await git.listRemotes({
        fs: this.createFSAdapter(),
        dir
      });
      
      if (remotes.length === 0) {
        return 'No remotes configured';
      }
      
      return remotes.map(remote => `${remote.remote}\t${remote.url}`).join('\n');
    } catch (error: any) {
      return `❌ Git remote failed: ${error.message}`;
    }
  }

  async diff(filepath?: string): Promise<string> {
    try {
      const dir = this.fs.getCurrentPath();
      
      // This is a simplified diff - isomorphic-git doesn't have built-in diff
      // We'll implement a basic file comparison
      const status = await git.statusMatrix({
        fs: this.createFSAdapter(),
        dir
      });
      
      const changes: string[] = [];
      
      for (const [file, headStatus, workdirStatus, stageStatus] of status) {
        if (filepath && file !== filepath) continue;
        
        if (headStatus === 1 && workdirStatus === 2 && stageStatus === 1) {
          changes.push(`--- a/${file}`);
          changes.push(`+++ b/${file}`);
          changes.push('@ Modified file (detailed diff not available in browser) @');
        }
      }
      
      return changes.length > 0 ? changes.join('\n') : 'No changes found';
    } catch (error: any) {
      return `❌ Git diff failed: ${error.message}`;
    }
  }

  setConfig(name: string, email: string): void {
    this.gitConfig.author = { name, email };
  }

  getConfig(): { name: string; email: string } {
    return this.gitConfig.author;
  }

  private createFSAdapter() {
    // Create a filesystem adapter for isomorphic-git
    return {
      readFile: async (filepath: string) => {
        try {
          const content = await this.fs.readFile(filepath);
          if (typeof content === 'string') {
            return new TextEncoder().encode(content);
          }
          return content;
        } catch (error) {
          throw new Error(`ENOENT: no such file or directory, open '${filepath}'`);
        }
      },
      
      writeFile: async (filepath: string, data: Uint8Array) => {
        const content = new TextDecoder().decode(data);
        await this.fs.writeFile(filepath, content);
      },
      
      unlink: async (filepath: string) => {
        await this.fs.deleteFile(filepath);
      },
      
      readdir: async (filepath: string) => {
        const items = await this.fs.listDirectory(filepath);
        return items.map(item => item.name);
      },
      
      mkdir: async (filepath: string) => {
        await this.fs.createDirectory(filepath);
      },
      
      rmdir: async (filepath: string) => {
        await this.fs.deleteFile(filepath);
      },
      
      stat: async (filepath: string) => {
        try {
          const info = await this.fs.getFileInfo(filepath);
          return {
            isFile: () => info.type === 'file',
            isDirectory: () => info.type === 'directory',
            size: info.size || 0,
            mtime: info.lastModified || new Date()
          };
        } catch (error) {
          throw new Error(`ENOENT: no such file or directory, stat '${filepath}'`);
        }
      },
      
      lstat: async (filepath: string) => {
        return this.createFSAdapter().stat(filepath);
      }
    };
  }

  private async getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const items = await this.fs.listDirectory(dir);
    
    for (const item of items) {
      const fullPath = dir + '/' + item.name;
      if (item.type === 'file') {
        files.push(fullPath);
      } else if (item.type === 'directory' && item.name !== '.git') {
        const subFiles = await this.getAllFiles(fullPath);
        files.push(...subFiles);
      }
    }
    
    return files;
  }
} 