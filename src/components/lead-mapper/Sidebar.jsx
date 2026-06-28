import { useState } from 'react';
import { Map, List } from 'lucide-react';
import CategorySearch from './CategorySearch';
import ZipSearch from './ZipSearch';
import BusinessListItem from './BusinessListItem';
import { STAGES, getStages } from '@/lib/leadConfig';

export default function Sidebar({
  activeTab, setActiveTab, places, leads, selectedPlaceId, onPlaceClick, searchQuery, onSearch, onZipSearch, searching, subscriptionPlan = 'premium'
}) {
  const [stageFilter, setStageFilter] = useState('all');
  const stages = getStages(subscriptionPlan);
  const filteredLeads = stageFilter === 'all' ? leads : leads.filter((l) => l.pipeline_stage === stageFilter);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-4 py-4 border-b border-border">
        <h1 className="text-lg font-semibold font-heading">MyLeadsMap</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Map your local business outreach</p>
      </div>

      <div className="flex gap-1 px-3 pt-3">
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
          activeTab === 'discover' ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`
          }>
          
          <Map className="w-3.5 h-3.5" /> Discover
        </button>
        <button
          onClick={() => setActiveTab('my-leads')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
          activeTab === 'my-leads' ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`
          }>
          
          <List className="w-3.5 h-3.5" /> My Leads
          {leads.length > 0 && <span className="text-xs text-muted-foreground">({leads.length})</span>}
        </button>
      </div>

      {activeTab === 'discover' ?
      <div className="flex flex-col flex-1 overflow-hidden">
          <div className="px-3 py-3 space-y-3">
            <CategorySearch onSearch={onSearch} searching={searching} initialValue={searchQuery} />
            <ZipSearch onZipSearch={onZipSearch} searching={searching} />
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {searching ?
          <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-border border-t-foreground rounded-full animate-spin" />
              </div> :
          places.length === 0 ?
          <div className="text-center py-12 text-sm text-muted-foreground">
                <p>Search for a business type above</p>
                <p className="text-xs mt-1">e.g. "dental", "legal", "restaurant"</p>
              </div> :

          <>
                <p className="text-xs text-muted-foreground mb-2 px-1">{places.length} businesses found</p>
                {places.map((place) => {
              const lead = leads.find((l) => l.place_id === place.place_id);
              return (
                <BusinessListItem
                  key={place.place_id}
                  place={place}
                  lead={lead}
                  selected={selectedPlaceId === place.place_id}
                  onClick={() => onPlaceClick(place, lead)} />);


            })}
              </>
          }
          </div>
        </div> :

      <div className="flex flex-col flex-1 overflow-hidden">
          <div className="px-3 pt-3 text-xs text-muted-foreground">
            {leads.length} / {subscriptionPlan === 'standard' ? 50 : 1000} leads used
          </div>
          <div className="flex flex-wrap gap-1.5 px-3 py-3">
            <button
            onClick={() => setStageFilter('all')}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
            stageFilter === 'all' ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`
            }>
            
              All ({leads.length})
            </button>
            {Object.entries(stages).map(([key, config]) => {
            const count = leads.filter((l) => l.pipeline_stage === key).length;
            return (
              <button
                key={key}
                onClick={() => setStageFilter(key)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1.5 ${
                stageFilter === key ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`
                }>
                
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
                  {config.label} ({count})
                </button>);

          })}
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {filteredLeads.length === 0 ?
          <div className="text-center py-12 text-sm text-muted-foreground">
                <p>No leads yet</p>
                <p className="text-xs mt-1">Search and log your first lead</p>
              </div> :

          filteredLeads.map((lead) =>
          <BusinessListItem
            key={lead.id}
            place={{
              place_id: lead.place_id, name: lead.name, address: lead.address,
              category: lead.category, lat: lead.lat, lng: lead.lng
            }}
            lead={lead}
            selected={selectedPlaceId === lead.place_id}
            onClick={() => onPlaceClick({
              place_id: lead.place_id, name: lead.name, address: lead.address,
              category: lead.category, lat: lead.lat, lng: lead.lng
            }, lead)} />

          )
          }
          </div>
        </div>
      }
    </div>);

}