import { IncomeStatementRow, OperatingExpense, Property } from '../types';

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

export function getPropertyGroupKeyFromProperty(prop: Property): string {
  const text = propertySearchText(prop);
  if (prop.area?.trim()) {
    const byArea = PROPERTY_GROUPS.find((g) => g.key.toLowerCase() === prop.area!.trim().toLowerCase());
    if (byArea) return byArea.key;
  }
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

function normalizeName(s?: string): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
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
    // Enrich units from all Property records in the same building group (e.g. Unit A, B on Avenue Q)
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

    const sortedUnits = [...(g.units || [])].sort((a, b) =>
      unitSortKey(a.label).localeCompare(unitSortKey(b.label)),
    );
    const unitsCount = Math.max(g.unitsCount || 0, sortedUnits.length);
    return { ...g, units: sortedUnits, unitsCount };
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

    if (!existing) {
      map.set(groupKey, {
        groupKey,
        propertyId: prop.id,
        label: groupKey,
        address: prop.address,
        image: prop.image,
        units: parentPreferred ? [] : [{ label: unitLabel, propertyId: prop.id }],
      });
      continue;
    }

    if (parentPreferred) {
      existing.propertyId = prop.id;
      if (prop.address) existing.address = prop.address;
      if (prop.image) existing.image = prop.image;
      // Remove self from units if it was added earlier as a pseudo-unit.
      existing.units = existing.units.filter((u) => u.propertyId !== prop.id);
    } else {
      const hasUnit = existing.units.some((u) => u.propertyId === prop.id);
      if (!hasUnit) {
        existing.units.push({ label: unitLabel, propertyId: prop.id });
        existing.units.sort((a, b) => unitSortKey(a.label).localeCompare(unitSortKey(b.label)));
      }
    }

    if (!existing.image && prop.image) existing.image = prop.image;
    if (!existing.address && prop.address) existing.address = prop.address;
  }

  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
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
