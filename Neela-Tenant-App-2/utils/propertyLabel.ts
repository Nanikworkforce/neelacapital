/**
 * Build a clear property label so staff never see bare "Unit 1".
 * Example: "6707 Sherman St — Unit 1"
 */

function streetFromAddress(address?: string | null): string {
  const raw = (address || '').trim();
  if (!raw) return '';
  let street = raw.split(',')[0].trim();
  street = street
    .replace(/\s*[-–,]?\s*unit\s*[-–]?\s*[A-Za-z0-9]+.*$/i, '')
    .replace(/[.,\s]+$/g, '')
    .trim();
  return street;
}

function extractUnitPart(name: string, address?: string): string {
  const trimmed = (name || '').trim();
  const src = `${trimmed} ${address || ''}`;
  const unit = src.match(/unit\s*[-–]?\s*([A-Za-z0-9]+)/i);
  if (unit) {
    // Keep descriptive titles like "Unit 2 (Urban Nesting)"
    if (/^\s*unit\s+/i.test(trimmed) && /[()]/.test(trimmed)) return trimmed;
    return `Unit ${unit[1].toUpperCase()}`;
  }
  const door = src.match(/door\s*(\d+)/i);
  if (door) return `Door ${door[1]}`;
  return trimmed || (address || '').trim() || 'Property';
}

export function formatPropertyUnitLabel(
  nameOrUnit?: string | null,
  address?: string | null,
): string {
  const name = (nameOrUnit || '').trim();
  const addr = (address || '').trim();
  const street = streetFromAddress(addr);

  // Already specific enough (has a street number and a unit mention)
  if (name && /\d{3,}/.test(name) && /unit\s+/i.test(name)) {
    return name;
  }

  const unitOrName = extractUnitPart(name, addr);
  if (street && unitOrName) {
    if (unitOrName.toLowerCase().includes(street.toLowerCase())) return unitOrName;
    if (street.toLowerCase().includes(unitOrName.toLowerCase())) return street;
    return `${street} — ${unitOrName}`;
  }
  return name || street || unitOrName || 'Property';
}

export function formatTenantPropertyLabel(tenant: {
  propertyUnit?: string | null;
  applicationData?: { propertyAddress?: string | null } | null;
}): string {
  return formatPropertyUnitLabel(
    tenant.propertyUnit,
    tenant.applicationData?.propertyAddress,
  );
}
