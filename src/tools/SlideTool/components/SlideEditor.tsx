import React, { useState, useEffect, useMemo } from 'react';
import { Slide, Theme } from '../types';

interface SlideEditorProps {
  slide: Slide;
  slideNumber: number;
  totalSlides: number;
  onUpdateSlide: (updatedSlideData: Partial<Slide>) => void;
  theme: Theme;
}

const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};

export const SlideEditor: React.FC<SlideEditorProps> = ({ slide, slideNumber, totalSlides, onUpdateSlide, theme }) => {
  const [localSlide, setLocalSlide] = useState<Slide>(slide);

  useEffect(() => {
    // When the slide prop changes, update localSlide.
    // Also, pre-fill imageDescription from imageQuery if imageDescription is empty.
    setLocalSlide(prevLocal => ({
      ...slide,
      imageDescription: slide.imageDescription || slide.imageQuery || prevLocal.imageDescription || ''
    }));
  }, [slide]);

  const debouncedUpdate = useMemo(() => debounce(onUpdateSlide, 500), [onUpdateSlide]);

  const handleChange = <K extends keyof Slide>(field: K, value: Slide[K]) => {
    const updatedSlide = { ...localSlide, [field]: value };
    setLocalSlide(updatedSlide);
    if (field === 'title' || field === 'content' || field === 'imageUrl' || field === 'imageDescription' || field === 'backgroundColor' || field === 'textColor') {
      debouncedUpdate({ [field]: value });
    } else {
      onUpdateSlide({ [field]: value }); // Update immediately for selects, numbers
    }
  };
  
  const renderFormattedContent = (text: string, slideTextColor?: string) => {
    const defaultColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
    const textColorStyle = slideTextColor ? { color: slideTextColor } : {};
    const textClass = `text-sm md:text-base lg:text-lg leading-relaxed mb-2 ${!slideTextColor ? defaultColor : ''}`;

    // Process markdown-like formatting
    const processMarkdown = (content: string) => {
      // Handle **bold**, *italic*, and `code`
      let processed = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **bold**
        .replace(/\*(.*?)\*/g, '<em>$1</em>')                 // *italic*
        .replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 rounded">$1</code>') // `code`
        .replace(/~~(.*?)~~/g, '<s>$1</s>')                    // ~~strikethrough~~
        .replace(/__(.*?)__/g, '<u>$1</u>');                   // __underline__

      return processed;
    };

    // Split by double newlines first to handle paragraphs
    const paragraphs = text.split(/\n\s*\n/);
    
    return paragraphs.map((paragraph, pIndex) => {
      if (!paragraph.trim()) return null;
      
      // Handle bullet points
      if (paragraph.trim().startsWith('- ')) {
        const items = paragraph.split('\n').filter(line => line.trim().startsWith('- '));
        return (
          <ul key={`p-${pIndex}`} className={`mb-2 ${!slideTextColor ? defaultColor : ''}`} style={textColorStyle}>
            {items.map((item, i) => (
              <li 
                key={`${pIndex}-${i}`} 
                className="ml-5 list-disc"
                dangerouslySetInnerHTML={{ 
                  __html: processMarkdown(item.substring(2).trim()) 
                }} 
              />
            ))}
          </ul>
        );
      }
      
      // Handle numbered lists (1. 2. etc.)
      if (/^\d+\.\s+/.test(paragraph.trim())) {
        const items = paragraph.split('\n').filter(line => /^\d+\.\s+/.test(line.trim()));
        return (
          <ol key={`p-${pIndex}`} className={`list-decimal ml-5 mb-2 ${!slideTextColor ? defaultColor : ''}`} style={textColorStyle}>
            {items.map((item, i) => (
              <li 
                key={`${pIndex}-${i}`}
                dangerouslySetInnerHTML={{ 
                  __html: processMarkdown(item.replace(/^\d+\.\s+/, '').trim()) 
                }} 
              />
            ))}
          </ol>
        );
      }
      
      // Handle regular paragraphs with markdown
      return (
        <p 
          key={`p-${pIndex}`} 
          className={textClass} 
          style={textColorStyle}
          dangerouslySetInnerHTML={{ __html: processMarkdown(paragraph) }}
        />
      );
    });
  };

  const editorLabelStyle = `block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`;
  const editorInputStyle = `w-full p-2 border rounded-md text-sm ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-primary-500 focus:border-primary-500' : 'bg-[#f7f0e4] border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-primary-500 focus:border-primary-500'}`;
  const editorSelectStyle = editorInputStyle;
  
  const slidePreviewBgColor = localSlide.backgroundColor || (theme === 'dark' ? '#334155' : '#E2E8F0'); // slate-700 or slate-200
  const slidePreviewTextColor = localSlide.textColor || (theme === 'dark' ? '#F1F5F9' : '#1E293B'); // slate-100 or slate-800

  const renderLayoutPreview = () => {
    const titleElement = <h3 className="font-bold text-sm sm:text-base md:text-lg break-words p-1 sm:p-2" style={{ color: slidePreviewTextColor }}>{localSlide.title || "Slide Title"}</h3>;
    const contentElement = <div className="text-[10px] sm:text-xs md:text-sm p-1 sm:p-2 overflow-y-auto max-h-24 sm:max-h-32 md:max-h-48 custom-scrollbar" style={{ color: slidePreviewTextColor }}>{renderFormattedContent(localSlide.content || "- Point 1\n- Point 2", slidePreviewTextColor)}</div>;
    const imageElement = localSlide.imageUrl ? 
        <img src={localSlide.imageUrl} alt={localSlide.imageDescription || localSlide.title || "Slide image"} className="object-contain w-full h-full max-h-full" onError={(e) => (e.currentTarget.style.display = 'none')} /> : 
        <div className="w-full h-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs">No Image URL / Error loading</div>;

    switch (localSlide.layout) {
      case 'text-image-right':
        return <div className="flex flex-col w-full h-full gap-1 sm:gap-2">
                 <div className="w-full sm:w-1/2 flex flex-col justify-center">{titleElement}{contentElement}</div>
                 <div className="w-full sm:w-1/2 flex items-center justify-center">{imageElement}</div>
               </div>;
      case 'text-image-left':
        return <div className="flex flex-col-reverse w-full h-full gap-1 sm:gap-2">
                 <div className="w-full sm:w-1/2 flex items-center justify-center">{imageElement}</div>
                 <div className="w-full sm:w-1/2 flex flex-col justify-center">{titleElement}{contentElement}</div>
               </div>;
      case 'image-only':
        return <div className="w-full h-full flex items-center justify-center">{imageElement}</div>;
      case 'title-only':
        return <div className="w-full h-full flex flex-col items-center justify-center p-2">{titleElement}</div>;
      case 'image-title-overlay':
        return <div className="relative w-full h-full">
                  <div className="absolute inset-0 flex items-center justify-center">{imageElement}</div>
                  <div className="absolute inset-x-0 bottom-4 p-2 bg-black bg-opacity-30 text-center">{titleElement}</div>
               </div>;
      case 'text-only':
      default:
        return <div className="w-full h-full flex flex-col items-center justify-center p-2">{titleElement}{contentElement}</div>;
    }
  };

  return (
    <div className={`p-2 md:p-3 flex flex-col xl:flex-row gap-3 md:gap-4 h-full overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'} transition-colors duration-300 rounded-lg`}>
      {/* Editor Panel */}
      <div className="xl:w-1/3 space-y-3 md:space-y-4 p-3 md:p-4 rounded-lg shadow-lg overflow-y-auto custom-scrollbar bg-[#f7f0e4] dark:bg-slate-800 transition-colors duration-300">
        <div className="flex justify-between items-center">
          <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Edit Slide {slideNumber}/{totalSlides}</h2>
        </div>

        {/* Text Inputs */}
        <div>
          <label htmlFor={`slideTitle-${slide.id}`} className={editorLabelStyle}>Title</label>
          <input
            id={`slideTitle-${slide.id}`}
            type="text"
            value={localSlide.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={editorInputStyle}
            placeholder="Slide Title"
          />
        </div>
        <div>
          <label htmlFor={`slideContent-${slide.id}`} className={editorLabelStyle}>Content (Markdown-like)</label>
          <textarea
            id={`slideContent-${slide.id}`}
            value={localSlide.content}
            onChange={(e) => handleChange('content', e.target.value)}
            className={`${editorInputStyle} min-h-[100px] md:min-h-[120px]`}
            placeholder="- Bullet point 1&#10;- Bullet point 2&#10;Paragraph text..."
            rows={5}
          />
        </div>

        {/* Image Inputs */}
        <div>
          <label htmlFor={`slideImageUrl-${slide.id}`} className={editorLabelStyle}>Image URL (Fetched or Manual)</label>
          <input
            id={`slideImageUrl-${slide.id}`}
            type="url"
            value={localSlide.imageUrl || ''}
            onChange={(e) => handleChange('imageUrl', e.target.value)}
            className={editorInputStyle}
            placeholder="https://example.com/image.png"
          />
        </div>
        <div>
          <label htmlFor={`slideImageDesc-${slide.id}`} className={editorLabelStyle}>Image Description (for Accessibility)</label>
          <input
            id={`slideImageDesc-${slide.id}`}
            type="text"
            value={localSlide.imageDescription || ''}
            onChange={(e) => handleChange('imageDescription', e.target.value)}
            className={editorInputStyle}
            placeholder="Brief description of the image"
          />
           {localSlide.imageQuery && !localSlide.imageDescription && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">AI suggested: "{localSlide.imageQuery}". Consider using this or refining it.</p>
          )}
        </div>

        {/* Layout and Style Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label htmlFor={`slideLayout-${slide.id}`} className={editorLabelStyle}>Layout</label>
            <select
              id={`slideLayout-${slide.id}`}
              value={localSlide.layout}
              onChange={(e) => handleChange('layout', e.target.value as Slide['layout'])}
              className={editorSelectStyle}
            >
              <option value="text-only">Text Only</option>
              <option value="text-image-right">Text, Image Right</option>
              <option value="text-image-left">Text, Image Left</option>
              <option value="image-only">Image Only</option>
              <option value="title-only">Title Only</option>
              <option value="image-title-overlay">Image with Title Overlay</option>
            </select>
          </div>
          <div>
            <label htmlFor={`slideTransition-${slide.id}`} className={editorLabelStyle}>Transition</label>
            <select
              id={`slideTransition-${slide.id}`}
              value={localSlide.transition}
              onChange={(e) => handleChange('transition', e.target.value as Slide['transition'])}
              className={editorSelectStyle}
            >
              <option value="none">None</option>
              <option value="fade">Fade</option>
              <option value="slide-left">Slide from Right</option> {/* Corrected visual description */}
              <option value="slide-right">Slide from Left</option> {/* Corrected visual description */}
              <option value="zoom">Zoom</option>
            </select>
          </div>
        </div>
        
        {/* Color and Timing Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label htmlFor={`slideBgColor-${slide.id}`} className={editorLabelStyle}>Background Color (Hex)</label>
            <input
              id={`slideBgColor-${slide.id}`}
              type="text"
              value={localSlide.backgroundColor || ''}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className={editorInputStyle}
              placeholder="#FFFFFF"
            />
          </div>
          <div>
            <label htmlFor={`slideTextColor-${slide.id}`} className={editorLabelStyle}>Text Color (Hex)</label>
            <input
              id={`slideTextColor-${slide.id}`}
              type="text"
              value={localSlide.textColor || ''}
              onChange={(e) => handleChange('textColor', e.target.value)}
              className={editorInputStyle}
              placeholder="#000000"
            />
          </div>
        </div>
        <div>
            <label htmlFor={`slideAutoAdvance-${slide.id}`} className={editorLabelStyle}>Autoplay Delay (seconds)</label>
            <input
              id={`slideAutoAdvance-${slide.id}`}
              type="number"
              min="0"
              step="0.5"
              value={localSlide.autoAdvanceDelay === undefined ? 5 : localSlide.autoAdvanceDelay}
              onChange={(e) => handleChange('autoAdvanceDelay', parseFloat(e.target.value))}
              className={editorInputStyle}
              placeholder="5"
            />
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className="w-full xl:w-2/3 flex flex-col rounded-lg shadow-lg bg-[#f7f0e4] dark:bg-slate-800 transition-colors duration-300 overflow-hidden">
        <div className="p-2 border-b border-slate-200 dark:border-slate-700">
        <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Live Preview</h3>
        </div>
        <div 
          className="aspect-video w-full overflow-hidden flex items-center justify-center relative transition-colors duration-300"
          style={{ backgroundColor: slidePreviewBgColor }}
          aria-label="Slide live preview"
        >
          {renderLayoutPreview()}
        </div>
         <p className="mt-2 text-xs text-center text-slate-500 dark:text-slate-400">
          Note: Preview is an approximation. Actual presentation may vary slightly.
        </p>
      </div>
    </div>
  );
};