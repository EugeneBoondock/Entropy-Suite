import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

const Navbar: React.FC = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then((res: any) => {
      const email = (res.data?.user as { email?: string } | null)?.email || null;
      setUserEmail(email);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_: string, session: any) => {
      setUserEmail(session?.user?.email || null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      {/* Fixed/Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex flex-col sm:flex-row items-center sm:items-stretch justify-between whitespace-nowrap border-b border-solid border-b-[#382f29]/10 px-4 sm:px-10 py-3 gap-3 sm:gap-0 bg-white/30 backdrop-blur-xl min-h-[4rem]" style={{ fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
        {/* Mobile Hamburger */}
        <button
          className="sm:hidden absolute right-4 top-4 z-20 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e67722] transition-colors duration-200"
          aria-label="Open navigation menu"
          onClick={() => setNavOpen((v) => !v)}
        >
          {navOpen ? (
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#382f29" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#382f29" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        <Link to="/" className="flex items-center gap-2 sm:gap-4 text-[#382f29] self-start sm:self-auto" onClick={() => setNavOpen(false)}>
          <div className="size-10 sm:size-12 flex items-center">
            <img src="/images/entropy_tools.png" alt="Entropy Suite Logo" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
          </div>
          <h2 className="text-[#382f29] text-base sm:text-lg font-bold leading-tight tracking-[-0.015em]">Entropy Suite</h2>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden sm:flex flex-1 justify-end gap-4 sm:gap-8 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-9">
            <Link className="text-[#382f29] text-sm font-medium leading-normal hover:text-[#e67722] transition-colors duration-200" to="/tools">Tools</Link>
            <Link className="text-[#382f29] text-sm font-medium leading-normal hover:text-[#e67722] transition-colors duration-200" to="/pricing">Pricing</Link>
            <Link className="text-[#382f29] text-sm font-medium leading-normal hover:text-[#e67722] transition-colors duration-200" to="/blog">Blog</Link>
            <a 
              href="https://coff.ee/eugeneboondock" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#382f29] text-sm font-medium leading-normal hover:text-[#e67722] transition-colors duration-200 flex items-center gap-1"
            >
              ☕ Coffee
            </a>
            {userEmail ? (
              <>
                <Link className="text-[#382f29] text-sm font-medium leading-normal hover:text-[#e67722] transition-colors duration-200" to="/dashboard">Dashboard</Link>
                <button
                  className="text-[#382f29] text-sm font-medium leading-normal hover:text-[#e67722] transition-colors duration-200"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate("/");
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link className="text-[#382f29] text-sm font-medium leading-normal hover:text-[#e67722] transition-colors duration-200" to="/login">Login</Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {navOpen && (
        <div 
          className="sm:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setNavOpen(false)}
        />
      )}

      {/* Mobile Dropdown Nav - Fixed Overlay */}
      {navOpen && (
        <div className="sm:hidden fixed top-16 left-0 right-0 z-50 bg-white/20 backdrop-blur-xl shadow-xl border-b border-[#382f29]/10 transition-all duration-300 ease-out">
          <nav className="flex flex-col items-center gap-1 py-4 px-4">
            <Link 
              className="text-[#382f29] text-base font-medium py-3 w-full text-center hover:bg-[#e67722]/20 rounded-lg transition-all duration-200" 
              to="/tools"
              onClick={() => setNavOpen(false)}
            >
              Tools
            </Link>
            <Link 
              className="text-[#382f29] text-base font-medium py-3 w-full text-center hover:bg-[#e67722]/20 rounded-lg transition-all duration-200" 
              to="/pricing"
              onClick={() => setNavOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              className="text-[#382f29] text-base font-medium py-3 w-full text-center hover:bg-[#e67722]/20 rounded-lg transition-all duration-200" 
              to="/blog"
              onClick={() => setNavOpen(false)}
            >
              Blog
            </Link>
            <a 
              href="https://www.buymeacoffee.com/entropytoolsai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#382f29] text-base font-medium py-3 w-full text-center hover:bg-[#e67722]/20 rounded-lg transition-all duration-200"
              onClick={() => setNavOpen(false)}
            >
              ☕ Buy me a coffee
            </a>
            {userEmail ? (
              <>
                <Link
                  className="text-[#382f29] text-base font-medium py-3 w-full text-center hover:bg-[#e67722]/20 rounded-lg transition-all duration-200"
                  to="/dashboard"
                  onClick={() => setNavOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate("/");
                    setNavOpen(false);
                  }}
                  className="text-[#382f29] text-base font-medium py-3 w-full text-center hover:bg-[#e67722]/20 rounded-lg transition-all duration-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                className="text-[#382f29] text-base font-medium py-3 w-full text-center hover:bg-[#e67722]/20 rounded-lg transition-all duration-200"
                to="/login"
                onClick={() => setNavOpen(false)}
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
};

export default Navbar; 