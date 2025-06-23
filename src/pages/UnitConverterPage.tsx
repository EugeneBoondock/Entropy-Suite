import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

interface Unit {
  name: string;
  symbol: string;
  factor: number;
}

interface UnitCategory {
  id: string;
  name: string;
  icon: string;
  units: Unit[];
}

const UnitConverterPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState<Unit | null>(null);
  const [toUnit, setToUnit] = useState<Unit | null>(null);
  const [fromValue, setFromValue] = useState<string>('1');
  const [toValue, setToValue] = useState<string>('');

  const categories: UnitCategory[] = [
    {
      id: 'length',
      name: 'Length',
      icon: '📏',
      units: [
        { name: 'Millimeter', symbol: 'mm', factor: 0.001 },
        { name: 'Centimeter', symbol: 'cm', factor: 0.01 },
        { name: 'Meter', symbol: 'm', factor: 1 },
        { name: 'Kilometer', symbol: 'km', factor: 1000 },
        { name: 'Inch', symbol: 'in', factor: 0.0254 },
        { name: 'Foot', symbol: 'ft', factor: 0.3048 },
        { name: 'Yard', symbol: 'yd', factor: 0.9144 },
        { name: 'Mile', symbol: 'mi', factor: 1609.34 }
      ]
    },
    {
      id: 'weight',
      name: 'Weight',
      icon: '⚖️',
      units: [
        { name: 'Milligram', symbol: 'mg', factor: 0.000001 },
        { name: 'Gram', symbol: 'g', factor: 0.001 },
        { name: 'Kilogram', symbol: 'kg', factor: 1 },
        { name: 'Ounce', symbol: 'oz', factor: 0.0283495 },
        { name: 'Pound', symbol: 'lb', factor: 0.453592 },
        { name: 'Ton', symbol: 't', factor: 1000 }
      ]
    },
    {
      id: 'temperature',
      name: 'Temperature',
      icon: '🌡️',
      units: [
        { name: 'Celsius', symbol: '°C', factor: 1 },
        { name: 'Fahrenheit', symbol: '°F', factor: 1 },
        { name: 'Kelvin', symbol: 'K', factor: 1 }
      ]
    },
    {
      id: 'volume',
      name: 'Volume',
      icon: '🥤',
      units: [
        { name: 'Milliliter', symbol: 'ml', factor: 0.001 },
        { name: 'Liter', symbol: 'l', factor: 1 },
        { name: 'Gallon', symbol: 'gal', factor: 3.78541 },
        { name: 'Quart', symbol: 'qt', factor: 0.946353 },
        { name: 'Pint', symbol: 'pt', factor: 0.473176 },
        { name: 'Cup', symbol: 'cup', factor: 0.236588 }
      ]
    }
  ];

  const getCurrentCategory = () => {
    return categories.find(cat => cat.id === selectedCategory) || categories[0];
  };

  const convertValue = (value: number, from: Unit, to: Unit): number => {
    if (selectedCategory === 'temperature') {
      // Temperature conversion
      if (from.symbol === '°C' && to.symbol === '°F') {
        return (value * 9/5) + 32;
      } else if (from.symbol === '°F' && to.symbol === '°C') {
        return (value - 32) * 5/9;
      } else if (from.symbol === '°C' && to.symbol === 'K') {
        return value + 273.15;
      } else if (from.symbol === 'K' && to.symbol === '°C') {
        return value - 273.15;
      } else if (from.symbol === '°F' && to.symbol === 'K') {
        return ((value - 32) * 5/9) + 273.15;
      } else if (from.symbol === 'K' && to.symbol === '°F') {
        return ((value - 273.15) * 9/5) + 32;
      }
      return value;
    } else {
      return (value * from.factor) / to.factor;
    }
  };

  const handleConvert = () => {
    if (!fromUnit || !toUnit || !fromValue) return;

    const inputValue = parseFloat(fromValue);
    if (isNaN(inputValue)) return;

    const result = convertValue(inputValue, fromUnit, toUnit);
    const resultStr = result.toFixed(6).replace(/\.?0+$/, '');
    setToValue(resultStr);
  };

  const swapUnits = () => {
    if (!fromUnit || !toUnit) return;
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromValue(toValue);
    setToValue(fromValue);
  };

  useEffect(() => {
    const category = getCurrentCategory();
    if (category.units.length >= 2) {
      setFromUnit(category.units[0]);
      setToUnit(category.units[1]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (fromValue && fromUnit && toUnit) {
      handleConvert();
    }
  }, [fromValue, fromUnit, toUnit]);

  return (
    <div className="flex size-full min-h-screen flex-col bg-[#f6f0e4]" style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}>
      <Navbar />
      
      <main className="flex-1 px-4 sm:px-10 md:px-20 lg:px-40 py-5">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-[#382f29] text-3xl font-bold">Unit Converter</h1>
              <p className="text-[#b8a99d] text-lg mt-2">Convert units between different measurement systems</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Categories */}
            <div className="bg-white rounded-xl border border-[#e0d5c7] p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#382f29] mb-4">Categories</h2>
              
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-[#382f29] text-white'
                        : 'hover:bg-[#f1f1f1] text-[#382f29]'
                    }`}
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Converter */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#e0d5c7] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{getCurrentCategory().icon}</span>
                <h2 className="text-xl font-semibold text-[#382f29]">{getCurrentCategory().name} Converter</h2>
              </div>

              <div className="space-y-6">
                {/* From Unit */}
                <div>
                  <label className="block text-sm font-medium text-[#382f29] mb-2">From</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={fromValue}
                        onChange={(e) => setFromValue(e.target.value)}
                        className="w-full border border-[#e0d5c7] rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                        placeholder="Enter value"
                      />
                    </div>
                    <select
                      value={fromUnit?.symbol || ''}
                      onChange={(e) => {
                        const unit = getCurrentCategory().units.find(u => u.symbol === e.target.value);
                        setFromUnit(unit || null);
                      }}
                      className="border border-[#e0d5c7] rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                    >
                      {getCurrentCategory().units.map(unit => (
                        <option key={unit.symbol} value={unit.symbol}>
                          {unit.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                  {fromUnit && (
                    <p className="text-sm text-[#b8a99d] mt-1">{fromUnit.name}</p>
                  )}
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <button
                    onClick={swapUnits}
                    className="p-3 bg-[#e0d5c7] text-[#382f29] rounded-full hover:bg-[#d0c5b7] transition-colors duration-200"
                    title="Swap units"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </div>

                {/* To Unit */}
                <div>
                  <label className="block text-sm font-medium text-[#382f29] mb-2">To</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={toValue}
                        readOnly
                        className="w-full border border-[#e0d5c7] rounded-lg px-4 py-3 text-lg bg-[#f9f9f9] text-[#382f29] font-medium"
                        placeholder="Result"
                      />
                    </div>
                    <select
                      value={toUnit?.symbol || ''}
                      onChange={(e) => {
                        const unit = getCurrentCategory().units.find(u => u.symbol === e.target.value);
                        setToUnit(unit || null);
                      }}
                      className="border border-[#e0d5c7] rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                    >
                      {getCurrentCategory().units.map(unit => (
                        <option key={unit.symbol} value={unit.symbol}>
                          {unit.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                  {toUnit && (
                    <p className="text-sm text-[#b8a99d] mt-1">{toUnit.name}</p>
                  )}
                </div>

                {/* Unit Reference */}
                <div className="border-t border-[#e0d5c7] pt-6">
                  <h3 className="text-lg font-semibold text-[#382f29] mb-4">Available Units</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {getCurrentCategory().units.map(unit => (
                      <div key={unit.symbol} className="flex items-center justify-between p-3 bg-[#f9f9f9] rounded-lg">
                        <div>
                          <span className="font-medium text-[#382f29]">{unit.name}</span>
                          <span className="text-[#b8a99d] text-sm ml-2">({unit.symbol})</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setFromUnit(unit)}
                            className="px-2 py-1 text-xs bg-[#382f29] text-white rounded hover:bg-[#4a3f37] transition-colors"
                          >
                            From
                          </button>
                          <button
                            onClick={() => setToUnit(unit)}
                            className="px-2 py-1 text-xs border border-[#382f29] text-[#382f29] rounded hover:bg-[#382f29] hover:text-white transition-colors"
                          >
                            To
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UnitConverterPage; 