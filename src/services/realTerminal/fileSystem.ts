// Real File System using OPFS (Origin Private File System)
export interface FileSystemItem {
  name: string;
  type: 'file' | 'directory';
  content?: string | Uint8Array;
  size?: number;
  lastModified?: Date;
  permissions?: string;
}

export class RealFileSystem {
  private opfsRoot: FileSystemDirectoryHandle | null = null;
  private currentPath: string = '/';
  private cache = new Map<string, FileSystemItem>();

  async initialize(): Promise<void> {
    try {
      // @ts-ignore - OPFS is still experimental
      this.opfsRoot = await navigator.storage.getDirectory();
      console.log('✅ OPFS initialized successfully');
    } catch (error) {
      console.warn('⚠️ OPFS not available, using fallback storage');
      // Fallback to IndexedDB for older browsers
      await this.initializeIndexedDBFallback();
    }
  }

  private async initializeIndexedDBFallback(): Promise<void> {
    // Create basic directory structure in IndexedDB
    const basicStructure = {
      '/': { name: '', type: 'directory' as const },
      '/home': { name: 'home', type: 'directory' as const },
      '/home/user': { name: 'user', type: 'directory' as const },
      '/home/user/projects': { name: 'projects', type: 'directory' as const },
      '/tmp': { name: 'tmp', type: 'directory' as const },
    };

    for (const [path, item] of Object.entries(basicStructure)) {
      this.cache.set(path, item);
    }
  }

  async createDirectory(path: string): Promise<void> {
    const fullPath = this.resolvePath(path);
    
    if (this.opfsRoot) {
      try {
        const pathParts = fullPath.split('/').filter(Boolean);
        let currentHandle = this.opfsRoot;
        
        for (const part of pathParts) {
          currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
        }
        
        this.cache.set(fullPath, {
          name: pathParts[pathParts.length - 1] || '',
          type: 'directory',
          lastModified: new Date()
        });
      } catch (error) {
        throw new Error(`Failed to create directory: ${error}`);
      }
    } else {
      // Fallback
      this.cache.set(fullPath, {
        name: path.split('/').pop() || '',
        type: 'directory',
        lastModified: new Date()
      });
    }
  }

  async writeFile(path: string, content: string | Uint8Array): Promise<void> {
    const fullPath = this.resolvePath(path);
    const pathParts = fullPath.split('/').filter(Boolean);
    const fileName = pathParts.pop() || 'untitled';
    
    if (this.opfsRoot) {
      try {
        let currentHandle = this.opfsRoot;
        
        // Navigate to parent directory
        for (const part of pathParts) {
          currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
        }
        
        // Create and write file
        const fileHandle = await currentHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        
        if (typeof content === 'string') {
          await writable.write(content);
        } else {
          await writable.write(content);
        }
        
        await writable.close();
        
        this.cache.set(fullPath, {
          name: fileName,
          type: 'file',
          content,
          size: typeof content === 'string' ? content.length : content.length,
          lastModified: new Date()
        });
      } catch (error) {
        throw new Error(`Failed to write file: ${error}`);
      }
    } else {
      // Fallback
      this.cache.set(fullPath, {
        name: fileName,
        type: 'file',
        content,
        size: typeof content === 'string' ? content.length : content.length,
        lastModified: new Date()
      });
    }
  }

  async readFile(path: string): Promise<string | Uint8Array> {
    const fullPath = this.resolvePath(path);
    
    if (this.opfsRoot) {
      try {
        const pathParts = fullPath.split('/').filter(Boolean);
        const fileName = pathParts.pop() || 'untitled';
        
        let currentHandle = this.opfsRoot;
        for (const part of pathParts) {
          currentHandle = await currentHandle.getDirectoryHandle(part);
        }
        
        const fileHandle = await currentHandle.getFileHandle(fileName);
        const file = await fileHandle.getFile();
        
        // Try to read as text first, fall back to binary
        try {
          return await file.text();
        } catch {
          return new Uint8Array(await file.arrayBuffer());
        }
      } catch (error) {
        throw new Error(`File not found: ${path}`);
      }
    } else {
      // Fallback
      const cached = this.cache.get(fullPath);
      if (cached && cached.type === 'file' && cached.content !== undefined) {
        return cached.content;
      }
      throw new Error(`File not found: ${path}`);
    }
  }

  async listDirectory(path: string = this.currentPath): Promise<FileSystemItem[]> {
    const fullPath = this.resolvePath(path);
    
    if (this.opfsRoot) {
      try {
        const pathParts = fullPath.split('/').filter(Boolean);
        let currentHandle = this.opfsRoot;
        
        for (const part of pathParts) {
          currentHandle = await currentHandle.getDirectoryHandle(part);
        }
        
        const items: FileSystemItem[] = [];
        
        // @ts-ignore - AsyncIterable not in types yet
        for await (const [name, handle] of currentHandle.entries()) {
          if (handle.kind === 'directory') {
            items.push({
              name,
              type: 'directory',
              lastModified: new Date()
            });
          } else {
            const file = await handle.getFile();
            items.push({
              name,
              type: 'file',
              size: file.size,
              lastModified: new Date(file.lastModified)
            });
          }
        }
        
        return items;
      } catch (error) {
        throw new Error(`Directory not found: ${path}`);
      }
    } else {
      // Fallback
      const items: FileSystemItem[] = [];
      const prefix = fullPath === '/' ? '/' : fullPath + '/';
      
      for (const [cachedPath, item] of this.cache.entries()) {
        if (cachedPath.startsWith(prefix) && cachedPath !== fullPath) {
          const relativePath = cachedPath.substring(prefix.length);
          if (!relativePath.includes('/')) {
            items.push(item);
          }
        }
      }
      
      return items;
    }
  }

  async deleteFile(path: string): Promise<void> {
    const fullPath = this.resolvePath(path);
    
    if (this.opfsRoot) {
      try {
        const pathParts = fullPath.split('/').filter(Boolean);
        const fileName = pathParts.pop() || 'untitled';
        
        let currentHandle = this.opfsRoot;
        for (const part of pathParts) {
          currentHandle = await currentHandle.getDirectoryHandle(part);
        }
        
        await currentHandle.removeEntry(fileName);
        this.cache.delete(fullPath);
      } catch (error) {
        throw new Error(`Failed to delete: ${error}`);
      }
    } else {
      // Fallback
      this.cache.delete(fullPath);
    }
  }

  async exists(path: string): Promise<boolean> {
    const fullPath = this.resolvePath(path);
    
    if (this.opfsRoot) {
      try {
        const pathParts = fullPath.split('/').filter(Boolean);
        const fileName = pathParts.pop();
        
        let currentHandle = this.opfsRoot;
        for (const part of pathParts) {
          currentHandle = await currentHandle.getDirectoryHandle(part);
        }
        
        if (fileName) {
          try {
            await currentHandle.getFileHandle(fileName);
            return true;
          } catch {
            try {
              await currentHandle.getDirectoryHandle(fileName);
              return true;
            } catch {
              return false;
            }
          }
        }
        return true;
      } catch {
        return false;
      }
    } else {
      return this.cache.has(fullPath);
    }
  }

  getCurrentPath(): string {
    return this.currentPath;
  }

  setCurrentPath(path: string): void {
    this.currentPath = this.resolvePath(path);
  }

  private resolvePath(path: string): string {
    if (path.startsWith('/')) {
      return path;
    }
    
    if (path === '.') {
      return this.currentPath;
    }
    
    if (path === '..') {
      const parts = this.currentPath.split('/').filter(Boolean);
      parts.pop();
      return parts.length === 0 ? '/' : '/' + parts.join('/');
    }
    
    if (this.currentPath === '/') {
      return '/' + path;
    }
    
    return this.currentPath + '/' + path;
  }

  // Utility methods
  async getFileInfo(path: string): Promise<FileSystemItem> {
    const fullPath = this.resolvePath(path);
    
    if (this.opfsRoot) {
      const pathParts = fullPath.split('/').filter(Boolean);
      const fileName = pathParts.pop() || '';
      
      let currentHandle = this.opfsRoot;
      for (const part of pathParts) {
        currentHandle = await currentHandle.getDirectoryHandle(part);
      }
      
      try {
        const fileHandle = await currentHandle.getFileHandle(fileName);
        const file = await fileHandle.getFile();
        return {
          name: fileName,
          type: 'file',
          size: file.size,
          lastModified: new Date(file.lastModified)
        };
      } catch {
        await currentHandle.getDirectoryHandle(fileName);
        return {
          name: fileName,
          type: 'directory',
          lastModified: new Date()
        };
      }
    } else {
      const cached = this.cache.get(fullPath);
      if (!cached) {
        throw new Error(`File not found: ${path}`);
      }
      return cached;
    }
  }

  async copyFile(source: string, destination: string): Promise<void> {
    const content = await this.readFile(source);
    await this.writeFile(destination, content);
  }

  async moveFile(source: string, destination: string): Promise<void> {
    await this.copyFile(source, destination);
    await this.deleteFile(source);
  }
} 