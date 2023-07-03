import { User } from 'actions/employee/employee.types';
import { ability } from 'app/config/Can';

export default function (user: User, links: any) {
  const linksToRemove: string[] = [];

  if (!user) {
    return links;
  }

  const { permissions } = user;
  const isAdmin = permissions?.role === 3;

  if (!ability.can('manage', 'Invoicing') && !ability.can('manage', 'CustomerPayments') && !isAdmin) {
    linksToRemove.push('invoicing');
  }

  if (!ability.can('manage', 'VendorPayments') && !isAdmin) {
    linksToRemove.push('payroll');
  }
  if (!ability.can('manage', 'Reporting') && !isAdmin) {
    linksToRemove.push('reports');
  }

  return links.filter((link: any) => !linksToRemove.includes(link.key));
}
