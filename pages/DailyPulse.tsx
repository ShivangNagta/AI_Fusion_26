import React, { useEffect, useMemo, useState } from 'react';
import { HUDButton, HUDCard } from '../components/RetroUI';
import { api, getToken } from '../services/api';
import { UserProfile } from '../types';
import { CloudSun, Utensils, Bell, Filter, CalendarClock, Megaphone, Plus, X } from 'lucide-react';

interface DailyPulseProps {
  user: UserProfile;
}

type TabType = 'mess' | 'weather' | 'announcements' | 'events';

export const DailyPulse: React.FC<DailyPulseProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<TabType>('mess');
  const [menu, setMenu] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [weather, setWeather] = useState<any | null>(null);
  const [alert, setAlert] = useState<any | null>(null);
  const [tagFilter, setTagFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Admin form states
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [menuForm, setMenuForm] = useState({ date: new Date().toISOString().slice(0, 10), meal: 'breakfast', item: '', calories: '', tags: '' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '', category: 'general', priority: 'medium', event_at: '' });
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.role === 'admin';

  const loadData = async () => {
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

  useEffect(() => {
    loadData();
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

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuForm.item.trim()) return;
    setSubmitting(true);
    try {
      await api.createMessMenu({
        date: menuForm.date,
        meal: menuForm.meal,
        item: menuForm.item,
        calories: menuForm.calories ? parseInt(menuForm.calories) : undefined,
        tags: menuForm.tags || undefined
      });
      setMenuForm({ date: new Date().toISOString().slice(0, 10), meal: 'breakfast', item: '', calories: '', tags: '' });
      setShowMenuForm(false);
      await loadData();
    } catch (err) {
      console.error('Failed to add menu item:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.body.trim()) return;
    setSubmitting(true);
    try {
      await api.createAnnouncement({
        title: announcementForm.title,
        body: announcementForm.body,
        category: announcementForm.category,
        priority: announcementForm.priority,
        event_at: announcementForm.event_at || undefined
      });
      setAnnouncementForm({ title: '', body: '', category: 'general', priority: 'medium', event_at: '' });
      setShowAnnouncementForm(false);
      await loadData();
    } catch (err) {
      console.error('Failed to add announcement:', err);
    } finally {
      setSubmitting(false);
    }
  };

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
            <div className="flex items-center gap-4">
              {isAdmin && (
                <button
                  onClick={() => setShowMenuForm(!showMenuForm)}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-mono uppercase border transition-all"
                  style={{
                    borderColor: 'var(--color-green)',
                    color: 'var(--color-green)',
                    backgroundColor: showMenuForm ? 'rgba(129, 178, 154, 0.2)' : 'transparent'
                  }}
                >
                  {showMenuForm ? <X size={12} /> : <Plus size={12} />}
                  {showMenuForm ? 'Cancel' : 'Add Item'}
                </button>
              )}
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
          </div>

          {/* Admin Add Menu Form */}
          {isAdmin && showMenuForm && (
            <form onSubmit={handleAddMenuItem} className="mb-6 p-4 border border-stone-700 bg-black/40">
              <div className="text-xs uppercase mb-3 font-mono" style={{ color: 'var(--color-green)' }}>+ ADD MENU ITEM</div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-stone-500 block mb-1">Date</label>
                  <input
                    type="date"
                    value={menuForm.date}
                    onChange={(e) => setMenuForm({ ...menuForm, date: e.target.value })}
                    className="w-full bg-black/50 border border-stone-700 px-2 py-2 font-mono text-sm"
                    style={{ color: 'var(--color-primary-light)' }}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-stone-500 block mb-1">Meal</label>
                  <select
                    value={menuForm.meal}
                    onChange={(e) => setMenuForm({ ...menuForm, meal: e.target.value })}
                    className="w-full bg-black/50 border border-stone-700 px-2 py-2 font-mono text-sm"
                    style={{ color: 'var(--color-primary-light)' }}
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snacks">Snacks</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-stone-500 block mb-1">Item Name *</label>
                  <input
                    type="text"
                    value={menuForm.item}
                    onChange={(e) => setMenuForm({ ...menuForm, item: e.target.value })}
                    placeholder="e.g., Paneer Butter Masala"
                    className="w-full bg-black/50 border border-stone-700 px-2 py-2 font-mono text-sm"
                    style={{ color: 'var(--color-primary-light)' }}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-stone-500 block mb-1">Calories</label>
                  <input
                    type="number"
                    value={menuForm.calories}
                    onChange={(e) => setMenuForm({ ...menuForm, calories: e.target.value })}
                    placeholder="e.g., 450"
                    className="w-full bg-black/50 border border-stone-700 px-2 py-2 font-mono text-sm"
                    style={{ color: 'var(--color-primary-light)' }}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-stone-500 block mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={menuForm.tags}
                    onChange={(e) => setMenuForm({ ...menuForm, tags: e.target.value })}
                    placeholder="e.g., veg, spicy"
                    className="w-full bg-black/50 border border-stone-700 px-2 py-2 font-mono text-sm"
                    style={{ color: 'var(--color-primary-light)' }}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <HUDButton type="submit" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Menu Item'}
                </HUDButton>
              </div>
            </form>
          )}

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2" style={{ color: 'var(--color-pink)' }}>
              <Megaphone size={16} /> <span className="font-bold text-sm">OFFICIAL NOTICES</span>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
                className="flex items-center gap-1 px-3 py-1 text-xs font-mono uppercase border transition-all"
                style={{
                  borderColor: 'var(--color-green)',
                  color: 'var(--color-green)',
                  backgroundColor: showAnnouncementForm ? 'rgba(129, 178, 154, 0.2)' : 'transparent'
                }}
              >
                {showAnnouncementForm ? <X size={12} /> : <Plus size={12} />}
                {showAnnouncementForm ? 'Cancel' : 'Add Announcement'}
              </button>
            )}
          </div>

          {/* Admin Add Announcement Form */}
          {isAdmin && showAnnouncementForm && (
            <form onSubmit={handleAddAnnouncement} className="mb-6 p-4 border border-stone-700 bg-black/40">
              <div className="text-xs uppercase mb-3 font-mono" style={{ color: 'var(--color-green)' }}>+ ADD ANNOUNCEMENT</div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-stone-500 block mb-1">Title *</label>
                  <input
                    type="text"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    placeholder="e.g., Exam Schedule Released"
                    className="w-full bg-black/50 border border-stone-700 px-2 py-2 font-mono text-sm"
                    style={{ color: 'var(--color-primary-light)' }}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-stone-500 block mb-1">Category</label>
                  <select
                    value={announcementForm.category}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, category: e.target.value })}
                    className="w-full bg-black/50 border border-stone-700 px-2 py-2 font-mono text-sm"
                    style={{ color: 'var(--color-primary-light)' }}
                  >
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="event">Event</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase text-stone-500 block mb-1">Body *</label>
                  <textarea
                    value={announcementForm.body}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, body: e.target.value })}
                    placeholder="Detailed description of the announcement..."
                    className="w-full bg-black/50 border border-stone-700 px-2 py-2 font-mono text-sm min-h-[80px]"
                    style={{ color: 'var(--color-primary-light)' }}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-stone-500 block mb-1">Priority</label>
                  <select
                    value={announcementForm.priority}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                    className="w-full bg-black/50 border border-stone-700 px-2 py-2 font-mono text-sm"
                    style={{ color: 'var(--color-primary-light)' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-stone-500 block mb-1">Event Date (optional)</label>
                  <input
                    type="datetime-local"
                    value={announcementForm.event_at}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, event_at: e.target.value })}
                    className="w-full bg-black/50 border border-stone-700 px-2 py-2 font-mono text-sm"
                    style={{ color: 'var(--color-primary-light)' }}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <HUDButton type="submit" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Announcement'}
                </HUDButton>
              </div>
            </form>
          )}

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
