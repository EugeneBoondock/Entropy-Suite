import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import MCPLitePage from './pages/MCPLitePage';
import MCPGalleryPage from './pages/MCPGalleryPage';
import DataAnalysisPage from './pages/DataAnalysisPage';
import RealTerminalPageNew from './pages/RealTerminalPageNew';
import SummarizerPage from './pages/SummarizerPage';
import TerminalPage from './pages/TerminalPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import UnihelperPage from './pages/UnihelperPage';
import UnitConverterPage from './pages/UnitConverterPage';
import VideoGeneratorPage from './pages/VideoGeneratorPage';
import VideoTrimmerPage from './pages/VideoTrimmerPage';
import YouTubeDownloaderPage from './pages/YouTubeDownloaderPage';
import PlagiarismCheckerPage from './pages/PlagiarismCheckerPage';
import ScrollToTop from './components/ScrollToTop';
import './../index.css';

const RealTerminalPage = React.lazy(() => import('./pages/RealTerminalPage'));

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/mcp-lite" element={<MCPLitePage />} />
        <Route path="/mcp-gallery" element={<MCPGalleryPage />} />
        <Route path="/data-analysis" element={<DataAnalysisPage />} />
        <Route path="/real-terminal" element={<Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading Terminal...</div>}><RealTerminalPage /></Suspense>} />
        <Route path="/real-terminal-new" element={<RealTerminalPageNew />} />
        <Route path="/youtube-downloader" element={<YouTubeDownloaderPage />} />
        <Route path="/plagiarism-checker" element={<PlagiarismCheckerPage />} />
        <Route path="/summarizer" element={<SummarizerPage />} />
        <Route path="/terminal" element={<TerminalPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/unihelper" element={<UnihelperPage />} />
        <Route path="/unit-converter" element={<UnitConverterPage />} />
        <Route path="/video-generator" element={<VideoGeneratorPage />} />
        <Route path="/video-trimmer" element={<VideoTrimmerPage />} />
      </Routes>
      <ScrollToTop />
    </Router>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
