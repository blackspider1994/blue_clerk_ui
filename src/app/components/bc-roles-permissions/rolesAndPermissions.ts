import { RolesAndPermissions } from 'actions/employee/employee.types';

export type Roles = 'admin'| 'dispatch' | 'accounting' | 'superAdmin';

export const permissionDescriptions: { [key :string]: string } = {
  'accounting': 'Accounting',
  'addVendors': 'Add Vendors',
  'admin': 'Admin',
  'customerPayments': 'Customer Payments',
  'deleteCompanyAccount': 'Delete company account',
  'dispatch': 'Scheduling/Dispatch',
  'editBillingInformation': 'Edit billing information',
  'editCompanyLogo': 'Edit company logo',
  'invoicing': 'Invoicing',
  'jobs': 'Jobs',
  'manageCompanySettings': 'Can edit company settings',
  'manageEmployeeInfoAndPermissions': 'Add and edit employee information and edit employee permissions',
  'manageItems': 'Create and edit items',
  'reporting': 'Reporting',
  'serviceTickets': 'Service Tickets',
  'superAdmin': 'Super Admin',
  'vendorPayments': 'Vendor Payments'
};


const initialRolesAndPermissions: RolesAndPermissions = {
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

export default initialRolesAndPermissions;
