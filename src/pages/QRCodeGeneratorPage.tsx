import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import QRCode from 'qrcode';

interface QRCodeOptions {
  text: string;
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  foregroundColor: string;
  backgroundColor: string;
  logo?: File;
  format: 'png' | 'svg' | 'jpeg';
  margin: number;
}

interface QRCodeHistory {
  id: string;
  text: string;
  timestamp: Date;
  dataUrl: string;
  options: QRCodeOptions;
}

const QRCodeGeneratorPage: React.FC = () => {
  const [options, setOptions] = useState<QRCodeOptions>({
    text: 'https://entropy-tools.com',
    size: 256,
    errorCorrectionLevel: 'M',
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    format: 'png',
    margin: 4
  });

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [history, setHistory] = useState<QRCodeHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'url' | 'text' | 'email' | 'phone' | 'wifi' | 'vcard'>('url');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Generate initial QR code
  useEffect(() => {
    handleGenerate();
  }, []);

  // QR Code generation using proper QRCode library
  const generateQRCode = async (text: string, opts: QRCodeOptions): Promise<string> => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Canvas not available');
      }

      // Generate QR code to canvas
      await QRCode.toCanvas(canvas, text, {
        width: opts.size,
        margin: opts.margin,
        color: {
          dark: opts.foregroundColor,
          light: opts.backgroundColor
        },
        errorCorrectionLevel: opts.errorCorrectionLevel
      });

      // Add logo if provided
      if (opts.logo) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              const logoSize = opts.size * 0.15;
              const logoX = (opts.size - logoSize) / 2;
              const logoY = (opts.size - logoSize) / 2;
              
              // Add white background for logo
              ctx.fillStyle = opts.backgroundColor;
              ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
              
              // Draw logo
              ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
              resolve();
            };
            img.onerror = () => resolve(); // Continue without logo if it fails
            img.src = URL.createObjectURL(opts.logo!);
          });
        }
      }

      // Convert to desired format
      return canvas.toDataURL(`image/${opts.format}`, 0.9);
    } catch (error) {
      console.error('QR Code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  };

  const handleGenerate = async () => {
    if (!options.text.trim()) {
      setError('Please enter text to generate QR code');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const dataUrl = await generateQRCode(options.text, options);
      setQrCodeDataUrl(dataUrl);
      
      // Add to history
      const historyItem: QRCodeHistory = {
        id: Date.now().toString(),
        text: options.text,
        timestamp: new Date(),
        dataUrl,
        options: { ...options }
      };
      
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10
    } catch (err) {
      setError('Failed to generate QR code');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = (dataUrl: string, filename: string = 'qrcode') => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${filename}.${options.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePresetText = (type: typeof activeTab) => {
    switch (type) {
      case 'url':
        return 'https://entropy-tools.com';
      case 'text':
        return 'Hello, World!';
      case 'email':
        return 'mailto:contact@entropy-tools.com?subject=Hello&body=Hi there!';
      case 'phone':
        return 'tel:+1234567890';
      case 'wifi':
        return 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;';
      case 'vcard':
        return `BEGIN:VCARD
VERSION:3.0
FN:John Doe
ORG:Entropy Suite
TEL:+1234567890
EMAIL:john@entropy-tools.com
URL:https://entropy-tools.com
END:VCARD`;
      default:
        return '';
    }
  };

  useEffect(() => {
    if (options.text) {
      handleGenerate();
    }
  }, [options.text, options.size, options.errorCorrectionLevel, options.foregroundColor, options.backgroundColor, options.margin]);

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="flex size-full min-h-screen flex-col bg-[#f6f0e4]" style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}>
      <Navbar />
      
      <main className="flex-1 px-4 sm:px-10 md:px-20 lg:px-40 py-5">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-[#382f29] text-3xl font-bold">QR Code Generator</h1>
              <p className="text-[#b8a99d] text-lg mt-2">Create QR codes for various purposes with customization options</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Generator Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* QR Code Type Tabs */}
              <div className="bg-white rounded-xl border border-[#e0d5c7] p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#382f29] mb-4">QR Code Type</h2>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { id: 'url', label: 'URL', icon: '🔗' },
                    { id: 'text', label: 'Text', icon: '📝' },
                    { id: 'email', label: 'Email', icon: '✉️' },
                    { id: 'phone', label: 'Phone', icon: '📞' },
                    { id: 'wifi', label: 'WiFi', icon: '📶' },
                    { id: 'vcard', label: 'vCard', icon: '👤' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as typeof activeTab);
                        setOptions(prev => ({ ...prev, text: generatePresetText(tab.id as typeof activeTab) }));
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-[#382f29] text-white'
                          : 'bg-[#e0d5c7] text-[#382f29] hover:bg-[#d0c5b7]'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Content Input */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#382f29] mb-2">
                      {activeTab === 'url' ? 'Website URL' :
                       activeTab === 'text' ? 'Text Content' :
                       activeTab === 'email' ? 'Email (mailto:email@domain.com)' :
                       activeTab === 'phone' ? 'Phone Number (tel:+1234567890)' :
                       activeTab === 'wifi' ? 'WiFi Configuration' :
                       'vCard Data'}
                    </label>
                    <textarea
                      value={options.text}
                      onChange={(e) => setOptions(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full border border-[#e0d5c7] rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                      rows={activeTab === 'vcard' ? 8 : 3}
                      placeholder={`Enter ${activeTab} content...`}
                    />
                  </div>

                  {activeTab === 'wifi' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700 font-medium mb-2">WiFi QR Code Format:</p>
                      <p className="text-xs text-blue-600">WIFI:T:WPA;S:NetworkName;P:Password;H:false;;</p>
                      <p className="text-xs text-blue-600 mt-1">
                        T: Security type (WPA, WEP, nopass)<br/>
                        S: Network name (SSID)<br/>
                        P: Password<br/>
                        H: Hidden network (true/false)
                      </p>
                    </div>
                  )}

                  {activeTab === 'vcard' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-700 font-medium mb-2">vCard Contact Format:</p>
                      <p className="text-xs text-green-600">
                        FN: Full Name<br/>
                        ORG: Organization<br/>
                        TEL: Phone Number<br/>
                        EMAIL: Email Address<br/>
                        URL: Website
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customization Options */}
              <div className="bg-white rounded-xl border border-[#e0d5c7] p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#382f29] mb-4">Customization</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#382f29] mb-2">Size (px)</label>
                      <input
                        type="range"
                        min="128"
                        max="512"
                        step="32"
                        value={options.size}
                        onChange={(e) => setOptions(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-[#b8a99d]">
                        <span>128px</span>
                        <span>{options.size}px</span>
                        <span>512px</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#382f29] mb-2">Error Correction</label>
                      <select
                        value={options.errorCorrectionLevel}
                        onChange={(e) => setOptions(prev => ({ ...prev, errorCorrectionLevel: e.target.value as any }))}
                        className="w-full border border-[#e0d5c7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                      >
                        <option value="L">Low (~7%)</option>
                        <option value="M">Medium (~15%)</option>
                        <option value="Q">Quartile (~25%)</option>
                        <option value="H">High (~30%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#382f29] mb-2">Margin</label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={options.margin}
                        onChange={(e) => setOptions(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-[#b8a99d]">
                        <span>0</span>
                        <span>{options.margin}</span>
                        <span>10</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#382f29] mb-2">Foreground Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={options.foregroundColor}
                          onChange={(e) => setOptions(prev => ({ ...prev, foregroundColor: e.target.value }))}
                          className="w-16 h-10 border border-[#e0d5c7] rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={options.foregroundColor}
                          onChange={(e) => setOptions(prev => ({ ...prev, foregroundColor: e.target.value }))}
                          className="flex-1 border border-[#e0d5c7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#382f29] font-mono text-sm"
                          placeholder="#000000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#382f29] mb-2">Background Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={options.backgroundColor}
                          onChange={(e) => setOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          className="w-16 h-10 border border-[#e0d5c7] rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={options.backgroundColor}
                          onChange={(e) => setOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          className="flex-1 border border-[#e0d5c7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#382f29] font-mono text-sm"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#382f29] mb-2">Format</label>
                      <select
                        value={options.format}
                        onChange={(e) => setOptions(prev => ({ ...prev, format: e.target.value as any }))}
                        className="w-full border border-[#e0d5c7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                      >
                        <option value="png">PNG</option>
                        <option value="jpeg">JPEG</option>
                        <option value="svg">SVG</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#382f29] mb-2">Logo (Optional)</label>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => setOptions(prev => ({ ...prev, logo: e.target.files?.[0] }))}
                        className="w-full border border-[#e0d5c7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#382f29] text-sm"
                      />
                      <p className="text-xs text-[#b8a99d] mt-1">Add a logo to the center of QR code</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generated QR Code */}
              <div className="bg-white rounded-xl border border-[#e0d5c7] p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-[#382f29]">Generated QR Code</h2>
                  {qrCodeDataUrl && (
                    <button
                      onClick={() => downloadQRCode(qrCodeDataUrl)}
                      className="px-4 py-2 bg-[#382f29] text-white rounded-lg hover:bg-[#4a3f37] transition-colors duration-200 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </button>
                  )}
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
                    {error}
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                <div className="flex justify-center">
                  {isGenerating ? (
                    <div className="flex items-center justify-center p-12">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-2 border-[#382f29] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[#382f29] font-medium">Generating QR code...</span>
                      </div>
                    </div>
                  ) : qrCodeDataUrl ? (
                    <div className="text-center">
                      <img
                        src={qrCodeDataUrl}
                        alt="Generated QR Code"
                        className="mx-auto border border-[#e0d5c7] rounded-lg shadow-sm"
                        style={{ maxWidth: '300px', maxHeight: '300px' }}
                      />
                      <div className="mt-4 text-sm text-[#b8a99d]">
                        <p>Size: {options.size}×{options.size}px</p>
                        <p>Format: {options.format.toUpperCase()}</p>
                        <p>Error Correction: {options.errorCorrectionLevel}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="mx-auto w-16 h-16 text-[#b8a99d] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11a6 6 0 11-12 0v-1m8 0V9a4 4 0 10-8 0v6h8z" />
                      </svg>
                      <p className="text-[#b8a99d] text-lg">Enter content to generate QR code</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* History Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#e0d5c7] p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-[#382f29]">History</h2>
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                {history.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto w-12 h-12 text-[#b8a99d] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[#b8a99d]">No QR codes generated yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map(item => (
                      <div key={item.id} className="border border-[#e0d5c7] rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={item.dataUrl}
                            alt="QR Code"
                            className="w-12 h-12 border border-[#e0d5c7] rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#382f29] truncate">
                              {item.text.length > 30 ? `${item.text.substring(0, 30)}...` : item.text}
                            </p>
                            <p className="text-xs text-[#b8a99d]">
                              {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => setOptions(item.options)}
                                className="text-xs px-2 py-1 bg-[#e0d5c7] text-[#382f29] rounded hover:bg-[#d0c5b7] transition-colors"
                              >
                                Load
                              </button>
                              <button
                                onClick={() => downloadQRCode(item.dataUrl, `qrcode-${item.id}`)}
                                className="text-xs px-2 py-1 bg-[#382f29] text-white rounded hover:bg-[#4a3f37] transition-colors"
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-[#e0d5c7] p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#382f29] mb-4">Quick Actions</h2>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setOptions(prev => ({ ...prev, foregroundColor: '#000000', backgroundColor: '#ffffff' }))}
                    className="w-full px-3 py-2 text-left border border-[#e0d5c7] rounded-lg hover:bg-[#f1f1f1] transition-colors text-sm"
                  >
                    🎨 Reset Colors
                  </button>
                  <button
                    onClick={() => setOptions(prev => ({ ...prev, size: 256, margin: 4 }))}
                    className="w-full px-3 py-2 text-left border border-[#e0d5c7] rounded-lg hover:bg-[#f1f1f1] transition-colors text-sm"
                  >
                    📐 Standard Size
                  </button>
                  <button
                    onClick={() => setOptions(prev => ({ ...prev, errorCorrectionLevel: 'H' }))}
                    className="w-full px-3 py-2 text-left border border-[#e0d5c7] rounded-lg hover:bg-[#f1f1f1] transition-colors text-sm"
                  >
                    🛡️ High Error Correction
                  </button>
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full px-3 py-2 text-left border border-[#e0d5c7] rounded-lg hover:bg-[#f1f1f1] transition-colors text-sm"
                  >
                    🖼️ Add Logo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default QRCodeGeneratorPage; 