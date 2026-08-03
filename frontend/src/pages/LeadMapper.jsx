import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/api/client';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import MapView from '@/components/lead-mapper/MapView';
import Sidebar from '@/components/lead-mapper/Sidebar';
import LeadDetailPanel from '@/components/lead-mapper/LeadDetailPanel';
import LogLeadForm from '@/components/lead-mapper/LogLeadForm';
import SearchHereButton from '@/components/lead-mapper/SearchHereButton';
import { useNavigate } from 'react-router-dom';
import { Menu, CircleUser, LayoutList } from 'lucide-react';

export default function LeadMapper() {
  const navigate = useNavigate();
  const { loaded, error: mapsError } = useGoogleMaps();
  const [places, setPlaces] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [activeTab, setActiveTab] = useState('discover');
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(384);
  const [subscriptionPlan, setSubscriptionPlan] = useState('premium');
  const [searchLocation, setSearchLocation] = useState(null);
  const [currentMapCenter, setCurrentMapCenter] = useState(null);
  const resizingRef = useRef(false);

  useEffect(() => {
    loadLeads();
    api.auth.me().then(user => {
      setSubscriptionPlan(user?.subscription_plan || 'premium');
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizingRef.current) return;
      const newWidth = Math.max(280, Math.min(640, e.clientX));
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => {
      if (!resizingRef.current) return;
      resizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startResize = () => {
    resizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const loadLeads = async () => {
    try {
      const result = await api.entities.Lead.list('-updated_date', 200);
      setLeads(result);
    } catch (err) {
      console.error('Failed to load leads:', err);
    }
  };

  useEffect(() => {
    const defaultLoc = { lat: 40.7128, lng: -74.006 };
    if (!navigator.geolocation) {
      setUserLocation(defaultLoc);
      setMapCenter(defaultLoc);
      setSearchLocation(defaultLoc);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setMapCenter(loc);
        setSearchLocation(loc);
      },
      () => {
        setUserLocation(defaultLoc);
        setMapCenter(defaultLoc);
        setSearchLocation(defaultLoc);
      }
    );
  }, []);

  const handleSearch = useCallback(async (query, locOverride) => {
    const loc = locOverride || searchLocation;
    if (!query || !loc) return;
    setSearching(true);
    setSearchQuery(query);
    if (locOverride) setSearchLocation(locOverride);
    try {
      const res = await api.functions.invoke('googlePlaces', {
        action: 'search',
        lat: loc.lat,
        lng: loc.lng,
        keyword: query,
        radius: 5000,
      });
      setPlaces(res.data.places || []);
    } catch (err) {
      console.error('Search failed:', err);
      setPlaces([]);
    } finally {
      setSearching(false);
    }
  }, [searchLocation]);

  const handleSearchHere = useCallback(() => {
    if (!currentMapCenter || !searchQuery) return;
    handleSearch(searchQuery, currentMapCenter);
  }, [currentMapCenter, searchQuery, handleSearch]);

  const handleZipSearch = useCallback(async (zip) => {
    if (!zip) return;
    setSearching(true);
    try {
      const res = await api.functions.invoke('googlePlaces', { action: 'geocode', zip });
      const latLng = { lat: res.data.lat, lng: res.data.lng };
      setSearchLocation(latLng);
      setMapCenter(latLng);
      if (searchQuery) {
        handleSearch(searchQuery, latLng);
      } else {
        setSearching(false);
      }
    } catch (err) {
      setSearching(false);
      alert('Could not find that zip code. Please try again.');
    }
  }, [searchQuery, handleSearch]);

  const handleCenterChanged = useCallback((c) => {
    setCurrentMapCenter(c);
  }, []);

  const handlePlaceClick = useCallback(async (place, lead) => {
    setShowDetailPanel(true);
    setSelectedPlace(place);
    setSelectedLead(lead || leads.find(l => l.place_id === place.place_id) || null);
    setMapCenter({ lat: place.lat, lng: place.lng });

    if (!place.phone || !place.website) {
      try {
        const res = await api.functions.invoke('googlePlaces', {
          action: 'details',
          place_id: place.place_id,
        });
        setSelectedPlace(prev => ({ ...prev, ...res.data.place }));
      } catch (err) {
        // keep original place
      }
    }
  }, [leads]);

  const handleLogLead = useCallback(async (data) => {
    const isNewLead = !leads.find(l => l.place_id === data.place_id);
    if (isNewLead) {
      const leadLimit = subscriptionPlan === 'standard' ? 50 : 1000;
      if (leads.length >= leadLimit) {
        alert(`You've reached the ${leadLimit}-lead limit on your plan.`);
        return;
      }
    }
    setSaving(true);
    try {
      const existing = leads.find(l => l.place_id === data.place_id);
      const newAction = {
        action_type: data.action_type,
        action_date: data.action_date,
        notes: data.notes,
        pipeline_stage: data.pipeline_stage,
      };

      if (existing) {
        const updated = await api.entities.Lead.update(existing.id, {
          pipeline_stage: data.pipeline_stage,
          contact_name: data.contact_name || existing.contact_name,
          contact_phone: data.contact_phone || existing.contact_phone,
          contact_email: data.contact_email || existing.contact_email,
          notes: data.notes || existing.notes,
          last_action_type: data.action_type,
          last_action_date: data.action_date,
          actions: [...(existing.actions || []), newAction],
        });
        setLeads(prev => prev.map(l => l.id === existing.id ? updated : l));
        setSelectedLead(updated);
      } else {
        const newLead = await api.entities.Lead.create({
          place_id: data.place_id,
          name: data.name,
          address: data.address,
          lat: data.lat,
          lng: data.lng,
          category: data.category,
          phone: data.phone,
          website: data.website,
          pipeline_stage: data.pipeline_stage,
          contact_name: data.contact_name,
          contact_phone: data.contact_phone,
          contact_email: data.contact_email,
          notes: data.notes,
          last_action_type: data.action_type,
          last_action_date: data.action_date,
          actions: [newAction],
        });
        setLeads(prev => [newLead, ...prev]);
        setSelectedLead(newLead);
      }
      setShowLogForm(false);
    } catch (err) {
      console.error('Failed to save lead:', err);
    } finally {
      setSaving(false);
    }
  }, [leads, subscriptionPlan]);

  const handleDeleteLead = useCallback(async (lead) => {
    try {
      await api.entities.Lead.delete(lead.id);
      setLeads(prev => prev.filter(l => l.id !== lead.id));
      setSelectedLead(null);
      setShowDetailPanel(false);
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  }, []);

  const showSearchHere = searchQuery && currentMapCenter && searchLocation && (
    Math.abs(currentMapCenter.lat - searchLocation.lat) > 0.005 ||
    Math.abs(currentMapCenter.lng - searchLocation.lng) > 0.005
  );

  return (
    <div className="fixed inset-0 flex bg-background">
      <div className="hidden md:flex flex-shrink-0 border-r border-border" style={{ width: sidebarWidth }}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          places={places}
          leads={leads}
          selectedPlaceId={selectedPlace?.place_id}
          onPlaceClick={handlePlaceClick}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onZipSearch={handleZipSearch}
          searching={searching}
          subscriptionPlan={subscriptionPlan}
        />
      </div>

      <div
        onMouseDown={startResize}
        className="hidden md:block w-1.5 cursor-col-resize bg-border hover:bg-foreground/20 active:bg-foreground/40 transition-colors flex-shrink-0"
      />

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85%] bg-background border-r border-border">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              places={places}
              leads={leads}
              selectedPlaceId={selectedPlace?.place_id}
              onPlaceClick={(p, l) => { handlePlaceClick(p, l); setSidebarOpen(false); }}
              searchQuery={searchQuery}
              onSearch={handleSearch}
              onZipSearch={handleZipSearch}
              searching={searching}
              subscriptionPlan={subscriptionPlan}
            />
          </div>
        </div>
      )}

      <div className="flex-1 relative">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden absolute top-4 left-4 z-10 p-2 rounded-lg bg-background border border-border shadow-sm"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border shadow-sm text-sm hover:bg-secondary"
          >
            <LayoutList className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="p-2 rounded-lg bg-background border border-border shadow-sm"
          >
            <CircleUser className="w-5 h-5" />
          </button>
        </div>

        {mapsError ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4 text-center">
            <div>
              <p>Failed to load Google Maps.</p>
              <p className="text-xs mt-1">Check your API key and try again.</p>
            </div>
          </div>
        ) : !loaded ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <MapView
              loaded={loaded}
              center={mapCenter}
              places={places}
              leads={leads}
              onPlaceClick={handlePlaceClick}
              onCenterChanged={handleCenterChanged}
            />
            {showSearchHere && (
              <SearchHereButton onClick={handleSearchHere} searching={searching} />
            )}
          </>
        )}

        {showDetailPanel && (
          <LeadDetailPanel
            place={selectedPlace}
            lead={selectedLead}
            onClose={() => setShowDetailPanel(false)}
            onLogLead={() => setShowLogForm(true)}
            onDeleteLead={handleDeleteLead}
          />
        )}
      </div>

      {showLogForm && selectedPlace && (
        <LogLeadForm
          onClose={() => setShowLogForm(false)}
          onSubmit={handleLogLead}
          place={selectedPlace}
          lead={selectedLead}
          saving={saving}
          subscriptionPlan={subscriptionPlan}
        />
      )}
    </div>
  );
}