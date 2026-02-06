import React, { useEffect, useState } from 'react';
import { HUDButton, HUDCard } from '../components/RetroUI';
import { api } from '../services/api';
import { Compass, Sparkles, MapPin, Map, Navigation, Building, Coffee, Dumbbell, Book, Home, Bus, TreePine } from 'lucide-react';

type TabType = 'nearby' | 'recommendations' | 'map';
type CategoryFilter = 'all' | 'campus' | 'food' | 'transport' | 'nature' | 'city' | 'spiritual';

// IIT Ropar Campus locations for the interactive map
const campusLocations = [
  { id: 'main-gate', name: 'Main Gate', x: 50, y: 95, icon: 'gate', description: 'Campus entrance with security' },
  { id: 'academic', name: 'Academic Block', x: 50, y: 50, icon: 'building', description: 'Lecture halls LH1-LH4, faculty offices' },
  { id: 'library', name: 'Library', x: 60, y: 40, icon: 'book', description: '24/7 study rooms, vast collection' },
  { id: 'mess', name: 'Central Mess', x: 35, y: 55, icon: 'food', description: 'Main dining facility' },
  { id: 'sac', name: 'SAC', x: 65, y: 55, icon: 'activity', description: 'Student Activity Center' },
  { id: 'sports', name: 'Sports Complex', x: 25, y: 40, icon: 'sports', description: 'Gym, courts, cricket ground' },
  { id: 'admin', name: 'Admin Block', x: 55, y: 65, icon: 'building', description: 'Administrative offices' },
  { id: 'bh1', name: 'BH-1', x: 20, y: 60, icon: 'hostel', description: 'Boys Hostel 1' },
  { id: 'bh2', name: 'BH-2', x: 20, y: 50, icon: 'hostel', description: 'Boys Hostel 2' },
  { id: 'bh3', name: 'BH-3', x: 15, y: 45, icon: 'hostel', description: 'Boys Hostel 3' },
  { id: 'gh1', name: 'GH-1', x: 80, y: 45, icon: 'hostel', description: 'Girls Hostel 1' },
  { id: 'gh2', name: 'GH-2', x: 85, y: 50, icon: 'hostel', description: 'Girls Hostel 2' },
  { id: 'medical', name: 'Medical Center', x: 45, y: 80, icon: 'medical', description: '24/7 medical facility' },
  { id: 'night-canteen', name: 'Night Canteen', x: 18, y: 55, icon: 'food', description: 'Late night snacks' },
  { id: 'parking', name: 'Parking', x: 55, y: 88, icon: 'parking', description: 'Visitor parking area' },
];

export const ExplorerGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [places, setPlaces] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [mood, setMood] = useState('study-friendly');
  const [budget, setBudget] = useState('medium');
  const [openNow, setOpenNow] = useState(true);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [navFrom, setNavFrom] = useState('');
  const [navTo, setNavTo] = useState('');
  const [navAdvice, setNavAdvice] = useState('');
  const [navLoading, setNavLoading] = useState(false);

  useEffect(() => {
    api.nearby().then((data) => setPlaces(data.items || []));
  }, []);

  const handleRecommend = async () => {
    setLoading(true);
    try {
      const data = await api.nearbyRecommendations({ mood, budget, openNow, tags: [mood] });
      setRecommendations(data.items || []);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = async () => {
    if (!navFrom || !navTo) return;
    setNavLoading(true);
    try {
      const data = await api.navigationAdvice({ currentLocation: navFrom, destination: navTo });
      setNavAdvice(data.advice || 'Unable to get directions.');
    } catch {
      setNavAdvice('Navigation service unavailable.');
    } finally {
      setNavLoading(false);
    }
  };

  const filteredPlaces = places.filter((place) => {
    if (categoryFilter === 'all') return true;
    return place.category === categoryFilter;
  });

  const campusPlaces = places.filter((p) => p.category === 'campus');
  const nearbyPlaces = places.filter((p) => p.category !== 'campus');

  const tabs = [
    { id: 'map' as TabType, label: 'Campus Map', icon: <Map size={16} /> },
    { id: 'nearby' as TabType, label: 'Nearby Places', icon: <MapPin size={16} /> },
    { id: 'recommendations' as TabType, label: 'AI Recommendations', icon: <Sparkles size={16} /> },
  ];

  const categoryFilters = [
    { id: 'all' as CategoryFilter, label: 'All' },
    { id: 'campus' as CategoryFilter, label: 'Campus' },
    { id: 'food' as CategoryFilter, label: 'Food & Cafe' },
    { id: 'transport' as CategoryFilter, label: 'Transport' },
    { id: 'nature' as CategoryFilter, label: 'Nature' },
    { id: 'spiritual' as CategoryFilter, label: 'Spiritual' },
    { id: 'city' as CategoryFilter, label: 'City' },
  ];

  const getLocationIcon = (iconType: string) => {
    switch (iconType) {
      case 'building': return <Building size={12} />;
      case 'food': return <Coffee size={12} />;
      case 'sports': return <Dumbbell size={12} />;
      case 'book': return <Book size={12} />;
      case 'hostel': return <Home size={12} />;
      default: return <MapPin size={12} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-800 pb-4">
        <h1 className="text-2xl font-['Orbitron'] text-white">EXPLORER'S GUIDE</h1>
        <p className="text-xs text-stone-400 font-mono">Navigate IIT Ropar campus and discover nearby places.</p>
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

      {/* Campus Map Tab */}
      {activeTab === 'map' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <HUDCard title="IIT ROPAR CAMPUS MAP" className="lg:col-span-2">
            <div className="relative w-full bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-700 rounded overflow-hidden" style={{ aspectRatio: '4/3' }}>
              {/* Campus Background Grid */}
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full" style={{ 
                  backgroundImage: 'linear-gradient(rgba(245,166,35,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,166,35,0.1) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />
              </div>
              
              {/* Roads */}
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-stone-700 transform -translate-x-1/2" />
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-stone-700 transform -translate-y-1/2" />
              
              {/* Campus Boundary */}
              <div className="absolute inset-4 border-2 border-dashed border-stone-700 rounded-lg" />
              
              {/* Location Markers */}
              {campusLocations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-full transition-all hover:scale-125 ${
                    selectedLocation?.id === loc.id
                      ? 'bg-amber-500 text-black scale-125'
                      : 'bg-stone-800 text-amber-400 border border-amber-600'
                  }`}
                  style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                  title={loc.name}
                >
                  {getLocationIcon(loc.icon)}
                </button>
              ))}
              
              {/* Legend */}
              <div className="absolute bottom-2 left-2 text-[10px] text-stone-500 font-mono">
                Click markers for details • IIT Ropar, Rupnagar
              </div>
            </div>

            {/* Selected Location Info */}
            {selectedLocation && (
              <div className="mt-4 p-4 border border-amber-800 bg-amber-950/30">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
                  <span className="font-bold" style={{ color: 'var(--color-primary-light)' }}>{selectedLocation.name}</span>
                </div>
                <p className="text-sm text-stone-400">{selectedLocation.description}</p>
                <button
                  onClick={() => { setNavTo(selectedLocation.name); setActiveTab('map'); }}
                  className="mt-3 text-xs font-mono px-3 py-1 border border-stone-700 hover:border-amber-600 transition-all"
                  style={{ color: 'var(--color-primary)' }}
                >
                  <Navigation size={12} className="inline mr-1" /> Navigate Here
                </button>
              </div>
            )}
          </HUDCard>

          {/* Navigation Panel */}
          <HUDCard title="AI NAVIGATION" accent="pink">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--color-pink)' }}>
                <Navigation size={16} /> <span className="font-bold text-sm">GET DIRECTIONS</span>
              </div>
              
              <div>
                <label className="text-[10px] uppercase text-stone-500 block mb-1">From</label>
                <select
                  value={navFrom}
                  onChange={(e) => setNavFrom(e.target.value)}
                  className="w-full bg-black/50 border border-stone-700 px-3 py-2 text-sm font-mono"
                  style={{ color: 'var(--color-primary-light)' }}
                >
                  <option value="">Select starting point...</option>
                  {campusLocations.map((loc) => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-[10px] uppercase text-stone-500 block mb-1">To</label>
                <select
                  value={navTo}
                  onChange={(e) => setNavTo(e.target.value)}
                  className="w-full bg-black/50 border border-stone-700 px-3 py-2 text-sm font-mono"
                  style={{ color: 'var(--color-primary-light)' }}
                >
                  <option value="">Select destination...</option>
                  {campusLocations.map((loc) => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <HUDButton onClick={handleNavigate} className="w-full" disabled={navLoading || !navFrom || !navTo}>
                <Compass size={14} /> {navLoading ? 'Getting Directions...' : 'Get Directions'}
              </HUDButton>

              {navAdvice && (
                <div className="p-4 border border-pink-800 bg-pink-950/30">
                  <div className="text-[10px] uppercase text-pink-400 mb-2">AI NAVIGATION TIP</div>
                  <p className="text-sm" style={{ color: 'var(--color-primary-light)' }}>{navAdvice}</p>
                </div>
              )}

              {/* Quick Links */}
              <div className="pt-4 border-t border-stone-700">
                <div className="text-[10px] uppercase text-stone-500 mb-3">QUICK ACCESS</div>
                <div className="grid grid-cols-2 gap-2">
                  {campusLocations.slice(0, 6).map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => { setSelectedLocation(loc); setNavTo(loc.name); }}
                      className="text-left p-2 text-xs border border-stone-700 hover:border-amber-600 transition-all bg-black/30"
                    >
                      <div className="font-mono" style={{ color: 'var(--color-primary)' }}>{loc.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </HUDCard>
        </div>
      )}

      {/* Nearby Places Tab */}
      {activeTab === 'nearby' && (
        <HUDCard title="NEARBY HUB">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
              <MapPin size={16} /> <span className="font-bold text-sm">PLACES AROUND IIT ROPAR</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {categoryFilters.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1 text-[10px] font-mono uppercase border transition-all ${
                    categoryFilter === cat.id
                      ? 'border-amber-600 bg-amber-950/50'
                      : 'border-stone-700 hover:border-stone-500'
                  }`}
                  style={{ color: categoryFilter === cat.id ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          {filteredPlaces.length === 0 ? (
            <div className="text-xs text-stone-500">No places found for this category.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlaces.map((place) => (
                <div key={place.id} className="p-4 border border-stone-700 bg-black/40 hover:border-amber-800 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase px-2 py-0.5 border border-stone-600 text-stone-400">
                      {place.category || 'nearby'}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-amber-950 border border-amber-800" style={{ color: 'var(--color-primary)' }}>
                      ★ {place.rating}
                    </span>
                  </div>
                  <div className="font-bold mt-2" style={{ color: 'var(--color-primary-light)' }}>{place.name}</div>
                  <div className="text-xs text-stone-400 mt-1">{place.description}</div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-[10px]" style={{ color: 'var(--color-primary)' }}>
                      {place.distance_km === 0 ? 'On Campus' : `${place.distance_km} km away`}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {place.vibe_tags?.split(',').slice(0, 2).join(', ')}
                    </span>
                  </div>
                  {place.coordinates && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${place.coordinates}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 text-[10px] font-mono flex items-center gap-1 hover:underline"
                      style={{ color: 'var(--color-pink)' }}
                    >
                      <Navigation size={10} /> Open in Google Maps
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </HUDCard>
      )}
      {/* AI Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <HUDCard title="AI VIBE PICKER" accent="pink">
            <div className="space-y-4">
              <div className="flex items-center gap-2" style={{ color: 'var(--color-pink)' }}>
                <Sparkles size={16} /> <span className="font-bold text-sm">MOOD MATCHING</span>
              </div>
              <div>
                <label className="text-[10px] uppercase text-stone-500 block mb-1">What's your vibe?</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full bg-black/50 border border-stone-700 px-3 py-2 text-sm font-mono"
                >
                  <option value="study-friendly">Study Friendly</option>
                  <option value="quiet">Quiet & Peaceful</option>
                  <option value="date-spot">Date Spot</option>
                  <option value="budget">Budget Friendly</option>
                  <option value="outdoors">Outdoors & Nature</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase text-stone-500 block mb-1">Budget</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-black/50 border border-stone-700 px-3 py-2 text-sm font-mono"
                >
                  <option value="low">Low Budget (₹0-200)</option>
                  <option value="medium">Medium (₹200-500)</option>
                  <option value="high">Premium (₹500+)</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-xs text-stone-400 font-mono">
                <input
                  type="checkbox"
                  checked={openNow}
                  onChange={(e) => setOpenNow(e.target.checked)}
                />
                Open Now Only
              </label>
              <HUDButton onClick={handleRecommend} className="w-full" disabled={loading}>
                <Compass size={14} /> {loading ? 'Finding...' : 'Get Recommendations'}
              </HUDButton>
            </div>
          </HUDCard>

          <HUDCard title="TOP PICKS" accent="orange" className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--color-orange)' }}>
              <Sparkles size={16} /> <span className="font-bold text-sm">AI-CURATED FOR YOU</span>
            </div>
            {recommendations.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles size={48} className="text-stone-700 mx-auto mb-4" />
                <div className="text-xs text-stone-500">Set your preferences and click "Get Recommendations"</div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {recommendations.map((place, index) => (
                  <div key={place.id} className="p-4 border border-stone-700 bg-black/40">
                    <div className="flex justify-between items-start">
                      <span className="text-lg font-['Orbitron']" style={{ color: 'var(--color-orange)' }}>#{index + 1}</span>
                      <span className="text-xs px-2 py-0.5 bg-orange-950 border border-orange-800" style={{ color: 'var(--color-orange)' }}>
                        ★ {place.rating}
                      </span>
                    </div>
                    <div className="font-bold mt-2" style={{ color: 'var(--color-primary-light)' }}>{place.name}</div>
                    <div className="text-xs text-stone-400 mt-1">{place.description}</div>
                    <div className="text-[10px] mt-3 text-stone-500">{place.vibe_tags}</div>
                  </div>
                ))}
              </div>
            )}
          </HUDCard>
        </div>
      )}
    </div>
  );
};
