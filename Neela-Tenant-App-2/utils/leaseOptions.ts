/** Admin/PM property-specific lease ticks stored on application_data.leaseOptions */

export type LeaseOptions = {
  residenceType: string;
  furnished: boolean | null;
  furnishingsList: string;
  appliances: string;
  termType: 'month_to_month' | 'standard';
  noticeDays: string;
  earlyMoveInAllowed: boolean | null;
  earlyMoveInDate: string;
  earlyMoveInProrated: string;
  securityDepositRequired: boolean;
  prepaidRentRequired: boolean;
  prepaidRentAmount: string;
  prepaidRentPeriod: string;
  lateFeeAmount: string;
  lateFeeDaily: boolean;
  nsfAmount: string;
  nsfUseMaxStatutory: boolean;
  landlordPaysUtilities: boolean;
  utilitiesList: string;
  utilitiesIncluded: {
    water: boolean;
    electricity: boolean;
    gas: boolean;
    internet: boolean;
    other: string;
  };
  petsAllowed: boolean | null;
  petFee: string;
  petTerms: string;
  moveInInspectionRequired: boolean;
  moveInInspectionBy: string;
  smokingAllowed: boolean;
  smokingAreas: string;
  rentersInsuranceRequired: boolean;
  rentersInsuranceMin: string;
  guestHours: string;
  hasCosigner: boolean;
  cosignerName: string;
  cosignerAddress: string;
  cosignerPhone: string;
  electricityInTenantName: boolean;
  leadPaintPre1978: boolean;
  floodplainAware: boolean;
  payZelle: boolean;
  payAch: boolean;
  payCash: boolean;
  payCheck: boolean;
  payOther: boolean;
  paymentOther: string;
};

export const defaultLeaseOptions = (): LeaseOptions => ({
  residenceType: 'Residential Unit',
  furnished: null,
  furnishingsList: '',
  appliances: 'Mini-split AC, Refrigerator, Stove/Oven, Smoke Detector(s)',
  termType: 'month_to_month',
  noticeDays: '30',
  earlyMoveInAllowed: null,
  earlyMoveInDate: '',
  earlyMoveInProrated: '',
  securityDepositRequired: true,
  prepaidRentRequired: false,
  prepaidRentAmount: '',
  prepaidRentPeriod: '',
  lateFeeAmount: '55.00',
  lateFeeDaily: true,
  nsfAmount: '55.00',
  nsfUseMaxStatutory: false,
  landlordPaysUtilities: false,
  utilitiesList: '',
  utilitiesIncluded: {
    water: false,
    electricity: false,
    gas: false,
    internet: false,
    other: '',
  },
  petsAllowed: null,
  petFee: '',
  petTerms: '',
  moveInInspectionRequired: false,
  moveInInspectionBy: '',
  smokingAllowed: false,
  smokingAreas: '',
  rentersInsuranceRequired: false,
  rentersInsuranceMin: '',
  guestHours: '48',
  hasCosigner: false,
  cosignerName: '',
  cosignerAddress: '',
  cosignerPhone: '',
  electricityInTenantName: true,
  leadPaintPre1978: false,
  floodplainAware: false,
  payZelle: true,
  payAch: false,
  payCash: false,
  payCheck: false,
  payOther: false,
  paymentOther: '',
});

export function mergeLeaseOptions(raw?: Record<string, unknown> | null): LeaseOptions {
  const base = defaultLeaseOptions();
  if (!raw || typeof raw !== 'object') return base;
  const util = (raw.utilitiesIncluded as Record<string, unknown>) || {};
  return {
    ...base,
    ...raw,
    utilitiesIncluded: {
      ...base.utilitiesIncluded,
      water: Boolean(util.water ?? base.utilitiesIncluded.water),
      electricity: Boolean(util.electricity ?? base.utilitiesIncluded.electricity),
      gas: Boolean(util.gas ?? base.utilitiesIncluded.gas),
      internet: Boolean(util.internet ?? base.utilitiesIncluded.internet),
      other: String(util.other ?? base.utilitiesIncluded.other ?? ''),
    },
    termType: (raw.termType as LeaseOptions['termType']) || base.termType,
  } as LeaseOptions;
}
