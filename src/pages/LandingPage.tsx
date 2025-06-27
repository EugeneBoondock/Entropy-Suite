import React from "react";
import { Link } from "react-router-dom";
import { default as Navbar } from "../components/Navbar";

const LandingPage: React.FC = () => {
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
        <div className="px-2 sm:px-4 md:px-10 lg:px-20 flex flex-1 justify-center py-2 sm:py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="@container">
              <div className="p-2 sm:p-4">
                <div
                  className="relative flex min-h-[320px] sm:min-h-[400px] md:min-h-[480px] flex-col gap-4 sm:gap-6 md:gap-8 sm:rounded-xl items-center justify-center p-2 sm:p-4 overflow-hidden"
                >
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40 sm:rounded-xl"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col gap-4 sm:gap-6 md:gap-8 items-center justify-center">
                  <div className="flex flex-col gap-2 text-center">
                    <h1
                      className="text-[#2F4F4F] text-2xl font-black leading-tight tracking-[-0.02em] sm:text-3xl md:text-4xl lg:text-5xl sm:tracking-[-0.033em]"
                      style={{ textShadow: '0px 0px 5px white, 0px 0px 5px white' }}
                    >
                      Unleash the Power of Randomness with Entropy Suite
                    </h1>
                    <h2 
                      className="text-[#2F4F4F] text-base font-normal leading-normal sm:text-lg md:text-xl lg:text-2xl max-w-xl mx-auto"
                      style={{ textShadow: '0px 0px 5px white, 0px 0px 10px white' }}
                    >
                      Spend your time on what Matters.
                    </h2>
                  </div>
                  <button
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#e67722] text-[#382f29] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]"
                  >
                    <span className="truncate">Explore our suite</span>
                  </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-10 px-4 py-10 @container">
              <div className="flex flex-col gap-4">
                <h1
                  className="text-[#382f29] tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]"
                >
                  Your Daily Dose of Useful Randomness
                </h1>
                <p className="text-[#382f29] text-base font-normal leading-normal max-w-[720px]">
                  Entropy Suite provides a wide array of AI-driven utilities to simplify your daily tasks and spark creativity.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-0">
                <Link to="/editor" style={{ textDecoration: 'none' }}>
                  <div className="flex flex-1 gap-3 rounded-lg border border-[#53463c] bg-white/20 backdrop-blur-sm p-4 flex-col hover:ring-2 hover:ring-[#e67722] hover:bg-white/30 transition-all duration-300">
                    <div className="text-[#382f29]">
                      {getToolIcon("Text to Presentation", "AI")}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-[#382f29] text-base font-bold leading-tight">Text to Presentation</h2>
                      <p className="text-[#5a5a5a] text-sm font-normal leading-normal">Transform text into engaging presentations with AI-powered design.</p>
                    </div>
                  </div>
                </Link>
                
                <Link to="/chatbot" style={{ textDecoration: 'none' }}>
                  <div className="flex flex-1 gap-3 rounded-lg border border-[#53463c] bg-white/20 backdrop-blur-sm p-4 flex-col hover:ring-2 hover:ring-[#e67722] hover:bg-white/30 transition-all duration-300">
                    <div className="text-[#382f29]">
                      {getToolIcon("AI Chatbot", "AI")}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-[#382f29] text-base font-bold leading-tight">AI Chatbot</h2>
                      <p className="text-[#5a5a5a] text-sm font-normal leading-normal">Engage with an intelligent AI chatbot for various tasks and assistance.</p>
                    </div>
                  </div>
                </Link>
                
                <Link to="/converter" style={{ textDecoration: 'none' }}>
                  <div className="flex flex-1 gap-3 rounded-lg border border-[#53463c] bg-white/20 backdrop-blur-sm p-4 flex-col hover:ring-2 hover:ring-[#e67722] hover:bg-white/30 transition-all duration-300">
                    <div className="text-[#382f29]">
                      {getToolIcon("File Converter", "Documents")}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-[#382f29] text-base font-bold leading-tight">File Converter</h2>
                      <p className="text-[#5a5a5a] text-sm font-normal leading-normal">Convert documents, images, and files between different formats seamlessly.</p>
                    </div>
                  </div>
                </Link>
                
                <Link to="/real-terminal" style={{ textDecoration: 'none' }}>
                  <div className="flex flex-1 gap-3 rounded-lg border border-[#53463c] bg-white/20 backdrop-blur-sm p-4 flex-col hover:ring-2 hover:ring-[#e67722] hover:bg-white/30 transition-all duration-300">
                    <div className="text-[#382f29]">
                      {getToolIcon("Real Terminal", "Terminal")}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-[#382f29] text-base font-bold leading-tight">Real Terminal</h2>
                      <p className="text-[#5a5a5a] text-sm font-normal leading-normal">Full development environment with Python, Node.js, Git & AI integration.</p>
                    </div>
                  </div>
                </Link>
              </div>
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
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#e67722] text-[#382f29] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] grow"
                    >
                      <span className="truncate">Get Started</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer className="flex justify-center">
          <div className="flex max-w-[960px] flex-1 flex-col">
            <footer className="flex flex-col gap-6 px-5 py-10 text-center @container">
              <div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around">
                <a className="text-[#b8a99d] text-base font-normal leading-normal min-w-40" href="#">About</a>
                <a className="text-[#b8a99d] text-base font-normal leading-normal min-w-40" href="#">Contact</a>
                <a className="text-[#b8a99d] text-base font-normal leading-normal min-w-40" href="#">Privacy Policy</a>
                <a className="text-[#b8a99d] text-base font-normal leading-normal min-w-40" href="#">Terms of Service</a>
              </div>
              <p className="text-[#b8a99d] text-base font-normal leading-normal">© 2025 Entropy Suite. All rights reserved.</p>
            </footer>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
