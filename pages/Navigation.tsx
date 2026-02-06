import React, { useState } from 'react';
import { HUDCard, HUDButton } from '../components/RetroUI';
import { UnderConstruction } from '../components/UnderConstruction';
import { getNavigationAdvice } from '../services/gemini';
import { MapPin, Navigation as NavIcon, Search, Construction } from 'lucide-react';
import { NavLocation } from '../types';

// Mock Data for Campus Map
const LOCATIONS: NavLocation[] = [
  { id: '1', name: 'Main Gate', category: 'utility', x: 50, y: 90, description: 'Main entrance security check.', status: 'open' },
  { id: '2', name: 'Library', category: 'academic', x: 20, y: 40, description: '24/7 Study Area & Books.', status: 'crowded' },
  { id: '3', name: 'Mess Hall A', category: 'food', x: 70, y: 30, description: 'North Indian Cuisine.', status: 'closed' },
  { id: '4', name: 'CS Dept', category: 'academic', x: 30, y: 60, description: 'Computer Science Labs.', status: 'open' },
  { id: '5', name: 'Gymkhana', category: 'recreation', x: 80, y: 70, description: 'Sports complex.', status: 'open' },
  { id: '6', name: 'Admin Block', category: 'utility', x: 50, y: 20, description: 'Registrar & Accounts.', status: 'open' },
];

export const Navigation: React.FC = () => {
  const [selectedLoc, setSelectedLoc] = useState<NavLocation | null>(null);
  const [navigationPath, setNavigationPath] = useState<NavLocation[] | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Simple "pathfinding" simulation
  const handleNavigate = async (target: NavLocation) => {
    // Assume start is Main Gate for demo
    const start = LOCATIONS.find(l => l.id === '1')!;
    setNavigationPath([start, target]);
    
    // Trigger Gemini Advice
    setLoadingAi(true);
    setAiAdvice('');
    const advice = await getNavigationAdvice(start.name, target.name, `Target status is ${target.status}. Time is ${new Date().toLocaleTimeString()}.`);
    setAiAdvice(advice);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-800 pb-4">
        <h1 className="text-2xl font-['Orbitron'] text-white">CAMPUS NAVIGATION</h1>
        <p className="text-xs text-stone-400 font-mono">Interactive campus map and AI-assisted wayfinding.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <HUDCard className="lg:col-span-2 relative overflow-hidden bg-black/80 p-0 min-h-[400px]" title="TACTICAL MAP">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,50,50,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,50,50,0.2)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          
          {/* SVG Map Layer */}
          <div className="w-full h-full relative min-h-[350px]">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Connections (Roads) */}
                <path d="M50 90 L50 60 L30 60 L20 40" stroke="#1e293b" strokeWidth="1" fill="none" />
                <path d="M50 60 L80 70" stroke="#1e293b" strokeWidth="1" fill="none" />
                <path d="M50 60 L50 20" stroke="#1e293b" strokeWidth="1" fill="none" />
                <path d="M50 20 L70 30" stroke="#1e293b" strokeWidth="1" fill="none" />

                {/* Active Path */}
                {navigationPath && (
                  <path 
                    d={`M${navigationPath[0].x} ${navigationPath[0].y} L50 60 L${navigationPath[1].x} ${navigationPath[1].y}`} 
                    stroke="#f5a623" 
                    strokeWidth="0.5" 
                    fill="none" 
                    strokeDasharray="2"
                    className="animate-[dash_1s_linear_infinite]"
                  >
                    <animate attributeName="stroke-dashoffset" from="10" to="0" dur="1s" repeatCount="indefinite" />
                  </path>
                )}
              </svg>

              {/* Location Nodes */}
              {LOCATIONS.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLoc(loc)}
                  className={`absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 transition-all duration-300 hover:scale-150 group z-20
                    ${selectedLoc?.id === loc.id ? 'bg-amber-400 border-white shadow-[0_0_20px_#f5a623]' : 'bg-stone-900 border-amber-800'}`}
                  style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                >
                  {/* Tooltip */}
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black/90 text-amber-400 text-[10px] px-2 py-1 border border-amber-900 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-mono z-30">
                    {loc.name}
                  </span>
                  
                  {/* Ripple Effect if selected */}
                  {selectedLoc?.id === loc.id && (
                      <span className="absolute inset-0 rounded-full border border-amber-400 animate-ping"></span>
                  )}
                </button>
              ))}
          </div>

          {/* User Location Indicator (Mock) */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1 bg-black/60 border border-stone-700 rounded text-xs text-stone-400 font-mono">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              GPS SIGNAL: STRONG
          </div>
        </HUDCard>

        {/* Info Panel */}
        <div className="flex flex-col gap-4">
          
          {/* Search */}
          <div className="relative">
              <input 
                  type="text" 
                  placeholder="SEARCH SECTOR..." 
                  className="w-full bg-black/50 border border-stone-700 p-3 pl-10 text-amber-100 font-mono text-sm focus:border-amber-500 focus:outline-none"
              />
              <Search className="absolute left-3 top-3 text-stone-500" size={16} />
          </div>

          {/* Selected Location Details */}
          <HUDCard className="flex-1 flex flex-col min-h-[300px]">
              {selectedLoc ? (
                  <>
                      <h2 className="text-xl font-bold font-['Orbitron'] text-amber-400 mb-1">{selectedLoc.name}</h2>
                      <div className="flex flex-wrap gap-2 mb-4">
                          <span className="text-[10px] bg-amber-900/40 text-amber-300 px-2 py-0.5 border border-amber-800 uppercase">{selectedLoc.category}</span>
                          <span className={`text-[10px] px-2 py-0.5 border uppercase ${selectedLoc.status === 'open' ? 'text-green-400 border-green-800 bg-green-900/20' : selectedLoc.status === 'crowded' ? 'text-yellow-400 border-yellow-800 bg-yellow-900/20' : 'text-red-400 border-red-800 bg-red-900/20'}`}>
                              {selectedLoc.status}
                          </span>
                      </div>
                      <p className="text-sm text-stone-300 mb-6 font-mono leading-relaxed">
                          {selectedLoc.description}
                      </p>
                      
                      <div className="mt-auto space-y-3">
                          {loadingAi ? (
                              <div className="text-xs text-amber-500 animate-pulse font-mono">&gt;&gt; CALCULATING OPTIMAL ROUTE...</div>
                          ) : aiAdvice ? (
                              <div className="p-3 bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 font-mono mb-2">
                                  <span className="text-amber-500 font-bold block mb-1">AI NAV ASSIST:</span>
                                  "{aiAdvice}"
                              </div>
                          ) : null}

                          <HUDButton onClick={() => handleNavigate(selectedLoc)} className="w-full">
                              <NavIcon size={16} /> ENGAGE NAV
                          </HUDButton>
                      </div>
                  </>
              ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-stone-600">
                      <MapPin size={48} className="mb-4 opacity-50" />
                      <p className="font-mono text-sm text-center">SELECT A NODE FROM THE TACTICAL MAP TO VIEW DETAILS</p>
                  </div>
              )}
          </HUDCard>
        </div>
      </div>

      <HUDCard title="ADVANCED FEATURES" className="mt-6">
        <UnderConstruction
          title="Full Navigation System"
          description="AR navigation, real-time crowd density, accessibility routing, and bus tracking are under active development."
        />
      </HUDCard>
    </div>
  );
};
