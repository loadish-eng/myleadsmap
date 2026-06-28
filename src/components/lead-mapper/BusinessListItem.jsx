import { getCategoryIcon } from '@/lib/categoryIcons';
import { CATEGORY_ICONS, STAGES, ACTION_TYPES } from '@/lib/leadConfig';

export default function BusinessListItem({ place, lead, selected, onClick }) {
  const IconComponent = CATEGORY_ICONS[getCategoryIcon(place.category)];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border mb-1.5 transition-colors ${
        selected ? 'border-foreground bg-secondary' : 'border-border hover:border-foreground/30 hover:bg-secondary/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground">
          {IconComponent && <IconComponent className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-sm truncate">{place.name}</p>
            {lead && (
              <span className="flex-shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: STAGES[lead.pipeline_stage]?.color }} />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{place.address}</p>
          {lead && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-xs text-muted-foreground">{STAGES[lead.pipeline_stage]?.label}</span>
              {lead.last_action_type && (
                <span className="text-xs text-muted-foreground">· {ACTION_TYPES[lead.last_action_type]?.label || lead.last_action_type}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}