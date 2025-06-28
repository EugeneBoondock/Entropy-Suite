# Deployment Guide for Entropy Tools

## SPA Routing Configuration

This project now includes proper Single Page Application (SPA) routing configuration to prevent 404 errors when refreshing pages or accessing direct URLs in production.

### Files Added/Modified:

1. **`public/_redirects`** - For Netlify deployment
2. **`vercel.json`** - For Vercel deployment  
3. **`public/404.html`** - For GitHub Pages deployment
4. **`index.html`** - Added GitHub Pages SPA routing script
5. **`vite.config.ts`** - Added preview configuration

## Deployment Platforms

### Netlify
- The `public/_redirects` file handles SPA routing automatically
- No additional configuration needed

### Vercel
- The `vercel.json` file configures rewrites for SPA routing
- Includes security headers

### GitHub Pages
- The `public/404.html` and routing script in `index.html` handle SPA routing
- Uses the spa-github-pages technique

### Other Platforms
- Most platforms support the `_redirects` file format
- For Apache servers, you may need to create a `.htaccess` file

## reCAPTCHA Configuration

The project now supports both reCAPTCHA v2 and v3:

### Current Setup (v3)
- Uses reCAPTCHA v3 for invisible, user-friendly verification
- Automatically executes on form load
- Shows Google branding as required

### Environment Variables Required:
```
VITE_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

### Key Type Compatibility:
- v3 keys work with the current implementation
- If you have v2 keys, change the `version` prop to `"v2"` in the components

## Build and Deploy

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting platform

3. **Set environment variables** on your hosting platform

## Testing

- Test direct URL access (e.g., `yoursite.com/login`)
- Test page refresh on different routes
- Test reCAPTCHA functionality on forms

## Troubleshooting

### 404 Errors on Refresh
- Ensure the appropriate routing file is deployed
- Check server configuration supports SPA routing

### reCAPTCHA Errors
- Verify site key is correct for your domain
- Check if key type matches implementation (v2 vs v3)
- Ensure domain is registered in reCAPTCHA console 