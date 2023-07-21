import { User } from 'actions/employee/employee.types';
// import { ability } from 'app/config/Can';
import { NAVDATA } from './bc-admin-header';
import { RolesAndPermissions } from 'actions/permissions/permissions.types';

export default function (user: User, rolesAndPermissions: RolesAndPermissions, links: NAVDATA[]) {
  const linksToRemove: string[] = [];

  if (!user) {
    return links;
  }

  const role = user.permissions?.role;
  const isAdmin = role === 3;

  if (!rolesAndPermissions?.accounting?.invoicing && !rolesAndPermissions?.accounting?.customerPayments && !isAdmin) {
    linksToRemove.push('invoicing');
  }

  if (!rolesAndPermissions?.accounting?.vendorPayments && !isAdmin) {
    linksToRemove.push('payroll');
  }
  if (!rolesAndPermissions?.accounting?.reporting && !isAdmin) {
    linksToRemove.push('reports');
  }

  if (
    !rolesAndPermissions?.admin?.manageEmployeeInfoAndPermissions &&
    !rolesAndPermissions?.admin?.manageCompanySettings &&
    !rolesAndPermissions?.superAdmin?.editBillingInformation && 
    !rolesAndPermissions?.admin?.addVendors && 
    !rolesAndPermissions?.admin?.manageItems && 
    !rolesAndPermissions?.admin?.manageCompanySettings && 
    !rolesAndPermissions?.admin?.manageEmployeeInfoAndPermissions && 
    !isAdmin
  ) {
    linksToRemove.push('admin')
  }

  return links.filter((link: NAVDATA) => !linksToRemove.includes(link.key || ''));
}
