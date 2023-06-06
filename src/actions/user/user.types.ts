import {DEFAULT_COORD} from "../../utils/constants";

export interface CompanyProfile {
  companyName: string;
  companyEmail: string;
  companyAdmin?: string;
  logoUrl?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone: string;
  fax?: string;
  coordinates?: {lat: number, lng: number};
  paymentTerm?: {
    createdAt: string,
    createdBy: string,
    dueDays: number,
    isActive: Boolean,
    name: string,
    updatedAt: string,
    _id: string | undefined,
  }
}

export interface CompanyLocation {
  _id: string;
  name: string;
  isActive: boolean;
  isMainLocation: boolean;
  info?: {
    companyEmail?: string;
  }
  contact?: {
    phone?: string;
  }
  contactName?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  },
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    emailSender?: string;
    setUserAsSender?: boolean;
  },
  isAddressAsBillingAddress?: boolean,
  workTypes?: any[],
  assignedVendors?: any[],
  assignedEmployees?: any[],
}

export interface CompanyProfileOtherState {
  locations: CompanyLocation[];
  inputError: {[k: string]: boolean};
  serverError: any;
  isLoading: boolean;
  isLocationLoading: boolean;
}
export interface CompanyProfileRes {
  status?: number;
  message?: string;
}

export const companyProfileState: CompanyProfile = {
  companyName: '',
  companyEmail: '',
  companyAdmin: '',
  fax: '',
  phone: '',
  city: '',
  state: '',
  zipCode: '',
  coordinates: DEFAULT_COORD,
  logoUrl: undefined,
  street: '',
  paymentTerm: {
    createdAt: '',
    createdBy: '',
    dueDays: 0,
    isActive: false,
    name: '',
    updatedAt: '',
    _id: '',
  }
}

export const companyLocationState: CompanyLocation = {
  _id: '',
  name: '',
  isActive: false,
  isMainLocation: false,
}

export type CompanyProfileStateType = CompanyProfile & CompanyProfileOtherState

export const initialCompanyProfileState: CompanyProfileStateType = {
  ...companyProfileState,
  locations: [],
  inputError: {},
  serverError: null,
  isLoading: false,
  isLocationLoading: false,
};


export enum CompanyProfileActonType {
  ONCHANGE = "ON_VALUE_CHANGE",
  LOADING = "IS_LOADING",
  UPDATE_SUCCESS = "COMPANY_PROFILE_UPDATE_SUCCESSFUL",
  FETCH_SUCCESS = 'FETCH_COMPANY_PROFILE_SUCCESSFUL',
  ON_UPDATE_ERROR = "COMPANY_PROFILE_UPDATE_FAILED",
  ON_FETCH_ERROR = "COMPANY_PROFILE_FETCH_FAILED",
  ON_INPUT_ERROR = 'VALIDATION_FAILED',
  SET_LOCATIONS = 'SET_LOCATIONS',
  SET_SELECTED_LOCATION = 'SET_SELECTED_LOCATIONS',
  UPDATE_LOCATION = 'UPDATE_LOCATION',
  ADD_LOCATION = 'ADD_LOCATION ',
  SET_LOCATIONS_LOADING = "SET_LOCATIONS_LOADING"
}
