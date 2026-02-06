import React, { useState } from 'react';
import { HUDCard, HUDButton } from '../components/RetroUI';
import { summarizeEmail } from '../services/gemini';
import { MailSummary } from '../types';
import { Mail as MailIcon, Cpu, CheckCircle, AlertTriangle } from 'lucide-react';

export const MailSummarizer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState<MailSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setSummary(null);
    setError('');
    try {
      const result = await summarizeEmail(inputText);
      setSummary({
          id: Date.now().toString(),
          originalSubject: result.subject || "Parsed Content",
          summary: result.summary,
          actionItems: result.actionItems || [],
          priority: (result.priority as any) || 'medium',
          category: (result.category as any) || 'admin',
          receivedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'AI Processing Failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-amber-950 border border-amber-500 rounded-sm">
            <MailIcon className="text-amber-400" size={24} />
        </div>
        <div>
            <h1 className="text-2xl font-['Orbitron'] text-white">MAIL SUMMARIZER</h1>
            <p className="text-sm text-stone-400 font-mono">AI-powered email analysis and summarization</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Input Area */}
        <HUDCard title="INCOMING TRANSMISSION" className="min-h-[400px] flex flex-col">
            <textarea
                className="flex-1 w-full bg-black/40 border border-stone-700 text-stone-300 p-4 font-mono text-sm resize-none focus:border-amber-500 focus:outline-none mb-4"
                placeholder="PASTE LONG-FORM ACADEMIC EMAIL CONTENT HERE FOR ANALYSIS..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
            />
            <HUDButton onClick={handleSummarize} disabled={loading || !inputText} className="w-full">
                {loading ? (
                    <span className="flex items-center gap-2"><Cpu className="animate-spin" /> PROCESSING...</span>
                ) : (
                    'ANALYZE DATA'
                )}
            </HUDButton>
            {error && (
                <div className="mt-3 p-3 border border-orange-500/40 bg-orange-950/30 text-orange-400 text-xs font-mono flex items-start gap-2">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    {error}
                </div>
            )}
        </HUDCard>

        {/* Output Area */}
        <div className="relative">
             {!summary && !loading && (
                 <div className="absolute inset-0 flex items-center justify-center text-stone-700 font-mono border border-stone-800 border-dashed bg-black/20">
                     WAITING FOR INPUT...
                 </div>
             )}
             
             {summary && (
                 <HUDCard title="INTELLIGENCE REPORT" accent={summary.priority === 'high' ? 'orange' : 'blue'} className="h-full">
                     <div className="space-y-6">
                         
                         {/* Priority Header */}
                         <div className="flex justify-between items-start border-b border-stone-800 pb-4">
                             <div>
                                 <span className="text-[10px] text-stone-500 uppercase block mb-1">CLASSIFICATION</span>
                                 <span className={`text-sm font-bold uppercase px-2 py-1 border ${
                                     summary.priority === 'high' ? 'text-orange-400 border-orange-500 bg-orange-950/30' : 
                                     'text-amber-400 border-amber-500 bg-amber-950/30'
                                 }`}>
                                     {summary.priority} PRIORITY
                                 </span>
                             </div>
                             <div className="text-right">
                                 <span className="text-[10px] text-stone-500 uppercase block mb-1">CATEGORY</span>
                                 <span className="text-sm text-stone-300 font-mono uppercase">{summary.category}</span>
                             </div>
                         </div>

                         {/* Summary */}
                         <div>
                             <h3 className="text-xs text-stone-500 uppercase font-bold mb-2">EXECUTIVE SUMMARY</h3>
                             <p className="text-lg text-white font-['Orbitron'] leading-relaxed">
                                 {summary.summary}
                             </p>
                         </div>

                         {/* Action Items */}
                         <div>
                             <h3 className="text-xs text-stone-500 uppercase font-bold mb-3">REQUIRED PROTOCOLS (ACTION ITEMS)</h3>
                             <ul className="space-y-2">
                                 {summary.actionItems.map((item, idx) => (
                                     <li key={idx} className="flex gap-3 items-start p-2 bg-white/5 rounded-sm border-l-2 border-amber-500">
                                         <CheckCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                                         <span className="text-sm text-stone-300 font-mono">{item}</span>
                                     </li>
                                 ))}
                                 {summary.actionItems.length === 0 && (
                                     <li className="text-sm text-stone-500 italic">No direct actions detected.</li>
                                 )}
                             </ul>
                         </div>

                     </div>
                 </HUDCard>
             )}
        </div>
      </div>
    </div>
  );
};
