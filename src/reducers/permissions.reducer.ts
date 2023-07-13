import {
  PermissionsState,
  RolesAndPermissions,
  UserPermissionsActionType,
} from 'actions/permissions/permissions.types';
import { Reducer } from 'redux';

export const initialRolesAndPermissions: RolesAndPermissions = {
  'admin': {
    'addVendors': false,
    'manageItems': false,
    'manageCompanySettings': false,
    'manageEmployeeInfoAndPermissions': false
  },
  'dispatch': {
    'serviceTickets': false,
    'jobs': false
  },
  'accounting': {
    'invoicing': false,
    'customerPayments': false,
    'vendorPayments': false,
    'reporting': false
  },
  'superAdmin': {
    'deleteCompanyAccount': false,
    'editCompanyLogo': false,
    'editBillingInformation': false
  }
};

const initialPermissions: PermissionsState = {
  loading: false,
  rolesAndPermissions: initialRolesAndPermissions,
  error: '',
};

const PermissionsReducer: Reducer<any> = (
  state = initialPermissions,
  action
) => {
  switch (action.type) {
    case UserPermissionsActionType.LOADING:
      return {
        ...state,
        loading: true,
      };
    case UserPermissionsActionType.FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        rolesAndPermissions: action.payload
      }
    case UserPermissionsActionType.NO_RECORD:
      return {
        ...state,
        loading: false,
        rolesAndPermissions: initialRolesAndPermissions
      }
    default:
  }
  return state;
};

export default PermissionsReducer