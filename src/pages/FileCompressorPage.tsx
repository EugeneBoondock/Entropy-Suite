import React, { useState, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';

interface FileItem {
  id: string;
  file: File;
  originalSize: number;
  compressedSize?: number;
  compressionRatio?: number;
  status: 'pending' | 'compressing' | 'completed' | 'error';
  downloadUrl?: string;
}

const FileCompressorPage: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [compressionLevel, setCompressionLevel] = useState(6);
  const [compressionFormat, setCompressionFormat] = useState<'zip' | 'gzip'>('zip');
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback((selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    const newFiles: FileItem[] = fileArray.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      file,
      originalSize: file.size,
      status: 'pending' as const,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
  }, []);

  const handleFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileSelect(selectedFiles);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [handleFileSelect]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  }, []);

  const compressFile = useCallback(async (fileItem: FileItem): Promise<FileItem> => {
    // Simulate compression process
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate compression ratio (in real implementation, would use actual compression libraries)
    const compressionRatio = 0.3 + Math.random() * 0.4; // 30-70% compression
    const compressedSize = Math.floor(fileItem.originalSize * compressionRatio);
    
    // Create a mock compressed file blob
    const compressedBlob = new Blob(['Mock compressed content'], { type: 'application/octet-stream' });
    const downloadUrl = URL.createObjectURL(compressedBlob);
    
    return {
      ...fileItem,
      compressedSize,
      compressionRatio: (1 - compressionRatio) * 100,
      status: 'completed',
      downloadUrl,
    };
  }, []);

  const compressAllFiles = useCallback(async () => {
    if (files.length === 0) {
      setError('Please add files to compress.');
      return;
    }

    setIsCompressing(true);
    setError(null);

    try {
      const pendingFiles = files.filter(file => file.status === 'pending');
      
      // Update status to compressing
      setFiles(prev => prev.map(file => 
        pendingFiles.some(pf => pf.id === file.id) 
          ? { ...file, status: 'compressing' }
          : file
      ));

      // Compress files in batches
      const batchSize = 3;
      for (let i = 0; i < pendingFiles.length; i += batchSize) {
        const batch = pendingFiles.slice(i, i + batchSize);
        
        const compressedBatch = await Promise.all(
          batch.map(file => compressFile(file))
        );

        setFiles(prev => prev.map(file => {
          const compressed = compressedBatch.find(cf => cf.id === file.id);
          return compressed || file;
        }));
      }
    } catch (err) {
      setError('Compression failed. Please try again.');
      console.error('Compression error:', err);
    } finally {
      setIsCompressing(false);
    }
  }, [files, compressFile]);

  const downloadFile = useCallback((fileItem: FileItem) => {
    if (!fileItem.downloadUrl) return;

    const link = document.createElement('a');
    link.href = fileItem.downloadUrl;
    link.download = `${fileItem.file.name}.${compressionFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [compressionFormat]);

  const downloadAll = useCallback(async () => {
    const completedFiles = files.filter(file => file.status === 'completed' && file.downloadUrl);
    
    if (completedFiles.length === 0) {
      setError('No completed files to download.');
      return;
    }

    // In a real implementation, would create a ZIP containing all compressed files
    for (const file of completedFiles) {
      downloadFile(file);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between downloads
    }
  }, [files, downloadFile]);

  const clearAll = useCallback(() => {
    files.forEach(file => {
      if (file.downloadUrl) {
        URL.revokeObjectURL(file.downloadUrl);
      }
    });
    setFiles([]);
    setError(null);
  }, [files]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalOriginalSize = files.reduce((sum, file) => sum + file.originalSize, 0);
  const totalCompressedSize = files
    .filter(file => file.compressedSize)
    .reduce((sum, file) => sum + (file.compressedSize || 0), 0);
  const overallCompressionRatio = totalOriginalSize > 0 
    ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-[#f6f0e4]">
      <Navbar />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#382f29] mb-4">File Compressor</h1>
            <p className="text-lg text-[#5c5349]">
              Compress your files to save space and bandwidth
            </p>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-[#e5dcc9]">
            <h2 className="text-xl font-semibold text-[#382f29] mb-4">Compression Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#382f29] mb-2">
                  Compression Level (1-9)
                </label>
                <input
                  type="range"
                  min="1"
                  max="9"
                  value={compressionLevel}
                  onChange={(e) => setCompressionLevel(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-[#5c5349] mt-1">
                  <span>Fast (1)</span>
                  <span>Balanced ({compressionLevel})</span>
                  <span>Best (9)</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#382f29] mb-2">
                  Output Format
                </label>
                <select
                  value={compressionFormat}
                  onChange={(e) => setCompressionFormat(e.target.value as 'zip' | 'gzip')}
                  className="w-full px-3 py-2 border border-[#e5dcc9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                >
                  <option value="zip">ZIP</option>
                  <option value="gzip">GZIP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-[#e5dcc9]">
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDrop={handleDrop}
              className="border-2 border-dashed border-[#8b7355] rounded-xl p-8 text-center cursor-pointer hover:border-[#6b5635] transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-[#382f29] mb-2">
                Drop files here or click to browse
              </h3>
              <p className="text-[#5c5349] mb-4">
                Support for all file types • Multiple file selection
              </p>
              <button className="bg-[#382f29] text-white px-6 py-3 rounded-lg hover:bg-[#2a211c] transition-colors">
                Choose Files
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-[#e5dcc9]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[#382f29]">
                  Files ({files.length})
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={compressAllFiles}
                    disabled={isCompressing || files.every(f => f.status === 'completed')}
                    className="bg-[#382f29] text-white px-4 py-2 rounded-lg hover:bg-[#2a211c] disabled:opacity-50 transition-colors"
                  >
                    {isCompressing ? 'Compressing...' : 'Compress All'}
                  </button>
                  <button
                    onClick={downloadAll}
                    disabled={!files.some(f => f.status === 'completed')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    Download All
                  </button>
                  <button
                    onClick={clearAll}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Summary Stats */}
              {files.some(f => f.status === 'completed') && (
                <div className="bg-[#f6f0e4] rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-[#382f29]">Original Size:</span>
                      <span className="ml-2">{formatFileSize(totalOriginalSize)}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#382f29]">Compressed Size:</span>
                      <span className="ml-2">{formatFileSize(totalCompressedSize)}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#382f29]">Space Saved:</span>
                      <span className="ml-2 text-green-600">{overallCompressionRatio.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {files.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 border border-[#e5dcc9] rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📄</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[#382f29] truncate">
                            {file.file.name}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-[#5c5349]">
                            <span>{formatFileSize(file.originalSize)}</span>
                            {file.compressedSize && (
                              <>
                                <span>→ {formatFileSize(file.compressedSize)}</span>
                                <span className="text-green-600">
                                  -{file.compressionRatio?.toFixed(1)}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {file.status === 'pending' && (
                        <span className="text-sm text-gray-500">Pending</span>
                      )}
                      {file.status === 'compressing' && (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#382f29]"></div>
                          <span className="text-sm text-[#382f29]">Compressing...</span>
                        </div>
                      )}
                      {file.status === 'completed' && (
                        <button
                          onClick={() => downloadFile(file)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Download
                        </button>
                      )}
                      {file.status === 'error' && (
                        <span className="text-sm text-red-600">Error</span>
                      )}
                      
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-red-600 text-2xl mr-3">⚠️</span>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Error</h3>
                    <p className="text-red-600">{error}</p>
                  </div>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileCompressorPage; 