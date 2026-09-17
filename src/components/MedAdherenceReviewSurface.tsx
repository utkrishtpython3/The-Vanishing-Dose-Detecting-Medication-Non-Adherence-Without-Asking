import React, { useState, useMemo, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, ComposedChart, Scatter, Line,
  PieChart, Pie, Cell, BarChart, Bar, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  AlertTriangle, CheckCircle, Info, Stethoscope, MessageSquare, ArrowRight, Activity, Calendar, ShieldAlert, FileText, Pill, Users, Search, ArrowLeft, Download, Sliders, PieChart as PieChartIcon, BarChart3, TrendingUp, Bell, BellRing, Settings2, ShieldCheck, Loader2, Sparkles, Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Interfaces ---
export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  activeRegimens: string[];
}

export interface ConformalInferenceBundle {
  hypothesisSets: string[];
  coverage: number;
  epistemicUncertainty: number;
  aleatoricUncertainty: number;
}

export interface ClaimInterval {
  startDay: number;
  endDay: number;
  daysSupply: number;
  status: 'filled' | 'late' | 'abandoned';
  label: string;
}

export interface ClinicalNoteMarker {
  day: number;
  text: string;
  type: 'side_effect' | 'cost' | 'neutral' | 'efficacy_doubt';
}

export interface TimeSeriesDataPoint {
  day: number;
  observedSBP: number | null;
  sbpLower: number | null;
  sbpUpper: number | null;
  counterfactualSBP: number;
  clinicSBP: number | null;
}

export interface PatientCase {
  profile: PatientProfile;
  conformal: ConformalInferenceBundle;
  hypotheses: { title: string; rationale: string; prob: number }[];
  claims: ClaimInterval[];
  notes: ClinicalNoteMarker[];
  timeseries: TimeSeriesDataPoint[];
  summary: string;
  radarData: { subject: string; A: number; fullMark: number }[];
}

// --- Mock Data Generators ---
const generateCase1 = (): PatientCase => {
  const timeseries: TimeSeriesDataPoint[] = [];
  for (let i = 0; i <= 180; i++) {
    const isWeekend = (i % 7) === 5 || (i % 7) === 6;
    const isLateFillPeriod = i > 60 && i < 78;
    const cfSBP = 125 + Math.sin(i / 10) * 2;
    let obsSBP = cfSBP;
    if (isWeekend) obsSBP += 12;
    if (isLateFillPeriod) obsSBP += 18;
    obsSBP += (Math.random() - 0.5) * 6;
    const hasTelemetry = Math.random() > 0.3 || obsSBP > 140;
    timeseries.push({
      day: i,
      observedSBP: hasTelemetry ? obsSBP : null,
      sbpLower: hasTelemetry ? obsSBP - 4 : null,
      sbpUpper: hasTelemetry ? obsSBP + 4 : null,
      counterfactualSBP: cfSBP,
      clinicSBP: (i === 0 || i === 90 || i === 180) ? obsSBP + 2 : null,
    });
  }
  return {
    profile: { id: 'P-1042', name: 'James Wilson', age: 62, gender: 'M', activeRegimens: ['Lisinopril 20mg'] },
    conformal: { hypothesisSets: ['Intermittent Non-Adherence', 'Logistical Friction'], coverage: 0.94, epistemicUncertainty: 0.25, aleatoricUncertainty: 0.45 },
    hypotheses: [
      { title: 'Behavioral/Logistical (88%)', rationale: 'Refill latency of +18 days post-Day 60 matches home BP drift. Supported by observed weekend coverage drops.', prob: 0.88 },
      { title: 'Pharmacological/Tolerance (12%)', rationale: 'Unlikely. Baseline response during early continuous possession indicates strong efficacy.', prob: 0.12 }
    ],
    claims: [
      { startDay: 0, endDay: 30, daysSupply: 30, status: 'filled', label: 'Filled On-Time' },
      { startDay: 32, endDay: 62, daysSupply: 30, status: 'late', label: '2 Days Late' },
      { startDay: 78, endDay: 108, daysSupply: 30, status: 'late', label: '16 Days Late' },
      { startDay: 108, endDay: 138, daysSupply: 30, status: 'filled', label: 'Filled On-Time' },
      { startDay: 140, endDay: 170, daysSupply: 30, status: 'late', label: '2 Days Late' },
    ],
    notes: [
      { day: 75, text: 'Reported formulary co-pay friction. Attempted to stretch medication until next paycheck.', type: 'cost' },
      { day: 15, text: 'Mild morning dizziness reported, symptoms resolved by afternoon.', type: 'side_effect' }
    ],
    summary: "The Neural CD-EKF has flagged an 88% probability of Behavioral Divergence. Late pharmacy refills starting around Day 60 strongly correlate with elevated observed blood pressure. Counterfactual analysis confirms the drug is biologically effective when taken, ruling out pharmacological tolerance.",
    radarData: [
      { subject: 'Pharmacy Log', A: 90, fullMark: 100 },
      { subject: 'Wearables', A: 75, fullMark: 100 },
      { subject: 'Clinical Notes', A: 60, fullMark: 100 },
      { subject: 'Demographics', A: 30, fullMark: 100 },
      { subject: 'Lab Results', A: 20, fullMark: 100 },
    ],
    timeseries
  };
};

const generateCase2 = (): PatientCase => {
  const timeseries: TimeSeriesDataPoint[] = [];
  for (let i = 0; i <= 180; i++) {
    const baseDrift = 130 + (i / 180) * 25; 
    const cfSBP = baseDrift + Math.sin(i / 15) * 2;
    let obsSBP = cfSBP + (Math.random() - 0.5) * 5;
    const hasTelemetry = Math.random() > 0.1;
    timeseries.push({
      day: i,
      observedSBP: hasTelemetry ? obsSBP : null,
      sbpLower: hasTelemetry ? obsSBP - 3 : null,
      sbpUpper: hasTelemetry ? obsSBP + 3 : null,
      counterfactualSBP: cfSBP,
      clinicSBP: (i === 0 || i === 90 || i === 180) ? obsSBP + 2 : null,
    });
  }
  return {
    profile: { id: 'P-8831', name: 'Sarah Jenkins', age: 58, gender: 'F', activeRegimens: ['Lisinopril 10mg'] },
    conformal: { hypothesisSets: ['Biological Inefficacy'], coverage: 0.91, epistemicUncertainty: 0.15, aleatoricUncertainty: 0.60 },
    hypotheses: [
      { title: 'Pharmacological/Tolerance (93%)', rationale: 'Persistent daily possession yielded no meaningful BP reduction, tightly tracking resistance counterfactual.', prob: 0.93 },
      { title: 'Behavioral/Logistical (7%)', rationale: 'Flawless 30-day blocks. Patient highly engaged with home telemetry.', prob: 0.07 }
    ],
    claims: [
      { startDay: 0, endDay: 30, daysSupply: 30, status: 'filled', label: 'Filled On-Time' },
      { startDay: 30, endDay: 60, daysSupply: 30, status: 'filled', label: 'Filled On-Time' },
      { startDay: 60, endDay: 90, daysSupply: 30, status: 'filled', label: 'Filled On-Time' },
      { startDay: 88, endDay: 118, daysSupply: 30, status: 'filled', label: 'Early Refill (Stockpile)' },
      { startDay: 118, endDay: 148, daysSupply: 30, status: 'filled', label: 'Filled On-Time' },
      { startDay: 148, endDay: 178, daysSupply: 30, status: 'filled', label: 'Filled On-Time' },
    ],
    notes: [
      { day: 90, text: 'Compliant with meds but SBP poorly controlled today; discuss ACE-i vs ARB switch.', type: 'efficacy_doubt' }
    ],
    summary: "The model detected a 93% probability of Pharmacological Resistance. The patient exhibits flawless 30-day block refills with zero logistical friction. However, observed SBP fails to track the do(A=1) response curve. We strongly recommend an immediate class switch (e.g., ACE-i to ARB) rather than behavioral counseling.",
    radarData: [
      { subject: 'Pharmacy Log', A: 95, fullMark: 100 },
      { subject: 'Wearables', A: 85, fullMark: 100 },
      { subject: 'Lab Results', A: 80, fullMark: 100 },
      { subject: 'Clinical Notes', A: 50, fullMark: 100 },
      { subject: 'Demographics', A: 25, fullMark: 100 },
    ],
    timeseries
  };
};

const applySimulation = (data: PatientCase, adherence: number, efficacy: number): PatientCase => {
  const efficacyPenalty = (100 - efficacy) * 0.3;
  const adherencePenalty = (100 - adherence) * 0.4;
  
  const newTimeSeries = data.timeseries.map(pt => {
    const cfSBP = pt.counterfactualSBP + efficacyPenalty;
    let obsSBP = pt.observedSBP;
    if (obsSBP !== null) {
      obsSBP = cfSBP + adherencePenalty + (Math.random() - 0.5) * 5;
    }
    return {
      ...pt,
      counterfactualSBP: cfSBP,
      observedSBP: obsSBP,
      sbpLower: obsSBP !== null ? obsSBP - 4 : null,
      sbpUpper: obsSBP !== null ? obsSBP + 4 : null,
      clinicSBP: pt.clinicSBP !== null ? obsSBP !== null ? obsSBP + 2 : cfSBP + 2 : null
    };
  });
  return { ...data, timeseries: newTimeSeries };
};

// --- Components ---
const TypewriterEffect = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 15);
    return () => clearInterval(timer);
  }, [text]);
  return <>{displayedText}</>;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-neutral-200 shadow-xl rounded-lg text-sm max-w-xs z-50">
        <p className="font-semibold text-neutral-900 mb-2">Day {label}</p>
        {payload.map((entry: any, index: number) => {
          if (entry.dataKey === 'sbpLower' || entry.dataKey === 'sbpUpper') return null;
          return (
            <div key={index} className="flex items-center justify-between space-x-4 mb-1">
              <span style={{ color: entry.color }} className="font-medium flex items-center space-x-1">
                {entry.name === 'Observed SBP' ? <Activity className="w-3 h-3 inline mr-1" /> : null}
                {entry.name}:
              </span>
              <span className="font-bold">{entry.value ? Math.round(entry.value) : '--'} mmHg</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const PatientView = ({ baseData, onBack }: { baseData: PatientCase, onBack: () => void }) => {
  const [simMode, setSimMode] = useState(false);
  const [simAdherence, setSimAdherence] = useState(100);
  const [simEfficacy, setSimEfficacy] = useState(100);
  const [isExporting, setIsExporting] = useState(false);
  const [actionState, setActionState] = useState<Record<string, 'idle' | 'loading' | 'success'>>({});
  const [toast, setToast] = useState<string | null>(null);

  const handleAction = (id: string, message: string) => {
    if (actionState[id] && actionState[id] !== 'idle') return;
    
    setActionState(prev => ({ ...prev, [id]: 'loading' }));
    setTimeout(() => {
      setActionState(prev => ({ ...prev, [id]: 'success' }));
      setToast(message);
      setTimeout(() => {
        setActionState(prev => ({ ...prev, [id]: 'idle' }));
        setToast(null);
      }, 3000);
    }, 1200);
  };

  const data = useMemo(() => {
    if (!simMode) return baseData;
    return applySimulation(baseData, simAdherence, simEfficacy);
  }, [baseData, simMode, simAdherence, simEfficacy]);

  const isAmbiguous = data.conformal.epistemicUncertainty >= 0.65;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patient_${data.profile.id}_fhir_bundle.json`;
      a.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
      setToast('FHIR Bundle successfully exported.');
      setTimeout(() => setToast(null), 3000);
    }, 800);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 relative"
    >
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-8 left-1/2 z-50 bg-emerald-900 text-emerald-50 px-6 py-3 rounded-full shadow-lg flex items-center border border-emerald-700 font-medium text-sm"
          >
            <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center justify-between mb-2">
        <button onClick={onBack} className="flex items-center text-sm font-medium text-neutral-500 hover:text-indigo-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-neutral-200 shadow-sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cohort Queue
        </button>
        <div className="flex items-center space-x-3">
          <button onClick={() => setSimMode(!simMode)} className={`flex items-center text-sm font-medium transition-colors px-3 py-1.5 rounded-lg border shadow-sm ${simMode ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'}`}>
            <Sliders className="w-4 h-4 mr-2" /> {simMode ? 'Exit Simulation' : 'Simulation Mode'}
          </button>
          <button onClick={handleExport} disabled={isExporting} className="flex items-center text-sm font-medium text-neutral-700 hover:text-indigo-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-neutral-200 shadow-sm disabled:opacity-70">
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            {isExporting ? 'Exporting...' : 'Export JSON'}
          </button>
        </div>
      </div>
      
      {/* Patient Header Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-2xl shrink-0">
            {data.profile.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
              {data.profile.name}
              <span className="ml-3 px-2.5 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded-md font-medium border border-neutral-200">
                {data.profile.id}
              </span>
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              {data.profile.age}yo {data.profile.gender} • Active Regimen: <span className="font-medium text-neutral-700">{data.profile.activeRegimens.join(', ')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* AI Synthesis Summary */}
      <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
        <div className="shrink-0 flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm border border-indigo-100">
          <Sparkles className="w-6 h-6 text-indigo-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-2">Neural Triage Synthesis</h3>
          <p className="text-indigo-950 font-medium leading-relaxed">
            <TypewriterEffect text={data.summary} />
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
              Multi-Modal Synchronized Timeline (180 Days)
            </h2>
            
            <div className="mb-8 relative">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center">
                <Pill className="w-4 h-4 mr-1.5" /> Track 1: Pharmacy Possession (PDC)
              </div>
              <div className="h-10 bg-neutral-50 rounded-lg relative border border-neutral-100 overflow-hidden w-full">
                {data.claims.map((claim, idx) => {
                  const left = `${(claim.startDay / 180) * 100}%`;
                  const width = `${((claim.endDay - claim.startDay) / 180) * 100}%`;
                  const bgColor = claim.status === 'filled' ? 'bg-indigo-500' : claim.status === 'late' ? 'bg-amber-400' : 'bg-red-400';
                  return (
                    <div key={idx} className={`absolute top-1.5 bottom-1.5 rounded-md ${bgColor} opacity-80 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer group`} style={{ left, width }}>
                      <div className="hidden group-hover:block absolute bottom-full mb-2 bg-neutral-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10">
                        {claim.label} (Days {claim.startDay}-{claim.endDay})
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mb-4 relative">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center"><Activity className="w-4 h-4 mr-1.5" /> Track 2 & 3: Physiological vs. Counterfactual</span>
                <div className="flex space-x-4 text-xs normal-case font-normal">
                  <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-indigo-600 mr-1.5" /> Observed SBP</span>
                  <span className="flex items-center"><div className="w-2 h-2 border border-dashed border-neutral-400 mr-1.5" /> Counterfactual do(A=1)</span>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.timeseries}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="day" type="number" domain={[0, 180]} ticks={[0, 30, 60, 90, 120, 150, 180]} stroke="#9CA3AF" fontSize={12} />
                    <YAxis domain={[110, 180]} stroke="#9CA3AF" fontSize={12} label={{ value: 'SBP (mmHg)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6B7280', fontSize: 12 } }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="sbpUpper" stroke="none" fill="#818CF8" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="sbpLower" stroke="none" fill="#fff" fillOpacity={1} />
                    <Line type="monotone" dataKey="counterfactualSBP" name="Counterfactual do(A=1)" stroke="#9CA3AF" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} />
                    <Line type="monotone" dataKey="observedSBP" name="Observed SBP" stroke="#4F46E5" strokeWidth={2.5} dot={false} connectNulls />
                    <Scatter dataKey="clinicSBP" name="In-Clinic SBP" fill="#DC2626" shape="cross" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="relative mt-6">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-1.5" /> Track 4: Clinical Friction Markers
              </div>
              <div className="h-10 bg-neutral-50 rounded-lg relative border border-neutral-100 overflow-visible w-full">
                {data.notes.map((note, idx) => {
                  const left = `${(note.day / 180) * 100}%`;
                  const iconColor = note.type === 'cost' ? 'text-amber-500' : note.type === 'side_effect' ? 'text-red-500' : 'text-indigo-500';
                  return (
                    <div key={idx} className="absolute top-2 -ml-2.5 cursor-pointer group z-20" style={{ left }}>
                      <div className={`bg-white rounded-full p-1 shadow-sm border border-neutral-200 ${iconColor}`}>
                        <MessageSquare className="w-3.5 h-3.5 fill-current opacity-20" />
                      </div>
                      <div className="hidden group-hover:block absolute bottom-full mb-2 -ml-24 w-48 bg-neutral-900 text-white text-xs p-2.5 rounded-lg shadow-xl z-30">
                        <span className="font-semibold block mb-1 opacity-80">Day {note.day} ({note.type})</span>
                        "{note.text}"
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Simulation Panel */}
          {simMode && (
            <div className="bg-indigo-900 rounded-2xl border border-indigo-800 shadow-lg p-6 animate-in slide-in-from-top-4 text-white">
              <h3 className="text-lg font-semibold flex items-center mb-4">
                <Settings2 className="w-5 h-5 mr-2 text-indigo-400" /> Counterfactual Simulation Sandbox
              </h3>
              <p className="text-sm text-indigo-200 mb-6">Adjust parameters to see how the model's Pearlian expectations and observed trajectory shift in real-time under hypothetical conditions.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="flex justify-between text-sm font-medium mb-3 text-indigo-100">
                    Simulated Adherence
                    <span className="text-white font-bold">{simAdherence}%</span>
                  </label>
                  <input type="range" min="0" max="100" value={simAdherence} onChange={(e) => setSimAdherence(Number(e.target.value))} className="w-full accent-indigo-400 bg-indigo-950 rounded-lg appearance-none h-2" />
                </div>
                <div>
                  <label className="flex justify-between text-sm font-medium mb-3 text-indigo-100">
                    Biological Efficacy (Response)
                    <span className="text-white font-bold">{simEfficacy}%</span>
                  </label>
                  <input type="range" min="0" max="100" value={simEfficacy} onChange={(e) => setSimEfficacy(Number(e.target.value))} className="w-full accent-emerald-400 bg-indigo-950 rounded-lg appearance-none h-2" />
                </div>
              </div>
            </div>
          )}

          {/* Reasoning Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 flex items-center">
                  <Stethoscope className="w-5 h-5 mr-2 text-indigo-600" />
                  Causal Explainer & Diagnostic Reasoning
                </h2>
                <p className="text-sm text-neutral-500 mt-1">Evaluating competing hypotheses from longitudinal evidence.</p>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center border ${isAmbiguous ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                {isAmbiguous ? <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> : <CheckCircle className="w-3.5 h-3.5 mr-1.5" />}
                Set: {`{${data.conformal.hypothesisSets.join(', ')}}`} [{(data.conformal.coverage * 100).toFixed(0)}% Coverage]
              </div>
            </div>

            {isAmbiguous && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl mb-6 flex items-start">
                <ShieldAlert className="w-5 h-5 text-amber-600 mr-3 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-900">Data Sparsity / Ambiguous Context</h4>
                  <p className="text-sm text-amber-700 mt-1">High epistemic uncertainty due to missing telemetry. Automated classification deferred.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {data.hypotheses.map((hyp, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${idx === 0 ? 'border-indigo-200 bg-indigo-50/30' : 'border-neutral-200 bg-neutral-50/50'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-semibold text-neutral-900">{hyp.title}</h4>
                    <span className={`text-xs font-bold ${idx === 0 ? 'text-indigo-600' : 'text-neutral-500'}`}>{(hyp.prob * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed">{hyp.rationale}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <span className="w-40 text-neutral-600 font-medium">Epistemic Uncertainty</span>
                <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden mr-3">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${data.conformal.epistemicUncertainty * 100}%` }} />
                </div>
                <span className="w-10 text-right text-neutral-500 text-xs">{(data.conformal.epistemicUncertainty * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="w-40 text-neutral-600 font-medium">Aleatoric Variance</span>
                <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden mr-3">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${data.conformal.aleatoricUncertainty * 100}%` }} />
                </div>
                <span className="w-10 text-right text-neutral-500 text-xs">{(data.conformal.aleatoricUncertainty * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <Network className="w-5 h-5 mr-2 text-indigo-600" /> Feature Importance
            </h3>
            <div className="h-64 w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.radarData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Signal Weight" dataKey="A" stroke="#4F46E5" fill="#818CF8" fillOpacity={0.4} />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-neutral-500 mt-2">Relative contribution of multi-modal features to final classification.</p>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-neutral-900 flex items-center mb-4">
              <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" />
              Dialogue & Action Scaffold
            </h2>
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 mb-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <p className="text-sm font-medium text-indigo-900 mb-2">Suggested Non-Accusatory Inquiry:</p>
              <p className="text-sm text-neutral-800 italic">
                {data?.profile?.name?.includes('Wilson') 
                  ? `"I see your blood pressure had a few higher readings around late November. Did you experience any side effects, or did you run into any trouble with pharmacy refills around the holidays?"`
                  : `"Your refill records look fantastic, but I'm noticing your blood pressure hasn't responded as we'd hope. Have you noticed any differences, or should we discuss adjusting the dose?"`
                }
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'bp', label: 'Order 30-Day Ambulatory BP', msg: 'Order placed in EHR.' },
                { id: 'dose', label: 'Adjust Dose / Switch Drug Class', msg: 'Formulary options opened in EHR.' },
                { id: 'pharm', label: 'Route to Clinical Pharmacist', msg: 'Routed to pharmacy queue.' },
                { id: 'dismiss', label: 'Dismiss Alert (Document Context)', msg: 'Alert dismissed and documented.' }
              ].map(action => (
                <button 
                  key={action.id}
                  onClick={() => handleAction(action.id, action.msg)}
                  disabled={actionState[action.id] === 'loading'}
                  className={`flex items-center justify-between px-4 py-3 border rounded-xl text-sm font-medium transition-all text-left ${
                    actionState[action.id] === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
                    actionState[action.id] === 'loading' ? 'bg-neutral-50 border-neutral-200 text-neutral-400 cursor-not-allowed' :
                    'bg-white border-neutral-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-neutral-700'
                  }`}
                >
                  <span>{actionState[action.id] === 'loading' ? 'Processing in EHR...' : action.label}</span>
                  {actionState[action.id] === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : actionState[action.id] === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : action.id === 'dismiss' ? (
                    <CheckCircle className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-neutral-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900 text-neutral-300 rounded-2xl p-6 text-xs font-mono border border-neutral-800 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-3">
              <span className="text-neutral-400 font-semibold flex items-center">
                <Info className="w-4 h-4 mr-2" /> Provenance Audit Trail
              </span>
              <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-[10px]">Verified</span>
            </div>
            <div className="space-y-2 opacity-80">
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>[00:00:01] Ingest: pharmacy_claims.parquet (N={data.claims.length})</motion.p>
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>[00:00:04] SDE Filter Pass: A(t), R(t) computed</motion.p>
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>[00:00:09] Counterfactual do(A=1) executed</motion.p>
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>[00:00:12] Conformal split-calibration successful</motion.p>
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>[00:00:14] Causal invariant: {data.hypotheses[0].title.split(' ')[0]} detected</motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-4 text-indigo-400">Total Latency: 16ms render / 142ms inference</motion.p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PredictiveAnalyticsPanel = () => {
  const riskData = [
    { name: 'High Risk', value: 184 },
    { name: 'Medium Risk', value: 342 },
    { name: 'Low Risk', value: 474 }
  ];
  const riskColors = ['#EF4444', '#F59E0B', '#10B981'];

  const abandonmentData = [
    { name: 'ACE Inhibitors', predicted: 45 },
    { name: 'Beta Blockers', predicted: 32 },
    { name: 'Statins', predicted: 68 },
    { name: 'Metformin', predicted: 24 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6 flex items-center">
            <PieChartIcon className="w-5 h-5 mr-2 text-indigo-600" /> Population Risk Stratification
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={riskColors[index % riskColors.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" /> Projected 30-Day Abandonment
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={abandonmentData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <RechartsTooltip />
                <Bar dataKey="predicted" fill="#4F46E5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" /> Trend Locate Notifications & Engine Insights
        </h3>
        <div className="space-y-4">
          <motion.div whileHover={{ scale: 1.01 }} className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start cursor-pointer transition-colors hover:bg-red-100/50">
            <TrendingUp className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Statins Cohort Alert (N=350)</p>
              <p className="text-sm text-red-700 mt-1">15% increase in weekend omission detected over the last 14 days. Suggest automated reminder intervention on Fridays.</p>
            </div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.01 }} className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start cursor-pointer transition-colors hover:bg-amber-100/50">
            <Activity className="w-5 h-5 text-amber-500 mr-3 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">ACE Inhibitor Biological Divergence (N=112)</p>
              <p className="text-sm text-amber-700 mt-1">High rate of perfect refill adherence failing to meet physiological targets. Potential localized resistance trend.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const CohortDashboard = ({ onSelectPatient }: { onSelectPatient: (id: string) => void }) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'analytics'>('queue');
  
  const queue = [
    { id: 'case1', pid: 'P-1042', name: 'James Wilson', type: 'Behavioral Divergence', prob: '88%', status: 'High Priority', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { id: 'case2', pid: 'P-8831', name: 'Sarah Jenkins', type: 'Biological Resistance', prob: '93%', status: 'High Priority', color: 'text-red-700 bg-red-50 border-red-200' },
    { id: 'case1', pid: 'P-2241', name: 'Marcus Cole', type: 'Logistical Friction', prob: '76%', status: 'Medium Priority', color: 'text-orange-700 bg-orange-50 border-orange-200' },
    { id: 'case1', pid: 'P-5590', name: 'Elena Rostova', type: 'Data Ambiguity', prob: 'N/A', status: 'Review Needed', color: 'text-neutral-700 bg-neutral-100 border-neutral-300' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto"
    >
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Triage & Analytics Dashboard</h1>
          <p className="text-neutral-600">Cohort overview of 1,000 continuously monitored patients.</p>
        </div>
        
        <div className="flex space-x-1 bg-neutral-200 p-1 rounded-xl w-fit">
          <button onClick={() => setActiveTab('queue')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'queue' ? 'bg-white text-indigo-700 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}>
            Triage Queue
          </button>
          <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-white text-indigo-700 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}>
            Predictive Analytics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mr-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">Active Monitored</p>
            <p className="text-2xl font-bold text-neutral-900">1,000</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-100 rounded-full opacity-50 animate-pulse" />
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mr-4 z-10">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="z-10">
            <p className="text-sm font-medium text-neutral-500">Divergence Detected</p>
            <p className="text-2xl font-bold text-neutral-900">184</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mr-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">System Confidence</p>
            <p className="text-2xl font-bold text-neutral-900">92.4%</p>
          </div>
        </div>
      </div>

      {activeTab === 'queue' ? (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-semibold text-neutral-900">High Priority Review Queue</h3>
            <div className="flex items-center space-x-3">
              <button className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                <BellRing className="w-4 h-4 mr-2" /> View 3 New Trend Alerts
              </button>
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Search cohort..." className="pl-9 pr-4 py-1.5 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64" />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-neutral-500 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 font-medium">Patient ID</th>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Primary Divergence</th>
                  <th className="px-6 py-3 font-medium">Confidence</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {queue.map((row, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={i} 
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-neutral-600">{row.pid}</td>
                    <td className="px-6 py-4 font-medium text-neutral-900">{row.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${row.color}`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-neutral-700">{row.prob}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => onSelectPatient(row.id)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                      >
                        Audit Patient <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <PredictiveAnalyticsPanel />
      )}
    </motion.div>
  );
};

export default function MedAdherenceReviewSurface() {
  const [view, setView] = useState<'cohort' | 'patient'>('cohort');
  const [activePatientData, setActivePatientData] = useState<PatientCase | null>(null);

  const handleSelectPatient = (id: string) => {
    setActivePatientData(id === 'case1' ? generateCase1() : generateCase2());
    setView('patient');
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 py-8 px-6">
      {view === 'cohort' ? (
        <CohortDashboard onSelectPatient={handleSelectPatient} />
      ) : activePatientData ? (
        <div className="max-w-7xl mx-auto">
          <PatientView baseData={activePatientData} onBack={() => setView('cohort')} />
        </div>
      ) : null}
    </div>
  );
}

