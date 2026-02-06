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
      <HUDCard title="ADVANCED FEATURES" className="mt-6">
        <UnderConstruction
          title="Full Navigation System"
          description="AR navigation, real-time crowd density, accessibility routing, and bus tracking are under active development."
        />
      </HUDCard>
    </div>
  );
};
