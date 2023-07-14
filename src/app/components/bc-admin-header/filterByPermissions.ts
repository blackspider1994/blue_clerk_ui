import { User } from 'actions/employee/employee.types';
import { ability } from 'app/config/Can';
import { NAVDATA } from './bc-admin-header';

export default function (user: User, links: NAVDATA[]) {
  const linksToRemove: string[] = [];

  if (!user) {
    return links;
  }

  const { permissions } = user;
  const isAdmin = permissions?.role === 3 || permissions?.role === 4;
  
  if (!ability.can('manage', 'Invoicing') && !ability.can('manage', 'CustomerPayments') && !isAdmin) {
    linksToRemove.push('invoicing');
  }

  if (!ability.can('manage', 'VendorPayments') && !isAdmin) {
    linksToRemove.push('payroll');
  }
  if (!ability.can('manage', 'Reporting') && !isAdmin) {
    linksToRemove.push('reports');
  }

  if (
    !ability.can('manage', 'Employee') &&
    !ability.can('manage', 'Company') &&
    !ability.can('edit', 'BillingInformation') && 
    !ability.can('add', 'Vendor') && 
    !ability.can('manage', 'Items') && 
    !ability.can('manage', 'Company') && 
    !ability.can('manage', 'Employee') && 
    !isAdmin
  ) {
    linksToRemove.push('admin')
  }

  return links.filter((link: NAVDATA) => !linksToRemove.includes(link.key || ''));
}
