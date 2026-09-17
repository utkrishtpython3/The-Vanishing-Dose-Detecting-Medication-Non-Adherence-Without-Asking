import React, { useState } from 'react';
import HomeOverview from './components/HomeOverview';
import EngineCodeViewer from './components/EngineCodeViewer';
import MedAdherenceReviewSurface from './components/MedAdherenceReviewSurface';
import { Beaker, Database, Network, HeartPulse, UserCircle, Hospital } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'engine' | 'clinical'>('home');

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-200">
      {/* Global Clinical EHR Navigation */}
      <div className="bg-slate-900 border-b border-slate-800 py-3 px-6 sticky top-0 z-50 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-white font-bold tracking-tight">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Hospital className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="block text-sm leading-tight text-indigo-300 font-medium">Vanishing Dose Network</span>
            <span className="block leading-tight text-lg">Central Triage Node</span>
          </div>
        </div>
        
        <div className="flex space-x-1 bg-slate-800 p-1.5 rounded-xl w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center whitespace-nowrap space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'home' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Architecture Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('engine')}
            className={`flex items-center whitespace-nowrap space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'engine' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Core Engines</span>
          </button>
          <button
            onClick={() => setActiveTab('clinical')}
            className={`flex items-center whitespace-nowrap space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'clinical' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Clinical Workspace</span>
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-3 text-slate-300 text-sm">
          <div className="text-right leading-tight">
            <p className="font-semibold text-white">Dr. E. Thorne</p>
            <p className="text-xs text-slate-400">Attending Cardiologist</p>
          </div>
          <UserCircle className="w-8 h-8 text-indigo-400" />
        </div>
      </div>

      {/* Dynamic Routing */}
      <div className="w-full">
        {activeTab === 'home' && <HomeOverview onLaunch={() => setActiveTab('clinical')} />}
        {activeTab === 'engine' && <EngineCodeViewer />}
        {activeTab === 'clinical' && <MedAdherenceReviewSurface />}
      </div>
    </div>
  );
}
