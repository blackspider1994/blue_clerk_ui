export const types = {
  'CUSTOMER_LOAD': 'loadCustomersActions',
  'CUSTOMER_NEW': 'newCustomerAction',
  'CUSTOMER_REMOVE': 'deleteCustomerActions',
  'SET_CUSTOMERS': 'setCustomer',
  'SET_SINGLE_CUSTOMER': 'setSingleCustomer',
  'GET_SINGLE_CUSTOMER': 'getSingleCustomer',
  'UPDATE_CUSTOMER_FAILED': 'updateCustomerFailed',
  'SET_CUSTOMERS_SEARCH_KEYWORD': 'setCustomersSearchKeyword',
};

export interface Customer {
  _id: string
  info: {
    name?: string
    email: string
  }
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  contact: {
    name: string
    phone: string
  }
  isActive: boolean
  company: string
  contactname: string
  profile: {
    firstName: string
    lastName: string
    displayName: string
  }
  vendorId: string,
  paymentTerm: {
    createdAt: string,
    createdBy: string,
    dueDays: number,
    isActive: Boolean,
    name: string,
    updatedAt: string,
    _id: string | undefined,
  }
}

export interface CustomersState {
  readonly loading: boolean;
  readonly data?: Customer[];
  readonly error?: string;
  readonly customerObj?: Customer;
  keyword?: string;
}

export enum CustomersActionType {
  GET = 'getCustomers',
  SUCCESS = 'getCustomersSuccess',
  FAILED = 'getCustomersFailed',
}
