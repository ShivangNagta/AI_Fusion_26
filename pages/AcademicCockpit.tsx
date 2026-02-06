import React, { useEffect, useState } from 'react';
import { HUDCard } from '../components/RetroUI';
import { UnderConstruction } from '../components/UnderConstruction';
import { api } from '../services/api';
import { UserProfile } from '../types';
import { Clock, BookOpenCheck, TrendingUp } from 'lucide-react';

interface AcademicCockpitProps {
  user: UserProfile;
}

type TabType = 'timetable' | 'grades' | 'lms';

export const AcademicCockpit: React.FC<AcademicCockpitProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<TabType>('timetable');
  const [timetable, setTimetable] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [timetableData, gradeData] = await Promise.all([
        api.timetable(),
        api.grades()
      ]);
      setTimetable(timetableData.items || []);
      setGrades(gradeData.items || []);
      setLoading(false);
    };
    load();
  }, []);

  const tabs = [
    { id: 'timetable' as TabType, label: 'Timetable', icon: <Clock size={16} /> },
    { id: 'grades' as TabType, label: 'Grades', icon: <TrendingUp size={16} /> },
    { id: 'lms' as TabType, label: 'LMS', icon: <BookOpenCheck size={16} /> },
  ];

  // Group timetable by day
  const timetableByDay = timetable.reduce((acc, slot) => {
    if (!acc[slot.day]) acc[slot.day] = [];
    acc[slot.day].push(slot);
    return acc;
  }, {} as Record<string, any[]>);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-800 pb-4">
        <h1 className="text-2xl font-['Orbitron'] text-white">ACADEMIC COCKPIT</h1>
        <p className="text-xs text-stone-400 font-mono">Live timetable and academic resources.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-stone-800 pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-mono uppercase transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-b-2 text-amber-400'
                : 'text-stone-500 hover:text-stone-300'
            }`}
            style={{
              borderColor: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
              backgroundColor: activeTab === tab.id ? 'rgba(245, 166, 35, 0.1)' : 'transparent'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timetable Tab */}
      {activeTab === 'timetable' && (
        <HUDCard title="WEEKLY SCHEDULE">
          <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--color-primary)' }}>
            <Clock size={16} /> <span className="font-bold text-sm">CLASS SCHEDULE</span>
          </div>
          {loading ? (
            <div className="text-xs text-stone-500">Loading schedule...</div>
          ) : timetable.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={48} className="text-stone-700 mx-auto mb-4" />
              <div className="text-xs text-stone-500">No classes scheduled.</div>
            </div>
          ) : (
            <div className="space-y-6">
              {days.map((day) => (
                timetableByDay[day] && (
                  <div key={day}>
                    <div className="text-sm font-bold mb-3" style={{ color: 'var(--color-primary)' }}>{day.toUpperCase()}</div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {timetableByDay[day].map((slot: any) => (
                        <div key={slot.id} className="p-3 border border-stone-700 bg-black/40">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] uppercase px-2 py-0.5 bg-amber-950 border border-amber-800" style={{ color: 'var(--color-primary)' }}>
                              {slot.start_time} - {slot.end_time}
                            </span>
                          </div>
                          <div className="font-bold mt-2" style={{ color: 'var(--color-primary-light)' }}>{slot.course}</div>
                          <div className="text-xs text-stone-400 mt-1">📍 {slot.location}</div>
                          <div className="text-[10px] mt-2" style={{ color: 'var(--color-primary)' }}>👤 {slot.instructor}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </HUDCard>
      )}

      {/* Grades Tab */}
      {activeTab === 'grades' && (
        <HUDCard title="ACADEMIC PERFORMANCE" accent="orange">
          <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--color-orange)' }}>
            <TrendingUp size={16} /> <span className="font-bold text-sm">GRADE REPORT</span>
          </div>
          {loading ? (
            <div className="text-xs text-stone-500">Loading grades...</div>
          ) : grades.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp size={48} className="text-stone-700 mx-auto mb-4" />
              <div className="text-xs text-stone-500">No grades posted yet.</div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {grades.map((grade) => (
                <div key={grade.id} className="p-4 border border-stone-700 bg-black/40">
                  <div className="text-[10px] text-stone-500 uppercase">{grade.course}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-3xl font-['Orbitron']" style={{ color: 'var(--color-orange)' }}>{grade.grade}</div>
                    <div className="text-right">
                      <div className="text-xs text-stone-500">Credits</div>
                      <div className="text-lg font-mono" style={{ color: 'var(--color-orange)' }}>{grade.credits || '3'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {grades.length > 0 && (
            <div className="mt-6 p-4 border border-orange-700 bg-orange-950/20">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[10px] uppercase text-stone-500">Cumulative GPA</div>
                  <div className="text-2xl font-['Orbitron']" style={{ color: 'var(--color-orange)' }}>
                    {(grades.reduce((sum, g) => sum + (g.gpa || 8.5), 0) / grades.length).toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase text-stone-500">Total Credits</div>
                  <div className="text-2xl font-mono" style={{ color: 'var(--color-orange)' }}>
                    {grades.reduce((sum, g) => sum + (g.credits || 3), 0)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </HUDCard>
      )}

      {/* LMS Tab */}
      {activeTab === 'lms' && (
        <HUDCard title="LEARNING MANAGEMENT SYSTEM" accent="pink">
          <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--color-pink)' }}>
            <BookOpenCheck size={16} /> <span className="font-bold text-sm">LMS INTEGRATION</span>
          </div>
          <UnderConstruction
            title="Full LMS Integration"
            description="Assignment submissions, course materials, lecture recordings, and grading system integration coming soon. This feature requires deep institutional backend integration with Moodle/other LMS systems."
          />
        </HUDCard>
      )}
    </div>
  );
};
