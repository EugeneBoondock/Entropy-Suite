const PEXELS_API_URL = 'https://api.pexels.com/v1/search';
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

if (!PEXELS_API_KEY) {
  console.warn("VITE_PEXELS_API_KEY environment variable not found. Image search will be disabled.");
}

interface PexelsImage {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

interface PexelsResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsImage[];
  next_page?: string;
}

export const fetchImageFromPexels = async (query: string): Promise<string | undefined> => {
  if (!PEXELS_API_KEY) {
    console.warn("Pexels API key not configured");
    return undefined;
  }

  if (!query || !query.trim()) {
    return undefined;
  }

  try {
    const response = await fetch(
      `${PEXELS_API_URL}?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY,
          'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
      if (response.status === 401) {
         console.error("Pexels API key is invalid or not authorized.");
      } else {
        console.error(`Pexels API error: ${response.status} ${response.statusText}`);
      }
      return undefined;
    }

    const data: PexelsResponse = await response.json();

    if (data.photos && data.photos.length > 0) {
      // Prefer 'landscape' or 'large' for slide backgrounds/main images
      return data.photos[0].src.landscape || data.photos[0].src.large || data.photos[0].src.original;
    }
    return undefined;
  } catch (error) {
    console.error("Error fetching image from Pexels:", error);
    return undefined;
  }
};
