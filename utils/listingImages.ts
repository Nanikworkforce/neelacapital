import { Property } from '../types';
import { extractUnitLabel, getPropertyGroupKeyFromProperty } from './propertyGrouping';

const DIR = '/property-images';

const GROUP_DEFAULT: Record<string, string> = {
  'Sherman St': `${DIR}/duplex-on-sherman.jpg`,
  'Avenue Q': `${DIR}/ga-avenue-q-unit-a.jpg`,
  'Avenue H': `${DIR}/the-hideaway.jpg`,
  '70th Street': `${DIR}/70th-unit-1.jpg`,
  'Avenue F': `${DIR}/wooding-ga-unit-4.jpg`,
  'Wooding St': `${DIR}/wooding-house-unit-1.jpg`,
  'Bella Jess': `${DIR}/bella-spring.jpg`,
  Tomball: `${DIR}/westlock-house.jpg`,
  Conroe: `${DIR}/sweet-magnolia.jpg`,
};

const UNIT_FILES: Record<string, Record<string, string>> = {
  'Avenue Q': {
    a: `${DIR}/ga-avenue-q-unit-a.jpg`,
    b: `${DIR}/ga-unit-b.jpg`,
    c: `${DIR}/ga-avenue-q-unit-a.jpg`,
    d: `${DIR}/ga-avenue-q-unit-d.jpg`,
  },
  'Sherman St': {
    '1': `${DIR}/duplex-on-sherman.jpg`,
    '2': `${DIR}/duplex-on-sherman-unit-2.jpg`,
    '3': `${DIR}/ga-on-sherman-unit-3.jpg`,
    '4': `${DIR}/ga-on-sherman-unit-4.jpg`,
    '5': `${DIR}/ga-on-sherman-unit-5.jpg`,
    '6': `${DIR}/ga-on-sherman-unit-6.jpg`,
  },
  'Avenue H': {
    '1': `${DIR}/the-hideaway.jpg`,
    '2': `${DIR}/little-h-house.jpg`,
    '3': `${DIR}/little-h-house-2.jpg`,
    '4': `${DIR}/little-h-house-3.jpg`,
  },
  '70th Street': {
    '1': `${DIR}/70th-unit-1.jpg`,
    '2': `${DIR}/70th-unit-2.jpg`,
    '3': `${DIR}/70th-unit-3.jpg`,
    '4': `${DIR}/70th-unit-4.jpg`,
  },
  'Wooding St': {
    '1': `${DIR}/wooding-house-unit-1.jpg`,
    '2': `${DIR}/wooding-house-unit-1.jpg`,
    '3': `${DIR}/wooding-ga-unit-3.jpg`,
  },
  'Avenue F': {
    '1': `${DIR}/wooding-ga-unit-4.jpg`,
    '2': `${DIR}/wooding-ga-unit-4.jpg`,
    '3': `${DIR}/wooding-ga-unit-4.jpg`,
    '4': `${DIR}/wooding-ga-unit-4.jpg`,
  },
};

function unitKey(prop: Property): string {
  const label = extractUnitLabel(prop.name, prop.address);
  const m = label.match(/unit\s+([a-z0-9]+)/i);
  if (m) return m[1].toLowerCase();
  const door = (prop.name || '').match(/\b([a-d]|[1-6])\b/i);
  return door ? door[1].toLowerCase() : '';
}

function isUsableImage(url?: string): boolean {
  const u = (url || '').trim();
  return u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/');
}

export function folderImageForProperty(prop: Property): string | undefined {
  const group = getPropertyGroupKeyFromProperty(prop);
  const unit = unitKey(prop);
  const byUnit = UNIT_FILES[group]?.[unit];
  if (byUnit) return byUnit;
  return GROUP_DEFAULT[group];
}

/** Prefer the Property Images folder so listings always have a photo on the public site. */
export function resolvePropertyImage(prop: Property, all: Property[] = []): string | undefined {
  const fromFolder = folderImageForProperty(prop);
  if (fromFolder) return fromFolder;
  if (isUsableImage(prop.image)) return prop.image;
  const group = getPropertyGroupKeyFromProperty(prop);
  const sibling = all.find(
    (p) => p.id !== prop.id && getPropertyGroupKeyFromProperty(p) === group && isUsableImage(p.image),
  );
  if (sibling?.image) return sibling.image;
  return GROUP_DEFAULT[group];
}

export function applyListingImages(properties: Property[]): Property[] {
  return properties.map((prop) => ({
    ...prop,
    image: resolvePropertyImage(prop, properties) || prop.image,
  }));
}
