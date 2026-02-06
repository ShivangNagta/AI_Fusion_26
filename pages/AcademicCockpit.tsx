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
        <h1 className="text-2xl font-['Orbitron'] text-white">DEMO ACADEMIC COCKPIT</h1>
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
          <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--color-pink)' }}>
            <BookOpenCheck size={16} /> <span className="font-bold text-sm">WEEKLY SCHEDULE</span>
          </div>
          <UnderConstruction
            title="Full LMS Integration"
            description="Assignment submissions, course materials, lecture recordings, and grading system integration coming soon. This feature requires deep institutional backend integration with Moodle/other LMS systems."
          />
        </HUDCard>
      )}

      {/* Grades Tab */}
      {activeTab === 'grades' && (
        <HUDCard title="ACADEMIC PERFORMANCE" accent="orange">
          <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--color-pink)' }}>
            <BookOpenCheck size={16} /> <span className="font-bold text-sm">ACADEMIC PERFORMANCE</span>
          </div>
          <UnderConstruction
            title="Full LMS Integration"
            description="Assignment submissions, course materials, lecture recordings, and grading system integration coming soon. This feature requires deep institutional backend integration with Moodle/other LMS systems."
          />
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
