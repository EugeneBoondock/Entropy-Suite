import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '../../pages/LandingPage';
import Pricing from '../../pages/Pricing';
import PptxGenJS from 'pptxgenjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Slide } from './types';
import { Toolbar } from './components/Toolbar';
import { SlidePreview } from './components/SlidePreview';
import { SlideEditor } from './components/SlideEditor';
import { PresentationView } from './components/PresentationView';
import { generateSlidesFromAI, generateMoreSlidesFromAI } from './services/geminiService';
import { videoExportService } from './services/videoExportService';
import { LoadingSpinner } from './components/LoadingSpinner';
import { renderSlideForExport } from './utils/renderSlideForExport';

export type Theme = 'light' | 'dark';
const LOCAL_STORAGE_SLIDES_KEY = 'entropy-tools-slides';
const LOCAL_STORAGE_TOPIC_KEY = 'entropy-tools-last-topic';

const EditorApp: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>(() => {
    try {
      const storedSlides = localStorage.getItem(LOCAL_STORAGE_SLIDES_KEY);
      if (storedSlides) {
        const parsedSlides = JSON.parse(storedSlides);
        return parsedSlides.map((s: any) => ({
          layout: 'text-only',
          transition: 'fade',
          autoAdvanceDelay: 5,
          backgroundColor: undefined,
          textColor: undefined,
          imageUrl: undefined,
          imageQuery: undefined, // Ensure imageQuery is initialized
          imageDescription: undefined,
          ...s,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error loading slides from localStorage:", error);
      return [];
    }
  });
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number | null>(
    slides.length > 0 ? 0 : null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPresenting, setIsPresenting] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [lastUsedTopic, setLastUsedTopic] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_TOPIC_KEY) || '';
  });

  // Effect for managing theme (dark/light mode)
  useEffect(() => {
    const storedTheme = localStorage.getItem('app-theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setTheme(mediaQuery.matches ? 'dark' : 'light');
    }
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem('app-theme')) { 
            setTheme(e.matches ? 'dark' : 'light');
        }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // Effect for saving slides and topic to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SLIDES_KEY, JSON.stringify(slides));
      if (lastUsedTopic) {
        localStorage.setItem(LOCAL_STORAGE_TOPIC_KEY, lastUsedTopic);
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      setError("Could not save data. Your browser's local storage might be full or disabled.");
    }
  }, [slides, lastUsedTopic]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const handleGenerateSlides = useCallback(async (prompt: string) => {
    if (!prompt.trim()) {
      setError("Please enter a topic or prompt.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setLastUsedTopic(prompt); // Save the topic
    try {
      const newSlides = await generateSlidesFromAI(prompt);
      setSlides(newSlides);
      setCurrentSlideIndex(newSlides.length > 0 ? 0 : null);
      if (newSlides.length === 0) {
        setError("AI did not generate any slides. Try a different prompt.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during AI generation.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGenerateMoreSlides = useCallback(async (promptForMore?: string) => {
    const topicToUse = promptForMore?.trim() || lastUsedTopic;
    if (!topicToUse) {
      setError("Please enter a topic or use the 'Generate AI Slides' button first.");
      return;
    }
     if (slides.length === 0) {
      setError("Generate some initial slides first before adding more.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setLastUsedTopic(topicToUse); // Update last used topic if a new one is provided for "more"
    try {
      const additionalSlides = await generateMoreSlidesFromAI(slides, topicToUse);
      if (additionalSlides.length > 0) {
        setSlides(prevSlides => [...prevSlides, ...additionalSlides]);
        // Optionally, navigate to the first new slide:
        // setCurrentSlideIndex(slides.length); 
      } else {
        setError("AI did not generate additional slides. Try a different angle or prompt.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while generating more slides.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [slides, lastUsedTopic]);


  const handleAddSlide = useCallback(() => {
    const newSlide: Slide = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      title: "Untitled Slide",
      content: "- New point",
      layout: 'text-only',
      transition: 'fade',
      autoAdvanceDelay: 5,
    };
    setSlides(prevSlides => {
      const updatedSlides = [...prevSlides, newSlide];
      setCurrentSlideIndex(updatedSlides.length - 1);
      return updatedSlides;
    });
  }, []);

  const handleSelectSlide = useCallback((index: number) => {
    setCurrentSlideIndex(index);
    if (window.innerWidth < 768) { 
        setIsSidebarVisible(false); 
    }
  }, []);

  const handleDeleteSlide = useCallback((indexToDelete: number) => {
    if (window.confirm(`Are you sure you want to delete slide ${indexToDelete + 1}?`)) {
      setSlides(prevSlides => {
        const updatedSlides = prevSlides.filter((_, index) => index !== indexToDelete);
        if (updatedSlides.length === 0) {
          setCurrentSlideIndex(null);
        } else if (currentSlideIndex === indexToDelete) {
          setCurrentSlideIndex(Math.max(0, indexToDelete - 1));
        } else if (currentSlideIndex !== null && currentSlideIndex > indexToDelete) {
          setCurrentSlideIndex(currentSlideIndex - 1);
        }
        return updatedSlides;
      });
    }
  }, [currentSlideIndex]);

  const handleUpdateSlide = useCallback((index: number, updatedSlideData: Partial<Slide>) => {
    setSlides(prevSlides =>
      prevSlides.map((slide, i) =>
        i === index ? { ...slide, ...updatedSlideData } : slide
      )
    );
  }, []);

  const togglePresentationMode = useCallback(() => {
    if (slides.length === 0) {
      setError("Add some slides before presenting.");
      return;
    }
    if (currentSlideIndex === null && slides.length > 0) {
        setCurrentSlideIndex(0);
    }
    setIsPresenting(prev => !prev);
  }, [slides.length, currentSlideIndex]);

  const navigatePresentation = useCallback((direction: 'next' | 'prev') => {
    if (currentSlideIndex === null) return;
    if (direction === 'next') {
      setCurrentSlideIndex(prev => (prev !== null && prev < slides.length - 1 ? prev + 1 : prev));
    } else {
      setCurrentSlideIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
    }
  }, [slides.length, currentSlideIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isPresenting) {
        if (event.key === 'Escape') {
          setIsPresenting(false);
        } else if (event.key === 'ArrowRight') {
          navigatePresentation('next');
        } else if (event.key === 'ArrowLeft') {
          navigatePresentation('prev');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPresenting, navigatePresentation]);

  const handleExportToPPTX = useCallback(async () => {
    if (slides.length === 0) {
      setError("No slides to export. Please generate or add some slides.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const pptx = new PptxGenJS();
      for (const slide of slides) { // Changed to for...of for async operations if needed for images
        const pptxSlide = pptx.addSlide();

        const slideBgColor = slide.backgroundColor ? slide.backgroundColor.replace('#', '') : (theme === 'dark' ? '1E293B' : 'F8FAFC');
        pptxSlide.background = { color: slideBgColor };
        
        const defaultTextColor = slide.textColor ? slide.textColor.replace('#', '') : (theme === 'dark' ? 'F1F5F9' : '1E293B');

        const titleOptions: PptxGenJS.TextPropsOptions = {
          x: 0.5, y: 0.25, w: '90%', h: 1, 
          fontSize: 28, bold: true, align: 'center', 
          color: defaultTextColor,
        };
        const contentOptions: PptxGenJS.TextPropsOptions = {
          x: 0.5, y: 1.5, w: '90%', h: 3.5, 
          fontSize: 16, 
          color: defaultTextColor,
          lineSpacing: 24,
        };
        
        const imageCommonOptions = {w: 4, h:3, sizing: { type: 'contain', w: 4, h: 3 } as PptxGenJS.ImageProps['sizing']};

        if (slide.layout === 'text-image-right') {
          titleOptions.w = '45%'; titleOptions.align = 'left';
          contentOptions.w = '45%';
          if (slide.imageUrl) {
             // PptxGenJS typically needs images to be base64 or accessible via server that allows CORS for direct URL fetching by the library in some contexts.
             // For client-side generation with external URLs, it's best if the image is publicly accessible without strict CORS.
            pptxSlide.addImage({ path: slide.imageUrl, x: 5, y: 1, ...imageCommonOptions });
          }
        } else if (slide.layout === 'text-image-left') {
          titleOptions.x = 5; titleOptions.w = '45%'; titleOptions.align = 'left';
          contentOptions.x = 5; contentOptions.w = '45%';
          if (slide.imageUrl) pptxSlide.addImage({ path: slide.imageUrl, x: 0.5, y: 1, ...imageCommonOptions });
        } else if (slide.layout === 'image-only') {
          if (slide.imageUrl) pptxSlide.addImage({ path: slide.imageUrl, x: '10%', y: '10%', w: '80%', h: '80%', sizing: { type: 'contain', w:'80%', h:'80%'} });
        } else if (slide.layout === 'title-only') {
           titleOptions.y = '40%';
        } else if (slide.layout === 'image-title-overlay') {
            if (slide.imageUrl) pptxSlide.addImage({ path: slide.imageUrl, x:0, y:0, w:'100%', h:'100%', sizing: { type: 'cover', w:'100%', h:'100%'} });
            titleOptions.y = '80%'; titleOptions.color = slide.textColor || 'FFFFFF'; 
            titleOptions.fontFace = 'Arial'; 
            pptxSlide.addText(slide.title || "Untitled Slide", titleOptions);
        }

        if (slide.layout !== 'image-only' && slide.layout !== 'image-title-overlay') {
            pptxSlide.addText(slide.title || "Untitled Slide", titleOptions);
        }
         if (slide.layout !== 'image-only' && slide.layout !== 'title-only' && slide.layout !== 'image-title-overlay') {
            const contentItems = slide.content.split('\n').map(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('- ')) {
                    return { text: trimmedLine.substring(2), options: { bullet: true, indentLevel: 0 } };
                }
                return { text: trimmedLine };
            });
            pptxSlide.addText(contentItems, contentOptions);
        }
      }
      await pptx.writeFile({ fileName: `Entropy-Tools-${Date.now()}.pptx` });
    } catch (err) {
      console.error("Error exporting to PPTX:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during PPTX export.");
    } finally {
      setIsLoading(false);
    }
  }, [slides, theme]);

  const handleExportToVideo = useCallback(async () => {
    if (slides.length === 0) {
      setError("No slides to export. Please generate or add some slides.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setExportProgress(0);
    
    try {
      // Create a temporary container for rendering slides
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '1280px';
      container.style.height = '720px';
      document.body.appendChild(container);
      
      // Render each slide and collect the elements
      const slideElements: HTMLElement[] = [];
      
      for (const slide of slides) {
        const slideElement = document.createElement('div');
        slideElement.style.width = '100%';
        slideElement.style.height = '100%';
        slideElement.style.backgroundColor = slide.backgroundColor || (theme === 'dark' ? '#1e293b' : '#ffffff');
        slideElement.style.color = slide.textColor || (theme === 'dark' ? '#ffffff' : '#000000');
        slideElement.style.padding = '40px';
        slideElement.style.boxSizing = 'border-box';
        slideElement.style.display = 'flex';
        slideElement.style.flexDirection = 'column';
        slideElement.style.justifyContent = 'center';
        slideElement.style.alignItems = 'center';
        slideElement.style.textAlign = 'center';
        
        // Add title
        const titleElement = document.createElement('h1');
        titleElement.textContent = slide.title;
        titleElement.style.fontSize = '48px';
        titleElement.style.marginBottom = '20px';
        titleElement.style.maxWidth = '100%';
        titleElement.style.overflow = 'hidden';
        titleElement.style.textOverflow = 'ellipsis';
        titleElement.style.color = 'inherit';
        
        // Add content
        const contentElement = document.createElement('div');
        contentElement.innerHTML = slide.content;
        contentElement.style.fontSize = '32px';
        contentElement.style.maxWidth = '100%';
        contentElement.style.overflow = 'hidden';
        contentElement.style.color = 'inherit';
        
        slideElement.appendChild(titleElement);
        slideElement.appendChild(contentElement);
        
        container.appendChild(slideElement);
        slideElements.push(slideElement);
      }
      
      // Export to video
      const progressCallback = (progress: number) => {
        setExportProgress(Math.round(progress));
      };
      
      const videoBlob = await videoExportService.exportAsVideo(slideElements, 5, progressCallback);
      
      // Create download link
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'presentation.mp4';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('Error exporting video:', error);
      setError('Failed to export video. Please try again.');
    } finally {
      // Clean up temporary elements
      const tempContainer = document.querySelector('div[style*="position: fixed; top: -9999px"]');
      if (tempContainer) {
        document.body.removeChild(tempContainer);
      }
      setIsLoading(false);
      setExportProgress(0);
    }
  }, [slides, theme]);

  const handleExportToPDF = useCallback(async () => {
    if (slides.length === 0) {
      setError("No slides to export. Please generate or add some slides.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const pdfRenderContainer = document.getElementById('pdf-render-container');
    if (!pdfRenderContainer) {
        setError("PDF rendering container not found.");
        setIsLoading(false);
        return;
    }
    
    await new Promise<void>(resolve => setTimeout(resolve, 100));

    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1280, 720] 
      });

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        pdfRenderContainer.innerHTML = renderSlideForExport(slide, theme);
        
        await new Promise<void>(resolve => setTimeout(resolve, 200)); // Increased delay for image loading

        const canvas = await html2canvas(pdfRenderContainer, {
          scale: 2, 
          useCORS: true,
          logging: false,
          width: 1280,
          height: 720,
          windowWidth: 1280,
          windowHeight: 720,
          imageTimeout: 20000, 
          onclone: async (clonedDoc) => { 
            const images = clonedDoc.querySelectorAll('img');
            const imageLoadPromises = Array.from(images).map(img => {
              if (img.complete && img.naturalHeight !== 0) {
                return Promise.resolve();
              }
              return new Promise<void>((resolvePromise) => {
                img.onload = () => resolvePromise();
                img.onerror = () => {
                  console.warn("Image failed to load for PDF export:", img.src);
                  // Replace broken image with a placeholder or remove it visually
                  const placeholder = clonedDoc.createElement('div');
                  placeholder.style.width = img.width ? `${img.width}px` : '100px';
                  placeholder.style.height = img.height ? `${img.height}px` : '100px';
                  placeholder.style.backgroundColor = '#f0f0f0';
                  placeholder.style.border = '1px dashed #ccc';
                  placeholder.style.display = 'flex';
                  placeholder.style.alignItems = 'center';
                  placeholder.style.justifyContent = 'center';
                  placeholder.style.fontSize = '12px';
                  placeholder.innerText = 'Image load error';
                  img.parentNode?.replaceChild(placeholder, img);
                  resolvePromise(); 
                };
              });
            });
            await Promise.all(imageLoadPromises);
          }
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) {
          pdf.addPage([1280, 720], 'landscape');
        }
        pdf.addImage(imgData, 'PNG', 0, 0, 1280, 720);
      }
      
      pdf.save(`Entropy-Tools-${Date.now()}.pdf`);
      pdfRenderContainer.innerHTML = '';

    } catch (err) {
      console.error("Error exporting to PDF:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during PDF export.");
      pdfRenderContainer.innerHTML = '';
    } finally {
      setIsLoading(false);
    }
  }, [slides, theme]);


  const currentSlide = currentSlideIndex !== null ? slides[currentSlideIndex] : null;

  if (isPresenting && currentSlideIndex !== null) {
    return (
      <PresentationView
        slides={slides}
        currentSlideIndex={currentSlideIndex}
        onExit={togglePresentationMode}
        onNavigate={navigatePresentation}
        theme={theme}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen font-sans antialiased overflow-hidden">
      {isLoading && exportProgress > 0 && exportProgress < 100 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Exporting Video</h3>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${exportProgress}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center">
              {exportProgress}% complete
            </p>
          </div>
        </div>
      )}
      <Toolbar
        onGenerateSlides={handleGenerateSlides}
        onGenerateMoreSlides={handleGenerateMoreSlides}
        onAddSlide={handleAddSlide}
        onDeleteSlide={() => currentSlideIndex !== null && handleDeleteSlide(currentSlideIndex)}
        onPresent={togglePresentationMode}
        isSlideSelected={currentSlideIndex !== null}
        isLoading={isLoading}
        error={error}
        clearError={() => setError(null)}
        hasSlides={slides.length > 0}
        theme={theme}
        onToggleTheme={toggleTheme}
        onExportPPTX={handleExportToPPTX}
        onExportPDF={handleExportToPDF}
        onExportVideo={handleExportToVideo}
        onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
        isSidebarVisible={isSidebarVisible}
        initialPrompt={lastUsedTopic}
      />
      <div className="flex flex-1 overflow-hidden bg-slate-200 dark:bg-slate-800 transition-colors duration-300">
        <aside 
            className={`
            ${isSidebarVisible ? 'w-72 md:w-72 lg:w-80' : 'w-0 -ml-1 md:w-0'} 
            bg-slate-800 dark:bg-slate-900 text-white p-4 space-y-3 overflow-y-auto shadow-xl flex-shrink-0
            transition-all duration-300 ease-in-out fixed md:static h-full md:h-auto z-40 md:z-auto
            ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            custom-scrollbar 
            `}
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-slate-300 dark:text-slate-400">Slides Overview</h2>
            <button 
              onClick={handleAddSlide} 
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 dark:hover:bg-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              title="Add New Slide"
              aria-label="Add New Slide"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
          {slides.length === 0 && !isLoading && (
            <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-5">No slides yet. <br className="hidden sm:inline"/>Use AI or add manually.</p>
          )}
          {slides.map((slide, index) => (
            <SlidePreview
              key={slide.id}
              slide={slide}
              isActive={index === currentSlideIndex}
              onClick={() => handleSelectSlide(index)}
              onDelete={() => handleDeleteSlide(index)}
              index={index}
              theme={theme}
            />
          ))}
        </aside>

        <main className={`flex-1 p-3 md:p-6 overflow-y-auto bg-[#f7f0e4] dark:bg-slate-800 transition-colors duration-300 custom-scrollbar ${isSidebarVisible && window.innerWidth < 768 ? 'blur-sm pointer-events-none' : ''}`}>
          {isLoading && !error && (
            <div className="flex flex-col justify-center items-center h-full">
              <LoadingSpinner />
              <p className="ml-4 text-slate-700 dark:text-slate-300 text-xl mt-4">AI is crafting your slides...</p>
            </div>
          )}
          {!isLoading && slides.length === 0 && (
             <div className="flex flex-col justify-center items-center h-full text-slate-500 dark:text-slate-400 text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 md:w-32 md:h-32 mb-6 text-slate-400 dark:text-slate-500 opacity-70">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12V9A2.25 2.25 0 0 0 A5.25 9v8.25m13.5-8.25H9m10.5 0H9m10.5 0H9M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
               <h2 className="text-2xl md:text-3xl font-semibold mb-3">Welcome to Entropy Tools!</h2>
               <p className="text-base md:text-lg">Your intelligent presentation assistant. <br className="sm:hidden"/> Enter a topic above or add a slide manually.</p>
             </div>
          )}
          {!isLoading && currentSlide && currentSlideIndex !== null && (
            <SlideEditor
              key={currentSlide.id} 
              slide={currentSlide}
              slideNumber={currentSlideIndex + 1}
              totalSlides={slides.length}
              onUpdateSlide={(updatedData) => handleUpdateSlide(currentSlideIndex, updatedData)}
              theme={theme}
            />
          )}
           {!isLoading && slides.length > 0 && currentSlide === null && !error && (
            <div className="flex flex-col justify-center items-center h-full text-slate-500 dark:text-slate-400 p-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 md:w-24 md:h-24 mb-4 text-slate-400 dark:text-slate-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
              <h2 className="text-xl md:text-2xl font-semibold mb-2">Select a slide</h2>
              <p className="text-center text-sm md:text-base">Choose a slide from the left panel to start editing.</p>
            </div>
          )}
        </main>
      </div>
      {isSidebarVisible && window.innerWidth < 768 && (
        <div 
            className="fixed inset-0 bg-black/30 z-30 backdrop-blur-sm" 
            onClick={() => setIsSidebarVisible(false)}
        ></div>
      )}
    </div>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/editor" element={<EditorApp />} />
      <Route path="/pricing" element={<Pricing />} />
    </Routes>
  </BrowserRouter>
);

export default App;