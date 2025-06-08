const CACHE_NAME = 'entropy-tools-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx', // Or the compiled JS path if using a build step
  '/App.tsx',
  '/types.ts',
  '/components/Toolbar.tsx',
  '/components/SlidePreview.tsx',
  '/components/SlideEditor.tsx',
  '/components/PresentationView.tsx',
  '/components/LoadingSpinner.tsx',
  '/services/geminiService.ts',
  // Tailwind CSS from CDN - this will be cached by the browser but good to list if self-hosting
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/heroicons/2.1.3/24/outline/heroicons.min.css',
  // Import map dependencies (ESM.sh URLs) - browser caches these, SW can provide fallback
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-dom@^19.1.0',
  'https://esm.sh/@google/genai@^1.4.0',
  'https://esm.sh/pptxgenjs@3.12.0',
  '/manifest.json',
  '/logo192.png', // Example icon
  '/logo512.png'  // Example icon
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add all URLs, but don't fail install if some CDN resources fail
        // (they might be opaque responses or have CORS issues for SW to cache directly)
        const cachePromises = urlsToCache.map(urlToCache => {
            return cache.add(urlToCache).catch(err => {
                console.warn(`Failed to cache ${urlToCache}: ${err}`);
            });
        });
        return Promise.all(cachePromises);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a stream and can only be consumed once.
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
              // For 'opaque' type (CDN resources with no-cors), we can't inspect them, but still cache.
              // For other errors, just return the response.
              if(response && response.type === 'opaque') {
                 // It's an opaque response (e.g. from CDN without CORS). We can cache it.
              } else {
                return response; // Return error response as is.
              }
            }

            // Clone the response because it's a stream and can only be consumed once by the browser and cache.
            const responseToCache = response.clone();
            
            // Don't cache API calls to Gemini or other dynamic data by default.
            // This basic SW is for app shell and static assets.
            // More sophisticated logic would be needed for dynamic data caching.
            if (event.request.url.includes('generativelanguage.googleapis.com')) {
                return response;
            }

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(error => {
            // Network request failed, try to serve a fallback or an offline page if defined
            console.error('Fetch failed; returning offline page if available.', error);
            // Example: return caches.match('/offline.html'); 
            // For now, just let the browser handle the network error for non-cached resources.
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
