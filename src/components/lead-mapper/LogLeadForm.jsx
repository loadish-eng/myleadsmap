import { useState } from 'react';
import { X } from 'lucide-react';
import { STAGES, ACTION_TYPES, getStages } from '@/lib/leadConfig';

export default function LogLeadForm({ onClose, onSubmit, place, lead, saving, subscriptionPlan = 'premium' }) {
  const stages = getStages(subscriptionPlan);
  const defaultStage = subscriptionPlan === 'standard' ? 'open' : 'prospect';
  const initialStage = lead?.pipeline_stage && stages[lead.pipeline_stage] ? lead.pipeline_stage : defaultStage;
  const [pipelineStage, setPipelineStage] = useState(initialStage);
  const [actionType, setActionType] = useState('called');
  const [actionDate, setActionDate] = useState(new Date().toISOString().split('T')[0]);
  const [contactName, setContactName] = useState(lead?.contact_name || '');
  const [contactPhone, setContactPhone] = useState(lead?.contact_phone || place?.phone || '');
  const [contactEmail, setContactEmail] = useState(lead?.contact_email || '');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      place_id: place.place_id,
      name: place.name,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      category: place.category,
      phone: place.phone,
      website: place.website,
      pipeline_stage: pipelineStage,
      action_type: actionType,
      action_date: actionDate,
      contact_name: contactName,
      contact_phone: contactPhone,
      contact_email: contactEmail,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-background rounded-xl border border-border shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="font-semibold font-heading">{lead ? 'Log New Action' : 'Log Lead'}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Pipeline Stage</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {Object.entries(stages).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPipelineStage(key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                    pipelineStage === key ? 'border-foreground bg-secondary' : 'border-border hover:bg-secondary/50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Action Type</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {Object.entries(ACTION_TYPES).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActionType(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                      actionType === key ? 'border-foreground bg-secondary' : 'border-border hover:bg-secondary/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Date</label>
            <input
              type="date"
              value={actionDate}
              onChange={(e) => setActionDate(e.target.value)}
              required
              className="w-full mt-1.5 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Contact Person</label>
            <input
              placeholder="Name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:border-foreground transition-colors"
            />
            <input
              placeholder="Phone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:border-foreground transition-colors"
            />
            <input
              placeholder="Email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Notes</label>
            <textarea
              placeholder="Summary of the interaction..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full mt-1.5 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:border-foreground transition-colors resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}