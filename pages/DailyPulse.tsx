import React, { useEffect, useMemo, useState } from 'react';
import { HUDButton, HUDCard } from '../components/RetroUI';
import { api, getToken } from '../services/api';
import { UserProfile } from '../types';
import { CloudSun, Utensils, Bell, Filter, CalendarClock, Megaphone } from 'lucide-react';

interface DailyPulseProps {
  user: UserProfile;
}

type TabType = 'mess' | 'weather' | 'announcements' | 'events';

export const DailyPulse: React.FC<DailyPulseProps> = () => {
  const [activeTab, setActiveTab] = useState<TabType>('mess');
  const [menu, setMenu] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [weather, setWeather] = useState<any | null>(null);
  const [alert, setAlert] = useState<any | null>(null);
  const [tagFilter, setTagFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [menuData, annData, weatherData] = await Promise.all([
          api.messMenu(),
          api.announcements(),
          api.weather()
        ]);
        setMenu(menuData.items || []);
        setAnnouncements(annData.items || []);
        setWeather(weatherData);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const token = getToken();
    const stream = new EventSource(`/api/stream/alerts?token=${token || ''}`);
    stream.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setAlert(data);
      } catch (err) {
        // Ignore parse errors.
      }
    };
    return () => stream.close();
  }, []);

  const filteredMenu = useMemo(() => {
    if (!tagFilter.trim()) return menu;
    return menu.filter((item) => (item.tags || '').includes(tagFilter.toLowerCase()));
  }, [menu, tagFilter]);

  const events = announcements.filter((item) => item.event_at);

  const tabs = [
    { id: 'mess' as TabType, label: 'Mess Menu', icon: <Utensils size={16} /> },
    { id: 'weather' as TabType, label: 'Weather & Alerts', icon: <CloudSun size={16} /> },
    { id: 'announcements' as TabType, label: 'Announcements', icon: <Megaphone size={16} /> },
    { id: 'events' as TabType, label: 'Events', icon: <CalendarClock size={16} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-800 pb-4">
        <div>
          <h1 className="text-2xl font-['Orbitron'] text-white">DAILY PULSE</h1>
          <p className="text-xs text-stone-400 font-mono">Live campus status, nutrition, and alerts.</p>
        </div>
        <div className="text-xs text-stone-500 font-mono flex items-center gap-2">
          <CalendarClock size={14} /> {new Date().toLocaleDateString()}
        </div>
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

      {/* Mess Menu Tab */}
      {activeTab === 'mess' && (
        <HUDCard title="LIVE MESS MENU">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-bold" style={{ color: 'var(--color-primary)' }}>
              <Utensils size={16} /> TODAY'S LINEUP
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Filter size={12} />
              <input
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                placeholder="Filter (veg, gluten-free)"
                className="bg-black/50 border border-stone-700 px-2 py-1 font-mono"
                style={{ color: 'var(--color-primary-light)' }}
              />
            </div>
          </div>
          {loading ? (
            <div className="text-xs text-stone-500 font-mono">Loading menu...</div>
          ) : filteredMenu.length === 0 ? (
            <div className="text-xs text-stone-500">No menu items found.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMenu.map((item) => (
                <div key={item.id} className="p-4 bg-black/40 border border-stone-700">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase px-2 py-0.5 bg-amber-950 border border-amber-800" style={{ color: 'var(--color-primary)' }}>
                      {item.meal}
                    </span>
                    <span className="text-xs text-stone-500">{item.calories} cal</span>
                  </div>
                  <div className="font-bold mt-2" style={{ color: 'var(--color-primary-light)' }}>{item.item}</div>
                  <div className="text-[10px] mt-2" style={{ color: 'var(--color-primary)' }}>Tags: {item.tags || 'none'}</div>
                </div>
              ))}
            </div>
          )}
        </HUDCard>
      )}

      {/* Weather & Alerts Tab */}
      {activeTab === 'weather' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <HUDCard title="WEATHER" accent="orange">
            <div className="p-6 border border-orange-700 bg-orange-950/20">
              <div className="flex items-center gap-3">
                <CloudSun size={48} style={{ color: 'var(--color-orange)' }} />
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--color-orange)' }}>{weather?.location || 'IIT Ropar Campus'}</div>
                  <div className="text-4xl font-['Orbitron'] text-white mt-1">
                    {weather?.temperatureC ?? '--'}°C
                  </div>
                </div>
              </div>
              <div className="text-sm text-stone-300 mt-4">{weather?.condition || 'Loading forecast...'}</div>
              <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-stone-400">
                <div className="p-3 border border-stone-700 bg-black/40">
                  <div className="text-[10px] uppercase text-stone-500">Humidity</div>
                  <div className="text-lg font-mono" style={{ color: 'var(--color-orange)' }}>{weather?.humidity ?? '--'}%</div>
                </div>
                <div className="p-3 border border-stone-700 bg-black/40">
                  <div className="text-[10px] uppercase text-stone-500">Wind</div>
                  <div className="text-lg font-mono" style={{ color: 'var(--color-orange)' }}>{weather?.windKph ?? '--'} kph</div>
                </div>
              </div>
            </div>
          </HUDCard>

          <HUDCard title="LIVE ALERTS" accent="pink">
            <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--color-pink)' }}>
              <Bell size={16} /> <span className="font-bold text-sm">CAMPUS NOTIFICATIONS</span>
            </div>
            <div className="p-4 border border-stone-700 bg-black/40 min-h-[200px]">
              {alert ? (
                <div>
                  <div className="font-bold" style={{ color: 'var(--color-primary-light)' }}>{alert.title}</div>
                  <div className="text-sm text-stone-400 mt-2">{alert.body}</div>
                  <div className="text-[10px] text-stone-500 mt-3">Received just now</div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <Bell size={32} className="text-stone-700 mb-3" />
                  <div className="text-xs text-stone-500">Waiting for alerts...</div>
                  <div className="text-[10px] text-stone-600 mt-1">Real-time notifications will appear here</div>
                </div>
              )}
            </div>
          </HUDCard>
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <HUDCard title="CAMPUS ANNOUNCEMENTS" accent="pink">
          <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--color-pink)' }}>
            <Megaphone size={16} /> <span className="font-bold text-sm">OFFICIAL NOTICES</span>
          </div>
          {announcements.length === 0 ? (
            <div className="text-xs text-stone-500">No announcements yet.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {announcements.map((item) => (
                <div key={item.id} className="p-4 border border-stone-700 bg-black/40">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase px-2 py-0.5 bg-pink-950 border border-pink-800" style={{ color: 'var(--color-pink)' }}>
                      {item.category}
                    </span>
                  </div>
                  <div className="font-bold mt-2" style={{ color: 'var(--color-primary-light)' }}>{item.title}</div>
                  <div className="text-xs text-stone-400 mt-2">{item.body}</div>
                  {item.event_at && (
                    <div className="text-[10px] mt-3" style={{ color: 'var(--color-pink)' }}>📅 {new Date(item.event_at).toLocaleString()}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </HUDCard>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <HUDCard title="UPCOMING EVENTS">
          <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--color-primary)' }}>
            <CalendarClock size={16} /> <span className="font-bold text-sm">EVENT CALENDAR</span>
          </div>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <CalendarClock size={48} className="text-stone-700 mx-auto mb-4" />
              <div className="text-xs text-stone-500">No upcoming events scheduled.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={event.id} className="p-4 border border-stone-700 bg-black/40">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-lg font-bold" style={{ color: 'var(--color-primary-light)' }}>{event.title}</div>
                      <div className="text-xs text-stone-400 mt-1">{event.body}</div>
                    </div>
                    {index === 0 && (
                      <span className="text-[10px] uppercase px-2 py-1 bg-amber-950 border border-amber-600" style={{ color: 'var(--color-primary)' }}>
                        NEXT UP
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span style={{ color: 'var(--color-primary)' }}>📅 {new Date(event.event_at).toLocaleDateString()}</span>
                    <span className="text-stone-500">🕐 {new Date(event.event_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {index === 0 && (
                    <HUDButton className="mt-4">View Event Details</HUDButton>
                  )}
                </div>
              ))}
            </div>
          )}
        </HUDCard>
      )}
    </div>
  );
};
