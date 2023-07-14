import { User } from 'actions/employee/employee.types';
import { ability } from 'app/config/Can';

const filterSidebarLinksByPermission = (user:User, links: any) => {
  const linksToRemove: string[] = [];

  if (!user) {
    return links;
  }

  const { permissions } = user;
  const isAdmin = permissions?.role === 3 || permissions?.role === 4;

  if (!ability.can('manage', 'Employee') && !isAdmin) {
    linksToRemove.push('employees');
  }

  if (!ability.can('manage', 'Company') && !isAdmin) {
    linksToRemove.push('company');
  }

  if (!ability.can('add', 'Vendor') && !isAdmin) {
    linksToRemove.push('vendors');
  }

  if (!ability.can('manage', 'Items') && !isAdmin) {
    linksToRemove.push('services_products');
  }

  if (!ability.can('manage', 'Invoicing') && !isAdmin) {
    linksToRemove.push('invoicing');
  }

  if (!ability.can('manage', 'Tickets') && !isAdmin) {
    linksToRemove.push('tickets');
  }

  if (!ability.can('manage', 'Jobs') && !isAdmin) {
    linksToRemove.push('jobs');
  }

  if (!ability.can('manage', 'Tickets') && !ability.can('manage', 'Jobs') && !isAdmin) {
    linksToRemove.push('calendar');
    linksToRemove.push('map');
  }

  if (!ability.can('edit', 'BillingInformation') && !isAdmin) {
    linksToRemove.push('billing');
  }

  if (!ability.can('manage', 'VendorPayments') && !isAdmin) {
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
