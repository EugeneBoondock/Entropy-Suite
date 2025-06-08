import React, { useState, useRef, useEffect } from 'react';
import { Theme } from '../App'; // Import Theme type

interface ToolbarProps {
  onGenerateSlides: (prompt: string) => void;
  onGenerateMoreSlides: (prompt?: string) => void; // Optional prompt for more
  onAddSlide: () => void;
  onDeleteSlide: () => void;
  onPresent: () => void;
  isSlideSelected: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  hasSlides: boolean;
  theme: Theme;
  onToggleTheme: () => void;
  onExportPPTX: () => void;
  onExportPDF: () => void;
  onToggleSidebar: () => void;
  isSidebarVisible: boolean;
  initialPrompt?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onGenerateSlides, 
  onGenerateMoreSlides,
  onAddSlide, 
  onDeleteSlide, 
  onPresent, 
  isSlideSelected, 
  isLoading, 
  error, 
  clearError,
  hasSlides,
  theme,
  onToggleTheme,
  onExportPPTX,
  onExportPDF,
  onToggleSidebar,
  isSidebarVisible,
  initialPrompt
}) => {
  const [prompt, setPrompt] = useState<string>(initialPrompt || '');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && !prompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt, prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    onGenerateSlides(prompt);
  };

  const handleGenerateMore = () => {
    if (isLoading) return;
    onGenerateMoreSlides(prompt); // Pass current prompt as context for more slides
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-[#f7f0e4] dark:bg-slate-800 p-2 md:p-3 shadow-lg flex items-center justify-between space-x-1 md:space-x-2 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-300">
      <div className="flex items-center">
        <button 
            onClick={onToggleSidebar} 
            className="md:hidden p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 mr-1"
            aria-label={isSidebarVisible ? "Hide sidebar" : "Show sidebar"}
            title={isSidebarVisible ? "Hide sidebar" : "Show sidebar"}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                {isSidebarVisible ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
            </svg>
        </button>
        <img 
          src="/images/entropy_tools.png" 
          alt="Entropy Tools Logo" 
          className="w-7 h-7 md:w-8 md:h-8 mr-1 md:mr-2 object-contain"
        />
        <h1 className="text-xl md:text-2xl font-bold text-primary-700 dark:text-primary-400 hidden sm:block">Entropy Tools</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-grow flex items-center space-x-1 md:space-x-2 max-w-sm md:max-w-md xl:max-w-lg">
        <input
          type="text"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            if (error) clearError();
          }}
          placeholder="Enter topic..."
          className="flex-grow p-2 md:p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow text-sm bg-[#f7f0e4] dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          disabled={isLoading}
          aria-label="Presentation topic prompt"
        />
        <button
          type="submit"
          className="px-3 py-2 md:px-3 md:py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center text-xs sm:text-sm font-medium"
          disabled={isLoading}
          aria-label="Generate slides with AI"
        >
          {isLoading && !hasSlides ? ( // Initial generation
            <>
              <svg className="animate-spin -ml-1 mr-1 md:mr-1.5 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="hidden sm:inline">Generating...</span>
              <span className="sm:hidden">AI...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
              </svg>
              <span className="hidden sm:inline">Generate</span>
              <span className="sm:hidden">AI</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleGenerateMore}
          className="px-3 py-2 md:px-3 md:py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center text-xs sm:text-sm font-medium"
          disabled={isLoading || !hasSlides}
          title="Add more AI-generated slides"
          aria-label="Add more AI-generated slides"
        >
         {isLoading && hasSlides ? ( // Generating more
            <>
              <svg className="animate-spin -ml-1 mr-1 md:mr-1.5 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="hidden sm:inline">More...</span>
              <span className="sm:hidden">More</span>
            </>
          ) : (
            <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="hidden sm:inline">More</span>
            <span className="sm:hidden">+AI</span>
            </>
          )}
        </button>
      </form>

      <div className="flex items-center space-x-1 md:space-x-1.5">
        {error && (
            <div className="hidden md:flex text-red-600 dark:text-red-400 text-xs p-1.5 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md max-w-[100px] lg:max-w-[150px] truncate relative group" title={error}>
              <span className="truncate">{error}</span>
              <button onClick={clearError} className="absolute top-0.5 right-0.5 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="p-2 md:px-3 md:py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center text-xs sm:text-sm font-medium"
            disabled={isLoading || !hasSlides}
            title="Export Options"
            aria-label="Export Options"
            aria-haspopup="true"
            aria-expanded={showExportMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 md:mr-1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="hidden md:inline">Export</span>
          </button>
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#f7f0e4] dark:bg-slate-700 rounded-md shadow-lg py-1 z-50 border dark:border-slate-600">
              <button
                onClick={() => { onExportPPTX(); setShowExportMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center"
                disabled={isLoading || !hasSlides}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2 text-orange-500">
                    <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 0 0 0 1.5v16.5a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5V3.75a.75.75 0 0 0 0-1.5h-15ZM5.25 21a2.25 2.25 0 0 1-2.25-2.25V3.75A2.25 2.25 0 0 1 5.25 1.5h13.5A2.25 2.25 0 0 1 21 3.75v15a2.25 2.25 0 0 1-2.25 2.25H5.25Z" clipRule="evenodd" />
                    <path d="M6.578 6.375a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Zm.75 4.5a.75.75 0 0 0-1.5 0v3a.75.75 0 0 0 1.5 0v-3Z" />
                    <path d="M10.078 9.375a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Zm-.75-3a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-1.5 0v1.5Z" />
                    <path d="M10.828 12.375a.75.75 0 0 0-1.5 0v3a.75.75 0 0 0 1.5 0v-3Zm1.5-1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Zm-.75-3a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-1.5 0v1.5Z" />
                    <path d="M15.078 12.375a.75.75 0 0 0-1.5 0v3a.75.75 0 0 0 1.5 0v-3Zm1.5-3a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Z" />
                </svg>
                Export as .PPTX
              </button>
              <button
                onClick={() => { onExportPDF(); setShowExportMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center"
                disabled={isLoading || !hasSlides}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2 text-red-500">
                  <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a.375.375 0 0 1-.375-.375V6.75A3.75 3.75 0 0 0 9 3H5.625Z" />
                  <path d="M12.971 1.816A5.23 5.23 0 0 1 15.75 1.5h1.875a.375.375 0 0 1 .375.375v4.5a.375.375 0 0 1-.375.375H12a.375.375 0 0 1-.375-.375v-1.5a.75.75 0 0 0-.75-.75h-.75a.75.75 0 0 0-.75.75v1.5A.375.375 0 0 1 9 6.75v-4.5a.375.375 0 0 1 .375-.375h1.875c.966 0 1.84.425 2.471 1.098Z" />
                  <path d="M11.25 12.375V15a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 .75-.75V12a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 0 .75-.75V9a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 0 0-1.5h-.75a.75.75 0 0 1-.75-.75V6a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75v.375a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 0-.75.75v3.375c0 .414.336.75.75.75Z" />
                </svg>
                Export as .PDF
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onToggleTheme}
          className="p-2 md:px-3 md:py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-60 transition-colors flex items-center"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          )}
        </button>

        <div className="hidden sm:flex items-center space-x-1 md:space-x-1.5">
            <button
            onClick={onAddSlide}
            className="px-2 py-2 md:px-3 md:py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center text-xs sm:text-sm font-medium"
            disabled={isLoading}
            title="Add New Slide"
            aria-label="Add New Slide"
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 md:mr-1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="hidden md:inline">Add</span>
            </button>
            <button
            onClick={onDeleteSlide}
            className="px-2 py-2 md:px-3 md:py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center text-xs sm:text-sm font-medium"
            disabled={isLoading || !isSlideSelected}
            title="Delete Selected Slide"
            aria-label="Delete Selected Slide"
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 md:mr-1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.342.052.682.107 1.022.166m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            <span className="hidden md:inline">Delete</span>
            </button>
            <button
            onClick={onPresent}
            className="px-2 py-2 md:px-3 md:py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center text-xs sm:text-sm font-medium"
            disabled={isLoading || !hasSlides}
            title="Start Presentation"
            aria-label="Start Presentation"
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 md:mr-1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12A2.25 2.25 0 0 0 20.25 14.25V3m-16.5 0h16.5m-16.5 0H3.75m16.5 0H20.25M5.625 6H9m3 0h3.375m-3.375 0V3m0 3v.75m0-3v-.75m-6 3H5.625m0 0V3m0 3v.75m0-3v-.75M9 11.25l3-3 3 3M9 11.25v-1.5m3 1.5v-1.5m3-1.5v-1.5M14.25 9v1.5M4.125 16.5h15.75c.621 0 1.125-.504 1.125-1.125V6.75A2.25 2.25 0 0 0 18.75 4.5H5.25A2.25 2.25 0 0 0 3 6.75v8.625c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
            <span className="hidden md:inline">Present</span>
            </button>
        </div>
      </div>
    </div>
  );
};