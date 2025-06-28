import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, PlayCircle, PauseCircle } from "lucide-react";
import { default as Navbar } from "../components/Navbar";
import { supabase } from "../utils/supabaseClient";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Handle Get Started button click
  const handleGetStarted = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/tools');
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      navigate('/login');
    }
  };

  // All tools data - including the new Notes tool
  const allTools = [
    {
      title: 'Text to Presentation',
      description: 'Convert text into presentation slides.',
      link: '/editor',
      category: 'AI'
    },
    {
      title: 'Text Summarizer',
      description: 'Summarize long texts into concise summaries.',
      link: '/summarizer',
      category: 'Text'
    },
    {
      title: 'File Converter',
      description: 'Convert documents, images, and other files between different formats.',
      link: '/converter',
      category: 'Documents'
    },
    {
      title: 'AI Chatbot',
      description: 'Engage with an AI chatbot for various tasks.',
      link: '/chatbot',
      category: 'AI'
    },
    {
      title: 'Notes & Journal',
      description: 'Capture your thoughts, ideas, and daily reflections.',
      link: '/notes',
      category: 'Productivity'
    },
    {
      title: 'Productivity Planner',
      description: 'Plan your day and manage your tasks effectively.',
      link: '/productivity-planner',
      category: 'Productivity'
    },
    {
      title: 'Image Resizer',
      description: 'Resize images to desired dimensions.',
      link: '/image-resizer',
      category: 'Documents'
    },
    {
      title: 'Video Trimmer',
      description: 'Trim videos to specific lengths.',
      link: '/video-trimmer',
      category: 'Documents'
    },
    {
      title: 'Audio Transcriber',
      description: 'Transcribe audio files into text.',
      link: '/audio-transcriber',
      category: 'AI'
    },
    {
      title: 'Data Analysis',
      description: 'Analyze data sets and extract insights.',
      link: '/data-analysis',
      category: 'Documents'
    },
    {
      title: 'Color Picker',
      description: 'Generate color palettes for your designs.',
      link: '/color-picker',
      category: 'Design'
    },
    {
      title: 'PDF Reader',
      description: 'View and read PDF files directly in your browser.',
      link: '/pdf-reader',
      category: 'Documents'
    },
    {
      title: 'PDF Editor',
      description: 'Edit PDF documents with ease.',
      link: '/pdf-editor',
      category: 'Documents'
    },
    {
      title: 'DOC Reader',
      description: 'Read Word documents (DOC, DOCX) in your browser.',
      link: '/doc-reader',
      category: 'Documents'
    },
    {
      title: 'File Compressor',
      description: 'Compress files to reduce their size.',
      link: '/file-compressor',
      category: 'Productivity'
    },
    {
      title: 'QR Code Generator',
      description: 'Create QR codes for various purposes.',
      link: '/qr-generator',
      category: 'Productivity'
    },
    {
      title: 'Unit Converter',
      description: 'Convert units between different systems.',
      link: '/unit-converter',
      category: 'Productivity'
    },
    {
      title: 'Document Translator',
      description: 'Translate documents into different languages.',
      link: '/document-translator',
      category: 'AI'
    },
    {
      title: 'PDF Merger',
      description: 'Merge multiple PDF files into one.',
      link: '/pdf-merger',
      category: 'Documents'
    },
    {
      title: 'MCP Lite',
      description: 'Build and deploy Model Context Protocols quickly.',
      link: '/mcp-lite',
      category: 'AI'
    },
    {
      title: 'Terminal',
      description: 'Web-based terminal emulator with filesystem simulation.',
      link: '/terminal',
      category: 'Developer'
    },
    {
      title: 'Basic Agent',
      description: 'Intelligent AI assistant for complex tasks and analysis.',
      link: '/basic-agent',
      category: 'AI'
    },
    {
      title: 'Therapy AI Agent',
      description: 'AI-powered mental health support and therapeutic guidance.',
      link: '/therapy-agent',
      category: 'Health'
    },
    {
      title: 'Real Terminal',
      description: 'Full development environment with Python, Node.js, Git & OPFS persistence.',
      link: '/real-terminal',
      category: 'Developer'
    },
    {
      title: 'Background Remover',
      description: 'Remove backgrounds from images instantly using AI.',
      link: '/background-remover',
      category: 'AI'
    },
    {
      title: 'Plagiarism Checker',
      description: 'Detect copied content and ensure originality.',
      link: '/plagiarism-checker',
      category: 'Text'
    },
    {
      title: 'YouTube Downloader',
      description: 'Download YouTube videos in various qualities and formats.',
      link: '/youtube-downloader',
      category: 'Media'
    },
    {
      title: 'AI Image Generator',
      description: 'Create stunning images with FLUX.1, DALL-E 3, and other AI models.',
      link: '/image-generator',
      category: 'AI'
    },
    {
      title: 'AI Video Generator',
      description: 'Generate professional videos from text or images.',
      link: '/video-generator',
      category: 'AI'
    },
    {
      title: 'AI Music Generator',
      description: 'Create songs and music with advanced AI models.',
      link: '/music-generator',
      category: 'AI'
    },
    {
      title: 'AI Search Engine',
      description: 'Next-generation intelligent search with real-time results.',
      link: '/ai-search-engine',
      category: 'AI'
    }
  ];

  // Professional Tools Slideshow Component
  const ToolsSlideshow: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [pauseTimeout, setPauseTimeout] = useState<NodeJS.Timeout | null>(null);
    const [visibleTools, setVisibleTools] = useState(4);

    // Separate calculations for mobile and desktop
    const getMobileSlides = () => Math.ceil(allTools.length / 1); // 1 tool per slide on mobile
    const getDesktopSlides = () => Math.ceil(allTools.length / visibleTools); // dynamic for desktop
    
    const totalSlides = typeof window !== 'undefined' && window.innerWidth < 640 
      ? getMobileSlides() 
      : getDesktopSlides();

    const nextSlide = () => {
      const maxSlides = typeof window !== 'undefined' && window.innerWidth < 640 
        ? allTools.length 
        : Math.ceil(allTools.length / visibleTools);
      setCurrentIndex((prev) => (prev + 1) % maxSlides);
      handleUserInteraction();
    };

    const prevSlide = () => {
      const maxSlides = typeof window !== 'undefined' && window.innerWidth < 640 
        ? allTools.length 
        : Math.ceil(allTools.length / visibleTools);
      setCurrentIndex((prev) => (prev - 1 + maxSlides) % maxSlides);
      handleUserInteraction();
    };

    const goToSlide = (index: number) => {
      setCurrentIndex(index);
      handleUserInteraction();
    };

    const handleUserInteraction = () => {
      // Pause auto-advance for 20 seconds when user interacts
      setIsPlaying(false);
      
      if (pauseTimeout) {
        clearTimeout(pauseTimeout);
      }
      
      const timeout = setTimeout(() => {
        setIsPlaying(true);
      }, 20000);
      
      setPauseTimeout(timeout);
    };

    const getCurrentTools = () => {
      const startIndex = currentIndex * visibleTools;
      return allTools.slice(startIndex, startIndex + visibleTools);
    };

    // Auto-advance slides and handle responsive design
    useEffect(() => {
      const updateVisibleTools = () => {
        let newVisibleTools = 4; // default desktop
        if (typeof window !== 'undefined') {
          if (window.innerWidth < 640) newVisibleTools = 1; // mobile
          else if (window.innerWidth < 1024) newVisibleTools = 2; // tablet
          else newVisibleTools = 4; // desktop
        }
        
        if (newVisibleTools !== visibleTools) {
          setVisibleTools(newVisibleTools);
          setCurrentIndex(0); // Reset to first slide when layout changes
        }
      };

      updateVisibleTools();
      window.addEventListener('resize', updateVisibleTools);

      return () => {
        window.removeEventListener('resize', updateVisibleTools);
      };
    }, [visibleTools]);

    // Auto-advance timer
    useEffect(() => {
      const interval = isPlaying ? setInterval(() => {
        const maxSlides = typeof window !== 'undefined' && window.innerWidth < 640 
          ? allTools.length 
          : Math.ceil(allTools.length / visibleTools);
        setCurrentIndex((prev) => (prev + 1) % maxSlides);
      }, 4000) : null;
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [isPlaying, visibleTools]);

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (pauseTimeout) {
          clearTimeout(pauseTimeout);
        }
      };
    }, [pauseTimeout]);

      return (
        <div className="w-full">
          {/* Mobile Version - Full Screen Cards */}
          <div className="block sm:hidden">
            <div className="relative w-full">
              {/* Mobile Navigation Dots - Simplified */}
              <div className="flex justify-center gap-1.5 mb-6 px-4">
                {Array.from({ length: Math.min(allTools.length, 10) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'bg-[#e67722] w-10 shadow-md' 
                        : 'bg-white/60 w-2.5 hover:bg-white/80'
                    }`}
                  />
                ))}
                {allTools.length > 10 && (
                  <span className="text-xs text-[#382f29]/70 self-center ml-2">
                    +{allTools.length - 10} more
                  </span>
                )}
              </div>

              {/* Mobile Full-Width Cards */}
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-400 ease-out"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {allTools.map((tool, slideIndex) => (
                    <div key={slideIndex} className="w-full flex-shrink-0">
                      <div className="px-4">
                        <Link 
                          to={tool.link} 
                          className="block w-full"
                        >
                          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-3xl p-8 shadow-2xl active:scale-98 transition-all duration-200 hover:shadow-3xl">
                            {/* Mobile Card - Vertical Layout */}
                            <div className="flex flex-col items-center text-center space-y-6">
                              {/* Large Icon */}
                              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#e67722]/20 to-[#e67722]/10 rounded-2xl border-2 border-[#e67722]/30 shadow-lg">
                                <div className="w-10 h-10 text-[#382f29]">
                                  {getToolIcon(tool.title, tool.category)}
                                </div>
                              </div>
                              
                              {/* Content */}
                              <div className="space-y-4 w-full">
                                <h3 className="text-[#382f29] font-bold text-2xl leading-tight">
                                  {tool.title}
                                </h3>
                                <p className="text-[#5a5a5a] text-base leading-relaxed max-w-sm mx-auto">
                                  {tool.description}
                                </p>
                                <div className="pt-2">
                                  <span className="inline-block px-4 py-2 text-sm font-semibold bg-gradient-to-r from-[#e67722] to-[#d66320] text-white rounded-full shadow-lg">
                                    {tool.category}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Bottom Navigation */}
              <div className="flex justify-center items-center gap-6 mt-8 px-4">
                <button
                  onClick={prevSlide}
                  className="p-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-white/70 shadow-xl active:scale-90 transition-all duration-200 hover:shadow-2xl"
                >
                  <ChevronLeft className="w-6 h-6 text-[#382f29]" />
                </button>
                
                <div className="text-center">
                  <span className="text-[#382f29] text-lg font-bold px-6 py-3 bg-white/60 rounded-2xl backdrop-blur-sm border border-white/50 shadow-lg">
                    {currentIndex + 1} / {allTools.length}
                  </span>
                </div>
                
                <button
                  onClick={nextSlide}
                  className="p-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-white/70 shadow-xl active:scale-90 transition-all duration-200 hover:shadow-2xl"
                >
                  <ChevronRight className="w-6 h-6 text-[#382f29]" />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Version - Grid Layout */}
          <div className="hidden sm:block">
            <div className="relative">
              {/* Desktop Navigation */}
              <div className="relative overflow-hidden">
                <div className="relative px-12 md:px-16">
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white border border-white/50 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#382f29]" />
                  </button>

                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white border border-white/50 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <ChevronRight className="w-4 h-4 text-[#382f29]" />
                  </button>

                  {/* Desktop Grid */}
                  <div className="overflow-hidden">
                    <div 
                      className="flex transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                      {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                        <div 
                          key={slideIndex} 
                          className="w-full flex-shrink-0 py-6"
                        >
                          <div 
                            className="grid gap-4 px-4"
                            style={{
                              gridTemplateColumns: `repeat(${visibleTools}, 1fr)`
                            }}
                          >
                            {allTools.slice(slideIndex * visibleTools, (slideIndex + 1) * visibleTools).map((tool, toolIndex) => (
                              <Link 
                                key={`desktop-${slideIndex}-${toolIndex}`} 
                                to={tool.link} 
                                className="group block"
                              >
                                <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg p-4 hover:bg-white/60 hover:border-white/50 transition-all duration-200 group-hover:scale-[1.02] shadow-sm hover:shadow-md h-full min-h-[180px] flex flex-col">
                                  <div className="flex flex-col items-center text-center gap-3 flex-1">
                                    <div className="flex items-center justify-center w-12 h-12 bg-white/50 rounded-lg border border-white/30 group-hover:bg-white/70 transition-all duration-200">
                                      {getToolIcon(tool.title, tool.category)}
                                    </div>
                                    
                                    <div className="space-y-2 flex-1 flex flex-col">
                                      <h3 className="text-[#382f29] font-semibold text-sm leading-tight">{tool.title}</h3>
                                      <p className="text-[#5a5a5a] text-xs leading-relaxed flex-1 px-1" style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                      }}>{tool.description}</p>
                                      <span className="inline-block px-2 py-1 text-xs font-medium bg-[#e67722]/20 text-[#8b3a00] rounded border border-[#e67722]/30 mt-auto">
                                        {tool.category}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Indicators */}
              <div className="flex items-center justify-center gap-1 mt-6">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      index === currentIndex 
                        ? 'bg-[#e67722] w-6' 
                        : 'bg-white/50 hover:bg-white/70 w-1.5'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Subtle pause indicator */}
          {!isPlaying && (
            <div className="absolute top-2 right-2 bg-white/70 backdrop-blur-sm rounded px-2 py-1 text-xs text-[#382f29]/70">
              Paused
            </div>
          )}
        </div>
      );
  };

  // Function to get icon for each tool category/type - same as ToolsPage
  const getToolIcon = (title: string, category: string) => {
    const iconClass = "w-6 h-6 text-[#382f29]";
    
    if (title.includes('Presentation')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V7h14v12zM8 8h8v2H8V8zm0 3h8v2H8v-2zm0 3h5v2H8v-2z"/>
        </svg>
      );
    }
    if (title.includes('Summarizer')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15h8v2H8v-2zm0-4h8v2H8v-2zm0-4h5v2H8V7z"/>
        </svg>
      );
    }
    if (title.includes('Converter') || title.includes('Convert')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      );
    }
    if (title.includes('Chatbot') || title.includes('AI') || title.includes('Agent')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm7 7c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm1.5-7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      );
    }
    if (title.includes('Planner') || title.includes('Productivity')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
        </svg>
      );
    }
    if (title.includes('Audio') || title.includes('Transcriber')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2s-2-.9-2-2V4c0-1.1.9-2 2-2zm5.3 6c0 3-2.54 5.1-5.3 5.1S6.7 11 6.7 8H5c0 3.41 2.72 6.23 6 6.72V17h-2v2h6v-2h-2v-2.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
        </svg>
      );
    }
    if (title.includes('Terminal')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4V8h16v10zm-10-1h6v-2h-6v2zM6.5 10.5l1.41 1.41L10.83 9 7.91 6.09 6.5 7.5 8 9l-1.5 1.5z"/>
        </svg>
      );
    }
    if (title.includes('Background') || title.includes('Remover')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          <path d="M12 7c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" opacity="0.5"/>
        </svg>
      );
    }
    if (title.includes('Plagiarism') || title.includes('Checker')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
          <path d="M15.5 12c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      );
    }
    if (title.includes('Notes') || title.includes('Journal')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          <path d="M16.5 4.5l1.5 1.5-1.5 1.5-1.5-1.5z" opacity="0.5"/>
        </svg>
      );
    }
    
    // Default icon for any other tools
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
      </svg>
    );
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#f6f0e4] group/design-root overflow-x-hidden"
      style={{ 
        fontFamily: '"Space Grotesk", "Noto Sans", sans-serif',
        backgroundImage: 'url("/images/bg_image.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
          >
        {/* Full page overlay for text readability */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
        
        <div className="layout-container flex h-full grow flex-col relative z-10">
        <Navbar />
        {/* Spacer for fixed navbar */}
        <div className="h-16 sm:h-20"></div>
        <div className="px-0 sm:px-4 md:px-10 lg:px-20 flex flex-1 justify-center py-2 sm:py-5">
          <div className="layout-content-container flex flex-col w-full sm:max-w-[960px] flex-1">
            <div className="@container">
              <div className="p-4 sm:p-4">
                <div
                  className="relative flex min-h-[300px] sm:min-h-[400px] md:min-h-[480px] flex-col gap-6 sm:gap-6 md:gap-8 rounded-xl items-center justify-center p-6 sm:p-4 overflow-hidden"
                >
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40 sm:rounded-xl"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col gap-4 sm:gap-6 md:gap-8 items-center justify-center">
                  <div className="flex flex-col gap-2 text-center">
                    <h1
                      className="text-[#2F4F4F] text-xl font-bold leading-tight tracking-[-0.01em] sm:text-2xl md:text-3xl lg:text-4xl break-words whitespace-normal px-2"
                      style={{ 
                        textShadow: '0px 0px 6px white, 0px 0px 8px white',
                        fontFamily: '"Roboto", "Arial", sans-serif'
                      }}
                    >
                      Unleash the Power of Random tools in the palm of your hand
                    </h1>
                    <h2 
                      className="text-[#2F4F4F] text-base font-normal leading-normal sm:text-lg md:text-xl max-w-xl mx-auto"
                      style={{ 
                        textShadow: '0px 0px 4px white, 0px 0px 6px white',
                        fontFamily: '"Roboto", "Arial", sans-serif'
                      }}
                    >
                      Spend your time on what actually Matters... living
                    </h2>
                  </div>
                  <Link
                    to="/tools"
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#e67722] text-[#382f29] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] hover:bg-[#d66320] transition-colors duration-200"
                  >
                    <span className="truncate">Explore our suite</span>
                  </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-8 sm:gap-8 md:gap-10 px-0 sm:px-4 py-8 sm:py-8 md:py-10 @container">
              <div className="flex flex-col gap-4 px-4 sm:px-0">
                <h1
                  className="text-[#382f29] tracking-light text-3xl sm:text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]"
                >
                  Your Daily Dose of Useful Randomness
                </h1>
                <p className="text-[#382f29] text-base sm:text-base font-normal leading-normal max-w-[720px]">
                  Entropy Suite provides a wide array of AI-driven utilities to simplify your daily tasks and spark creativity.
                </p>
              </div>
              <ToolsSlideshow />
            </div>
            <div className="flex flex-col gap-10 px-4 py-10 @container">
              <div className="flex flex-col gap-4">
                <h1
                  className="text-[#382f29] tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]"
                >
                  AI-Powered Tools for Every Need
                </h1>
                <p className="text-[#382f29] text-base font-normal leading-normal max-w-[720px]">
                  Explore a growing library of tools designed to enhance productivity and inspire innovation.
                </p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                <Link to="/summarizer" className="flex flex-col gap-3 pb-3 group">
                  <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl transition-transform duration-300 group-hover:scale-105 border border-white/20 bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-[#382f29] w-16 h-16">
                      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15h8v2H8v-2zm0-4h8v2H8v-2zm0-4h5v2H8V7z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <p className="text-[#382f29] text-base font-medium leading-normal">Text Summarizer</p>
                    <p className="text-[#5a5a5a] text-sm font-normal leading-normal">Summarize long texts into concise, easy-to-read summaries with AI.</p>
                  </div>
                </Link>
                
                <Link to="/productivity-planner" className="flex flex-col gap-3 pb-3 group">
                  <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl transition-transform duration-300 group-hover:scale-105 border border-white/20 bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-[#382f29] w-16 h-16">
                      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <p className="text-[#382f29] text-base font-medium leading-normal">Productivity Planner</p>
                    <p className="text-[#5a5a5a] text-sm font-normal leading-normal">Plan your day and manage tasks effectively with smart organization tools.</p>
                  </div>
                </Link>
                
                <Link to="/background-remover" className="flex flex-col gap-3 pb-3 group">
                  <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl transition-transform duration-300 group-hover:scale-105 border border-white/20 bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-[#382f29] w-16 h-16">
                      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                        <path d="M12 7c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" opacity="0.5"/>
                      </svg>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <p className="text-[#382f29] text-base font-medium leading-normal">Background Remover</p>
                    <p className="text-[#5a5a5a] text-sm font-normal leading-normal">Remove backgrounds from images instantly using AI. Perfect for profile pictures.</p>
                  </div>
                </Link>
              </div>
            </div>
            <div className="@container">
              <div className="flex flex-col justify-end gap-6 px-4 py-10 @[480px]:gap-8 @[480px]:px-10 @[480px]:py-20">
                <div className="flex flex-col gap-2 text-center">
                  <h1
                    className="text-[#382f29] tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]"
                  >
                    Ready to Embrace the Randomness?
                  </h1>
                  <p className="text-[#382f29] text-base font-normal leading-normal max-w-[720px]">Sign up today and unlock the full potential of Entropy Suite.</p>
                </div>
                <div className="flex flex-1 justify-center">
                  <div className="flex justify-center">
                    <button
                      onClick={handleGetStarted}
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#e67722] text-[#382f29] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] grow hover:bg-[#d66320] transition-colors duration-200"
                    >
                      <span className="truncate">Get Started</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Subtle separator line */}
        <div className="w-full border-t border-[#b8a99d]/30"></div>
        
        <footer className="flex justify-center px-4">
          <div className="flex max-w-[960px] flex-1 flex-col">
            <footer className="flex flex-col gap-6 py-10 text-center @container">
              {/* Translucent card for footer content */}
              <div className="bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 p-6 mx-4">
                <div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around mb-6">
                  <Link to="/about" className="text-[#382f29] text-base font-medium leading-normal min-w-40 hover:text-[#e67722] transition-colors duration-200">About</Link>
                  <Link to="/contact" className="text-[#382f29] text-base font-medium leading-normal min-w-40 hover:text-[#e67722] transition-colors duration-200">Contact</Link>
                  <Link to="/privacy-policy" className="text-[#382f29] text-base font-medium leading-normal min-w-40 hover:text-[#e67722] transition-colors duration-200">Privacy Policy</Link>
                  <Link to="/terms-of-service" className="text-[#382f29] text-base font-medium leading-normal min-w-40 hover:text-[#e67722] transition-colors duration-200">Terms of Service</Link>
                </div>
                <div className="flex flex-col gap-4 items-center">
                  <p className="text-[#382f29] text-base font-normal leading-normal">© 2025 Entropy Suite. All rights reserved.</p>
                  
                  {/* Styled Boondock Labs button */}
                  <div className="flex items-center gap-2">
                    <span className="text-[#382f29] text-sm font-normal">Powered by</span>
                    <a 
                      href="https://boondocklabs.co.za" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#e67722] to-[#d66320] text-white text-sm font-semibold rounded-lg hover:from-[#d66320] hover:to-[#c55a1e] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                      </svg>
                      Boondock Labs
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
