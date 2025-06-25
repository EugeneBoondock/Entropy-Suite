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
      <Link to="/" className="flex items-center gap-2 sm:gap-4 text-[#382f29] self-start sm:self-auto">
        <div className="size-10 sm:size-12 flex items-center"><img src="/images/entropy_tools.png" alt="Entropy Suite Logo" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" /></div>
        <h2 className="text-[#382f29] text-base sm:text-lg font-bold leading-tight tracking-[-0.015em]">Entropy Suite</h2>
      </Link>
      {/* Desktop Nav */}
      <div className="hidden sm:flex flex-1 justify-end gap-4 sm:gap-8 w-full sm:w-auto">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-9">
          <Link className="text-[#382f29] text-sm font-medium leading-normal" to="/tools">Tools</Link>
          <Link className="text-[#382f29] text-sm font-medium leading-normal" to="/pricing">Pricing</Link>
          <a className="text-[#382f29] text-sm font-medium leading-normal" href="#">Blog</a>
          {userEmail ? (
            <button
              className="text-[#382f29] text-sm font-medium leading-normal"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/");
              }}
            >
              Sign Out
            </button>
          ) : (
            <Link className="text-[#382f29] text-sm font-medium leading-normal" to="/login">Login</Link>
          )}
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
            <Link className="text-[#382f29] text-base font-medium py-2 w-full text-center hover:bg-[#e6c8b1]" to="/tools">Tools</Link>
            <Link className="text-[#382f29] text-base font-medium py-2 w-full text-center hover:bg-[#e6c8b1]" to="/pricing">Pricing</Link>
            <a className="text-[#382f29] text-base font-medium py-2 w-full text-center hover:bg-[#e6c8b1]" href="#">Blog</a>
            {userEmail ? (
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate("/");
                  setNavOpen(false);
                }}
                className="text-[#382f29] text-base font-medium py-2 w-full text-center hover:bg-[#e6c8b1]"
              >
                Sign Out
              </button>
            ) : (
              <Link
                className="text-[#382f29] text-base font-medium py-2 w-full text-center hover:bg-[#e6c8b1]"
                to="/login"
                onClick={() => setNavOpen(false)}
              >
                Login
              </Link>
            )}
            <div className="flex gap-2 mt-2">
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e67722] text-[#382f29] text-sm font-bold leading-normal tracking-[0.015em]">
                <span className="truncate">Get started</span>
              </button>
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#382f29] text-[#e6c8b1] text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Log in</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar; 