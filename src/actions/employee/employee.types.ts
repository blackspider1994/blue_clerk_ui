export const types = {
  'EMPLOYEE_LOAD': 'loadAllEmployeesActions',
  'EMPLOYEE_NEW': 'newEmployeeAction',
  'EMPLOYEE_REMOVE': 'deleteEmployeeActions',
  'SET_EMPLOYEES': 'setEmployee'
};

export interface updateEmployeeLocPermParam {
  employeeId: string;
  canAccessAllLocations: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  canAccessAllLocations?: boolean;
}

export interface User {
  _id: string,
  auth?: {
    email?: string,
    password?: string
  },
  profile?: {
    firstName?: string,
    lastName?: string,
    displayName?: string
  },
  address?: {
    street?: string,
    city?: string,
    state?: string,
    zipCode?: string
  },
  contact?: {
    phone?: string
  },
  permissions?: {
    role?: 0
  },
  info?: {
    companyName?: string,
    logoUrl?: string,
    industry?: string
  },
  company?: string
  allLocation?: boolean
}

export interface UserDetails {
  'firstName': string,
  'lastName': string,
  'email': string,
  'phone': string,
  'emailPreferences': {
    'preferences': string,
    'time': string,
    'timezone': string
  }
}

export interface UsersState {
  readonly loading: boolean
  readonly data?: User[]
  readonly error?: string
  readonly added?: boolean
  readonly employeeDetails?: UserDetails
}

export const EmployeeRoles = ['Office Admin', 'Technician', 'Manager', 'Company Administrator', 'Admin', 'Customer'];

export enum UsersActionType {
  GET = 'getUsers',
  SUCCESS = 'getUsersSuccess',
  FAILED = 'getUsersFailed',
  ADDED = 'addedUser',
  GET_SINGLE_EMPLOYEE = 'getSingleEmployee',
  SET_SINGLE_EMPLOYEE = 'setSingleEmployee',
}
