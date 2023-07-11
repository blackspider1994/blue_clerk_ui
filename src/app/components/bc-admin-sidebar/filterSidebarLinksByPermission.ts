import { User } from 'actions/employee/employee.types';
import { ability } from 'app/config/Can';

const filterSidebarLinksByPermission = (user:User, links: any) => {
  const linksToRemove: string[] = [];

  if (!user) {
    return links;
  }

  const { permissions } = user;
  const isAdmin = permissions?.role === 3;

  if (!ability.can('manage', 'Employee') && !isAdmin) {
    linksToRemove.push('employees');
  }

  if (!ability.can('manage', 'Company') && !isAdmin) {
    linksToRemove.push('company');
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

  if (!ability.can('edit', 'BillingInformation') && !ability.can('manage', 'Jobs') && !isAdmin) {
    linksToRemove.push('billing');
  }

  return links.filter((link: any) => !linksToRemove.includes(link.key));
};

export default filterSidebarLinksByPermission;
