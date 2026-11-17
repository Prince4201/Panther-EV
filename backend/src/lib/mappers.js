/**
 * Maps a PostgreSQL snake_case row from the admins table to the
 * camelCase shape expected by the existing controllers and middleware.
 *
 * The old Mongoose document had `doc._id` and `doc.id`; we keep `row.id`
 * and also expose `_id` as an alias so callers like `visibleFilter(a)` and
 * `Admin.deleteOne({ _id })` patterns still work.
 */
export function mapAdmin(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    permissions: row.permissions || [],
    active: row.active,
    phone: row.phone || '',
    avatar: row.avatar || '',
    address: {
      line1: row.address_line1 || '',
      city: row.address_city || '',
      state: row.address_state || '',
      pincode: row.address_pincode || '',
      country: row.address_country || 'India',
    },
    mustChangePassword: row.must_change_password || false,
    passwordChangedAt: row.password_changed_at || null,
    tokenVersion: row.token_version || 0,
    lastLoginAt: row.last_login_at || null,
    createdBy: row.created_by || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    phone: row.phone || '',
    avatar: row.avatar || '',
    address: {
      line1: row.address_line1 || '',
      city: row.address_city || '',
      state: row.address_state || '',
      pincode: row.address_pincode || '',
      country: row.address_country || 'India',
    },
    active: row.active,
    tokenVersion: row.token_version || 0,
    lastActiveAt: row.last_active_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    tag: row.tag || '',
    summary: row.summary || '',
    description: row.description || '',
    image: row.image || '',
    imagePublicId: row.image_public_id || '',
    gallery: row.gallery || [],
    specs: row.specs || [],
    price: row.price != null ? Number(row.price) : null,
    order: row.order,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCategory(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    key: row.key,
    slug: row.slug,
    description: row.description || '',
    active: row.active,
    displayOrder: row.display_order,
    createdBy: row.created_by || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapHeroSlide(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    title: row.title,
    subtitle: row.subtitle || '',
    description: row.description || '',
    image: row.image,
    imagePublicId: row.image_public_id || '',
    mobileImage: row.mobile_image || '',
    mobileImagePublicId: row.mobile_image_public_id || '',
    imageAlt: row.image_alt || '',
    fit: row.fit || 'cover',
    bgColor: row.bg_color || '#EEF0F2',
    textColor: row.text_color || 'dark',
    textAlign: row.text_align || 'left',
    overlay: row.overlay ?? 0,
    button1Text: row.button1_text || '',
    button1Url: row.button1_url || '',
    button2Text: row.button2_text || '',
    button2Url: row.button2_url || '',
    order: row.order,
    active: row.active,
    duration: row.duration ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapFinancePartner(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    category: row.category || 'financing',
    description: row.description || '',
    logo: row.logo || '',
    logoPublicId: row.logo_public_id || '',
    logoBg: row.logo_bg || 'light',
    logoScale: row.logo_scale ?? 100,
    website: row.website || '',
    contactPhone: row.contact_phone || '',
    contactEmail: row.contact_email || '',
    order: row.order,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTeamMember(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    name: row.name || '',
    designation: row.designation || '',
    email: row.email || '',
    image: row.image || '',
    imagePublicId: row.image_public_id || '',
    imageScale: row.image_scale ?? 100,
    imagePosX: row.image_pos_x ?? 0,
    imagePosY: row.image_pos_y ?? 0,
    description: row.description || '',
    experience: row.experience || '',
    additionalInfo: row.additional_info || '',
    displayOrder: row.display_order,
    isVisible: row.is_visible,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSettings(row) {
  if (!row) return null;
  const hero = row.hero || {};
  return {
    id: row.id,
    _id: row.id,
    key: row.key,
    hero: {
      autoplay: hero.autoplay !== false,
      duration: hero.duration ?? 6000,
      pauseOnHover: hero.pauseOnHover !== false,
      showIndicators: hero.showIndicators !== false,
      showArrows: hero.showArrows !== false,
      transition: hero.transition || 'fade',
    },
    seeds: row.seeds || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapInquiry(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    email: row.email || '',
    phone: row.phone,
    city: row.city || '',
    subject: row.subject || '',
    message: row.message || '',
    vehicles: row.vehicles || [],
    country: row.country || 'IN',
    vehicleInterest: row.vehicle_interest || '',
    source: row.source || 'contact',
    whatsappStatus: row.whatsapp_status || 'not_applicable',
    status: row.status || 'new',
    assignedTo: row.assigned_to || null,
    assignedAt: row.assigned_at || null,
    user: row.user_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // populated fields (from JOINs)
    ...(row.assigned_to_name !== undefined ? { assignedToAdmin: { id: row.assigned_to, name: row.assigned_to_name, email: row.assigned_to_email } } : {}),
  };
}

export function mapInquiryActivity(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    inquiry: row.inquiry_id,
    type: row.type,
    actor: { id: row.actor_id || null, name: row.actor_name || '', role: row.actor_role || '' },
    message: row.message || '',
    fromStatus: row.from_status || undefined,
    toStatus: row.to_status || undefined,
    assignedTo: row.assigned_to_id ? { id: row.assigned_to_id, name: row.assigned_to_name || '' } : undefined,
    visibility: row.visibility || 'internal',
    createdAt: row.created_at,
  };
}

export function mapActivityLog(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    actor: { id: row.actor_id || null, name: row.actor_name || '', role: row.actor_role || '' },
    action: row.action,
    summary: row.summary,
    entityType: row.entity_type || '',
    entityId: row.entity_id || '',
    meta: row.meta || {},
    createdAt: row.created_at,
  };
}
