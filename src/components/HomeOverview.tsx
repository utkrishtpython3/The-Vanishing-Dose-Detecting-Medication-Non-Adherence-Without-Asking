import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Play, ArrowRight, BrainCircuit, Activity, Database, ShieldCheck, Cpu } from 'lucide-react';

export default function HomeOverview({ onLaunch }: { onLaunch: () => void }) {
  const [booting, setBooting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [systemReady, setSystemReady] = useState(false);

  const runEngine = () => {
    setBooting(true);
    const sequence = [
      "Initializing Continuous-Discrete SDE Engine...",
      "Loading pharmacy_claims.parquet (N=1,000)...",
      "Loading wearables_daily.parquet (MNAR adjusted)...",
      "Propagating Latent States via 4th-Order Runge-Kutta...",
      "Computing Pearlian Counterfactuals E[Y | do(A=1)]...",
      "Applying Split-Conformal Calibration (α=0.10)...",
      "Granger Causality Invariants Verified.",
      "System Ready. 184 divergence anomalies detected."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setLogs(prev => [...prev, sequence[i]]);
        i++;
      } else {
        clearInterval(interval);
        setSystemReady(true);
      }
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 sm:py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 shadow-sm">
          <Activity className="w-4 h-4" />
          <span>Good Health and Well-being Track</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Vanishing Dose</span>
        </h1>
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
          Detecting medication non-adherence without asking. A causal inference engine that reasons across fragmented healthcare signals to distinguish behavioral gaps from biological resistance.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 mb-3">Multi-Modal Fusion</h3>
          <p className="text-neutral-600 leading-relaxed">
            Ingests irregular, asymmetrical data streams: pharmacy renewals, noisy wearable telemetry, lab results, and unstructured clinical note semantics.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 mb-3">Neural CD-EKF</h3>
          <p className="text-neutral-600 leading-relaxed">
            Uses Continuous-Discrete Extended Kalman Filters and Pearlian Do-Calculus to orthogonalize behavioral non-adherence from pharmacological resistance.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 mb-3">Non-Accusatory HCI</h3>
          <p className="text-neutral-600 leading-relaxed">
            Translates complex conformal uncertainty sets into a clinician-friendly interface, providing actionable diagnostic reasoning without alert fatigue.
          </p>
        </motion.div>
      </div>

      {/* Interactive Terminal Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
        className="max-w-4xl mx-auto bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-neutral-800"
      >
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-4 font-mono text-xs text-neutral-500">pipeline_runner.sh</span>
          </div>
          <Cpu className="w-4 h-4 text-neutral-500" />
        </div>
        
        <div className="p-6 h-64 font-mono text-sm overflow-y-auto custom-scrollbar relative">
          {!booting ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Terminal className="w-12 h-12 text-neutral-600 mb-4" />
              <p className="text-neutral-400 mb-6">System idling. Ready to process 1,000 synthetic patient trajectories.</p>
              <button 
                onClick={runEngine}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-900/20"
              >
                <Play className="w-4 h-4" />
                <span>Initialize CD-EKF Engine</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {logs.map((log, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start"
                  >
                    <span className="text-emerald-500 mr-3">❯</span>
                    <span className={log?.includes('Ready') ? 'text-blue-400 font-bold' : 'text-neutral-300'}>{log}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {systemReady && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 flex justify-center pb-4"
                >
                  <button 
                    onClick={onLaunch}
                    className="flex items-center space-x-2 bg-white text-neutral-900 px-6 py-3 rounded-xl font-bold hover:bg-neutral-100 transition-all shadow-xl"
                  >
                    <span>Launch Clinical Triage Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
