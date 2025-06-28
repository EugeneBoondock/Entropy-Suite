import React, { useState, useCallback, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useDropzone } from 'react-dropzone';
import { convertFile, convertMultipleFiles } from '../tools/DocumentConverter/converterService';
import { LoadingSpinner } from '../tools/SlideTool/components/LoadingSpinner';

const DocumentConverterPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState<string>('');
  const [availableFormats, setAvailableFormats] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionProgress, setConversionProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (files.length > 0) {
      // Get all unique file extensions
      const extensions = files.map(file => file.name.split('.').pop()?.toLowerCase()).filter(Boolean);
      const uniqueExtensions = [...new Set(extensions)];
      
      setOutputFormat('');
      setError(null);

      // Find common formats that all file types can convert to
      let commonFormats: string[] = [];
      
      if (uniqueExtensions.length === 1) {
        // Single file type - use original logic
        const extension = uniqueExtensions[0];
      switch(extension) {
        case 'docx':
            commonFormats = ['txt', 'html', 'pdf', 'pptx'];
          break;
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'webp':
            commonFormats = ['pdf', 'docx', 'png', 'jpg', 'webp'];
          break;
        case 'txt':
            commonFormats = ['pdf', 'docx', 'html'];
          break;
        case 'json':
            commonFormats = ['csv'];
          break;
        case 'csv':
            commonFormats = ['json', 'xlsx'];
          break;
        case 'md':
            commonFormats = ['html', 'pdf'];
          break;
        case 'pdf':
            commonFormats = ['jpg', 'png'];
          break;
        case 'xlsx':
            commonFormats = ['csv'];
          break;
        case 'svg':
            commonFormats = ['png'];
          break;
        case 'xml':
            commonFormats = ['json'];
            break;
          case 'mov':
            commonFormats = ['mp4'];
          break;
        default:
            commonFormats = [];
          setError(`File type ".${extension}" is not supported.`);
          break;
      }
      } else {
        // Multiple file types - for now, we'll convert each to its most common format
        commonFormats = ['pdf', 'png', 'jpg', 'html', 'txt'];
        setError('Mixed file types detected. Each file will be converted to the target format if supported.');
      }
      
      setAvailableFormats(commonFormats);
    } else {
      setAvailableFormats([]);
    }
  }, [files]);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setError(null);
    if (fileRejections.length > 0) {
        setError("File type not supported. Please upload supported file types.");
    } else if (acceptedFiles.length > 0) {
      setFiles(acceptedFiles);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/vnd.ms-excel': ['.xlsx'],
        'application/pdf': ['.pdf'],
        'text/plain': ['.txt'],
        'text/markdown': ['.md'],
        'application/json': ['.json'],
        'text/csv': ['.csv'],
        'image/svg+xml': ['.svg'],
        'application/xml': ['.xml', 'text/xml'],
        'image/png': ['.png'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/webp': ['.webp'],
        'video/quicktime': ['.mov'],
    }
  });

  const handleConvert = async () => {
    if (!files.length || !outputFormat) return;
    
    setIsConverting(true);
    setError(null);
    setConversionProgress(0);
    try {
        if (files.length === 1) {
          await convertFile(files[0], outputFormat);
        } else {
          await convertMultipleFiles(files, outputFormat, (progress) => {
            setConversionProgress(progress);
          });
        }
    } catch(err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during conversion.');
    } finally {
        setIsConverting(false);
        setConversionProgress(0);
    }
  };

  const renderFileIcons = () => {
    if (!files.length) return null;
    
    return (
      <div className="space-y-2">
        {files.map((file, index) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
          return (
            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
              {renderFileIcon(extension)}
              <span className="font-medium text-gray-700">{file.name}</span>
              <button
                onClick={() => setFiles(files.filter((_, i) => i !== index))}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const renderFileIcon = (extension?: string) => {
    
    switch (extension) {
      case 'pdf':
        return <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDL48yNkADS0vPqi2sOlwizl6Rk_-hjrSVEokw_Z5HNUoae_osX1K_VMUYw_XbAK2gzBGNk8rRczRfcmSX9qz8rW_HmgCP_AaWFz6BB3zO6rCMuVsh1wDbyB2ZSfFMk_7RUr1LE8k_xVrjjjxymMVEVeU80k0lv7EOex-mcOJeli0Jbv2uKHvjJpdcCUmeHd6V1pNbsq2fsa1dkvB6iXJPIx7Ewbg7g7gVEuU2CM2B50z2kqU3ggFY8C5N2yIth2YW3aV204eSR8fxq" alt="PDF" className="w-12 h-12" />;
      case 'docx':
        return <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6t8eqIpmlWubaRzfTarfdEWvXm81nvovUc8pF6ew1PZflGw8ju6Jfn50Vg_mRnfAvDV51B5z-PsUm0dSFv6PTTEaK2ea8H1y6K6y_Pajr6XWXYpxzJTWcBuAs42glKaiq5Fba6IKiUDrnI2I9PP5X2FPK1QJFtUcEBwwjrapVESixw__ujLoCJ_2KWo_GiOD3gh1bUhAHi_wBLnYXaumuiin6nGqryNRz2QbXzd0YC0c0kovFSOuTKus-LNcGtqSaYDjQLV7rJekR" alt="DOC" className="w-12 h-12" />;
      case 'xlsx':
        return <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpAjv0vMB7XqCY89so4l4RfiApFxsrB_l4nxuyDUJH9G_SMXfNmwvQA2SRddKZ6jhiTuBIYt5txE7iMDcmvemrX9G-Hf8drwNVQTOEG23dz4yMeOqWhkHkvFyFB1144Zf5Wfjy0_9i3NfXzcwz4iOyYZ0vEnyWxWoufzTkG2rbZHsYX6vHtPGlk1R2xNIuHVa9gopH3TurAwfj5CJ7ZVAjrW2Cs_m3dmJnerGvGx74ISyaPSz1ajyLvbM-CCk8BdsfPx8x42wQhTJg" alt="XLSX" className="w-12 h-12" />;
      case 'csv':
        return <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpAjv0vMB7XqCY89so4l4RfiApFxsrB_l4nxuyDUJH9G_SMXfNmwvQA2SRddKZ6jhiTuBIYt5txE7iMDcmvemrX9G-Hf8drwNVQTOEG23dz4yMeOqWhkHkvFyFB1144Zf5Wfjy0_9i3NfXzcwz4iOyYZ0vEnyWxWoufzTkG2rbZHsYX6vHtPGlk1R2xNIuHVa9gopH3TurAwfj5CJ7ZVAjrW2Cs_m3dmJnerGvGx74ISyaPSz1ajyLvbM-CCk8BdsfPx8x42wQhTJg" alt="CSV" className="w-12 h-12" />;
      case 'json':
        return <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDreDfS0s35-KbkUj1iLXQZO-1DgjhAEqjZ1OXfoySLEfVLNWKM8zEsdAXj2Ugz6l7aaINfX4pLPL-71qNASKZ7bKAYRZ1iO6imYnxwmnL0v399XzySxn4PVsm8uzpmsUnQzmYJd5FstOeNdBxH1zkv0ZN0h1JpSuYb7JtSUkge7zMQWYI7rNFfmAvkpgO4HDFXr0lS26nTgcMIpLqVU_cZdwLFHb66QkeJO-vKDqLkMse8WP6T9i4UaTBQiHl5EZHf9dnik11KQyn5" alt="JSON" className="w-12 h-12" />;
      case 'xml':
        return <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDreDfS0s35-KbkUj1iLXQZO-1DgjhAEqjZ1OXfoySLEfVLNWKM8zEsdAXj2Ugz6l7aaINfX4pLPL-71qNASKZ7bKAYRZ1iO6imYnxwmnL0v399XzySxn4PVsm8uzpmsUnQzmYJd5FstOeNdBxH1zkv0ZN0h1JpSuYb7JtSUkge7zMQWYI7rNFfmAvkpgO4HDFXr0lS26nTgcMIpLqVU_cZdwLFHb66QkeJO-vKDqLkMse8WP6T9i4UaTBQiHl5EZHf9dnik11KQyn5" alt="XML" className="w-12 h-12" />;
      case 'md':
        return <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7PYGw1dKaYf1pnZqAOGHzg9KYlzRwNeujczoHadgmQ6woOe5PfOMbvCAlHkdh3pvEyCiZgG_nLI-blrVgZ_AUbqg53I5sPpX3T8IY956O5KtEXDxlKfrmSIlUFEchldwXMYKoqz8E7TfEmER1SoiF8GfVb42ScvgIh6ESThpOCRNut_UEYZcjcaL_cFkRYETIgLAWWYQBnXqeV8s5B2zy6mCJcs5Kxwn-7Kg-jhAvrWBIHZX3fhuLqWIgLhWg6UeSqyrZKJWHjl5n" alt="MD" className="w-12 h-12" />;
      case 'txt':
         return <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7PYGw1dKaYf1pnZqAOGHzg9KYlzRwNeujczoHadgmQ6woOe5PfOMbvCAlHkdh3pvEyCiZgG_nLI-blrVgZ_AUbqg53I5sPpX3T8IY956O5KtEXDxlKfrmSIlUFEchldwXMYKoqz8E7TfEmER1SoiF8GfVb42ScvgIh6ESThpOCRNut_UEYZcjcaL_cFkRYETIgLAWWYQBnXqeV8s5B2zy6mCJcs5Kxwn-7Kg-jhAvrWBIHZX3fhuLqWIgLhWg6UeSqyrZKJWHjl5n" alt="TXT" className="w-12 h-12" />;
      case 'mov':
        return (
          <svg className="w-12 h-12 text-[#382f29]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
          </svg>
        );
      default:
        return <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAymCQ1q-8yTgnWif-z1dKx8fWjB1sM_jT1hN2hT73fCj1gH7Rce8a7zC3h8F2t8K9a7zJ4bYx9gJzDkYn6vX5f8W1iW9gQhB9" alt="File" className="w-12 h-12" />;
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url(/images/bg_image.png)' }}
    >
      <div className="min-h-screen bg-black/10">
        <Navbar />
        <main className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white sm:text-5xl mb-4">
                File Converter
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Convert documents, images, and other files between different formats with ease.
              </p>
            </div>

            {/* Main Converter Card */}
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-8 border border-white/30 shadow-xl">
              {/* Drag & Drop Area */}
              <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isDragActive ? 'border-blue-400 bg-blue-400/10 backdrop-blur-sm' : 'border-white/40 hover:border-white/60'}`}>
                <input {...getInputProps()} />
                <div className="flex flex-col items-center space-y-4">
                  <svg className="w-16 h-16 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {isDragActive ? (
                    <p className="text-blue-200 text-lg font-medium">Drop files here...</p>
                  ) : (
                    <div>
                      <p className="text-white text-lg font-medium mb-2">Drag & drop files here</p>
                      <p className="text-white/60">or click to select files</p>
                    </div>
                  )}
                </div>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Your Files ({files.length}):
                  </h3>
                  <div className="space-y-3">
                    {files.map((file, index) => {
                      const extension = file.name.split('.').pop()?.toLowerCase();
                      return (
                        <div key={index} className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all">
                          {renderFileIcon(extension)}
                          <span className="font-medium text-white flex-1">{file.name}</span>
                          <button
                            onClick={() => setFiles(files.filter((_, i) => i !== index))}
                            className="text-red-300 hover:text-red-100 p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                            aria-label="Remove file"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Format Selection */}
              <div className="mt-8">
                <label htmlFor="outputFormat" className="block text-xl font-semibold text-white mb-3">
                  Convert To:
                </label>
                <select
                  id="outputFormat"
                  className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  disabled={!files.length || availableFormats.length === 0}
                >
                  <option value="" className="text-gray-800">Select format...</option>
                  {availableFormats.map(format => (
                    <option key={format} value={format} className="text-gray-800">
                      {format.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Progress Bar */}
              {isConverting && files.length > 1 && (
                <div className="mt-6">
                  <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-300 shadow-lg" 
                      style={{ width: `${conversionProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-white/80 mt-2 text-center font-medium">
                    Converting files... {Math.round(conversionProgress)}%
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg">
                  <p className="text-red-200">{error}</p>
                </div>
              )}

              {/* Convert Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={handleConvert}
                  disabled={!files.length || !outputFormat || isConverting}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  {isConverting ? (
                    <div className="flex items-center gap-3">
                      <LoadingSpinner />
                      <span>{files.length > 1 ? 'Converting to ZIP...' : 'Converting...'}</span>
                    </div>
                  ) : (
                    <span>{files.length > 1 ? 'Convert Files to ZIP' : 'Convert File'}</span>
                  )}
                </button>
              </div>

              {/* Supported Formats Info */}
              <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <h4 className="text-white font-semibold mb-2">Supported Formats:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm text-white/70">
                  <span>• Documents: DOCX, PDF, TXT</span>
                  <span>• Images: PNG, JPG, WEBP</span>
                  <span>• Data: JSON, CSV, XLSX</span>
                  <span>• Markup: HTML, MD, XML</span>
                  <span>• Video: MOV to MP4</span>
                  <span>• Vector: SVG to PNG</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocumentConverterPage; 