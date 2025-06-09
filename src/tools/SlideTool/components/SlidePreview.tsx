import React from 'react';
import { Slide, Theme } from '../types';

interface SlidePreviewProps {
  slide: Slide;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  index: number;
  theme: Theme; // Not directly used for styling here, but good for consistency if needed
}

export const SlidePreview: React.FC<SlidePreviewProps> = ({ slide, isActive, onClick, onDelete, index }) => {
  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent onClick for the preview itself
    onDelete();
  };

  
  return (
    <div
      onClick={onClick}
      className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-150 ease-in-out border-2
                  ${isActive 
                    ? 'bg-primary-600 dark:bg-primary-700 text-white shadow-xl scale-103 border-primary-700 dark:border-primary-500 ring-2 ring-primary-300 dark:ring-primary-600 ring-offset-2 ring-offset-slate-800 dark:ring-offset-slate-900' 
                    : 'bg-slate-700 dark:bg-slate-800 hover:bg-slate-600 dark:hover:bg-slate-700 text-slate-300 dark:text-slate-400 hover:text-white dark:hover:text-slate-200 border-slate-600 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-600'
                  }`}
      role="button"
      aria-pressed={isActive}
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      title={`Slide ${index + 1}: ${slide.title || "Untitled Slide"}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-grow min-w-0"> {/* Added min-w-0 for better truncation */}
          <p className={`text-xs ${isActive ? 'text-primary-200 dark:text-primary-300' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-200 dark:group-hover:text-slate-300'} transition-colors mb-0.5`}>{`Slide ${index + 1}`}</p>
          <h3 className="font-semibold text-sm truncate pr-6">
            {slide.title || "Untitled Slide"}
          </h3>
        </div>
      </div>
      <button
        onClick={handleDelete}
        className={`absolute top-1.5 right-1.5 p-1 rounded-full 
                    ${isActive ? 'text-primary-100 dark:text-primary-200 hover:text-red-200 dark:hover:text-red-300 hover:bg-primary-500 dark:hover:bg-primary-600' : 'text-slate-400 dark:text-slate-500 hover:text-red-400 dark:hover:text-red-300 hover:bg-slate-500 dark:hover:bg-slate-600'}
                    group-hover:opacity-100 transition-opacity duration-150
                    ${isActive ? 'opacity-100' : 'opacity-0 focus:opacity-100'}`}
        title={`Delete Slide ${index + 1}`}
        aria-label={`Delete Slide ${index + 1}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
       <p className={`mt-1 text-xs ${isActive ? 'text-primary-200 dark:text-primary-300' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-300 dark:group-hover:text-slate-400'} transition-colors truncate`}>
        {slide.content.split('\n')[0].replace(/^- /, '').substring(0, 40) || "No content..."}
        {slide.content.length > 40 ? "..." : ""}
      </p>
    </div>
  );
};