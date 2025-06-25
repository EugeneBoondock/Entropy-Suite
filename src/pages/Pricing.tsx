import React from "react";
import { Link } from "react-router-dom";

const Pricing: React.FC = () => {
  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#161412] group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#35302c] px-10 py-3">
          <div className="flex items-center gap-4 text-white">
            <div className="size-12 flex items-center">
              <img src="/images/entropy_tools.png" alt="Entropy Suite Logo" className="h-12 w-12 object-contain" />
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Entropy Tools</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a className="text-white text-sm font-medium leading-normal" href="#">Home</a>
              <a className="text-white text-sm font-medium leading-normal" href="#">Tools</a>
              <Link className="text-white text-sm font-medium leading-normal" to="/pricing">Pricing</Link>
              <a className="text-white text-sm font-medium leading-normal" href="#">Contact</a>
            </div>
            <div className="flex gap-2">
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e6c8b1] text-[#161412] text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Sign up</span>
              </button>
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#35302c] text-[#e6c8b1] text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Log in</span>
              </button>
            </div>
          </div>
        </header>
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">Choose the plan that's right for you</p>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(228px,1fr))] gap-2.5 px-4 py-3 @3xl:grid-cols-4">
              {/* Plan 1 */}
              <div className="flex flex-1 flex-col gap-4 rounded-xl border border-solid border-[#4f4640] bg-[#24211e] p-6">
                <div className="flex flex-col gap-1">
                  <h1 className="text-white text-base font-bold leading-tight">R50</h1>
                  <p className="flex items-baseline gap-1 text-white">
                    <span className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">R50</span>
                    <span className="text-white text-base font-bold leading-tight">/month</span>
                  </p>
                </div>
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#35302c] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Choose Plan</span>
                </button>
                <div className="flex flex-col gap-2">
                  <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                    <div className="text-white" data-icon="Check" data-size="20px" data-weight="regular">
                      {/* SVG Check */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                    </div>
                    Access to basic tools
                  </div>
                  <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                    <div className="text-white" data-icon="Check" data-size="20px" data-weight="regular">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                    </div>
                    Limited usage
                  </div>
                  <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                    <div className="text-white" data-icon="Check" data-size="20px" data-weight="regular">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                    </div>
                    Community support
                  </div>
                </div>
              </div>
              {/* Plan 2 */}
              <div className="flex flex-1 flex-col gap-4 rounded-xl border border-solid border-[#4f4640] bg-[#24211e] p-6">
                <div className="flex flex-col gap-1">
                  <h1 className="text-white text-base font-bold leading-tight">R100</h1>
                  <p className="flex items-baseline gap-1 text-white">
                    <span className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">R100</span>
                    <span className="text-white text-base font-bold leading-tight">/month</span>
                  </p>
                </div>
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#35302c] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Choose Plan</span>
                </button>
                <div className="flex flex-col gap-2">
                  <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                    <div className="text-white" data-icon="Check" data-size="20px" data-weight="regular">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                    </div>
                    Access to all tools
                  </div>
                  <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                    <div className="text-white" data-icon="Check" data-size="20px" data-weight="regular">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                    </div>
                    Standard usage
                  </div>
                  <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                    <div className="text-white" data-icon="Check" data-size="20px" data-weight="regular">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                    </div>
                    Priority support
                  </div>
                </div>
              </div>
              {/* Plan 3 */}
              <div className="flex flex-1 flex-col gap-4 rounded-xl border border-solid border-[#4f4640] bg-[#24211e] p-6">
                <div className="flex flex-col gap-1">
                  <h1 className="text-white text-base font-bold leading-tight">R200</h1>
                  <p className="flex items-baseline gap-1 text-white">
                    <span className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">R200</span>
                    <span className="text-white text-base font-bold leading-tight">/month</span>
                  </p>
                </div>
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#35302c] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Choose Plan</span>
                </button>
                <div className="flex flex-col gap-2">
                  <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                    <div className="text-white" data-icon="Check" data-size="20px" data-weight="regular">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                    </div>
                    Unlimited access to all tools
                  </div>
                  <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                    <div className="text-white" data-icon="Check" data-size="20px" data-weight="regular">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                    </div>
                    Unlimited usage
                  </div>
                  <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                    <div className="text-white" data-icon="Check" data-size="20px" data-weight="regular">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                    </div>
                    Dedicated support
                  </div>
                </div>
              </div>
              {/* Plan 4: Enterprise */}
              <div className="flex flex-1 flex-col gap-4 rounded-xl border border-solid border-[#4f4640] bg-[#24211e] p-6">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <h1 className="text-white text-base font-bold leading-tight">Enterprise</h1>
                    <p className="text-[#161412] text-xs font-medium leading-normal tracking-[0.015em] rounded-full bg-[#e6c8b1] px-3 py-[3px] text-center">Best for Teams</p>
                  </div>
                  <span className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Contact Us</span>
                </div>
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#35302c] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Contact Sales</span>
                </button>
                <div className="flex flex-col gap-2">
                  <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                    <div className="text-white" data-icon="Check" data-size="20px" data-weight="regular">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                    </div>
                    Custom solutions
                  </div>
                  <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                    <div className="text-white" data-icon="Check" data-size="20px" data-weight="regular">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                    </div>
                    Scalable pricing
                  </div>
                  <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                    <div className="text-white" data-icon="Check" data-size="20px" data-weight="regular">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                    </div>
                    Dedicated account manager
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
                <a className="text-[#b3aaa2] text-base font-normal leading-normal min-w-40" href="#">About</a>
                <a className="text-[#b3aaa2] text-base font-normal leading-normal min-w-40" href="#">Contact</a>
                <a className="text-[#b3aaa2] text-base font-normal leading-normal min-w-40" href="#">Privacy Policy</a>
                <a className="text-[#b3aaa2] text-base font-normal leading-normal min-w-40" href="#">Terms of Service</a>
              </div>
              <p className="text-[#b3aaa2] text-base font-normal leading-normal">@2024 Entropy Tools. All rights reserved.</p>
            </footer>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Pricing;
