import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

interface MCPDefinition {
  id: string;
  name: string;
  description: string;
  tools: any[];
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const MCPGalleryPage: React.FC = () => {
  const [definitions, setDefinitions] = useState<MCPDefinition[]>([]);

  const loadList = async () => {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) return;

      const res = await fetch(`${API_URL}/v1/mcps`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error('api');
      const data = await res.json();
      setDefinitions(data);
    } catch (e) {
      console.error('API load failed, falling back to localStorage', e);
      const stored = JSON.parse(localStorage.getItem('mcp-lite-definitions') || '[]');
      setDefinitions(stored);
    }
  };

  useEffect(() => {
    loadList();
    const timer = setInterval(loadList, 4000);
    return () => clearInterval(timer);
  }, []);

  const remove = async (id: string) => {
    setDefinitions((prev) => prev.filter((d) => d.id !== id));

    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (session) {
        await fetch(`${API_URL}/v1/mcps/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      } else {
        const updated = definitions.filter((d) => d.id !== id);
        localStorage.setItem('mcp-lite-definitions', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Failed to delete definition', e);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f0e4]">
      <Navbar />
      <main className="flex-1 container mx-auto p-4 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#382f29]">MCP Gallery</h1>
          <Link to="/mcp-lite" className="px-4 py-2 bg-[#e67722] text-[#382f29] font-bold rounded-md">
            + New MCP
          </Link>
        </div>

        {definitions.length === 0 ? (
          <p className="text-[#5d4633]">No MCPs saved yet. Create one to get started!</p>
        ) : (
          <div className="space-y-4">
            {definitions.map((def) => (
              <div key={def.id} className="bg-white border border-[#382f29] rounded-md p-4 flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-[#382f29]">{def.name}</h2>
                  <p className="text-sm text-[#5d4633] mb-2">{def.description}</p>
                  <pre className="bg-[#f6f0e4] p-2 rounded-md text-xs overflow-x-auto max-h-32">{JSON.stringify(def.tools, null, 2)}</pre>
                </div>
                <div className="flex flex-col gap-2 min-w-max">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(def, null, 2));
                    }}
                    className="px-3 py-1 bg-[#b8a99d] text-white rounded-md text-sm"
                  >
                    Copy JSON
                  </button>
                  <button
                    onClick={() => remove(def.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MCPGalleryPage; 