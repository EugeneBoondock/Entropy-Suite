import React, { useState, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

interface DataSet {
  id: string;
  name: string;
  data: any[];
  columns: string[];
  statistics: Record<string, any>;
}

interface ColumnStats {
  type: 'numeric' | 'string' | 'date';
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  mode?: any;
  uniqueValues?: number;
  nullCount?: number;
  standardDeviation?: number;
}

const DataAnalysisPage: React.FC = () => {
  const [dataSets, setDataSets] = useState<DataSet[]>([]);
  const [selectedDataSet, setSelectedDataSet] = useState<DataSet | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter'>('bar');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeColumn = (data: any[], column: string): ColumnStats => {
    const values = data.map(row => row[column]).filter(val => val !== null && val !== undefined && val !== '');
    const nullCount = data.length - values.length;
    
    // Check if numeric
    const numericValues = values.filter(val => !isNaN(Number(val))).map(Number);
    const isNumeric = numericValues.length > values.length * 0.8;
    
    if (isNumeric && numericValues.length > 0) {
      const sorted = numericValues.sort((a, b) => a - b);
      const sum = sorted.reduce((acc, val) => acc + val, 0);
      const mean = sum / sorted.length;
      const median = sorted.length % 2 === 0 
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

      // Calculate standard deviation
      const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numericValues.length;
      const standardDeviation = Math.sqrt(variance);

      return {
        type: 'numeric',
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        mean: Number(mean.toFixed(2)),
        median: Number(median.toFixed(2)),
        standardDeviation: Number(standardDeviation.toFixed(2)),
        uniqueValues: new Set(numericValues).size,
        nullCount
      };
    } else {
      // String analysis
      const stringValues = values.map(String);
      const frequency: Record<string, number> = {};
      stringValues.forEach(val => {
        frequency[val] = (frequency[val] || 0) + 1;
      });
      
      const mode = Object.entries(frequency).reduce((a, b) => 
        frequency[a[0]] > frequency[b[0]] ? a : b
      )[0];

      return {
        type: 'string',
        mode,
        uniqueValues: new Set(stringValues).size,
        nullCount
      };
    }
  };

  const analyzeDataSet = (data: any[], name: string): DataSet => {
    const columns = Object.keys(data[0] || {});
    const statistics: Record<string, ColumnStats> = {};
    
    columns.forEach(column => {
      statistics[column] = analyzeColumn(data, column);
    });

    return {
      id: Date.now().toString(),
      name,
      data,
      columns,
      statistics
    };
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      processFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const processFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              setError('Error parsing CSV file: ' + results.errors[0].message);
              setIsLoading(false);
              return;
            }
            
            if (results.data.length === 0) {
              setError('CSV file is empty');
              setIsLoading(false);
              return;
            }
            
            const dataSet = analyzeDataSet(results.data, file.name);
            setDataSets(prev => [...prev, dataSet]);
            setSelectedDataSet(dataSet);
            setSelectedColumns(dataSet.columns.slice(0, 2));
            setIsLoading(false);
          },
          error: (error) => {
            setError('Failed to parse CSV file: ' + error.message);
            setIsLoading(false);
          }
        });
      } else if (file.name.endsWith('.json')) {
        const text = await file.text();
        const jsonData = JSON.parse(text);
        const data = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        if (data.length === 0) {
          setError('JSON file contains no data');
          setIsLoading(false);
          return;
        }
        
        const dataSet = analyzeDataSet(data, file.name);
        setDataSets(prev => [...prev, dataSet]);
        setSelectedDataSet(dataSet);
        setSelectedColumns(dataSet.columns.slice(0, 2));
        setIsLoading(false);
      } else {
        setError('Please upload a CSV or JSON file');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Failed to process file: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setIsLoading(false);
    }
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
  }, [processFile]);

  const generateChartData = () => {
    if (!selectedDataSet || selectedColumns.length === 0) return [];
    
    if (chartType === 'pie') {
      const column = selectedColumns[0];
      const frequency: Record<string, number> = {};
      
      selectedDataSet.data.forEach(row => {
        const value = String(row[column] || 'Unknown');
        frequency[value] = (frequency[value] || 0) + 1;
      });

      return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10) // Top 10 values
        .map(([name, value]) => ({ name, value }));
    }
    
    return selectedDataSet.data.slice(0, 200).map((row, index) => {
      const result: any = { index: index + 1 };
      selectedColumns.forEach(col => {
        const value = row[col];
        result[col] = isNaN(Number(value)) ? value : Number(value);
      });
      return result;
    });
  };

  const exportAnalysis = () => {
    if (!selectedDataSet) return;
    
    const analysis = {
      dataset: selectedDataSet.name,
      timestamp: new Date().toISOString(),
      summary: {
        rows: selectedDataSet.data.length,
        columns: selectedDataSet.columns.length,
        totalCells: selectedDataSet.data.length * selectedDataSet.columns.length
      },
      columnStatistics: selectedDataSet.statistics,
      sampleData: selectedDataSet.data.slice(0, 10)
    };
    
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analysis_${selectedDataSet.name.replace(/\.[^/.]+$/, "")}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    setDataSets([]);
    setSelectedDataSet(null);
    setSelectedColumns([]);
    setError(null);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

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
        
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-xl inline-block">
                <h1 className="text-4xl font-bold text-white mb-4">Data Analysis</h1>
                <p className="text-lg text-white/80">
                  Upload and analyze your datasets with powerful visualization tools
                </p>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-white px-6 py-4 rounded-2xl mb-8 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
                <button 
                  onClick={() => setError(null)} 
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Upload Section */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 shadow-xl">
              <div 
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  dragActive 
                    ? 'border-white/60 bg-white/10' 
                    : 'border-white/30 hover:border-white/50 hover:bg-white/5'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="space-y-6">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {dragActive ? 'Drop your dataset here' : 'Upload Dataset'}
                  </h3>
                  <p className="text-white/70 mb-6">
                    Drag and drop or click to upload CSV or JSON files
                  </p>
                  <button 
                    className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-8 py-4 text-white hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Choose File'}
                  </button>
                  <p className="text-sm text-white/60 mt-4">
                    Supports CSV and JSON formats • Max 50MB
                  </p>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv,.json"
                className="hidden"
              />
            </div>

            {selectedDataSet && (
              <div className="space-y-8">
                {/* Action Bar */}
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
                  <div className="flex gap-4">
                    <button
                      onClick={exportAnalysis}
                      className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-6 py-3 text-white hover:bg-white/30 transition-all duration-300 flex items-center gap-2 shadow-xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export Analysis
                    </button>
                    <button
                      onClick={clearData}
                      className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-6 py-3 text-white hover:bg-white/30 transition-all duration-300 flex items-center gap-2 shadow-xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear Data
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Dataset Info & Controls */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xl font-semibold text-white mb-6">Dataset Overview</h3>
                    <div className="space-y-4">
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white/70">Name:</span>
                          <span className="font-medium text-white text-sm">{selectedDataSet.name}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white/70">Rows:</span>
                          <span className="font-medium text-white">{selectedDataSet.data.length.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Columns:</span>
                          <span className="font-medium text-white">{selectedDataSet.columns.length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h4 className="text-lg font-semibold text-white mb-4">Chart Settings</h4>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-white mb-3">Chart Type</label>
                        <select
                          value={chartType}
                          onChange={(e) => setChartType(e.target.value as any)}
                          className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                        >
                          <option value="bar" className="bg-gray-800 text-white">Bar Chart</option>
                          <option value="line" className="bg-gray-800 text-white">Line Chart</option>
                          <option value="pie" className="bg-gray-800 text-white">Pie Chart</option>
                          <option value="scatter" className="bg-gray-800 text-white">Scatter Plot</option>
                        </select>
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-medium text-white mb-3">
                          Columns ({chartType === 'pie' ? 'select 1' : 'select up to 3'})
                        </label>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {selectedDataSet.columns.map(column => (
                            <label key={column} className="flex items-center space-x-3 bg-white/5 rounded-lg p-2">
                              <input
                                type="checkbox"
                                checked={selectedColumns.includes(column)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const maxColumns = chartType === 'pie' ? 1 : 3;
                                    if (selectedColumns.length < maxColumns) {
                                      setSelectedColumns(prev => [...prev, column]);
                                    }
                                  } else {
                                    setSelectedColumns(prev => prev.filter(col => col !== column));
                                  }
                                }}
                                className="rounded text-blue-500 focus:ring-blue-500 bg-white/20"
                              />
                              <span className="text-sm text-white flex-1">{column}</span>
                              <span className="text-xs text-white/60">
                                {selectedDataSet.statistics[column].type}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visualization */}
                  <div className="lg:col-span-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xl font-semibold text-white mb-6">Visualization</h3>
                    
                    {selectedColumns.length > 0 ? (
                      <div className="h-96 bg-white/5 rounded-xl p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <>
                            {chartType === 'bar' && (
                              <BarChart data={generateChartData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="index" stroke="rgba(255,255,255,0.7)" />
                                <YAxis stroke="rgba(255,255,255,0.7)" />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'rgba(0,0,0,0.8)', 
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    color: 'white'
                                  }} 
                                />
                                <Legend />
                                {selectedColumns.map((column, index) => (
                                  <Bar key={column} dataKey={column} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </BarChart>
                            )}
                            
                            {chartType === 'line' && (
                              <LineChart data={generateChartData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="index" stroke="rgba(255,255,255,0.7)" />
                                <YAxis stroke="rgba(255,255,255,0.7)" />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'rgba(0,0,0,0.8)', 
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    color: 'white'
                                  }} 
                                />
                                <Legend />
                                {selectedColumns.map((column, index) => (
                                  <Line key={column} type="monotone" dataKey={column} stroke={COLORS[index % COLORS.length]} strokeWidth={2} />
                                ))}
                              </LineChart>
                            )}
                            
                            {chartType === 'pie' && (
                              <PieChart>
                                <Pie
                                  data={generateChartData()}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                  outerRadius={120}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {generateChartData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'rgba(0,0,0,0.8)', 
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    color: 'white'
                                  }} 
                                />
                              </PieChart>
                            )}

                            {chartType === 'scatter' && selectedColumns.length >= 2 && (
                              <ScatterChart data={generateChartData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey={selectedColumns[0]} stroke="rgba(255,255,255,0.7)" />
                                <YAxis dataKey={selectedColumns[1]} stroke="rgba(255,255,255,0.7)" />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'rgba(0,0,0,0.8)', 
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    color: 'white'
                                  }} 
                                />
                                <Scatter name="Data Points" data={generateChartData()} fill={COLORS[0]} />
                              </ScatterChart>
                            )}
                          </>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-96 flex items-center justify-center bg-white/5 rounded-xl">
                        <div className="text-center">
                          <svg className="mx-auto w-16 h-16 text-white/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p className="text-white/70 text-lg">Select columns to visualize data</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistics Table */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xl font-semibold text-white mb-6">Column Statistics</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="px-6 py-4 text-left text-sm font-medium text-white">Column</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-white">Type</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-white">Unique Values</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-white">Null Count</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-white">Summary</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {selectedDataSet.columns.map(column => {
                          const stats = selectedDataSet.statistics[column];
                          return (
                            <tr key={column} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-white">{column}</td>
                              <td className="px-6 py-4 text-sm text-white/80">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  stats.type === 'numeric' ? 'bg-blue-500/20 text-blue-200' :
                                  stats.type === 'string' ? 'bg-green-500/20 text-green-200' :
                                  'bg-purple-500/20 text-purple-200'
                                }`}>
                                  {stats.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-white/80">{stats.uniqueValues?.toLocaleString()}</td>
                              <td className="px-6 py-4 text-sm text-white/80">{stats.nullCount?.toLocaleString()}</td>
                              <td className="px-6 py-4 text-sm text-white/80">
                                {stats.type === 'numeric' 
                                  ? `Mean: ${stats.mean}, Range: ${stats.min}-${stats.max}, SD: ${stats.standardDeviation}`
                                  : `Mode: ${stats.mode}`
                                }
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!selectedDataSet && !isLoading && (
              <div className="text-center py-16">
                <svg className="mx-auto w-16 h-16 text-white/50 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-white/70 text-lg">Upload a dataset to start analyzing</p>
                <p className="text-white/50 text-sm mt-2">CSV and JSON files supported</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataAnalysisPage;