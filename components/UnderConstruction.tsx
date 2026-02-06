import React from 'react';
import { Construction } from 'lucide-react';

interface UnderConstructionProps {
  title: string;
  description?: string;
}

export const UnderConstruction: React.FC<UnderConstructionProps> = ({ title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-yellow-500/50 bg-yellow-950/10 rounded-sm">
      <div className="under-construction mb-4 rounded px-4 py-2 flex items-center gap-2">
        <Construction size={20} />
        <span>UNDER CONSTRUCTION</span>
      </div>
      <h3 className="text-lg font-['Orbitron'] text-yellow-400 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-400 text-center max-w-md">{description}</p>
      )}
    </div>
  );
};
