import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  name?: string;
}

interface ColorPalette {
  id: string;
  name: string;
  colors: Color[];
  type: 'custom' | 'complementary' | 'triadic' | 'analogous' | 'monochromatic' | 'split-complementary';
  createdAt: Date;
}

const ColorPickerPage: React.FC = () => {
  const [currentColor, setCurrentColor] = useState<Color>({
    hex: '#3b82f6',
    rgb: { r: 59, g: 130, b: 246 },
    hsl: { h: 217, s: 91, l: 60 }
  });
  
  const [palettes, setPalettes] = useState<ColorPalette[]>([]);
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
    h /= 360;
    s /= 100;
    l /= 100;
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  const updateColor = (hex: string) => {
    // Validate hex format
    if (!/^#[0-9A-F]{6}$/i.test(hex)) return;
    
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    setCurrentColor({ hex, rgb, hsl });
  };

  const generateComplementaryPalette = (baseColor: Color): Color[] => {
    const complementaryHue = (baseColor.hsl.h + 180) % 360;
    const complementaryRgb = hslToRgb(complementaryHue, baseColor.hsl.s, baseColor.hsl.l);
    const complementaryHex = rgbToHex(complementaryRgb.r, complementaryRgb.g, complementaryRgb.b);
    
    return [
      baseColor,
      {
        hex: complementaryHex,
        rgb: complementaryRgb,
        hsl: { h: complementaryHue, s: baseColor.hsl.s, l: baseColor.hsl.l }
      }
    ];
  };

  const generateTriadicPalette = (baseColor: Color): Color[] => {
    const colors = [baseColor];
    
    for (let i = 1; i < 3; i++) {
      const hue = (baseColor.hsl.h + i * 120) % 360;
      const rgb = hslToRgb(hue, baseColor.hsl.s, baseColor.hsl.l);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      colors.push({
        hex,
        rgb,
        hsl: { h: hue, s: baseColor.hsl.s, l: baseColor.hsl.l }
      });
    }
    
    return colors;
  };

  const generateAnalogousPalette = (baseColor: Color): Color[] => {
    const colors = [baseColor];
    const step = 30;
    
    for (let i = 1; i <= 2; i++) {
      const hue1 = (baseColor.hsl.h + i * step) % 360;
      const hue2 = (baseColor.hsl.h - i * step + 360) % 360;
      
      [hue1, hue2].forEach(hue => {
        const rgb = hslToRgb(hue, baseColor.hsl.s, baseColor.hsl.l);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        colors.push({
          hex,
          rgb,
          hsl: { h: hue, s: baseColor.hsl.s, l: baseColor.hsl.l }
        });
      });
    }
    
    return colors;
  };

  const generateMonochromaticPalette = (baseColor: Color): Color[] => {
    const colors: Color[] = [];
    const lightnesses = [20, 40, 60, 80];
    
    lightnesses.forEach(lightness => {
      const rgb = hslToRgb(baseColor.hsl.h, baseColor.hsl.s, lightness);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      colors.push({
        hex,
        rgb,
        hsl: { h: baseColor.hsl.h, s: baseColor.hsl.s, l: lightness }
      });
    });
    
    return colors;
  };

  const generateSplitComplementaryPalette = (baseColor: Color): Color[] => {
    const colors = [baseColor];
    const complementaryHue = (baseColor.hsl.h + 180) % 360;
    
    // Generate split complementary colors (150° and 210° from base)
    [150, 210].forEach(offset => {
      const hue = (baseColor.hsl.h + offset) % 360;
      const rgb = hslToRgb(hue, baseColor.hsl.s, baseColor.hsl.l);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      colors.push({
        hex,
        rgb,
        hsl: { h: hue, s: baseColor.hsl.s, l: baseColor.hsl.l }
      });
    });
    
    return colors;
  };

  const generatePalette = (type: ColorPalette['type']): Color[] => {
    switch (type) {
      case 'complementary': return generateComplementaryPalette(currentColor);
      case 'triadic': return generateTriadicPalette(currentColor);
      case 'analogous': return generateAnalogousPalette(currentColor);
      case 'monochromatic': return generateMonochromaticPalette(currentColor);
      case 'split-complementary': return generateSplitComplementaryPalette(currentColor);
      default: return [currentColor];
    }
  };

  const savePalette = (type: ColorPalette['type'], customColors?: Color[]) => {
    const colors = customColors || generatePalette(type);
    const palette: ColorPalette = {
      id: Date.now().toString(),
      name: newPaletteName || `${type.charAt(0).toUpperCase() + type.slice(1)} Palette`,
      colors,
      type,
      createdAt: new Date()
    };
    
    setPalettes(prev => [...prev, palette]);
    setNewPaletteName('');
  };

  const deletePalette = (id: string) => {
    setPalettes(prev => prev.filter(p => p.id !== id));
    if (selectedPalette?.id === id) {
      setSelectedPalette(null);
    }
  };

  const exportPalette = (palette: ColorPalette, format: 'css' | 'json' | 'adobe-ase') => {
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'css':
        content = `:root {\n${palette.colors.map((color, index) => 
          `  --color-${index + 1}: ${color.hex};`
        ).join('\n')}\n}`;
        filename = `${palette.name.replace(/\s+/g, '-').toLowerCase()}.css`;
        mimeType = 'text/css';
        break;
      case 'json':
        content = JSON.stringify({
          name: palette.name,
          colors: palette.colors.map(color => ({
            hex: color.hex,
            rgb: color.rgb,
            hsl: color.hsl
          }))
        }, null, 2);
        filename = `${palette.name.replace(/\s+/g, '-').toLowerCase()}.json`;
        mimeType = 'application/json';
        break;
      case 'adobe-ase':
        // Simplified ASE format (would need more complex implementation for real ASE)
        content = palette.colors.map(color => color.hex).join('\n');
        filename = `${palette.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
        mimeType = 'text/plain';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyColorToClipboard = async (color: Color) => {
    try {
      await navigator.clipboard.writeText(color.hex);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      extractColorsFromImage(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const extractColorsFromImage = (file: File) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = Math.min(img.width, 400);
      canvas.height = Math.min(img.height, 400);
      ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
      const colors: Color[] = [];
      const colorMap = new Map<string, number>();
      
      // Sample every 10th pixel to avoid performance issues
      for (let i = 0; i < imageData.data.length; i += 40) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const alpha = imageData.data[i + 3];
        
        // Skip transparent pixels
        if (alpha < 128) continue;
        
        const hex = rgbToHex(r, g, b);
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
      }
      
      // Get the most common colors
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([hex]) => {
          const rgb = hexToRgb(hex);
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
          return { hex, rgb, hsl };
        });
      
      if (sortedColors.length > 0) {
        savePalette('custom', sortedColors);
        setSelectedPalette({
          id: 'preview',
          name: 'Extracted from Image',
          colors: sortedColors,
          type: 'custom',
          createdAt: new Date()
        });
      }
    };
    
    img.src = URL.createObjectURL(file);
  };

  const getContrastRatio = (color1: Color, color2: Color): number => {
    const luminance = (color: Color) => {
      const { r, g, b } = color.rgb;
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const l1 = luminance(color1);
    const l2 = luminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  };

  const generateRandomColor = () => {
    const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    updateColor(randomHex);
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: "url('/images/bg_image.png')",
        fontFamily: '"Space Grotesk", "Noto Sans", sans-serif'
      }}
    >
      {/* Background overlay */}
      <div className="min-h-screen bg-black/10">
        <Navbar />
        
        {/* Spacer for fixed navbar */}
        <div className="h-16"></div>
        
        <main className="px-4 sm:px-10 md:px-20 lg:px-40 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-xl">
                <h1 className="text-white text-3xl font-bold mb-2">Color Picker</h1>
                <p className="text-white/80 text-lg">Generate beautiful color palettes for your designs</p>
              </div>
              
              <button
                onClick={generateRandomColor}
                className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl px-6 py-3 text-white hover:bg-white/30 transition-all duration-300 flex items-center gap-3 shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Random Color
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Color Picker Section */}
              <div className="lg:col-span-2 space-y-8">
                {/* Main Color Picker */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-xl font-semibold text-white mb-6">Color Picker</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <div 
                        className="w-full h-40 rounded-xl border-2 border-white/30 cursor-pointer relative overflow-hidden group transition-all duration-300 hover:border-white/50"
                        style={{ backgroundColor: currentColor.hex }}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                      >
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-semibold text-lg drop-shadow-lg">Click to pick</span>
                        </div>
                      </div>
                      
                      {showColorPicker && (
                        <div className="mt-4">
                          <input
                            type="color"
                            value={currentColor.hex}
                            onChange={(e) => updateColor(e.target.value)}
                            className="w-full h-12 border border-white/20 rounded-xl cursor-pointer bg-white/10 backdrop-blur-md"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-white mb-3">HEX</label>
                        <div className="flex">
                          <input
                            type="text"
                            value={currentColor.hex}
                            onChange={(e) => updateColor(e.target.value)}
                            className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-l-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                          />
                          <button
                            onClick={() => copyColorToClipboard(currentColor)}
                            className="bg-white/20 backdrop-blur-md border border-white/30 border-l-0 rounded-r-xl px-4 py-3 text-white hover:bg-white/30 transition-all duration-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">R</label>
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={currentColor.rgb.r}
                            onChange={(e) => {
                              const r = Math.max(0, Math.min(255, parseInt(e.target.value) || 0));
                              const hex = rgbToHex(r, currentColor.rgb.g, currentColor.rgb.b);
                              updateColor(hex);
                            }}
                            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">G</label>
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={currentColor.rgb.g}
                            onChange={(e) => {
                              const g = Math.max(0, Math.min(255, parseInt(e.target.value) || 0));
                              const hex = rgbToHex(currentColor.rgb.r, g, currentColor.rgb.b);
                              updateColor(hex);
                            }}
                            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">B</label>
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={currentColor.rgb.b}
                            onChange={(e) => {
                              const b = Math.max(0, Math.min(255, parseInt(e.target.value) || 0));
                              const hex = rgbToHex(currentColor.rgb.r, currentColor.rgb.g, b);
                              updateColor(hex);
                            }}
                            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">H</label>
                          <input
                            type="number"
                            min="0"
                            max="360"
                            value={currentColor.hsl.h}
                            onChange={(e) => {
                              const h = Math.max(0, Math.min(360, parseInt(e.target.value) || 0));
                              const rgb = hslToRgb(h, currentColor.hsl.s, currentColor.hsl.l);
                              const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                              updateColor(hex);
                            }}
                            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">S</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={currentColor.hsl.s}
                            onChange={(e) => {
                              const s = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                              const rgb = hslToRgb(currentColor.hsl.h, s, currentColor.hsl.l);
                              const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                              updateColor(hex);
                            }}
                            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">L</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={currentColor.hsl.l}
                            onChange={(e) => {
                              const l = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                              const rgb = hslToRgb(currentColor.hsl.h, currentColor.hsl.s, l);
                              const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                              updateColor(hex);
                            }}
                            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Palette Generators */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-xl font-semibold text-white mb-6">Generate Palettes</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {[
                      { type: 'complementary' as const, label: 'Complementary' },
                      { type: 'triadic' as const, label: 'Triadic' },
                      { type: 'analogous' as const, label: 'Analogous' },
                      { type: 'monochromatic' as const, label: 'Monochromatic' },
                      { type: 'split-complementary' as const, label: 'Split Complementary' }
                    ].map(({ type, label }) => (
                      <button
                        key={type}
                        onClick={() => {
                          const colors = generatePalette(type);
                          setSelectedPalette({
                            id: 'preview',
                            name: `${label} Preview`,
                            colors,
                            type,
                            createdAt: new Date()
                          });
                        }}
                        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-white hover:bg-white/20 transition-all duration-300 text-sm font-medium"
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {selectedPalette && (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-white">{selectedPalette.name}</h3>
                        {selectedPalette.id === 'preview' && (
                          <button
                            onClick={() => savePalette(selectedPalette.type, selectedPalette.colors)}
                            className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-4 py-2 text-white hover:bg-white/30 transition-all duration-300 text-sm"
                          >
                            Save Palette
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {selectedPalette.colors.map((color, index) => (
                          <div key={index} className="text-center">
                            <div
                              className="w-full h-16 rounded-xl border border-white/20 cursor-pointer transition-transform hover:scale-105"
                              style={{ backgroundColor: color.hex }}
                              onClick={() => copyColorToClipboard(color)}
                              title={`Click to copy ${color.hex}`}
                            />
                            <p className="text-xs text-white/80 mt-2 font-mono">{color.hex}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={newPaletteName}
                      onChange={(e) => setNewPaletteName(e.target.value)}
                      placeholder="Palette name (optional)"
                      className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && extractColorsFromImage(e.target.files[0])}
                      className="hidden"
                    />
                    <div
                      className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-white hover:bg-white/20 transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                        dragActive ? 'border-white/50 bg-white/20' : ''
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Extract from Image
                    </div>
                  </div>
                </div>

                {/* Accessibility Tool */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-xl font-semibold text-white mb-6">Accessibility Checker</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-medium text-white mb-4">Text Color</label>
                      <div className="flex items-center gap-4">
                        <div
                          className="w-20 h-20 rounded-xl border-2 border-white/30"
                          style={{ backgroundColor: currentColor.hex }}
                        />
                        <div>
                          <p className="font-mono text-sm text-white">{currentColor.hex}</p>
                          <p className="text-xs text-white/70">rgb({currentColor.rgb.r}, {currentColor.rgb.g}, {currentColor.rgb.b})</p>
                          <p className="text-xs text-white/70">hsl({currentColor.hsl.h}°, {currentColor.hsl.s}%, {currentColor.hsl.l}%)</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-4">Background Colors</label>
                      <div className="space-y-3">
                        {[
                          { hex: '#ffffff', name: 'White' },
                          { hex: '#000000', name: 'Black' },
                          { hex: '#f3f4f6', name: 'Light Gray' },
                          { hex: '#374151', name: 'Dark Gray' }
                        ].map(bg => {
                          const bgRgb = hexToRgb(bg.hex);
                          const bgColor = { hex: bg.hex, rgb: bgRgb, hsl: rgbToHsl(bgRgb.r, bgRgb.g, bgRgb.b) };
                          const ratio = getContrastRatio(currentColor, bgColor);
                          const isAALarge = ratio >= 3;
                          const isAA = ratio >= 4.5;
                          const isAAA = ratio >= 7;
                          
                          return (
                            <div key={bg.hex} className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-lg border border-white/20"
                                  style={{ backgroundColor: bg.hex }}
                                />
                                <div>
                                  <p className="text-sm font-medium text-white">{bg.name}</p>
                                  <p className="text-xs text-white/70">Ratio: {ratio.toFixed(2)}:1</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  isAAA ? 'bg-green-500/20 text-green-200 border border-green-400/30' :
                                  isAA ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-400/30' :
                                  isAALarge ? 'bg-orange-500/20 text-orange-200 border border-orange-400/30' :
                                  'bg-red-500/20 text-red-200 border border-red-400/30'
                                }`}>
                                  {isAAA ? 'AAA' : isAA ? 'AA' : isAALarge ? 'AA Large' : 'Fail'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Saved Palettes Sidebar */}
              <div className="space-y-8">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-xl font-semibold text-white mb-6">Saved Palettes</h2>
                  
                  {palettes.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="mx-auto w-12 h-12 text-white/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h4.001" />
                      </svg>
                      <p className="text-white/70">No saved palettes yet</p>
                      <p className="text-white/50 text-sm mt-1">Generate and save palettes to see them here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {palettes.map(palette => (
                        <div key={palette.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-medium text-white text-sm">{palette.name}</h3>
                              <p className="text-xs text-white/60">{palette.colors.length} colors • {palette.type}</p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setSelectedPalette(palette)}
                                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                                title="View palette"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => exportPalette(palette, 'css')}
                                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                                title="Export as CSS"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => deletePalette(palette.id)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                                title="Delete palette"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-2">
                            {palette.colors.slice(0, 4).map((color, index) => (
                              <div
                                key={index}
                                className="w-full h-8 rounded-lg border border-white/20 cursor-pointer transition-transform hover:scale-105"
                                style={{ backgroundColor: color.hex }}
                                onClick={() => copyColorToClipboard(color)}
                                title={color.hex}
                              />
                            ))}
                          </div>
                          
                          {palette.colors.length > 4 && (
                            <p className="text-xs text-white/60 mt-3 text-center">
                              +{palette.colors.length - 4} more colors
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ColorPickerPage; 