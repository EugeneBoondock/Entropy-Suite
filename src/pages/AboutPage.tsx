import React from "react";
import { Link } from "react-router-dom";
import { default as Navbar } from "../components/Navbar";

const AboutPage: React.FC = () => {
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
        <div className="px-2 sm:px-4 md:px-10 lg:px-20 flex flex-1 justify-center py-2 sm:py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="@container">
              <div className="p-2 sm:p-4">
                {/* Hero Section */}
                <div className="relative flex min-h-[200px] flex-col gap-4 sm:gap-6 rounded-xl items-center justify-center p-4 sm:p-8 overflow-hidden mb-8">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40 rounded-xl"></div>
                  <div className="relative z-10 flex flex-col gap-4 items-center justify-center text-center">
                    <h1
                      className="text-[#2F4F4F] text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-[-0.02em]"
                      style={{ textShadow: '0px 0px 5px white, 0px 0px 5px white' }}
                    >
                      About Entropy Suite
                    </h1>
                    <p 
                      className="text-[#2F4F4F] text-lg sm:text-xl max-w-2xl"
                      style={{ textShadow: '0px 0px 5px white, 0px 0px 10px white' }}
                    >
                      Embracing randomness to enhance productivity and creativity
                    </p>
                  </div>
                </div>

                {/* Content Cards */}
                <div className="flex flex-col gap-8">
                  {/* Our Story */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 p-6">
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">Our Story</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      Entropy Suite was born from the idea that the best tools often emerge from unexpected combinations and creative randomness. 
                      In a world of rigid workflows and predictable software, we believe there's beauty and utility in embracing a little chaos.
                    </p>
                    <p className="text-[#382f29] text-base leading-relaxed">
                      Our suite of AI-powered tools is designed to help you break free from conventional thinking, streamline your daily tasks, 
                      and discover new ways to be productive. From text summarization to background removal, from productivity planning to 
                      real terminal environments, we've gathered the tools you didn't know you needed.
                    </p>
                  </div>

                  {/* Our Mission */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 p-6">
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">Our Mission</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      To democratize access to powerful AI tools and utilities that enhance human creativity and productivity. 
                      We believe that everyone should have access to the tools that can help them focus on what truly matters, living their best life.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 mx-auto mb-3 text-[#e67722]">
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </div>
                        <h3 className="text-[#382f29] font-semibold mb-2">Innovation</h3>
                        <p className="text-[#5a5a5a] text-sm">Constantly evolving with cutting-edge AI technology</p>
                      </div>
                      <div className="text-center p-4">
                        <div className="w-12 h-12 mx-auto mb-3 text-[#e67722]">
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                        <h3 className="text-[#382f29] font-semibold mb-2">Simplicity</h3>
                        <p className="text-[#5a5a5a] text-sm">Complex tools made simple and accessible</p>
                      </div>
                      <div className="text-center p-4">
                        <div className="w-12 h-12 mx-auto mb-3 text-[#e67722]">
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.49 1.49 0 0 0 18.54 8H16c-.8 0-1.54.37-2.01 1l-2.54 3.45a1.48 1.48 0 0 0 .27 2.09L15 17v5h1zm-8.5-10l-2.5 6v4h2v-3l2.5-6L11 11.5H8.5z"/>
                          </svg>
                        </div>
                        <h3 className="text-[#382f29] font-semibold mb-2">Empowerment</h3>
                        <p className="text-[#5a5a5a] text-sm">Helping you achieve more with less effort</p>
                      </div>
                    </div>
                  </div>

                  {/* About the Creator */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 p-6">
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">About the Creator</h2>
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-gradient-to-r from-[#e67722] to-[#d66320] rounded-full flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">EB</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[#382f29] text-xl font-semibold mb-2">Eugene Boondock</h3>
                        <p className="text-[#382f29] text-base leading-relaxed mb-4">
                          Eugene is the founder and visionary behind Entropy Suite and Boondock Labs. With a passion for AI technology 
                          and a belief that the best solutions often come from unexpected places, Eugene created this suite of tools 
                          to help people break free from conventional workflows.
                        </p>
                        <p className="text-[#382f29] text-base leading-relaxed mb-4">
                          Eugene also created <a 
                            href="https://earthie.world" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#e67722] hover:text-[#d66320] transition-colors duration-200 font-semibold"
                          >
                            Earthie.world
                          </a>, a comprehensive platform designed for the Earth2 community. This platform features numerous tools 
                          and resources to enhance the Earth2 experience, demonstrating Eugene's commitment to building specialized 
                          solutions for niche communities.
                        </p>
                        <p className="text-[#382f29] text-base leading-relaxed">
                          Based in South Africa, Eugene continues to explore the intersection of artificial intelligence, creativity, 
                          and productivity, always looking for new ways to make powerful technology accessible to everyone.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Technology Stack */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 p-6">
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">Built with Modern Technology</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-6">
                      Entropy Suite is built using cutting-edge web technologies and AI services to ensure fast, 
                      reliable, and secure experiences for all our users.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white/20 rounded-lg">
                        <div className="text-[#e67722] text-2xl mb-2">⚛️</div>
                        <span className="text-[#382f29] text-sm font-medium">React</span>
                      </div>
                      <div className="text-center p-3 bg-white/20 rounded-lg">
                        <div className="text-[#e67722] text-2xl mb-2">🤖</div>
                        <span className="text-[#382f29] text-sm font-medium">AI Powered</span>
                      </div>
                      <div className="text-center p-3 bg-white/20 rounded-lg">
                        <div className="text-[#e67722] text-2xl mb-2">☁️</div>
                        <span className="text-[#382f29] text-sm font-medium">Cloud Native</span>
                      </div>
                      <div className="text-center p-3 bg-white/20 rounded-lg">
                        <div className="text-[#e67722] text-2xl mb-2">🔒</div>
                        <span className="text-[#382f29] text-sm font-medium">Secure</span>
                      </div>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="bg-gradient-to-r from-[#e67722]/20 to-[#d66320]/20 backdrop-blur-sm rounded-xl border border-[#e67722]/30 p-6 text-center">
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-6">
                      Join thousands of users who have already discovered the power of Entropy Suite's AI-driven tools.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link 
                        to="/tools"
                        className="inline-flex items-center justify-center px-6 py-3 bg-[#e67722] text-white font-semibold rounded-lg hover:bg-[#d66320] transition-colors duration-200"
                      >
                        Explore Tools
                      </Link>
                      <Link 
                        to="/contact"
                        className="inline-flex items-center justify-center px-6 py-3 bg-white/20 text-[#382f29] font-semibold rounded-lg hover:bg-white/30 transition-colors duration-200 border border-[#382f29]/20"
                      >
                        Get in Touch
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 