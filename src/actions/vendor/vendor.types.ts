export const types = {
  'COMPANY_CONTRACTS_LOAD': 'loadCompanyContractsActions',
  'COMPANY_CONTRACT_CANCEL_OR_FINISH': 'COMPANY_CONTRACT_CANCEL_OR_FINISH',
  'GET_SINGLE_VENDOR': 'getSingleCustomer'
};

export interface InfoTypes {
  companyEmail: string;
  companyName: string;
}

export interface Vendor {
  _id: string;
  status: number;
  contractor: {
    _id: string;
    type: number;
    info: InfoTypes
  };
  company: {
    _id: string;
    type: number;
    info: InfoTypes
  },
  extraPermission?: any[];
}

export interface VendorsState {
  readonly loading: boolean
  readonly contractLoading?: boolean
  readonly data?: any[]
  readonly error?: string
  readonly response?: string
  readonly vendorObj?: Vendor | {}
  readonly vendorPayments?: any[]
  readonly assignedVendors?: string[]
  readonly unsignedVendorsFlag?: boolean
}

export enum VendorActionType {
  GET = 'getVendors',
  SET = 'setVendors',
  SUCCESS = 'getVendorsSuccess',
  FAILED = 'getVendorsFailed',
  SET_SINGLE_VENDOR = 'setSingleVender',
  GET_SINGLE_VENDOR = 'getSingleVendor',
  UPDATE_SINGLE_VENDOR_PAYMENT = 'updateSingleVendorPayment',
  DELETE_SINGLE_VENDOR_PAYMENT = 'deleteSingleVendorPayment',
  SET_VENDOR_DISPLAY_NAME = 'setVendorDisplayName',
  SET_ASSIGNED_VENDORS = 'setAssignedVendors',
  SET_UNSIGNED_VENDORS_FLAG = 'setUnsignedVendorsFlag',
}

export const vendorStatusToNumber:any = {
  'accept': 1,
  'reject': 3,
  'cancel': 2,
  'finish': 4
};
