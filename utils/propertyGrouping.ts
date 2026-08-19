import { IncomeStatementRow, OperatingExpense, Property, PropertyUnit } from '../types';

export const PROPERTY_GROUPS: { key: string; patterns: string[] }[] = [
  { key: 'Avenue Q', patterns: ['avenue q', 'ave q'] },
  { key: 'Sherman St', patterns: ['sherman'] },
  { key: 'Avenue H', patterns: ['avenue h', 'ave h'] },
  { key: '70th Street', patterns: ['70th'] },
  { key: 'Wooding St', patterns: ['wooding', 'wooden'] },
  { key: 'Bella Jess', patterns: ['bella jess'] },
  { key: 'Avenue F', patterns: ['avenue f', 'ave f'] },
  { key: 'Conroe', patterns: ['conroe'] },
  { key: 'Tomball', patterns: ['tomball', 'tomabll'] },
  { key: 'Magnolia Dr', patterns: ['magnolia'] },
  { key: 'Westlock Dr', patterns: ['westlock'] },
];

/**
 * Canonical doors per building. Empty array = single-door (no unit step / no unit breakdown).
 * Keep in sync with backend/api/property_units_service.py PORTFOLIO_UNIT_CATALOG.
 */
export const PORTFOLIO_UNIT_CATALOG: Record<string, string[]> = {
  'Avenue Q': [
    'Unit A',
    'Unit B (Eado Escape)',
    'Unit C',
    'Unit D (Eado Studio)',
  ],
  'Bella Jess': [],
  Tomball: [],
  Conroe: [],
  'Sherman St': [
    'Unit 1',
    'Unit 2 (Urban Nesting)',
    'Unit 3',
    'Unit 4',
    'Unit 5',
    'Unit 6',
  ],
  '70th Street': ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4'],
  'Avenue H': [
    'Unit 1 (The Hideaway) 7425',
    'Unit 2 (Little H House) 7427',
    'Unit 3 (Sweet Home) 7429',
    'Unit 4 - Erica',
  ],
  'Wooding St': ['Unit 1', 'Unit 2 (Cozy Suite)', 'Unit 3'],
  'Avenue F': ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4'],
};

export function portfolioUnitLabels(groupKey: string): string[] | null {
  if (Object.prototype.hasOwnProperty.call(PORTFOLIO_UNIT_CATALOG, groupKey)) {
    return PORTFOLIO_UNIT_CATALOG[groupKey];
  }
  return null;
}

/** Same order as Income Statement: singles first, then buildings with units. */
export const PORTFOLIO_DISPLAY_ORDER = [
  'Bella Jess',
  'Tomball',
  'Conroe',
  'Wooding St',
  'Avenue F',
  '70th Street',
  'Avenue H',
  'Avenue Q',
  'Sherman St',
];

/** Public home page: buildings with more doors first. */
export const LISTINGS_DISPLAY_ORDER = [
  'Sherman St',
  'Avenue Q',
  'Avenue H',
  '70th Street',
  'Avenue F',
  'Wooding St',
  'Bella Jess',
  'Tomball',
  'Conroe',
];

/** Building roll-up row (e.g. "Ave Q") vs a real unit row. */
export function isBuildingRollup(prop: Property): boolean {
  return isLikelyPortfolioParent(prop, getPropertyGroupKeyFromProperty(prop));
}

/**
 * Public listings / short stays / pickers: one card per unit on multi-door
 * buildings, one card for Bella Jess / Tomball / Conroe. Drops parent duplicates.
 */
export function propertiesForPortfolioDisplay(properties: Property[]): Property[] {
  return properties.filter((prop) => {
    const groupKey = getPropertyGroupKeyFromProperty(prop);
    const catalog = portfolioUnitLabels(groupKey);
    const parent = isLikelyPortfolioParent(prop, groupKey);
    if (catalog !== null && catalog.length === 0) return parent;
    if (catalog !== null && catalog.length > 0) return !parent;
    return !parent;
  });
}

/** Multi-door buildings need unit (or building-wide) choice; single-door catalog skips that step. */
export function groupNeedsUnitStep(groupKey: string, fallbackUnitCount = 0): boolean {
  const labels = portfolioUnitLabels(groupKey);
  if (labels !== null) return labels.length > 1;
  return fallbackUnitCount > 1;
}

/**
 * Align expense unit picker rows to the same catalog as Income Statement
 * "Properties & Units" (drops orphans / duplicate Door vs Unit leftovers).
 */
export function unitsForExpensePicker(
  apiUnits: PropertyUnit[],
  groupKey: string,
  propertyId: string,
): PropertyUnit[] {
  const seen = new Set<string>();
  const deduped: PropertyUnit[] = [];
  for (const u of apiUnits) {
    const key = (u.label || '').toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(u);
  }

  const catalog = portfolioUnitLabels(groupKey);
  if (catalog === null) {
    return deduped;
  }
  if (catalog.length === 0) {
    return [];
  }

  const byLabel = new Map<string, PropertyUnit>();
  const byBase = new Map<string, PropertyUnit>();
  for (const u of deduped) {
    if (!byLabel.has(u.label)) byLabel.set(u.label, u);
    const key = unitBaseKey(u.label);
    // Prefer rows that already use a catalog label when base keys collide.
    if (!byBase.has(key) || catalog.includes(u.label)) {
      byBase.set(key, u);
    }
  }

  return catalog.map((label, i) => {
    const match = byLabel.get(label) || byBase.get(unitBaseKey(label));
    if (match) {
      return { ...match, label, sortOrder: i };
    }
    return {
      id: '',
      property: propertyId,
      label,
      monthlyRent: 0,
      status: 'vacant' as const,
      sortOrder: i,
    };
  });
}

export function unitBaseKey(label: string): string {
  const m = (label || '').match(/unit\s*([a-z0-9]+)/i);
  return m ? m[1].toUpperCase() : (label || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function propertySearchText(parts: {
  area?: string;
  address?: string;
  name?: string;
  city?: string;
  state?: string;
}): string {
  return [parts.area, parts.address, parts.name, parts.city, parts.state]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function normalizeName(s?: string): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function getPropertyGroupKeyFromProperty(prop: Property): string {
  const text = propertySearchText(prop);
  const areaAliases: Record<string, string> = {
    tomabll: 'Tomball',
    tomball: 'Tomball',
    'ave q': 'Avenue Q',
    aveq: 'Avenue Q',
    'ave h': 'Avenue H',
    aveh: 'Avenue H',
    'ave f': 'Avenue F',
    avef: 'Avenue F',
    wooden: 'Wooding St',
    wooding: 'Wooding St',
    '70th': '70th Street',
    sherman: 'Sherman St',
  };
  if (prop.area?.trim()) {
    const area = prop.area.trim().toLowerCase();
    if (areaAliases[area]) return areaAliases[area];
    const byArea = PROPERTY_GROUPS.find((g) => g.key.toLowerCase() === area);
    if (byArea) return byArea.key;
  }
  const nameNorm = normalizeName(prop.name);
  const nameAliases: Record<string, string> = {
    tomball: 'Tomball',
    tomabll: 'Tomball',
    conroe: 'Conroe',
    bellajess: 'Bella Jess',
    aveq: 'Avenue Q',
    aveh: 'Avenue H',
    avef: 'Avenue F',
    sherman: 'Sherman St',
    '70th': '70th Street',
    wooden: 'Wooding St',
    wooding: 'Wooding St',
  };
  if (nameAliases[nameNorm]) return nameAliases[nameNorm];
  const byLength = [...PROPERTY_GROUPS].sort((a, b) => b.key.length - a.key.length);
  for (const g of byLength) {
    if (g.patterns.some((p) => text.includes(p))) return g.key;
  }
  return (prop.name || '').replace(/\s*[-–]\s*unit\s+\w+/i, '').trim() || prop.name || 'Other';
}

export function getPropertyGroupKey(row: IncomeStatementRow, prop?: Property): string {
  if (prop) return getPropertyGroupKeyFromProperty(prop);
  const text = propertySearchText({
    address: row.address,
    name: row.propertyName,
    city: row.city,
    state: row.state,
  });
  const byLength = [...PROPERTY_GROUPS].sort((a, b) => b.key.length - a.key.length);
  for (const g of byLength) {
    if (g.patterns.some((p) => text.includes(p))) return g.key;
  }
  return (row.propertyName || '').replace(/\s*[-–]\s*unit\s+\w+/i, '').trim() || row.propertyName || 'Other';
}

export function extractUnitLabel(name: string, address?: string): string {
  const trimmedName = (name || '').trim();
  const src = `${trimmedName} ${address || ''}`;
  const unit = src.match(/unit\s*[-–]?\s*([A-Za-z0-9]+)/i);
  if (unit) return `Unit ${unit[1].toUpperCase()}`;
  const door = src.match(/door\s*(\d+)/i);
  if (door) return `Door ${door[1]}`;
  return trimmedName || (address || '').trim() || 'Property';
}

function unitSortKey(label: string): string {
  const m = label.match(/(\d+|[A-Za-z]+)/);
  return m ? m[1].padStart(4, '0') : label;
}

export function sortPropertiesForPortfolioDisplay(list: Property[]): Property[] {
  const groupRank = (key: string) => {
    const i = PORTFOLIO_DISPLAY_ORDER.indexOf(key);
    return i === -1 ? 999 : i;
  };
  const unitRank = (prop: Property, groupKey: string) => {
    const catalog = portfolioUnitLabels(groupKey);
    if (!catalog || catalog.length === 0) return 0;
    const name = (prop.name || '').trim().toLowerCase();
    const label = extractUnitLabel(prop.name, prop.address).toLowerCase();
    const exact = catalog.findIndex((c) => {
      const cl = c.toLowerCase();
      return cl === name || cl === label;
    });
    if (exact >= 0) return exact;
    const fuzzy = catalog.findIndex((c) => {
      const cn = normalizeName(c);
      const pn = normalizeName(prop.name);
      return Boolean(cn && pn && (pn.includes(cn) || cn.includes(pn)));
    });
    return fuzzy >= 0 ? fuzzy : 50;
  };
  return [...list].sort((a, b) => {
    const ka = getPropertyGroupKeyFromProperty(a);
    const kb = getPropertyGroupKeyFromProperty(b);
    const d = groupRank(ka) - groupRank(kb);
    if (d !== 0) return d;
    return unitRank(a, ka) - unitRank(b, kb);
  });
}

export function groupPropertiesByBuilding(properties: Property[]): { groupKey: string; items: Property[] }[] {
  const sorted = sortPropertiesForPortfolioDisplay(propertiesForPortfolioDisplay(properties));
  const map = new Map<string, Property[]>();
  for (const p of sorted) {
    const k = getPropertyGroupKeyFromProperty(p);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(p);
  }
  const keys = [
    ...PORTFOLIO_DISPLAY_ORDER.filter((k) => map.has(k)),
    ...[...map.keys()].filter((k) => !PORTFOLIO_DISPLAY_ORDER.includes(k)),
  ];
  return keys.map((groupKey) => ({ groupKey, items: map.get(groupKey)! }));
}

export type GroupedPropertyRow = IncomeStatementRow & { groupKey: string };

export function groupIncomeStatementProperties(
  rows: IncomeStatementRow[],
  propertyList: Property[],
): GroupedPropertyRow[] {
  const map = new Map<string, GroupedPropertyRow>();

  for (const row of rows) {
    const prop = propertyList.find((p) => p.id === row.propertyId);
    const groupKey = getPropertyGroupKey(row, prop);

    if (!map.has(groupKey)) {
      map.set(groupKey, {
        ...row,
        groupKey,
        propertyId: groupKey,
        propertyName: groupKey,
        rentIncome: 0,
        shortStayIncome: 0,
        totalIncome: 0,
        totalExpenses: 0,
        netIncome: 0,
        units: [],
        unitsCount: 0,
        financials: row.financials,
        monthly: row.monthly ? row.monthly.map((m) => ({ ...m })) : undefined,
        imageUrl: row.imageUrl,
        address: row.address,
        city: row.city,
        state: row.state,
      });
    }

    const group = map.get(groupKey)!;
    group.rentIncome += row.rentIncome;
    group.shortStayIncome += row.shortStayIncome;
    group.totalIncome += row.totalIncome;
    group.totalExpenses += row.totalExpenses;
    group.netIncome += row.netIncome;
    if (!group.imageUrl && row.imageUrl) group.imageUrl = row.imageUrl;
    if (!group.financials && row.financials) group.financials = row.financials;
    if (!group.address && row.address) group.address = row.address;
    // Prefer the richest monthly series (portfolio parent usually has the Master P&L totals).
    if (row.monthly?.length) {
      const existing = (group.monthly || []).reduce((s, m) => s + Math.abs(m.income) + Math.abs(m.expenses), 0);
      const next = row.monthly.reduce((s, m) => s + Math.abs(m.income) + Math.abs(m.expenses), 0);
      if (!group.monthly?.length || next >= existing) {
        group.monthly = row.monthly.map((m) => ({ ...m }));
      }
    }

    if (row.units?.length) {
      for (const unit of row.units) {
        if (!group.units!.some((u) => u.unitId === unit.unitId)) {
          group.units!.push(unit);
        }
      }
    } else {
      const name = prop?.name || row.propertyName;
      const isParentRollup =
        normalizeName(name) === normalizeName(groupKey) ||
        Boolean(prop?.area?.trim() && normalizeName(name) === normalizeName(prop.area));
      if (!isParentRollup || (row.unitsCount || prop?.units || 1) <= 1) {
        group.units!.push({
          unitId: row.propertyId,
          propertyId: row.propertyId,
          label: extractUnitLabel(name, prop?.address || row.address),
          monthlyRent: prop?.price ?? 0,
          status: prop?.status || 'vacant',
          rentIncome: row.rentIncome,
          totalExpenses: row.totalExpenses,
          netIncome: row.netIncome,
        });
      }
    }
    group.unitsCount = Math.max(group.units!.length, row.unitsCount || prop?.units || 0);
  }

  return Array.from(map.values()).map((g) => {
    const catalog = portfolioUnitLabels(g.groupKey);

    // Enrich units from all Property records in the same building group (e.g. Unit A, B on Avenue Q)
    // Skip when we have a canonical catalog — sibling Property names are often wrong/mixed.
    if (catalog === null) {
      for (const prop of propertyList) {
        const propGroup = getPropertyGroupKeyFromProperty(prop);
        if (propGroup !== g.groupKey) continue;
        const unitLabel = extractUnitLabel(prop.name, prop.address);
        const isParentOnly =
          normalizeName(prop.name) === normalizeName(g.groupKey) ||
          (prop.area?.trim() && normalizeName(prop.name) === normalizeName(prop.area));
        if (isParentOnly) continue;

        const pseudoId = `prop-${prop.id}`;
        if (!g.units!.some((u) => u.unitId === pseudoId || u.label === unitLabel)) {
          g.units!.push({
            unitId: pseudoId,
            propertyId: prop.id,
            label: unitLabel,
            monthlyRent: prop.price ?? 0,
            status: prop.status || 'vacant',
            rentIncome: 0,
            totalExpenses: 0,
            netIncome: 0,
          });
        }
      }
    }

    let sortedUnits = [...(g.units || [])].sort((a, b) =>
      unitSortKey(a.label).localeCompare(unitSortKey(b.label)),
    );

    if (catalog !== null) {
      if (catalog.length === 0) {
        sortedUnits = [];
      } else {
        // Keep real P&L unit rows; rename/filter to catalog; drop orphans.
        const byBase = new Map<string, (typeof sortedUnits)[0]>();
        for (const u of sortedUnits) {
          const key = unitBaseKey(u.label);
          if (!byBase.has(key)) byBase.set(key, u);
        }
        sortedUnits = catalog.map((label, i) => {
          const match = byBase.get(unitBaseKey(label));
          if (match) return { ...match, label };
          return {
            unitId: `catalog-${g.groupKey}-${i}`,
            propertyId: g.propertyId,
            label,
            monthlyRent: 0,
            status: 'vacant',
            rentIncome: 0,
            totalExpenses: 0,
            netIncome: 0,
          };
        });
      }
    }

    const unitsCount = catalog !== null
      ? catalog.length
      : Math.max(g.unitsCount || 0, sortedUnits.length);
    return { ...g, units: sortedUnits, unitsCount };
  }).sort((a, b) => {
    const ia = PORTFOLIO_DISPLAY_ORDER.indexOf(a.groupKey);
    const ib = PORTFOLIO_DISPLAY_ORDER.indexOf(b.groupKey);
    const ra = ia === -1 ? 999 : ia;
    const rb = ib === -1 ? 999 : ib;
    if (ra !== rb) return ra - rb;
    return a.groupKey.localeCompare(b.groupKey);
  });
}

export type PropertyGroupUnit = {
  label: string;
  propertyId: string;
};

export type PropertyGroupOption = {
  groupKey: string;
  propertyId: string;
  label: string;
  address?: string;
  image?: string;
  units: PropertyGroupUnit[];
};

/** Prefer portfolio parent (building roll-up) as the expense property target. */
function isLikelyPortfolioParent(prop: Property, groupKey: string): boolean {
  const name = normalizeName(prop.name);
  const area = normalizeName(prop.area);
  const key = normalizeName(groupKey);
  if (name === key || area === key) return true;
  const short: Record<string, string> = {
    aveq: 'avenueq',
    sherman: 'shermanst',
    '70th': '70thstreet',
    aveh: 'avenueh',
    wooden: 'woodingst',
    wooding: 'woodingst',
    avef: 'avenuef',
    tomabll: 'tomball',
    tomball: 'tomball',
    bellajess: 'bellajess',
    conroe: 'conroe',
  };
  return short[name] === key || name === key.replace(/st$/, '') || name === key.replace(/street$/, '');
}

/** Group managed Property records by building for expense dropdowns. */
export function groupPropertiesForSelect(properties: Property[]): PropertyGroupOption[] {
  const map = new Map<string, PropertyGroupOption>();

  for (const prop of properties) {
    const groupKey = getPropertyGroupKeyFromProperty(prop);
    const parentPreferred = isLikelyPortfolioParent(prop, groupKey);
    const unitLabel = extractUnitLabel(prop.name, prop.address);
    const existing = map.get(groupKey);
    const catalog = portfolioUnitLabels(groupKey);

    if (!existing) {
      map.set(groupKey, {
        groupKey,
        propertyId: prop.id,
        label: groupKey,
        address: prop.address,
        image: prop.image,
        // Prefer catalog; empty catalog = single-door (no unit cards).
        units: catalog !== null
          ? catalog.map((label) => ({ label, propertyId: prop.id }))
          : (parentPreferred ? [] : [{ label: unitLabel, propertyId: prop.id }]),
      });
      continue;
    }

    if (parentPreferred) {
      existing.propertyId = prop.id;
      if (prop.address) existing.address = prop.address;
      if (prop.image) existing.image = prop.image;
      if (catalog !== null) {
        existing.units = catalog.map((label) => ({ label, propertyId: prop.id }));
      } else {
        existing.units = existing.units.filter((u) => u.propertyId !== prop.id);
      }
    } else if (catalog === null) {
      const hasUnit = existing.units.some((u) => u.propertyId === prop.id);
      if (!hasUnit) {
        existing.units.push({ label: unitLabel, propertyId: prop.id });
        existing.units.sort((a, b) => unitSortKey(a.label).localeCompare(unitSortKey(b.label)));
      }
    }

    if (!existing.image && prop.image) existing.image = prop.image;
    if (!existing.address && prop.address) existing.address = prop.address;
  }

  return Array.from(map.values()).sort((a, b) => {
    const ia = PORTFOLIO_DISPLAY_ORDER.indexOf(a.groupKey);
    const ib = PORTFOLIO_DISPLAY_ORDER.indexOf(b.groupKey);
    const ra = ia === -1 ? 999 : ia;
    const rb = ib === -1 ? 999 : ib;
    if (ra !== rb) return ra - rb;
    return a.label.localeCompare(b.label);
  });
}

export function propertyIdsInGroup(properties: Property[], groupKey: string): string[] {
  return properties
    .filter((p) => getPropertyGroupKeyFromProperty(p) === groupKey)
    .map((p) => p.id);
}

/**
 * Resolve building property id for expense posting.
 * Always posts to the portfolio parent so P&amp;L rollups stay correct.
 * Unit selection is handled via PropertyUnit FK separately.
 */
export function resolvePropertyIdForExpense(
  groups: PropertyGroupOption[],
  groupKey: string,
  _unitLabel?: string,
): string {
  const group = groups.find((g) => g.groupKey === groupKey);
  return group?.propertyId || '';
}

export type ExpenseLineItem = {
  id: string;
  label: string;
  category: OperatingExpense['category'];
  visibility: 'operating' | 'admin_only';
  group: 'general' | 'unit' | 'financing';
  managerAllowed: boolean;
};

/** Full Excel-style expense lines. Managers only see managerAllowed entries. */
export const EXPENSE_LINE_ITEMS: ExpenseLineItem[] = [
  // General operating
  { id: 'insurance', label: 'Insurance', category: 'insurance', visibility: 'operating', group: 'general', managerAllowed: false },
  { id: 'taxes', label: 'Taxes', category: 'taxes', visibility: 'operating', group: 'general', managerAllowed: false },
  { id: 'inspection', label: 'Inspection', category: 'maintenance', visibility: 'operating', group: 'general', managerAllowed: true },
  { id: 'appraisal', label: 'Appraisal', category: 'maintenance', visibility: 'operating', group: 'general', managerAllowed: true },
  { id: 'hoa', label: 'HOA Fees', category: 'hoa', visibility: 'operating', group: 'general', managerAllowed: true },
  { id: 'bank_charges', label: 'Bank Charges', category: 'bank_charges', visibility: 'operating', group: 'general', managerAllowed: false },
  { id: 'legal', label: 'Legal & Professional Fees', category: 'legal', visibility: 'operating', group: 'general', managerAllowed: true },
  // Unit / day-to-day
  { id: 'management', label: 'Property Management Fees', category: 'management', visibility: 'operating', group: 'unit', managerAllowed: false },
  { id: 'maintenance', label: 'Repairs & Maintenance', category: 'maintenance', visibility: 'operating', group: 'unit', managerAllowed: true },
  { id: 'advertising', label: 'Advertising / Leasing', category: 'advertising', visibility: 'operating', group: 'unit', managerAllowed: true },
  { id: 'cleaning', label: 'Cleaning Fees', category: 'cleaning', visibility: 'operating', group: 'unit', managerAllowed: true },
  { id: 'survey', label: 'Survey', category: 'legal', visibility: 'operating', group: 'unit', managerAllowed: true },
  { id: 'supplies', label: 'Supplies & Materials', category: 'supplies', visibility: 'operating', group: 'unit', managerAllowed: true },
  { id: 'kitchen_bath', label: 'Kitchen & Bathroom Supplies', category: 'supplies', visibility: 'operating', group: 'unit', managerAllowed: true },
  { id: 'electricity', label: 'Electricity', category: 'utilities', visibility: 'operating', group: 'unit', managerAllowed: true },
  { id: 'water', label: 'Water Bill', category: 'utilities', visibility: 'operating', group: 'unit', managerAllowed: true },
  { id: 'internet', label: 'Internet', category: 'utilities', visibility: 'operating', group: 'unit', managerAllowed: true },
  { id: 'gas', label: 'Gas', category: 'utilities', visibility: 'operating', group: 'unit', managerAllowed: true },
  { id: 'transportation', label: 'Transportation / Mileage', category: 'transportation', visibility: 'operating', group: 'unit', managerAllowed: true },
  { id: 'other', label: 'Other', category: 'other', visibility: 'operating', group: 'unit', managerAllowed: true },
  // Financing (admin only — below NOI)
  { id: 'mortgage_interest', label: 'Mortgage Interest', category: 'mortgage_interest', visibility: 'admin_only', group: 'financing', managerAllowed: false },
  { id: 'mortgage_principal', label: 'Principal Repayment (non-expense)', category: 'mortgage_principal', visibility: 'admin_only', group: 'financing', managerAllowed: false },
  { id: 'depreciation', label: 'Depreciation (Non-cash)', category: 'depreciation', visibility: 'admin_only', group: 'financing', managerAllowed: false },
];

export function expenseLinesForRole(role: 'admin' | 'manager'): ExpenseLineItem[] {
  if (role === 'admin') return EXPENSE_LINE_ITEMS;
  return EXPENSE_LINE_ITEMS.filter((l) => l.managerAllowed);
}

export const MANAGER_EXPENSE_CATEGORIES: { value: string; label: string }[] = expenseLinesForRole('manager').map((l) => ({
  value: l.category,
  label: l.label,
}));

export const CATEGORY_LABELS: Record<string, string> = {
  utilities: 'Utilities',
  maintenance: 'Repairs & Maintenance',
  taxes: 'Property Taxes',
  insurance: 'Insurance',
  management: 'Management Fees',
  cleaning: 'Cleaning',
  hoa: 'HOA Fees',
  advertising: 'Advertising / Leasing',
  legal: 'Legal & Professional',
  supplies: 'Supplies & Materials',
  transportation: 'Transportation',
  bank_charges: 'Bank Charges',
  mortgage_interest: 'Mortgage Interest',
  mortgage_principal: 'Mortgage Principal',
  depreciation: 'Depreciation',
  other: 'Other',
};
