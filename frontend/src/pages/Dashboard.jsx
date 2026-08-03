import { useState, useEffect, useMemo } from 'react';
import { api } from '@/api/client';
import { useNavigate } from 'react-router-dom';
import { Map as MapIcon, CircleUser } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getStages } from '@/lib/leadConfig';
import StageBadge from '@/components/lead-mapper/StageBadge';

export default function Dashboard() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [subscriptionPlan, setSubscriptionPlan] = useState('premium');

  useEffect(() => {
    loadLeads();
    api.auth.me().then(user => {
      setSubscriptionPlan(user?.subscription_plan || 'premium');
    }).catch(() => {});
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const result = await api.entities.Lead.list('-updated_date', 500);
      setLeads(result);
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const stages = getStages(subscriptionPlan);

  const filteredLeads = useMemo(() => {
    let result = [...leads];

    if (stageFilter !== 'all') {
      result = result.filter(l => l.pipeline_stage === stageFilter);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.last_action_date || a.created_date || 0).getTime();
      const dateB = new Date(b.last_action_date || b.created_date || 0).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [leads, stageFilter, sortOrder]);

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
        <h1 className="text-lg font-semibold">Lead Dashboard</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border shadow-sm text-sm hover:bg-secondary"
          >
            <MapIcon className="w-4 h-4" />
            Map View
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="p-2 rounded-lg bg-background border border-border shadow-sm"
          >
            <CircleUser className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 px-6 py-3 border-b border-border flex-shrink-0">
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {Object.entries(stages).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sort by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground ml-auto">
          Showing {filteredLeads.length} of {leads.length} leads
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin" />
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No leads found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="px-6 py-3 font-medium">Business</th>
                <th className="px-6 py-3 font-medium">Address</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Stage</th>
                <th className="px-6 py-3 font-medium">Last Action</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => (
                <tr key={lead.id} className="border-b border-border hover:bg-secondary/50">
                  <td className="px-6 py-3 font-medium">{lead.name}</td>
                  <td className="px-6 py-3 text-muted-foreground">{lead.address}</td>
                  <td className="px-6 py-3 text-muted-foreground">{lead.phone || '—'}</td>
                  <td className="px-6 py-3"><StageBadge stage={lead.pipeline_stage} /></td>
                  <td className="px-6 py-3 text-muted-foreground capitalize">
                    {lead.last_action_type ? lead.last_action_type.replace('_', ' ') : '—'}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {lead.last_action_date || (lead.created_date ? new Date(lead.created_date).toLocaleDateString() : '—')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
