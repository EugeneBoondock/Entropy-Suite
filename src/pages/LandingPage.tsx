import React, { useState } from "react";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#f6f0e4] group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex flex-col sm:flex-row items-center sm:items-stretch justify-between whitespace-nowrap border-b border-solid border-b-[#382f29] px-4 sm:px-10 py-3 gap-3 sm:gap-0 relative">
  {/* Mobile Hamburger */}
  <button
    className="sm:hidden absolute right-4 top-4 z-20 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e67722]"
    aria-label="Open navigation menu"
    onClick={() => setNavOpen((v) => !v)}
  >
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#382f29" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>
          <div className="flex items-center gap-2 sm:gap-4 text-[#382f29] self-start sm:self-auto">
            <div className="size-10 sm:size-12 flex items-center"><img src="/images/entropy_tools.png" alt="Entropy Tools Logo" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" /></div>
            <h2 className="text-[#382f29] text-base sm:text-lg font-bold leading-tight tracking-[-0.015em]">Entropy Tools</h2>
          </div>
          {/* Desktop Nav */}
<div className="hidden sm:flex flex-1 justify-end gap-4 sm:gap-8 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-9">
              <a className="text-[#382f29] text-sm font-medium leading-normal" href="#">Tools</a>
              <Link className="text-[#382f29] text-sm font-medium leading-normal" to="/pricing">Pricing</Link>
              <a className="text-[#382f29] text-sm font-medium leading-normal" href="#">Blog</a>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e67722] text-[#382f29] text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Get started</span>
              </button>
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#382f29] text-[#e6c8b1] text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Log in</span>
              </button>
            </div>
          </div>
        {/* Mobile Dropdown Nav */}
{navOpen && (
  <div className="sm:hidden absolute left-0 top-full w-full bg-[#f6f0e4] shadow-lg border-b border-[#382f29] z-10 animate-fade-in">
    <nav className="flex flex-col items-center gap-2 py-4">
      <a className="text-[#382f29] text-base font-medium py-2 w-full text-center hover:bg-[#e6c8b1]" href="#">Tools</a>
      <Link className="text-[#382f29] text-base font-medium py-2 w-full text-center hover:bg-[#e6c8b1]" to="/pricing">Pricing</Link>
      <a className="text-[#382f29] text-base font-medium py-2 w-full text-center hover:bg-[#e6c8b1]" href="#">Blog</a>
      <div className="flex gap-2 mt-2">
        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e67722] text-[#382f29] text-sm font-bold leading-normal tracking-[0.015em]">
          <span className="truncate">Get started</span>
        </button>
        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#382f29] text-[#e6c8b1] text-sm font-bold leading-normal tracking-[0.015em]">
          <span className="truncate">Log in</span>
        </button>
      </div>
    </nav>
  </div>
)}
</header>
        <div className="px-2 sm:px-4 md:px-10 lg:px-20 flex flex-1 justify-center py-2 sm:py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="@container">
              <div className="p-2 sm:p-4">
                <div
                  className="flex min-h-[320px] sm:min-h-[400px] md:min-h-[480px] flex-col gap-4 sm:gap-6 md:gap-8 bg-cover bg-center bg-no-repeat sm:rounded-xl items-center justify-center p-2 sm:p-4"
                  style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.12) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAXqCZwuBEvenkYPSTmcUG59eeZcteFTB-ngU3R68hqeEyYY7Urtcu-PO5viIp9O--8Isj6qF3Meps9f4NQrQ4iiW22Js-yc13zkXwpm2sz5YLgmevw6mCYWwJTXn0Nvsoh3DGoL0BEfEL13wB4m1qy3xbNr4mn9Tl25phsVqQsJG4VpCWF6HqnteUi6wBL3wv1kLzS1dY6WUiLWeo18YRBDi6rcENzKGJDRuFDpOLrWFIH0MCYNOYiTkMPPC8NlYCeZV9mtQsy61LW")' }}
                >
                  <div className="flex flex-col gap-2 text-center">
                    <h1
                      className="text-[#5d4633] text-2xl font-black leading-tight tracking-[-0.02em] sm:text-3xl md:text-4xl lg:text-5xl sm:tracking-[-0.033em]"
                    >
                      Unleash the Power of Randomness with Entropy Tools
                    </h1>
                    <h2 className="text-[#5d4633] text-base font-normal leading-normal sm:text-lg md:text-xl lg:text-2xl max-w-xl mx-auto">
                      Discover a diverse collection of AI-powered tools designed for everyday use. From converting documents to generating presentations, Entropy Tools offers a unique blend of functionality and creativity.
                    </h2>
                  </div>
                  <button
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#e67722] text-[#382f29] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]"
                  >
                    <span className="truncate">Explore Tools</span>
                  </button>
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
                  Entropy Tools provides a wide array of AI-driven utilities to simplify your daily tasks and spark creativity.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-0">
                <Link to="/editor" style={{ textDecoration: 'none' }}>
  <div className="flex flex-1 gap-3 rounded-lg border border-[#53463c] bg-[#f6f0e4] p-4 flex-col hover:ring-2 hover:ring-[#e67722] transition-shadow">
    <div className="text-[#382f29]" data-icon="File" data-size="24px" data-weight="regular">
      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
        <path
          d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"
        ></path>
      </svg>
    </div>
    <div className="flex flex-col gap-1">
      <h2 className="text-[#382f29] text-base font-bold leading-tight">Text to Presentation</h2>
      <p className="text-[#b8a99d] text-sm font-normal leading-normal">Transform text into engaging presentations with AI-powered design.</p>
    </div>
  </div>
</Link>
                <div className="flex flex-1 gap-3 rounded-lg border border-[#53463c] bg-[#f6f0e4] p-4 flex-col">
                  <div className="text-[#382f29]" data-icon="Presentation" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M216,40H136V24a8,8,0,0,0-16,0V40H40A16,16,0,0,0,24,56V176a16,16,0,0,0,16,16H79.36L57.75,219a8,8,0,0,0,12.5,10l29.59-37h56.32l29.59,37a8,8,0,1,0,12.5-10l-21.61-27H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,136H40V56H216V176Z"
                      ></path>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-[#382f29] text-base font-bold leading-tight">Text to Explanation Videos</h2>
                    <p className="text-[#b8a99d] text-sm font-normal leading-normal">Generate informative explanation videos from text input.</p>
                  </div>
                </div>
                <div className="flex flex-1 gap-3 rounded-lg border border-[#53463c] bg-[#f6f0e4] p-4 flex-col">
                  <div className="text-[#382f29]" data-icon="Video" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M164.44,105.34l-48-32A8,8,0,0,0,104,80v64a8,8,0,0,0,12.44,6.66l48-32a8,8,0,0,0,0-13.32ZM120,129.05V95l25.58,17ZM216,40H40A16,16,0,0,0,24,56V168a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,128H40V56H216V168Zm16,40a8,8,0,0,1-8,8H32a8,8,0,0,1,0-16H224A8,8,0,0,1,232,208Z"
                      ></path>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-[#382f29] text-base font-bold leading-tight">Text to Word/Docx</h2>
                    <p className="text-[#b8a99d] text-sm font-normal leading-normal">Create well-designed Word and Docx documents from text.</p>
                  </div>
                </div>
                <div className="flex flex-1 gap-3 rounded-lg border border-[#53463c] bg-[#f6f0e4] p-4 flex-col">
                  <div className="text-[#382f29]" data-icon="TextB" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M170.48,115.7A44,44,0,0,0,140,40H72a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8h80a48,48,0,0,0,18.48-92.3ZM80,56h60a28,28,0,0,1,0,56H80Zm72,136H80V128h72a32,32,0,0,1,0,64Z"
                      ></path>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-[#382f29] text-base font-bold leading-tight">Document Conversion</h2>
                    <p className="text-[#b8a99d] text-sm font-normal leading-normal">Seamlessly convert documents between various formats, including PDF.</p>
                  </div>
                </div>
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
              <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3">
                <div className="flex flex-col gap-3 pb-3">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBTvl1odmqD0XxwaRdx8SOzjGXzV2YHMWt4_lkeCEYVUlZ9GBrGzQTtdVnz7hGU0iOooyVgIF8STYyvGJteR7xNIOTK1_u8ks3IxYERMsLecOBH0xIUx-ZMRVbBI13n-kBEb1nhascPxscPkqPCVEQxP44du15MDNwrXf6Xkw_t2HH7-XRcDFjxynfbu9wqzc6c6UZAzS-l8Vqe4RGFs47W8jxDCO-yoQNa3MwaK5Sfdp0nVuL0oZM40aC04-qyM2FUA6UskFBcrk_6")' }}
                  ></div>
                  <div>
                    <p className="text-[#382f29] text-base font-medium leading-normal">Creative Content Generation</p>
                    <p className="text-[#b8a99d] text-sm font-normal leading-normal">Generate unique content, from presentations to videos, with AI assistance.</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 pb-3">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA0CwKPpFBeAlucCVY6LALvb1vMFgE6H7igDjCK9WeDQJu_qMZeNnTznRFEuFFsmO2MuZcBIeJuUg7CkW1-9pZTxQQQbrJGBMFS5Ih9chUmO22fccXZ1Ikc51Xx-B9ObMyk3zZxhOfZv2thDOkv6r1pExdnIyZK1gt_rfGiRfVNRdb4yEg9-uu-MKZoPV-3PesG8OFXjo1cF8H-ZLthkbj9VAKCoC0io83566c8n9PUy0EQU13FdQA8wmup2SH9vRTGNBahBXzXqD-G")' }}
                  ></div>
                  <div>
                    <p className="text-[#382f29] text-base font-medium leading-normal">Document Management</p>
                    <p className="text-[#b8a99d] text-sm font-normal leading-normal">Effortlessly manage and convert documents with intuitive tools.</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 pb-3">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuByWI9ovSB8uSquHS7TDKjUJ4veYQ2_QPV3VlTrDkxBluNxPTl7Myg32guTXRsEA1o00gHBL25sgi6j-8pgewowzNasR6BV-JRLajoSY9v47lWlEOH9COwbRFwGY-jF6tV2qJRyavsRuWeGjodL7VElVkIXW8RN4DFatXTxMRTUFCcMLnbCmgDVIXBBDZueGSXaVWP_SU3oa8kpWn5KkHzufFXuQ77hR-bgZRIzCZWdLpPPawTnEQA8p7zN4pWkPsmWKs300nt2I61m")' }}
                  ></div>
                  <div>
                    <p className="text-[#382f29] text-base font-medium leading-normal">Everyday Utilities</p>
                    <p className="text-[#b8a99d] text-sm font-normal leading-normal">Find a variety of useful tools for everyday tasks, powered by AI.</p>
                  </div>
                </div>
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
                  <p className="text-[#382f29] text-base font-normal leading-normal max-w-[720px]">Sign up today and unlock the full potential of Entropy Tools.</p>
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
              <p className="text-[#b8a99d] text-base font-normal leading-normal">© 2024 Entropy Tools. All rights reserved.</p>
            </footer>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
