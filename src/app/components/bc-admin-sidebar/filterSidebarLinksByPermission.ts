import { User } from 'actions/employee/employee.types';
import { RolesAndPermissions } from 'actions/permissions/permissions.types';
import { ability } from 'app/config/Can';

const filterSidebarLinksByPermission = (user:User, rolesAndPermissions: RolesAndPermissions, links: any, ) => {
  const linksToRemove: string[] = [];

  if (!user && !rolesAndPermissions) {
    return links;
  }

  const role = user?.permissions?.role;

  const isAdmin = role === 3;

  if (!rolesAndPermissions?.admin?.manageEmployeeInfoAndPermissions && !isAdmin) {
    linksToRemove.push('employees');
  }

  if (!rolesAndPermissions?.admin?.manageCompanySettings && !isAdmin) {
    linksToRemove.push('company');
  }

  if (!rolesAndPermissions?.admin?.addVendors && !isAdmin) {
    linksToRemove.push('vendors');
  }

  if (!rolesAndPermissions?.admin?.manageItems && !isAdmin) {
    linksToRemove.push('services_products');
  }

  if (!rolesAndPermissions?.accounting?.invoicing && !isAdmin) {
    linksToRemove.push('invoicing');
  }

  if (!rolesAndPermissions?.dispatch?.serviceTickets && !isAdmin) {
    linksToRemove.push('tickets');
  }

  if (!rolesAndPermissions?.dispatch?.jobs && !isAdmin) {
    linksToRemove.push('jobs');
  }

  if (!rolesAndPermissions?.dispatch?.serviceTickets && !rolesAndPermissions?.dispatch?.jobs && !isAdmin) {
    linksToRemove.push('calendar');
    linksToRemove.push('map');
  }

  if (!rolesAndPermissions?.superAdmin?.editBillingInformation && !isAdmin) {
    linksToRemove.push('billing');
  }

  if (!rolesAndPermissions?.accounting?.vendorPayments && !isAdmin) {
    linksToRemove.push('payroll');
  }

  if (!isAdmin) {
    linksToRemove.push('brands');
    linksToRemove.push('equipment_type');
    linksToRemove.push('groups');
    linksToRemove.push('report_number');
    linksToRemove.push('roles');
    linksToRemove.push('integrations');
    linksToRemove.push('data');
  }

  return links.filter((link: any) => !linksToRemove.includes(link.key));
};

export default filterSidebarLinksByPermission;
