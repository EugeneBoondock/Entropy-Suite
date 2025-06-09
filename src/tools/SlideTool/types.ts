export interface Slide {
  id: string;
  title: string;
  content: string; // Content can be markdown-like with bullet points
  imageUrl?: string;
  imageQuery?: string; // AI-suggested query for image search
  imageDescription?: string; // Alt text for the image
  layout: 'text-only' | 'text-image-right' | 'text-image-left' | 'image-only' | 'title-only' | 'image-title-overlay';
  transition: 'none' | 'fade' | 'slide-right' | 'slide-left' | 'zoom';
  backgroundColor?: string; // Hex color
  textColor?: string; // Hex color
  autoAdvanceDelay?: number; // Seconds for autoplay
}

export type Theme = 'light' | 'dark';