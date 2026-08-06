import { Phone, Mail, PhoneCall, XCircle, Scale, Stethoscope, Utensils, Briefcase, Scissors, Car, Dumbbell, GraduationCap, Building2 } from 'lucide-react';

export const STAGES = {
  prospect: { label: 'Prospect', color: '#3B82F6' },
  pitched: { label: 'Pitched', color: '#F59E0B' },
  following_up: { label: 'Following Up', color: '#A855F7' },
  closed: { label: 'Closed', color: '#10B981' },
  open: { label: 'Open', color: '#3B82F6' },
};

export const STANDARD_STAGES = {
  open: { label: 'Open', color: '#3B82F6' },
  closed: { label: 'Closed', color: '#10B981' },
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