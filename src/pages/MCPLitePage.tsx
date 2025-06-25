import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import Navbar from '../components/Navbar';

interface Tool {
  id: string;
  name: string;
  description: string;
  inputSchema: string;
}

const MCPLitePage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);

  /**
   * MCP meta-data
   */
  const [mcpName, setMcpName] = useState<string>('');
  const [mcpDescription, setMcpDescription] = useState<string>('');

  /**
   * Tools the user adds to this MCP
   */
  const [tools, setTools] = useState<Tool[]>([]);

  /**
   * Controlled state for the tool-creation mini-form
   */
  const [toolDraft, setToolDraft] = useState<Omit<Tool, 'id'>>({
    name: '',
    description: '',
    inputSchema: '',
  });

  /* ----------------------------- helpers ----------------------------- */
  const next = () => setStep((prev) => Math.min(prev + 1, 3));
  const prev = () => setStep((prev) => Math.max(prev - 1, 1));

  const resetToolDraft = () =>
    setToolDraft({ name: '', description: '', inputSchema: '' });

  const addTool = () => {
    if (!toolDraft.name.trim()) return;
    setTools((prev) => [
      ...prev,
      { id: Date.now().toString(), ...toolDraft },
    ]);
    resetToolDraft();
  };

  const removeTool = (id: string) =>
    setTools((prev) => prev.filter((t) => t.id !== id));

  const generateMCPDefinition = () => {
    const definition = {
      name: mcpName,
      description: mcpDescription,
      tools: tools.map(({ id, ...rest }) => rest),
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    return JSON.stringify(definition, null, 2);
  };

  const saveDefinition = async () => {
    const def = {
      name: mcpName,
      description: mcpDescription,
      tools: tools.map(({ id, ...rest }) => rest),
    };

    // Try Supabase first (needs auth)
    try {
      if (supabase && (await supabase.auth.getSession()).data.session) {
        const { error } = await supabase.from('mcps').insert([{ ...def }]);
        if (error) throw error;
        navigate('/mcp-gallery');
        return;
      }
    } catch (e) {
      console.error('Supabase save failed, falling back to localStorage', e);
    }

    // Fallback localStorage
    try {
      const withId = { ...def, id: Date.now().toString(), createdAt: new Date().toISOString() };
      const existing = JSON.parse(localStorage.getItem('mcp-lite-definitions') || '[]');
      existing.push(withId);
      localStorage.setItem('mcp-lite-definitions', JSON.stringify(existing));
      navigate('/mcp-gallery');
    } catch (e) {
      alert('Failed to save definition');
    }
  };

  /* ----------------------------- rendering --------------------------- */
  return (
    <div className="flex flex-col min-h-screen bg-[#f6f0e4]">
      <Navbar />
      <main className="flex-1 container mx-auto p-4 w-full max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-[#382f29] mb-6 text-center">
          MCP Lite – Quick Wizard
        </h1>

        {/* Step indicators */}
        <div className="flex justify-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold 
                ${step === s ? 'bg-[#e67722] text-[#382f29]' : 'bg-[#b8a99d] text-white'}`}
            >
              {s}
            </div>
          ))}
        </div>

        {step === 1 && (
          <section className="space-y-6">
            <div>
              <label className="block text-[#382f29] font-medium mb-1" htmlFor="mcp-name">
                MCP Name
              </label>
              <input
                id="mcp-name"
                type="text"
                value={mcpName}
                onChange={(e) => setMcpName(e.target.value)}
                className="w-full p-3 border border-[#382f29] rounded-md focus:outline-none focus:ring-2 focus:ring-[#e67722] bg-white"
                placeholder="e.g. GitHub Issue Manager"
              />
            </div>
            <div>
              <label className="block text-[#382f29] font-medium mb-1" htmlFor="mcp-desc">
                Description
              </label>
              <textarea
                id="mcp-desc"
                value={mcpDescription}
                onChange={(e) => setMcpDescription(e.target.value)}
                className="w-full p-3 border border-[#382f29] rounded-md focus:outline-none focus:ring-2 focus:ring-[#e67722] bg-white resize-none h-24"
                placeholder="Short summary of what this MCP does"
              />
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-8">
            <div className="space-y-4 border-b border-[#382f29] pb-6">
              <h2 className="text-xl font-semibold text-[#382f29]">Add Tools</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[#382f29] mb-1">
                    Function Name
                  </label>
                  <input
                    type="text"
                    value={toolDraft.name}
                    onChange={(e) =>
                      setToolDraft((d) => ({ ...d, name: e.target.value }))
                    }
                    className="w-full p-2 border border-[#382f29] rounded-md bg-white"
                    placeholder="e.g. list_issues"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#382f29] mb-1">
                    Input Schema (JSON)
                  </label>
                  <input
                    type="text"
                    value={toolDraft.inputSchema}
                    onChange={(e) =>
                      setToolDraft((d) => ({ ...d, inputSchema: e.target.value }))
                    }
                    className="w-full p-2 border border-[#382f29] rounded-md bg-white"
                    placeholder='{ "owner": "string", "repo": "string" }'
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[#382f29] mb-1">
                    Description
                  </label>
                  <textarea
                    value={toolDraft.description}
                    onChange={(e) =>
                      setToolDraft((d) => ({ ...d, description: e.target.value }))
                    }
                    className="w-full p-2 border border-[#382f29] rounded-md bg-white resize-none h-20"
                    placeholder="Explain what the tool does"
                  />
                </div>
              </div>
              <button
                onClick={addTool}
                className="mt-3 bg-[#e67722] text-[#382f29] font-bold px-6 py-2 rounded-md hover:bg-opacity-90 disabled:opacity-50"
                disabled={!toolDraft.name.trim()}
              >
                Add Tool
              </button>
            </div>

            {/* List of added tools */}
            {tools.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#382f29]">Current Tools</h3>
                <ul className="space-y-3">
                  {tools.map((t) => (
                    <li
                      key={t.id}
                      className="flex justify-between items-start bg-white border border-[#382f29] rounded-md p-3"
                    >
                      <div>
                        <p className="font-medium text-[#382f29]">{t.name}</p>
                        <p className="text-sm text-[#5d4633]">{t.description}</p>
                      </div>
                      <button
                        onClick={() => removeTool(t.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {step === 3 && (
          <section>
            <h2 className="text-xl font-semibold text-[#382f29] mb-4">Review Definition</h2>
            <pre className="bg-white p-4 rounded-md overflow-x-auto border border-[#382f29] text-sm whitespace-pre-wrap">
              {generateMCPDefinition()}
            </pre>
            <p className="text-[#5d4633] mt-2 text-sm">
              (In a future version this would be deployed automatically and an
              endpoint URL would be generated.)
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const def = generateMCPDefinition();
                  navigator.clipboard.writeText(def).catch(() => null);
                  alert('Definition copied to clipboard!');
                }}
                className="px-6 py-2 bg-[#b8a99d] text-white rounded-md"
              >
                Copy JSON
              </button>
              <button
                onClick={saveDefinition}
                className="px-6 py-2 bg-[#e67722] text-[#382f29] font-bold rounded-md"
              >
                Save
              </button>
            </div>
          </section>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-10">
          <button
            onClick={prev}
            disabled={step === 1}
            className="px-6 py-2 bg-[#b8a99d] text-white rounded-md disabled:opacity-50"
          >
            Back
          </button>
          {step < 3 ? (
            <button
              onClick={next}
              disabled={
                (step === 1 && !mcpName.trim()) ||
                (step === 2 && tools.length === 0)
              }
              className="px-6 py-2 bg-[#e67722] text-[#382f29] font-bold rounded-md disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => {
                const def = generateMCPDefinition();
                navigator.clipboard.writeText(def).catch(() => null);
                alert('MCP definition copied to clipboard!');
              }}
              className="px-6 py-2 bg-[#e67722] text-[#382f29] font-bold rounded-md"
            >
              Copy Definition
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default MCPLitePage; 