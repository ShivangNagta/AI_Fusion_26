import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { HUDCard } from '../components/RetroUI';
import { Clock, Utensils, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

interface DashboardProps {
  user: UserProfile;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [menu, setMenu] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [menuData, annData, timetableData] = await Promise.all([
          api.messMenu(),
          api.announcements(),
          api.timetable()
        ]);
        setMenu(menuData.items || []);
        setAnnouncements(annData.items || []);
        setTimetable(timetableData.items || []);
      } catch (err) {
        // Keep dashboard resilient even if data fails.
      }
    };
    load();
  }, []);

  const nextClass = timetable[0];
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end pb-4 mb-8" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <h1 className="text-3xl font-['Orbitron']" style={{ color: 'var(--color-fg)' }}>
            <span style={{ color: 'var(--color-primary)' }}>WELCOME</span>, {user.username}
          </h1>
          <p className="text-sm font-mono mt-1" style={{ color: 'var(--color-text-muted)' }}>SYSTEM STATUS: OPTIMAL // DAY 42 OF SEMESTER</p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-2xl font-mono" style={{ color: 'var(--color-primary-light)' }}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Local Campus Time</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Widget 1: Daily Pulse / Mess */}
        <HUDCard title="The Daily Pulse" className="h-auto min-h-[16rem] flex flex-col">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
            <h3 className="text-base md:text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-primary-light)' }}>
              <Utensils size={18} /> MESS MENU
            </h3>
            <span className="px-2 py-0.5 text-[10px] shrink-0" style={{ backgroundColor: 'rgba(129, 178, 154, 0.2)', color: 'var(--color-green)', border: '1px solid var(--color-green)' }}>OPEN</span>
          </div>
          <div className="flex-1 space-y-3 font-mono text-xs md:text-sm overflow-y-auto pr-1 md:pr-2 scrollbar-hide">
            {menu.slice(0, 3).map((item) => (
              <div key={item.id} className="p-2 bg-white/5 border-l-2 overflow-hidden" style={{ borderColor: 'var(--color-yellow)' }}>
                <div className="text-[10px] md:text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.meal.toUpperCase()}</div>
                <div className="font-bold text-sm md:text-base break-words" style={{ color: 'var(--color-primary-light)' }}>{item.item}</div>
                <div className="text-[10px] mt-1" style={{ color: 'var(--color-yellow)' }}>★ {item.rating || '4.1'} Rating</div>
              </div>
            ))}
            {menu.length === 0 && (
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Menu feed loading...</div>
            )}
          </div>
          <div className="mt-2 text-right">
             <span className="text-[10px] underline cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>View Full Schedule &gt;&gt;</span>
          </div>
        </HUDCard>

        {/* Widget 2: Academic Cockpit */}
        {/* <HUDCard title="Academic Cockpit" accent="secondary" className="h-64 flex flex-col">
           <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-pink)' }}>
              <Clock size={18} /> NEXT CLASS
            </h3>
            <span className="animate-blink w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-pink)' }}></span>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            {nextClass ? (
              <>
                <div className="text-2xl font-['Orbitron']" style={{ color: 'var(--color-fg)' }}>{nextClass.course}</div>
                <div className="font-bold mt-1" style={{ color: 'var(--color-pink)' }}>{nextClass.day}</div>
                <div className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>{nextClass.location}</div>
                <div className="mt-4 px-3 py-1 text-xs rounded" style={{ backgroundColor: 'rgba(224, 122, 95, 0.15)', border: '1px solid var(--color-pink)', color: 'var(--color-pink)' }}>
                  {nextClass.start_time} - {nextClass.end_time}
                </div>
              </>
            ) : (
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Timetable loading...</div>
            )}
          </div>
        </HUDCard> */}

        {/* Widget 3: Alerts */}
        <HUDCard title="Campus Alerts" accent="tertiary" className="h-64">
           <div className="flex items-center gap-2 mb-4 font-bold" style={{ color: 'var(--color-orange)' }}>
             <AlertTriangle size={18} />
             <h3>NOTICES</h3>
           </div>
           <ul className="space-y-3 text-xs font-mono">
             {announcements.slice(0, 3).map((item) => (
               <li key={item.id} className="flex gap-2">
                 <span className="font-bold" style={{ color: 'var(--color-orange)' }}>[!]</span>
                 <span style={{ color: 'var(--color-text)' }}>{item.title}</span>
               </li>
             ))}
             {announcements.length === 0 && (
               <li style={{ color: 'var(--color-text-muted)' }}>No notices yet.</li>
             )}
           </ul>
        </HUDCard>

         {/* Wide Widget: Quick Nav Stats (Teaser for Nav Page) */}
        {/* <HUDCard className="md:col-span-2 h-48 flex items-center relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-900/20 to-transparent pointer-events-none" />
            <div className="relative z-10 w-full">
                 <h3 className="text-lg font-bold mb-2 font-['Orbitron']" style={{ color: 'var(--color-primary)' }}>CAMPUS TRAFFIC STATUS</h3>
                 <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-black/40" style={{ border: '1px solid var(--color-border)' }}>
                        <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>MAIN GATE</div>
                        <div className="font-bold" style={{ color: 'var(--color-green)' }}>CLEAR</div>
                    </div>
                     <div className="p-3 bg-black/40" style={{ border: '1px solid var(--color-border)' }}>
                        <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>LIBRARY</div>
                        <div className="font-bold" style={{ color: 'var(--color-yellow)' }}>MODERATE</div>
                    </div>
                     <div className="p-3 bg-black/40" style={{ border: '1px solid var(--color-border)' }}>
                        <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>CAFETERIA</div>
                        <div className="font-bold" style={{ color: 'var(--color-red)' }}>BUSY</div>
                    </div>
                 </div>
                 <p className="text-[10px] mt-4 text-center" style={{ color: 'var(--color-text-muted)' }}>Data aggregated from WiFi density sensors.</p>
            </div>
        </HUDCard> */}

      </div>
    </div>
  );
};
