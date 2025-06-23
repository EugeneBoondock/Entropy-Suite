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
    const colors: { hex: string; rgb: { r: number; g: number; b: number; }; hsl: { h: number; s: number; l: number; }; }[] = [];
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

  const generatePalette = (type: ColorPalette['type']): Color[] => {
    switch (type) {
      case 'complementary': return generateComplementaryPalette(currentColor);
      case 'triadic': return generateTriadicPalette(currentColor);
      case 'analogous': return generateAnalogousPalette(currentColor);
      case 'monochromatic': return generateMonochromaticPalette(currentColor);
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

  const copyColorToClipboard = (color: Color) => {
    navigator.clipboard.writeText(color.hex);
  };

  const extractColorsFromImage = (file: File) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx!.drawImage(img, 0, 0);
      
      const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
      const colors: Color[] = [];
      const colorMap = new Map<string, number>();
      
      // Sample every 10th pixel to avoid performance issues
      for (let i = 0; i < imageData.data.length; i += 40) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
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
      
      savePalette('custom', sortedColors);
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

  return (
    <div className="flex size-full min-h-screen flex-col bg-[#f6f0e4]" style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}>
      <Navbar />
      
      <main className="flex-1 px-4 sm:px-10 md:px-20 lg:px-40 py-5">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-[#382f29] text-3xl font-bold">Color Picker</h1>
              <p className="text-[#b8a99d] text-lg mt-2">Generate beautiful color palettes for your designs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Color Picker Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Color Picker */}
              <div className="bg-white rounded-xl border border-[#e0d5c7] p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#382f29] mb-4">Color Picker</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div 
                      className="w-full h-32 rounded-lg border-2 border-[#e0d5c7] cursor-pointer relative"
                      style={{ backgroundColor: currentColor.hex }}
                      onClick={() => setShowColorPicker(!showColorPicker)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-lg drop-shadow-lg">
                        Click to pick
                      </div>
                    </div>
                    
                    {showColorPicker && (
                      <div className="mt-4">
                        <input
                          type="color"
                          value={currentColor.hex}
                          onChange={(e) => updateColor(e.target.value)}
                          className="w-full h-12 border border-[#e0d5c7] rounded-lg cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#382f29] mb-1">HEX</label>
                      <div className="flex">
                        <input
                          type="text"
                          value={currentColor.hex}
                          onChange={(e) => updateColor(e.target.value)}
                          className="flex-1 border border-[#e0d5c7] rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                        />
                        <button
                          onClick={() => copyColorToClipboard(currentColor)}
                          className="px-3 py-2 bg-[#382f29] text-white rounded-r-lg hover:bg-[#4a3f37] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[#382f29] mb-1">R</label>
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={currentColor.rgb.r}
                          onChange={(e) => {
                            const r = parseInt(e.target.value) || 0;
                            const hex = rgbToHex(r, currentColor.rgb.g, currentColor.rgb.b);
                            updateColor(hex);
                          }}
                          className="w-full border border-[#e0d5c7] rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#382f29] mb-1">G</label>
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={currentColor.rgb.g}
                          onChange={(e) => {
                            const g = parseInt(e.target.value) || 0;
                            const hex = rgbToHex(currentColor.rgb.r, g, currentColor.rgb.b);
                            updateColor(hex);
                          }}
                          className="w-full border border-[#e0d5c7] rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#382f29] mb-1">B</label>
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={currentColor.rgb.b}
                          onChange={(e) => {
                            const b = parseInt(e.target.value) || 0;
                            const hex = rgbToHex(currentColor.rgb.r, currentColor.rgb.g, b);
                            updateColor(hex);
                          }}
                          className="w-full border border-[#e0d5c7] rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[#382f29] mb-1">H</label>
                        <input
                          type="number"
                          min="0"
                          max="360"
                          value={currentColor.hsl.h}
                          onChange={(e) => {
                            const h = parseInt(e.target.value) || 0;
                            const rgb = hslToRgb(h, currentColor.hsl.s, currentColor.hsl.l);
                            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                            updateColor(hex);
                          }}
                          className="w-full border border-[#e0d5c7] rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#382f29] mb-1">S</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={currentColor.hsl.s}
                          onChange={(e) => {
                            const s = parseInt(e.target.value) || 0;
                            const rgb = hslToRgb(currentColor.hsl.h, s, currentColor.hsl.l);
                            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                            updateColor(hex);
                          }}
                          className="w-full border border-[#e0d5c7] rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#382f29] mb-1">L</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={currentColor.hsl.l}
                          onChange={(e) => {
                            const l = parseInt(e.target.value) || 0;
                            const rgb = hslToRgb(currentColor.hsl.h, currentColor.hsl.s, l);
                            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                            updateColor(hex);
                          }}
                          className="w-full border border-[#e0d5c7] rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Palette Generators */}
              <div className="bg-white rounded-xl border border-[#e0d5c7] p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#382f29] mb-4">Generate Palettes</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { type: 'complementary' as const, label: 'Complementary' },
                    { type: 'triadic' as const, label: 'Triadic' },
                    { type: 'analogous' as const, label: 'Analogous' },
                    { type: 'monochromatic' as const, label: 'Monochromatic' }
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
                      className="px-3 py-2 border border-[#e0d5c7] text-[#382f29] rounded-lg hover:bg-[#f1f1f1] transition-colors text-sm"
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {selectedPalette && (
                  <div className="border border-[#e0d5c7] rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-[#382f29]">{selectedPalette.name}</h3>
                      {selectedPalette.id === 'preview' && (
                        <button
                          onClick={() => savePalette(selectedPalette.type, selectedPalette.colors)}
                          className="px-3 py-1 bg-[#382f29] text-white rounded-lg hover:bg-[#4a3f37] transition-colors text-sm"
                        >
                          Save Palette
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {selectedPalette.colors.map((color, index) => (
                        <div key={index} className="text-center">
                          <div
                            className="w-full h-16 rounded-lg border border-[#e0d5c7] cursor-pointer"
                            style={{ backgroundColor: color.hex }}
                            onClick={() => copyColorToClipboard(color)}
                            title={`Click to copy ${color.hex}`}
                          />
                          <p className="text-xs text-[#382f29] mt-1 font-mono">{color.hex}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newPaletteName}
                    onChange={(e) => setNewPaletteName(e.target.value)}
                    placeholder="Palette name (optional)"
                    className="flex-1 border border-[#e0d5c7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && extractColorsFromImage(e.target.files[0])}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-[#382f29] text-[#382f29] rounded-lg hover:bg-[#382f29] hover:text-white transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Extract from Image
                  </button>
                </div>
              </div>

              {/* Accessibility Tool */}
              <div className="bg-white rounded-xl border border-[#e0d5c7] p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#382f29] mb-4">Accessibility Checker</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#382f29] mb-2">Text Color</label>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-16 h-16 rounded-lg border-2 border-[#e0d5c7]"
                        style={{ backgroundColor: currentColor.hex }}
                      />
                      <div>
                        <p className="font-mono text-sm">{currentColor.hex}</p>
                        <p className="text-xs text-[#b8a99d]">rgb({currentColor.rgb.r}, {currentColor.rgb.g}, {currentColor.rgb.b})</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#382f29] mb-2">Background Colors</label>
                    <div className="space-y-2">
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
                          <div key={bg.hex} className="flex items-center justify-between p-3 border border-[#e0d5c7] rounded-lg">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded border border-[#e0d5c7]"
                                style={{ backgroundColor: bg.hex }}
                              />
                              <div>
                                <p className="text-sm font-medium text-[#382f29]">{bg.name}</p>
                                <p className="text-xs text-[#b8a99d]">Ratio: {ratio.toFixed(2)}:1</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                isAAA ? 'bg-green-100 text-green-700' :
                                isAA ? 'bg-yellow-100 text-yellow-700' :
                                isAALarge ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
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
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#e0d5c7] p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#382f29] mb-4">Saved Palettes</h2>
                
                {palettes.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto w-12 h-12 text-[#b8a99d] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h4.001" />
                    </svg>
                    <p className="text-[#b8a99d]">No saved palettes yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {palettes.map(palette => (
                      <div key={palette.id} className="border border-[#e0d5c7] rounded-lg p-3">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-[#382f29] text-sm">{palette.name}</h3>
                            <p className="text-xs text-[#b8a99d]">{palette.colors.length} colors</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setSelectedPalette(palette)}
                              className="p-1 text-[#382f29] hover:bg-[#e0d5c7] rounded"
                              title="View palette"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => exportPalette(palette, 'css')}
                              className="p-1 text-[#382f29] hover:bg-[#e0d5c7] rounded"
                              title="Export as CSS"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deletePalette(palette.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Delete palette"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-1">
                          {palette.colors.slice(0, 4).map((color, index) => (
                            <div
                              key={index}
                              className="w-full h-6 rounded border border-[#e0d5c7] cursor-pointer"
                              style={{ backgroundColor: color.hex }}
                              onClick={() => copyColorToClipboard(color)}
                              title={color.hex}
                            />
                          ))}
                        </div>
                        
                        {palette.colors.length > 4 && (
                          <p className="text-xs text-[#b8a99d] mt-2 text-center">
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
  );
};

export default ColorPickerPage; 