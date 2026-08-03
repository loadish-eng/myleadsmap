import { Phone, MapPin, Mail, User, X, Plus, Clock, Trash2, Globe } from 'lucide-react';
import StageBadge from './StageBadge';
import { STAGES, ACTION_TYPES } from '@/lib/leadConfig';

export default function LeadDetailPanel({ place, lead, onClose, onLogLead, onDeleteLead }) {
  if (!place) return null;

  const actions = (lead?.actions || []).slice().reverse();

  return (
    <div className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-background border-l border-border shadow-xl z-20 flex flex-col">
      <div className="flex items-start justify-between p-4 border-b border-border">
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold font-heading text-base">{place.name}</h2>
          {place.category && (
            <p className="text-xs text-muted-foreground capitalize mt-0.5">{place.category.replace(/_/g, ' ')}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {lead && (
            <button
              onClick={() => {
                if (confirm('Delete this lead? This cannot be undone.')) onDeleteLead(lead);
              }}
              className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Delete lead"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3 border-b border-border">
          {place.address && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{place.address}</span>
            </div>
          )}
          {place.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">{place.phone}</span>
            </div>
          )}
          {(place.website || lead?.website) && (
            <a
              href={place.website || lead.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-foreground hover:underline"
            >
              <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{(place.website || lead.website).replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
            </a>
          )}
        </div>

        {lead ? (
          <>
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Pipeline</span>
                <StageBadge stage={lead.pipeline_stage} />
              </div>
              {(lead.contact_name || lead.contact_phone || lead.contact_email) && (
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Contact</span>
                  {lead.contact_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{lead.contact_name}</span>
                    </div>
                  )}
                  {lead.contact_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{lead.contact_phone}</span>
                    </div>
                  )}
                  {lead.contact_email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{lead.contact_email}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Action History</span>
              <div className="mt-3 space-y-0">
                {actions.length > 0 ? actions.map((action, idx) => {
                  const actionConfig = ACTION_TYPES[action.action_type];
                  const Icon = actionConfig?.icon || Clock;
                  return (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        {idx < actions.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{actionConfig?.label || action.action_type}</p>
                          <span className="text-xs text-muted-foreground">{action.action_date}</span>
                        </div>
                        {action.pipeline_stage && (
                          <span className="text-xs text-muted-foreground">{STAGES[action.pipeline_stage]?.label}</span>
                        )}
                        {action.notes && <p className="text-sm text-muted-foreground mt-1">{action.notes}</p>}
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-muted-foreground">No actions logged yet.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="p-4">
            <p className="text-sm text-muted-foreground">No lead logged for this business yet.</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <button
          onClick={onLogLead}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {lead ? 'Log New Action' : 'Log Lead'}
        </button>
      </div>
    </div>
  );
}