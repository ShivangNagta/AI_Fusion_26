import React, { useEffect, useState } from 'react';
import { HUDButton, HUDCard } from '../components/RetroUI';
import { api } from '../services/api';
import { UserProfile } from '../types';
import { PackageSearch, ShoppingCart, CarTaxiFront } from 'lucide-react';

interface StudentExchangeProps {
  user: UserProfile;
}

type TabType = 'lost-found' | 'marketplace' | 'travel';

export const StudentExchange: React.FC<StudentExchangeProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<TabType>('lost-found');
  const [lostFound, setLostFound] = useState<any[]>([]);
  const [marketplace, setMarketplace] = useState<any[]>([]);
  const [travel, setTravel] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [lostForm, setLostForm] = useState({ type: 'lost', title: '', description: '', location: '', contact: user.email });
  const [marketForm, setMarketForm] = useState({ title: '', description: '', price: '', category: 'textbooks', seller: user.username, contact: user.email, item_condition: 'good' });
  const [travelForm, setTravelForm] = useState({ destination: '', depart_at: '', seats: 1, notes: '', contact: user.email });

  const refresh = async () => {
    const [lostData, marketData, travelData] = await Promise.all([
      api.lostFound(),
      api.marketplace(),
      api.travel()
    ]);
    setLostFound(lostData.items || []);
    setMarketplace(marketData.items || []);
    setTravel(travelData.items || []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleLostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createLostFound(lostForm);
    setLostForm({ type: 'lost', title: '', description: '', location: '', contact: user.email });
    refresh();
  };

  const handleMarketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createMarketplace({ ...marketForm, price: Number(marketForm.price) });
    setMarketForm({ title: '', description: '', price: '', category: 'textbooks', seller: user.username, contact: user.email, item_condition: 'good' });
    refresh();
  };

  const handleTravelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createTravel({ ...travelForm, seats: Number(travelForm.seats) });
    setTravelForm({ destination: '', depart_at: '', seats: 1, notes: '', contact: user.email });
    refresh();
  };

  const tabs = [
    { id: 'lost-found' as TabType, label: 'Lost & Found', icon: <PackageSearch size={16} /> },
    { id: 'marketplace' as TabType, label: 'Marketplace', icon: <ShoppingCart size={16} /> },
    { id: 'travel' as TabType, label: 'Travel Sharing', icon: <CarTaxiFront size={16} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-800 pb-4">
        <h1 className="text-2xl font-['Orbitron'] text-white">STUDENT EXCHANGE</h1>
        <p className="text-xs text-stone-400 font-mono">Lost & found, marketplace, and travel sharing.</p>
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

      {/* Lost & Found Tab */}
      {activeTab === 'lost-found' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <HUDCard title="REPORT ITEM">
            <form onSubmit={handleLostSubmit} className="space-y-4">
              <div className="text-xs font-bold flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                <PackageSearch size={14} /> Report a lost or found item
              </div>
              <select
                value={lostForm.type}
                onChange={(e) => setLostForm({ ...lostForm, type: e.target.value })}
                className="w-full bg-black/50 border border-stone-700 px-3 py-2 text-sm font-mono"
              >
                <option value="lost">I Lost Something</option>
                <option value="found">I Found Something</option>
              </select>
              <input
                value={lostForm.title}
                onChange={(e) => setLostForm({ ...lostForm, title: e.target.value })}
                placeholder="Item title (e.g., Blue Wallet)"
                className="w-full bg-black/50 border border-stone-700 px-3 py-2 text-sm font-mono"
                required
              />
              <input
                value={lostForm.location}
                onChange={(e) => setLostForm({ ...lostForm, location: e.target.value })}
                placeholder="Location (e.g., Library Block A)"
                className="w-full bg-black/50 border border-stone-700 px-3 py-2 text-sm font-mono"
                required
              />
              <textarea
                value={lostForm.description}
                onChange={(e) => setLostForm({ ...lostForm, description: e.target.value })}
                placeholder="Description with identifying details..."
                className="w-full bg-black/50 border border-stone-700 px-3 py-2 text-sm font-mono h-24"
                required
              />
              <HUDButton type="submit" className="w-full">Submit Report</HUDButton>
            </form>
          </HUDCard>

          <HUDCard title="RECENT REPORTS">
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="text-xs text-stone-500">Loading...</div>
              ) : lostFound.length === 0 ? (
                <div className="text-xs text-stone-500">No reports yet.</div>
              ) : (
                lostFound.map((item) => (
                  <div key={item.id} className="p-3 border border-stone-700 bg-black/40">
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] uppercase px-2 py-0.5 ${
                        item.type === 'lost' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-green-950 text-green-400 border border-green-800'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-[10px] text-stone-500">{item.location}</span>
                    </div>
                    <div className="font-bold mt-2" style={{ color: 'var(--color-primary-light)' }}>{item.title}</div>
                    <div className="text-xs text-stone-400 mt-1">{item.description}</div>
                    <div className="text-[10px] mt-2" style={{ color: 'var(--color-primary)' }}>Contact: {item.contact}</div>
                  </div>
                ))
              )}
            </div>
          </HUDCard>
        </div>
      )}

      {/* Marketplace Tab */}
      {activeTab === 'marketplace' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <HUDCard title="LIST AN ITEM" accent="pink">
            <form onSubmit={handleMarketSubmit} className="space-y-4">
              <div className="text-xs font-bold flex items-center gap-2" style={{ color: 'var(--color-pink)' }}>
                <ShoppingCart size={14} /> Sell your stuff to fellow students
              </div>
              <input
                value={marketForm.title}
                onChange={(e) => setMarketForm({ ...marketForm, title: e.target.value })}
                placeholder="Item title"
                className="w-full bg-black/50 border border-stone-700 px-3 py-2 text-sm font-mono"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={marketForm.price}
                  onChange={(e) => setMarketForm({ ...marketForm, price: e.target.value })}
                  placeholder="Price (₹)"
                  type="number"
                  className="w-full bg-black/50 border border-stone-700 px-3 py-2 text-sm font-mono"
                  required
                />
                <select
                  value={marketForm.category}
                  onChange={(e) => setMarketForm({ ...marketForm, category: e.target.value })}
                  className="w-full bg-black/50 border border-stone-700 px-3 py-2 text-sm font-mono"
                >
                  <option value="textbooks">Textbooks</option>
                  <option value="electronics">Electronics</option>
                  <option value="furniture">Furniture</option>
                  <option value="cycles">Cycles</option>
                </select>
              </div>
              <select
                value={marketForm.item_condition}
                onChange={(e) => setMarketForm({ ...marketForm, item_condition: e.target.value })}
                className="w-full bg-black/50 border border-stone-700 px-3 py-2 text-sm font-mono"
              >
                <option value="excellent">Excellent Condition</option>
                <option value="good">Good Condition</option>
                <option value="fair">Fair Condition</option>
              </select>
              <textarea
                value={marketForm.description}
                onChange={(e) => setMarketForm({ ...marketForm, description: e.target.value })}
                placeholder="Describe your item..."
                className="w-full bg-black/50 border border-stone-700 px-3 py-2 text-sm font-mono h-24"
                required
              />
              <HUDButton type="submit" className="w-full">List Item for Sale</HUDButton>
            </form>
          </HUDCard>

          <HUDCard title="ITEMS FOR SALE" accent="pink">
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="text-xs text-stone-500">Loading...</div>
              ) : marketplace.length === 0 ? (
                <div className="text-xs text-stone-500">No items listed yet.</div>
              ) : (
                marketplace.map((item) => (
                  <div key={item.id} className="p-3 border border-stone-700 bg-black/40">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase text-stone-500">{item.category}</span>
                      <span className="text-[10px] uppercase px-2 py-0.5 bg-stone-800 text-stone-400">{item.item_condition}</span>
                    </div>
                    <div className="font-bold mt-2" style={{ color: 'var(--color-primary-light)' }}>{item.title}</div>
                    <div className="text-xs text-stone-400 mt-1">{item.description}</div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-lg font-bold" style={{ color: 'var(--color-pink)' }}>₹{item.price}</span>
                      <span className="text-[10px] text-stone-500">{item.contact}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </HUDCard>
        </div>
      )}

      {/* Travel Sharing Tab */}
      {activeTab === 'travel' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <HUDCard title="POST A RIDE" accent="orange">
            <form onSubmit={handleTravelSubmit} className="space-y-4">
              <div className="text-xs font-bold flex items-center gap-2" style={{ color: 'var(--color-orange)' }}>
                <CarTaxiFront size={14} /> Share a cab to save money
              </div>
              <input
                value={travelForm.destination}
                onChange={(e) => setTravelForm({ ...travelForm, destination: e.target.value })}
                placeholder="Destination (e.g., Chandigarh Airport)"
                className="w-full bg-black/50 border border-stone-700 px-3 py-2 text-sm font-mono"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="datetime-local"
                  value={travelForm.depart_at}
                  onChange={(e) => setTravelForm({ ...travelForm, depart_at: e.target.value })}
                  className="w-full bg-black/50 border border-stone-700 px-3 py-2 text-sm font-mono"
                  required
                />
                <input
                  type="number"
                  min={1}
                  value={travelForm.seats}
                  onChange={(e) => setTravelForm({ ...travelForm, seats: Number(e.target.value) })}
                  placeholder="Seats"
                  className="w-full bg-black/50 border border-stone-700 px-3 py-2 text-sm font-mono"
                />
              </div>
              <textarea
                value={travelForm.notes}
                onChange={(e) => setTravelForm({ ...travelForm, notes: e.target.value })}
                placeholder="Additional notes (pickup point, cost sharing, etc.)"
                className="w-full bg-black/50 border border-stone-700 px-3 py-2 text-sm font-mono h-24"
              />
              <HUDButton type="submit" className="w-full">Post Ride</HUDButton>
            </form>
          </HUDCard>

          <HUDCard title="AVAILABLE RIDES" accent="orange">
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="text-xs text-stone-500">Loading...</div>
              ) : travel.length === 0 ? (
                <div className="text-xs text-stone-500">No rides posted yet.</div>
              ) : (
                travel.map((trip) => (
                  <div key={trip.id} className="p-3 border border-stone-700 bg-black/40">
                    <div className="font-bold" style={{ color: 'var(--color-orange)' }}>{trip.destination}</div>
                    <div className="text-xs text-stone-400 mt-2">
                      <span className="mr-4">📅 {new Date(trip.depart_at).toLocaleDateString()}</span>
                      <span>🕐 {new Date(trip.depart_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm px-2 py-1 bg-orange-950 border border-orange-800 text-orange-400">
                        {trip.seats} seat{trip.seats > 1 ? 's' : ''} available
                      </span>
                      <span className="text-[10px] text-stone-500">{trip.contact}</span>
                    </div>
                    {trip.notes && <div className="text-xs text-stone-500 mt-2 italic">{trip.notes}</div>}
                  </div>
                ))
              )}
            </div>
          </HUDCard>
        </div>
      )}
    </div>
  );
};
