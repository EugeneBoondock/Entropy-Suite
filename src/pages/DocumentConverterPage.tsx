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
    <div className="flex flex-col min-h-screen bg-[#f6f0e4]">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 flex flex-col items-center">
        <div className="text-center my-8">
          <h1 className="text-3xl font-bold text-[#382f29]">
            File Converter
          </h1>
          <p className="text-[#5d4633] mt-2">
            Convert documents, images, and other files between different formats.
          </p>
        </div>

        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
          <div {...getRootProps()} className={`border-2 border-dashed rounded-md p-10 text-center cursor-pointer transition-all ${isDragActive ? 'border-[#e67722] bg-[#f6f0e4]' : 'border-gray-300'}`}>
            <input {...getInputProps()} />
            {isDragActive ?
              <p className="text-[#e67722]">Drop files here ...</p> :
              <p className="text-gray-500">Drag & drop files here, or click to select files</p>
            }
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-[#382f29]">
                Your Files ({files.length}):
              </h3>
              <div className="mt-2">
                {renderFileIcons()}
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <label htmlFor="outputFormat" className="text-lg font-semibold text-[#382f29]">Convert To:</label>
            <select
              id="outputFormat"
              className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#e67722] focus:outline-none"
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              disabled={!files.length || availableFormats.length === 0}
            >
              <option value="">Select format...</option>
              {availableFormats.map(format => (
                <option key={format} value={format}>{format.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {isConverting && files.length > 1 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#e67722] h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${conversionProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1 text-center">
                Converting files... {Math.round(conversionProgress)}%
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={handleConvert}
              disabled={!files.length || !outputFormat || isConverting}
              className="px-8 py-3 bg-[#e67722] text-[#382f29] font-bold rounded-md hover:bg-opacity-90 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isConverting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner />
                  {files.length > 1 ? 'Converting to ZIP...' : 'Converting...'}
                </div>
              ) : (
                files.length > 1 ? 'Convert Files to ZIP' : 'Convert File'
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentConverterPage; 