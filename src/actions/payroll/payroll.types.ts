export const types = {
  'GET_CONTRACTORS': 'getContractors',
  'SET_CONTRACTORS': 'setContractors',
  'SET_CONTRACTOR': 'setContractor',
  'UPDATE_CONTRACTOR': 'updateContractor',
  'REMOVE_CONTRACTOR': 'removeContractor',
  'SET_CONTRACTOR_LOADING': 'setContractorLoading',
  'SET_CONTRACTOR_PAYMENTS': 'setContractorPayments',
  'UPDATE_CONTRACTOR_PAYMENT': 'updateContractorPayment',
  'REMOVE_CONTRACTOR_PAYMENT': 'removeContractorPayment',
  'REFRESH_CONTRACTOR_PAYMENT': 'refreshContractorPayment',
};

export interface Contractor {
  _id: string;
  type: string;
  vendor: string;
  email: string;
  phone: string;
  contact: {
    displayName: string;
    _id: string;
    email:  string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  balance: number;
  commission: number;
  commissionType: string;
  commissionTier: string;
  commissionTotal: number;
  invoiceIds: string[];
}

export interface ContractorPayment {
  _id: string;
  paidAt: string;
  startDate: string;
  endDate: string;
  referenceNumber: string;
  paymentType: string;
  invoices: any[];
  amountPaid: number;
  notes: string;
  contractor?: string;
  employee?: string;
  payedPerson?: Contractor,
  company: {
    _id: string;
    info: {
      companyName: string;
    }
  };
}

export interface PayrollState {
  readonly loading: boolean
  readonly contractors: Contractor[]
  readonly payments: ContractorPayment[]
  readonly data?: any[]
  readonly error?: string
  //readonly response?: string
  readonly contractorObj?: Contractor | {}
  readonly refresh?: boolean
}

export enum PayrollActionType {
  GET = 'getContractors',
  SET = 'setContractors',
  LOADING = 'loading',
  SUCCESS = 'getContractorsSuccess',
  FAILED = 'getContractorsFailed',
  SET_SINGLE_Contractor = 'setSingleContractor',
  // GET_SINGLE_VENDOR = 'getSingleVendor',
}

// export interface Contractor {
//   _id: string;
//   info: {
//     companyName: string;
//     companyEmail: string;
//   };
//   address: {
//     street: string;
//     city: string;
//     state: string;
//     zipCode: string;
//   },
//   contact: {
//     phone: string;
//   },
//   balance: number;
//   commission: number;
//   type: string;
// }
