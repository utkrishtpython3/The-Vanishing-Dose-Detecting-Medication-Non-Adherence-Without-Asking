import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Download, Check, FileCode, Database, Network } from 'lucide-react';
import { motion } from 'motion/react';

export default function EngineCodeViewer() {
  const [activeFile, setActiveFile] = useState<'med_adherence_engine.py' | 'neural_causal_filter.py'>('med_adherence_engine.py');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCode('');
    fetch(`/${activeFile}`)
      .then((res) => res.text())
      .then((text) => setCode(text))
      .catch((err) => console.error('Failed to fetch code', err));
  }, [activeFile]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 mb-4">Core Inference Engines</h2>
        <p className="text-neutral-600 max-w-3xl">
          The mathematical backbone of the system. Phase 1 handles synthetic latent generation simulating real-world missingness. Phase 2 implements the continuous-discrete extended Kalman filter (CD-EKF) to decouple adherence from biological resistance.
        </p>
      </div>

      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveFile('med_adherence_engine.py')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
            activeFile === 'med_adherence_engine.py' 
              ? 'bg-white text-indigo-700 border-indigo-200 shadow-sm' 
              : 'bg-transparent text-neutral-500 border-transparent hover:bg-neutral-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Phase 1: Generation SDEs</span>
        </button>
        <button
          onClick={() => setActiveFile('neural_causal_filter.py')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
            activeFile === 'neural_causal_filter.py' 
              ? 'bg-white text-indigo-700 border-indigo-200 shadow-sm' 
              : 'bg-transparent text-neutral-500 border-transparent hover:bg-neutral-100'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Phase 2: Neural CD-EKF</span>
        </button>
      </div>

      <motion.section
        layout
        className="bg-neutral-900 rounded-3xl overflow-hidden shadow-xl ring-1 ring-neutral-800"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <FileCode className="w-5 h-5 text-indigo-400" />
            <span className="font-mono text-sm text-neutral-300">{activeFile}</span>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-sm font-medium transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-white hover:bg-neutral-200 text-neutral-900 rounded-xl text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
        <div className="p-6 overflow-x-auto text-sm h-[600px] overflow-y-auto custom-scrollbar bg-[#1E1E1E]">
          {code ? (
            <SyntaxHighlighter
              language="python"
              style={vscDarkPlus}
              customStyle={{ background: 'transparent', padding: 0, margin: 0, fontSize: '0.875rem', lineHeight: '1.5' }}
            >
              {code}
            </SyntaxHighlighter>
          ) : (
            <div className="text-neutral-500 font-mono animate-pulse">Loading script...</div>
          )}
        </div>
      </motion.section>
    </div>
  );
}
