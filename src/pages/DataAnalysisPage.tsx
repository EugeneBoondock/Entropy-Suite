import React, { useState, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

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
}

const DataAnalysisPage: React.FC = () => {
  const [, setDataSets] = useState<DataSet[]>([]);
  const [selectedDataSet, setSelectedDataSet] = useState<DataSet | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter'>('bar');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

      return {
        type: 'numeric',
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        mean: Number(mean.toFixed(2)),
        median: Number(median.toFixed(2)),
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

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              setError('Error parsing CSV file');
              return;
            }
            
            const dataSet = analyzeDataSet(results.data, file.name);
            setDataSets(prev => [...prev, dataSet]);
            setSelectedDataSet(dataSet);
            setSelectedColumns(dataSet.columns.slice(0, 2));
            setIsLoading(false);
          },
          error: () => {
            setError('Failed to parse CSV file');
            setIsLoading(false);
          }
        });
      } else if (file.name.endsWith('.json')) {
        const text = await file.text();
        const jsonData = JSON.parse(text);
        const data = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        const dataSet = analyzeDataSet(data, file.name);
        setDataSets(prev => [...prev, dataSet]);
        setSelectedDataSet(dataSet);
        setSelectedColumns(dataSet.columns.slice(0, 2));
      } else {
        setError('Please upload a CSV or JSON file');
      }
    } catch (err) {
      setError('Failed to process file');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateChartData = () => {
    if (!selectedDataSet || selectedColumns.length === 0) return [];
    
    if (chartType === 'pie') {
      const column = selectedColumns[0];
      const frequency: Record<string, number> = {};
      
      selectedDataSet.data.forEach(row => {
        const value = String(row[column] || 'Unknown');
        frequency[value] = (frequency[value] || 0) + 1;
      });

      return Object.entries(frequency).map(([name, value]) => ({ name, value }));
    }
    
    return selectedDataSet.data.slice(0, 100).map((row, index) => {
      const result: any = { index };
      selectedColumns.forEach(col => {
        result[col] = isNaN(Number(row[col])) ? row[col] : Number(row[col]);
      });
      return result;
    });
  };

  const exportAnalysis = () => {
    if (!selectedDataSet) return;
    
    const analysis = {
      dataset: selectedDataSet.name,
      rows: selectedDataSet.data.length,
      columns: selectedDataSet.columns.length,
      statistics: selectedDataSet.statistics
    };
    
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analysis_${selectedDataSet.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const COLORS = ['#382f29', '#5c5349', '#8b7355', '#b8a99d', '#e0d5c7'];

  return (
    <div className="min-h-screen bg-[#f6f0e4]">
      <Navbar />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#382f29] mb-4">Data Analysis</h1>
            <p className="text-lg text-[#5c5349]">
              Upload and analyze your datasets with powerful visualization tools
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div 
              className="border-2 border-dashed border-[#8b7355] rounded-xl p-8 text-center cursor-pointer hover:border-[#6b5635] transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-[#382f29] mb-2">Upload Dataset</h3>
              <p className="text-[#5c5349] mb-4">
                Drag and drop or click to upload CSV or JSON files
              </p>
              <button 
                className="px-6 py-2 bg-[#382f29] text-white rounded-lg hover:bg-[#4a3f37] transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Choose File'}
              </button>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Dataset Info */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-[#382f29] mb-4">Dataset Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#5c5349]">Name:</span>
                    <span className="font-medium">{selectedDataSet.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5c5349]">Rows:</span>
                    <span className="font-medium">{selectedDataSet.data.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5c5349]">Columns:</span>
                    <span className="font-medium">{selectedDataSet.columns.length}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-[#382f29] mb-3">Chart Settings</h4>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#382f29] mb-2">Chart Type</label>
                    <select
                      value={chartType}
                      onChange={(e) => setChartType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-[#e0d5c7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                    >
                      <option value="bar">Bar Chart</option>
                      <option value="line">Line Chart</option>
                      <option value="pie">Pie Chart</option>
                      <option value="scatter">Scatter Plot</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#382f29] mb-2">
                      Columns ({chartType === 'pie' ? 'select 1' : 'select up to 3'})
                    </label>
                    {selectedDataSet.columns.map(column => (
                      <label key={column} className="flex items-center space-x-2 mb-2">
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
                          className="rounded text-[#382f29] focus:ring-[#382f29]"
                        />
                        <span className="text-sm">{column}</span>
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={exportAnalysis}
                    className="w-full px-4 py-2 bg-[#382f29] text-white rounded-lg hover:bg-[#4a3f37] transition-colors"
                  >
                    Export Analysis
                  </button>
                </div>
              </div>

              {/* Visualization */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-[#382f29] mb-4">Visualization</h3>
                
                {selectedColumns.length > 0 && (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <>
                        {chartType === 'bar' && (
                          <BarChart data={generateChartData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="index" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {selectedColumns.map((column, index) => (
                              <Bar key={column} dataKey={column} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </BarChart>
                        )}
                        
                        {chartType === 'line' && (
                          <LineChart data={generateChartData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="index" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {selectedColumns.map((column, index) => (
                              <Line key={column} type="monotone" dataKey={column} stroke={COLORS[index % COLORS.length]} />
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
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {generateChartData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        )}
                      </>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Statistics */}
              <div className="lg:col-span-3 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-[#382f29] mb-4">Column Statistics</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#e0d5c7]">
                    <thead className="bg-[#f6f0e4]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#382f29] uppercase tracking-wider">Column</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#382f29] uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#382f29] uppercase tracking-wider">Unique Values</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#382f29] uppercase tracking-wider">Null Count</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#382f29] uppercase tracking-wider">Summary</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#e0d5c7]">
                      {selectedDataSet.columns.map(column => {
                        const stats = selectedDataSet.statistics[column];
                        return (
                          <tr key={column}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#382f29]">{column}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5c5349]">{stats.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5c5349]">{stats.uniqueValues}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5c5349]">{stats.nullCount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5c5349]">
                              {stats.type === 'numeric' 
                                ? `Mean: ${stats.mean}, Range: ${stats.min}-${stats.max}`
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
        </div>
      </div>
    </div>
  );
};

export default DataAnalysisPage;