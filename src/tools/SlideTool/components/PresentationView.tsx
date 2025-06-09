import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { JSX } from 'react';
import { Slide, Theme } from '../types';

interface PresentationViewProps {
  slides: Slide[];
  currentSlideIndex: number;
  onExit: () => void;
  onNavigate: (direction: 'next' | 'prev') => void;
  theme: Theme; // App theme, for control styling
}

const transitionDuration = 500; // ms

export const PresentationView = ({ slides, currentSlideIndex, onExit, onNavigate, theme }: PresentationViewProps): JSX.Element | null => {
  const [slideToShow, setSlideToShow] = useState(slides[currentSlideIndex]);
  const [transitionState, setTransitionState] = useState<'idle' | 'exiting' | 'entering'>('idle');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplaySpeed, setAutoplaySpeed] = useState(1); // 1x, 1.5x, 2x
  const autoplayTimerRef = React.useRef<number | null>(null);

  useEffect(() => {
    if (slides[currentSlideIndex] !== slideToShow) {
      setTransitionState('exiting');
      const timeoutId = setTimeout(() => {
        setSlideToShow(slides[currentSlideIndex]);
        setTransitionState('entering');
        const enterTimeout = setTimeout(() => {
          setTransitionState('idle');
        }, transitionDuration);
        return () => clearTimeout(enterTimeout);
      }, transitionDuration);

      return () => clearTimeout(timeoutId);
    }
  }, [currentSlideIndex, slides, slideToShow]);

  const startAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
    }
    const delay = (slideToShow.autoAdvanceDelay !== undefined ? slideToShow.autoAdvanceDelay : 5) * 1000 / autoplaySpeed;
    autoplayTimerRef.current = window.setTimeout(() => {
      if (currentSlideIndex < slides.length - 1) {
        onNavigate('next');
      } else {
        setIsPlaying(false); // Stop at the end
      }
    }, delay);
  }, [slideToShow, currentSlideIndex, slides.length, onNavigate, autoplaySpeed]);

  useEffect(() => {
    if (isPlaying) {
      startAutoplay();
    } else {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    }
    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
    };
  }, [isPlaying, currentSlideIndex, startAutoplay]);

  const handlePlayPause = () => setIsPlaying(prev => !prev);
  const handleStop = () => {
    setIsPlaying(false);
  };
  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAutoplaySpeed(parseFloat(e.target.value));
  };

  const currentSlide = slideToShow;
  if (!currentSlide) return null;

  const slideStyles: React.CSSProperties = {
    backgroundColor: currentSlide.backgroundColor || (theme === 'dark' ? '#1e293b' : '#f8fafc'), 
    color: currentSlide.textColor || (theme === 'dark' ? '#f1f5f9' : '#1e293b'), 
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    boxSizing: 'border-box',
    overflow: 'hidden',
    position: 'absolute', 
    inset: 0,
  };
  
  const getTransitionClasses = () => {
    const tType = currentSlide.transition || 'fade';
    if (transitionState === 'entering') return `${tType}-enter ${tType}-enter-active`;
    if (transitionState === 'exiting') return `${tType}-exit ${tType}-exit-active`;
    return '';
  };

  const renderSlideContent = () => {
    const titleElement = <h1 className="font-bold text-2xl sm:text-3xl md:text-5xl lg:text-6xl break-words p-2 sm:p-4 text-center">{currentSlide.title}</h1>;
    const contentElement = (
      <ul className="text-base sm:text-xl md:text-2xl lg:text-3xl space-y-2 sm:space-y-3 md:space-y-4 max-w-prose text-left p-2 sm:p-4 overflow-y-auto custom-scrollbar max-h-[50vh] sm:max-h-[60vh]">
        {currentSlide.content.split('\n').map((line, index) => {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('- ')) {
            return <li key={index} className="ml-6 list-disc">{trimmedLine.substring(2)}</li>;
          } else if (trimmedLine) {
            return <p key={index}>{trimmedLine}</p>;
          }
          return null;
        })}
      </ul>
    );
    const imageElement = currentSlide.imageUrl ? (
      <img 
        src={currentSlide.imageUrl} 
        alt={currentSlide.imageDescription || currentSlide.title || "Slide image"} 
        className="object-contain max-w-full max-h-full"
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
    ) : null;

    switch (currentSlide.layout) {
      case 'text-image-right':
        return <div className="flex flex-row w-full h-full items-center">
                 <div className="w-full sm:w-1/2 flex flex-col justify-center p-2 sm:p-4 md:p-8">{titleElement}{contentElement}</div>
                 <div className="w-full sm:w-1/2 flex items-center justify-center p-2 sm:p-4 md:p-8 h-full">{imageElement}</div>
               </div>;
      case 'text-image-left':
        return <div className="flex flex-row w-full h-full items-center">
                 <div className="w-full sm:w-1/2 flex items-center justify-center p-2 sm:p-4 md:p-8 h-full">{imageElement}</div>
                 <div className="w-full sm:w-1/2 flex flex-col justify-center p-2 sm:p-4 md:p-8">{titleElement}{contentElement}</div>
               </div>;
      case 'image-only':
        return <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 md:p-8">{imageElement}</div>;
      case 'title-only':
        return <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 md:p-8">{titleElement}</div>;
      case 'image-title-overlay':
        return <div className="relative w-full h-full">
                {imageElement && React.cloneElement(imageElement, { className: "absolute inset-0 w-full h-full object-cover" })}
                <div className="absolute inset-x-0 bottom-4 sm:bottom-10 p-2 sm:p-4 bg-black bg-opacity-40 text-center">{titleElement}</div>
               </div>;
      case 'text-only':
      default:
        return <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 md:p-8">{titleElement}{contentElement}</div>;
    }
  };

  const controlButtonClass = `p-3 sm:p-3.5 rounded-full transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-opacity-75 ${theme === 'dark' ? 'bg-slate-700 text-slate-200 hover:bg-slate-600 focus:ring-slate-500' : 'bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-400'} disabled:opacity-50 disabled:cursor-not-allowed`;
  
  const hasPexelsImage = useMemo(() => slides.some(s => s.imageUrl && s.imageUrl.includes('pexels.com')), [slides]);

  // Landscape detection hook
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`fixed inset-0 z-[100] overflow-hidden ${theme === 'dark' ? 'bg-black' : 'bg-slate-300'}`}>
      {/* Portrait mode warning for mobile */}
      {!isLandscape && window.innerWidth < 640 && (
        <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center p-6 bg-black text-white text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 animate-bounce">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
          <h2 className="text-xl font-bold mb-2">Please Rotate Your Device</h2>
          <p className="text-slate-300">For the best presentation experience, please turn your phone sideways (landscape mode).</p>
        </div>
      )}
      <div className={`slide-container relative w-full h-full ${getTransitionClasses()}`} style={slideStyles}>
        {renderSlideContent()}
      </div>

      {hasPexelsImage && (
        <div className={`absolute bottom-2 left-2 text-xs z-[110] p-1 rounded ${theme === 'dark' ? 'bg-black/50 text-slate-400' : 'bg-[#f7f0e4]/90 text-slate-600'}`}>
          Photos provided by <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-500">Pexels</a>
        </div>
      )}

      {/* Navigation & Autoplay Controls */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-3 sm:space-x-4 z-[110] p-2.5 sm:p-3 bg-opacity-50 rounded-lg backdrop-blur-sm ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} shadow-xl">
        <button onClick={() => onNavigate('prev')} disabled={currentSlideIndex === 0} className={controlButtonClass} aria-label="Previous slide">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        
        <button onClick={handlePlayPause} className={controlButtonClass} aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}>
          {isPlaying ? 
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg> :
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
          }
        </button>
        <button onClick={handleStop} disabled={!isPlaying} className={controlButtonClass} aria-label="Stop slideshow">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" /></svg>
        </button>
        
        <span className={`text-xs sm:text-sm mx-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
          {currentSlideIndex + 1} / {slides.length}
        </span>
        
        <select value={autoplaySpeed} onChange={handleSpeedChange} className={`p-1.5 sm:p-2 text-xs rounded-md border-none focus:ring-2 ${theme === 'dark' ? 'bg-slate-700 text-slate-200 focus:ring-slate-500' : 'bg-slate-200 text-slate-700 focus:ring-slate-400'}`} aria-label="Autoplay speed">
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
        </select>

        <button onClick={() => onNavigate('next')} disabled={currentSlideIndex === slides.length - 1} className={controlButtonClass} aria-label="Next slide">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </button>
      </div>

      <button onClick={onExit} className={`absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-2.5 rounded-full z-[110] transition-colors ${controlButtonClass}`} aria-label="Exit presentation mode">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
};