export function toPublicUser(u) {
  return {
    id: u.id,
    email: u.email,
    full_name: u.fullName,
    role: u.role,
    subscription_status: u.subscriptionStatus,
    subscription_plan: u.subscriptionPlan,
    google_api_key: u.googleApiKey,
    created_date: u.createdAt,
    updated_date: u.updatedAt,
  };
}

export function toPublicLead(l) {
  return {
    id: l.id,
    place_id: l.placeId,
    name: l.name,
    address: l.address,
    category: l.category,
    lat: l.lat,
    lng: l.lng,
    phone: l.phone,
    website: l.website,
    pipeline_stage: l.pipelineStage,
    contact_name: l.contactName,
    contact_phone: l.contactPhone,
    contact_email: l.contactEmail,
    notes: l.notes,
    last_action_type: l.lastActionType,
    last_action_date: l.lastActionDate,
    actions: l.actions,
    created_date: l.createdAt,
    updated_date: l.updatedAt,
  };
}
