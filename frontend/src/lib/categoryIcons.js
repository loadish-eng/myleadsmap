const STAGE_COLORS = {
  prospect: '#A0A0A0',
  pitched: '#5B7B9A',
  following_up: '#A88B5C',
  closed: '#0F0F0F',
};

const MARKER_ICONS = {
  legal: '<path d="M12 3v18M5 7h14M5 7L3 12L7 12ZM19 7L17 12L21 12Z" stroke="#F7F7F5" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  medical: '<rect x="4" y="9" width="16" height="12" rx="1.5" stroke="#F7F7F5" stroke-width="1.8" fill="none"/><path d="M12 12v6M9 15h6" stroke="#F7F7F5" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
  food: '<path d="M7 3v8M9 3v8M7 11a2 2 0 0 0 2 0M9 3v18M17 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4v9" stroke="#F7F7F5" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  business: '<rect x="3" y="8" width="18" height="12" rx="2" stroke="#F7F7F5" stroke-width="1.8" fill="none"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#F7F7F5" stroke-width="1.8" fill="none"/>',
  beauty: '<circle cx="6" cy="6" r="2.5" stroke="#F7F7F5" stroke-width="1.8" fill="none"/><circle cx="6" cy="18" r="2.5" stroke="#F7F7F5" stroke-width="1.8" fill="none"/><path d="M8 8l12 12M8 16L20 4" stroke="#F7F7F5" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
  auto: '<path d="M5 16h14M6 16l1.5-5h9L18 16M5 16v2M19 16v2" stroke="#F7F7F5" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  fitness: '<path d="M6 4v16M4 7v10M6 12h12M18 4v16M20 7v10" stroke="#F7F7F5" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
  education: '<path d="M2 9l10-4 10 4-10 4-10-4zM6 11v4c0 1 3 3 6 3s6-2 6-3v-4" stroke="#F7F7F5" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  default: '<rect x="4" y="9" width="16" height="12" rx="1.5" stroke="#F7F7F5" stroke-width="1.8" fill="none"/><path d="M4 13h16" stroke="#F7F7F5" stroke-width="1.8" fill="none"/><rect x="7" y="15" width="3" height="3" stroke="#F7F7F5" stroke-width="1.5" fill="none"/><rect x="14" y="15" width="3" height="3" stroke="#F7F7F5" stroke-width="1.5" fill="none"/>',
};

const CATEGORY_MAP = {
  lawyer: 'legal', legal: 'legal',
  doctor: 'medical', dentist: 'medical', hospital: 'medical', health: 'medical', pharmacy: 'medical', physiotherapist: 'medical', veterinary_care: 'medical',
  restaurant: 'food', cafe: 'food', bakery: 'food', meal_takeaway: 'food', bar: 'food', meal_delivery: 'food',
  store: 'business', clothing_store: 'business', furniture_store: 'business', electronics_store: 'business', home_goods_store: 'business', shopping_mall: 'business', florist: 'business', book_store: 'business', jewelry_store: 'business', shoe_store: 'business', real_estate_agency: 'business', accounting: 'business', bank: 'business', insurance_agency: 'business', finance: 'business', travel_agency: 'business', general_contractor: 'business', locksmith: 'business', painter: 'business', plumber: 'business', electrician: 'business', roofing_contractor: 'business',
  beauty_salon: 'beauty', hair_care: 'beauty', spa: 'beauty', nail_saloon: 'beauty', barber: 'beauty',
  car_dealer: 'auto', car_repair: 'auto', car_wash: 'auto', gas_station: 'auto', car_rental: 'auto',
  gym: 'fitness',
  school: 'education', university: 'education', library: 'education',
};

export function getCategoryIcon(category) {
  if (!category) return 'default';
  return CATEGORY_MAP[category] || 'default';
}

export function createMarkerIcon(category, pipelineStage) {
  const iconName = getCategoryIcon(category);
  const iconSvg = MARKER_ICONS[iconName] || MARKER_ICONS.default;
  const hasLead = !!pipelineStage;
  const badgeColor = hasLead ? STAGE_COLORS[pipelineStage] : null;

  const badge = hasLead
    ? `<circle cx="28" cy="28" r="6.5" fill="${badgeColor}" stroke="#F7F7F5" stroke-width="2"/>${pipelineStage === 'closed' ? '<path d="M25.5 28l2 2 3.5-3.5" stroke="#F7F7F5" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' : ''}`
    : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48"><path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z" fill="#1A1A1A" stroke="#F7F7F5" stroke-width="1.5"/><g transform="translate(6, 6)">${iconSvg}</g>${badge}</svg>`;

  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}