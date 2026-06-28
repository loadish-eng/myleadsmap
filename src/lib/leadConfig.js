import { Phone, Mail, PhoneCall, XCircle, Scale, Stethoscope, Utensils, Briefcase, Scissors, Car, Dumbbell, GraduationCap, Building2 } from 'lucide-react';

export const STAGES = {
  prospect: { label: 'Prospect', color: '#A0A0A0' },
  pitched: { label: 'Pitched', color: '#5B7B9A' },
  following_up: { label: 'Following Up', color: '#A88B5C' },
  closed: { label: 'Closed', color: '#0F0F0F' },
  open: { label: 'Open', color: '#5B7B9A' },
};

export const STANDARD_STAGES = {
  open: { label: 'Open', color: '#5B7B9A' },
  closed: { label: 'Closed', color: '#0F0F0F' },
};

export function getStages(plan) {
  return plan === 'standard' ? STANDARD_STAGES : STAGES;
}

export const ACTION_TYPES = {
  called: { label: 'Called', icon: Phone },
  emailed: { label: 'Emailed', icon: Mail },
  spoke_phone: { label: 'Spoke on Phone', icon: PhoneCall },
  declined: { label: 'Declined', icon: XCircle },
};

export const CATEGORY_ICONS = {
  legal: Scale,
  medical: Stethoscope,
  food: Utensils,
  business: Briefcase,
  beauty: Scissors,
  auto: Car,
  fitness: Dumbbell,
  education: GraduationCap,
  default: Building2,
};