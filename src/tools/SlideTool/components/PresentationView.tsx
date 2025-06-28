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

  // Touch handling for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  // Landscape detection hook
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-hide controls on mobile or during autoplay
  const resetControlsTimer = useCallback(() => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    setShowControls(true);
    if (isMobile || isPlaying) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, isPlaying ? 2000 : 3000); // Faster fade during autoplay
      setControlsTimeout(timeout);
    }
  }, [controlsTimeout, isMobile, isPlaying]);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [currentSlideIndex, resetControlsTimer]);

  // When autoplay starts, immediately start the fade timer
  useEffect(() => {
    if (isPlaying) {
      resetControlsTimer();
    } else {
      // When autoplay stops, show controls
      setShowControls(true);
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
        setControlsTimeout(null);
      }
    }
  }, [isPlaying, resetControlsTimer, controlsTimeout]);

  // Touch handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    resetControlsTimer();
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentSlideIndex < slides.length - 1) {
      onNavigate('next');
    }
    if (isRightSwipe && currentSlideIndex > 0) {
      onNavigate('prev');
    }
  };

  // Tap to show/hide controls
  const handleTap = () => {
    if (isMobile) {
      setShowControls(!showControls);
      resetControlsTimer();
    }
  };

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
    padding: isMobile ? '1rem' : '2rem',
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
    // Enhanced mobile typography - smaller headings for mobile
    const titleClasses = isMobile 
      ? "font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl break-words p-1 sm:p-2 text-center leading-tight"
      : "font-bold text-2xl sm:text-3xl md:text-5xl lg:text-6xl break-words p-2 sm:p-4 text-center";
    
    const contentClasses = isMobile
      ? "text-xs sm:text-sm md:text-base lg:text-lg space-y-1 sm:space-y-2 max-w-prose text-left p-1 sm:p-2 overflow-y-auto custom-scrollbar max-h-[65vh] leading-relaxed"
      : "text-base sm:text-xl md:text-2xl lg:text-3xl space-y-2 sm:space-y-3 md:space-y-4 max-w-prose text-left p-2 sm:p-4 overflow-y-auto custom-scrollbar max-h-[50vh] sm:max-h-[60vh]";

    const titleElement = <h1 className={titleClasses}>{currentSlide.title}</h1>;
    const contentElement = (
      <ul className={contentClasses}>
        {currentSlide.content.split('\n').map((line, index) => {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('- ')) {
            return <li key={index} className="ml-3 sm:ml-4 md:ml-6 list-disc">{trimmedLine.substring(2)}</li>;
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

    // Mobile-first layouts with better spacing
    const mobileLayoutClasses = "flex flex-col sm:flex-row w-full h-full items-center";
    const mobileTextClasses = "w-full sm:w-1/2 flex flex-col justify-center p-1 sm:p-2 md:p-4 lg:p-8";
    const mobileImageClasses = "w-full sm:w-1/2 flex items-center justify-center p-1 sm:p-2 md:p-4 lg:p-8 h-full max-h-[35vh] sm:max-h-full";

    switch (currentSlide.layout) {
      case 'text-image-right':
        return <div className={mobileLayoutClasses}>
                 <div className={mobileTextClasses}>{titleElement}{contentElement}</div>
                 <div className={mobileImageClasses}>{imageElement}</div>
               </div>;
      case 'text-image-left':
        return <div className={mobileLayoutClasses}>
                 <div className={`${mobileImageClasses} order-2 sm:order-1`}>{imageElement}</div>
                 <div className={`${mobileTextClasses} order-1 sm:order-2`}>{titleElement}{contentElement}</div>
               </div>;
      case 'image-only':
        return <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 md:p-8">{imageElement}</div>;
      case 'title-only':
        return <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 md:p-8">{titleElement}</div>;
      case 'image-title-overlay':
        return <div className="relative w-full h-full">
                {imageElement && React.cloneElement(imageElement, { className: "absolute inset-0 w-full h-full object-cover" })}
                <div className="absolute inset-x-0 bottom-4 sm:bottom-10 p-2 sm:p-4 bg-black bg-opacity-60 text-center backdrop-blur-sm">{titleElement}</div>
               </div>;
      case 'text-only':
      default:
        return <div className="w-full h-full flex flex-col items-center justify-center text-center p-1 sm:p-2 md:p-4 lg:p-8">{titleElement}{contentElement}</div>;
    }
  };

  const controlButtonClass = `p-2 sm:p-3 md:p-3.5 rounded-full transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-opacity-75 ${theme === 'dark' ? 'bg-slate-700 text-slate-200 hover:bg-slate-600 focus:ring-slate-500' : 'bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-400'} disabled:opacity-50 disabled:cursor-not-allowed`;
  
  const hasPexelsImage = useMemo(() => slides.some(s => s.imageUrl && s.imageUrl.includes('pexels.com')), [slides]);

  return (
    <div className={`fixed inset-0 z-[100] overflow-hidden ${theme === 'dark' ? 'bg-black' : 'bg-slate-300'}`}>
      {/* Portrait mode warning for mobile */}
      {!isLandscape && isMobile && (
        <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center p-6 bg-black text-white text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 animate-bounce">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          <h2 className="text-xl font-bold mb-2">Please Rotate Your Device</h2>
          <p className="text-slate-300 text-sm leading-relaxed">For the best presentation experience, please turn your phone sideways (landscape mode).</p>
          <button 
            onClick={onExit}
            className="mt-4 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
          >
            Exit Presentation
          </button>
        </div>
      )}
      
      <div 
        className={`slide-container relative w-full h-full ${getTransitionClasses()}`} 
        style={slideStyles}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={handleTap}
      >
        {renderSlideContent()}
      </div>

      {hasPexelsImage && (
        <div className={`absolute bottom-2 left-2 text-xs z-[110] p-1 rounded ${theme === 'dark' ? 'bg-black/50 text-slate-400' : 'bg-[#f7f0e4]/90 text-slate-600'}`}>
          Photos provided by <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-500">Pexels</a>
        </div>
      )}

      {/* Navigation & Autoplay Controls */}
      <div className={`fixed bottom-2 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-1 sm:space-x-2 md:space-x-4 z-[110] p-1.5 sm:p-2.5 md:p-3 bg-opacity-75 sm:bg-opacity-50 rounded-lg backdrop-blur-sm shadow-xl transition-all duration-300 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} ${showControls || (!isMobile && !isPlaying) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button onClick={() => onNavigate('prev')} disabled={currentSlideIndex === 0} className={controlButtonClass} aria-label="Previous slide">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        
        <button onClick={handlePlayPause} className={controlButtonClass} aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}>
          {isPlaying ? 
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg> :
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
          }
        </button>
        <button onClick={handleStop} disabled={!isPlaying} className={controlButtonClass} aria-label="Stop slideshow">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" /></svg>
        </button>
        
        <span className={`text-xs sm:text-sm mx-1 whitespace-nowrap ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
          {currentSlideIndex + 1} / {slides.length}
        </span>
        
        <select value={autoplaySpeed} onChange={handleSpeedChange} className={`p-1 sm:p-1.5 md:p-2 text-xs rounded-md border-none focus:ring-2 ${theme === 'dark' ? 'bg-slate-700 text-slate-200 focus:ring-slate-500' : 'bg-slate-200 text-slate-700 focus:ring-slate-400'}`} aria-label="Autoplay speed">
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
        </select>

        <button onClick={() => onNavigate('next')} disabled={currentSlideIndex === slides.length - 1} className={controlButtonClass} aria-label="Next slide">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </button>
      </div>

      <button onClick={onExit} className={`absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 p-2 sm:p-2.5 rounded-full z-[110] transition-all duration-300 ${controlButtonClass} ${showControls || (!isMobile && !isPlaying) ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} aria-label="Exit presentation mode">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      {/* Mobile swipe hint */}
      {isMobile && showControls && !isPlaying && (
        <div className="fixed bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-[105] text-xs text-white/60 text-center animate-pulse">
          <p>Swipe left/right to navigate • Tap to show/hide controls</p>
        </div>
      )}

      {/* Autoplay indicator */}
      {isPlaying && !showControls && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[105] flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2 text-white text-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span>Playing</span>
        </div>
      )}
    </div>
  );
};