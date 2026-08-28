import { Property } from '../types';

const BILLS_INCLUDED = /bills included|utilities included/i;
const BILLS_TENANT = /you pay bills|tenant pays/i;

export function shortStayTitle(p: Property): string {
  return p.shortStayListingTitle || p.name || `Cozy ${p.bedrooms ?? 2}-Bed Retreat`;
}

export function shortStayDescription(p: Property): string {
  return (
    p.shortStayListingDescription ||
    'A welcoming, comfortable space designed for rest and relaxation during your Houston stay.'
  );
}

export function shortStayLocation(p: Property): string {
  if (p.shortStayListingLocation) return p.shortStayListingLocation;
  const address = (p.address || '').trim().replace(/,\s*$/, '');
  if (address) {
    const city = p.city || 'Houston';
    const state = p.state || 'TX';
    if (city && address.toLowerCase().includes(city.toLowerCase())) return address;
    return `${address}, ${city}, ${state}`;
  }
  const area = p.shortStayListingArea || 'Greater Houston';
  const city = p.city || 'Houston';
  const state = p.state || 'TX';
  return `${area}, ${city}, ${state}`;
}

export function shortStayArea(p: Property): string {
  return p.shortStayListingArea || p.area || 'Greater Houston';
}

export function billsNote(p: Property): string | null {
  const hay = [
    ...(p.furnishingsBreakdown || []),
    p.shortStayListingDescription || '',
  ].join(' ');
  if (BILLS_INCLUDED.test(hay)) return 'Bills included';
  if (BILLS_TENANT.test(hay)) return 'You pay bills';
  return null;
}

/** Advertised Airbnb rate is monthly. */
export function monthlyRate(p: Property): number {
  const n = Number(p.price);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function formatMonthlyRate(p: Property): string {
  const n = monthlyRate(p);
  return n ? `$${n.toLocaleString()}/mo` : '';
}
