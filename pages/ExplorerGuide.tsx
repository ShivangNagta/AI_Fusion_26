import React, { useEffect, useState } from 'react';
import { HUDButton, HUDCard } from '../components/RetroUI';
import { UnderConstruction } from '../components/UnderConstruction';
import { api } from '../services/api';
import { Compass, Sparkles, MapPin, Map } from 'lucide-react';

type TabType = 'nearby' | 'recommendations' | 'map';

export const ExplorerGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('nearby');
  const [places, setPlaces] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [mood, setMood] = useState('study-friendly');
  const [budget, setBudget] = useState('medium');
  const [openNow, setOpenNow] = useState(true);
  const [loading, setLoading] = useState(false);

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

  const tabs = [
    { id: 'nearby' as TabType, label: 'Nearby Places', icon: <MapPin size={16} /> },
    { id: 'recommendations' as TabType, label: 'AI Recommendations', icon: <Sparkles size={16} /> },
    { id: 'map' as TabType, label: 'Campus Map', icon: <Map size={16} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-800 pb-4">
        <h1 className="text-2xl font-['Orbitron'] text-white">EXPLORER'S GUIDE</h1>
        <p className="text-xs text-stone-400 font-mono">Discover places around IIT Ropar campus.</p>
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

      {/* Nearby Places Tab */}
      {activeTab === 'nearby' && (
        <HUDCard title="NEARBY HUB">
          <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--color-primary)' }}>
            <MapPin size={16} /> <span className="font-bold text-sm">PLACES AROUND CAMPUS</span>
          </div>
          {places.length === 0 ? (
            <div className="text-xs text-stone-500">No places loaded.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {places.map((place) => (
                <div key={place.id} className="p-4 border border-stone-700 bg-black/40">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-stone-500">{place.distance_km} km away</span>
                    <span className="text-xs px-2 py-0.5 bg-amber-950 border border-amber-800" style={{ color: 'var(--color-primary)' }}>
                      ★ {place.rating}
                    </span>
                  </div>
                  <div className="font-bold mt-2" style={{ color: 'var(--color-primary-light)' }}>{place.name}</div>
                  <div className="text-xs text-stone-400 mt-1">{place.description}</div>
                  <div className="text-[10px] mt-3" style={{ color: 'var(--color-primary)' }}>Vibes: {place.vibe_tags}</div>
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

      {/* Campus Map Tab */}
      {activeTab === 'map' && (
        <HUDCard title="INTERACTIVE MAP">
          <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--color-primary)' }}>
            <Map size={16} /> <span className="font-bold text-sm">CAMPUS NAVIGATION</span>
          </div>
          <UnderConstruction
            title="AR Campus Navigation"
            description="Interactive campus map with AR navigation, building locations, crowd density indicators, and real-time bus tracking. Coming soon!"
          />
        </HUDCard>
      )}
    </div>
  );
};
