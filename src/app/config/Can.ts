import { PureAbility } from '@casl/ability';
import { createCanBoundTo } from '@casl/react';
import defineRulesFor from './ability';
import store from '../../store';
import { User } from 'actions/employee/employee.types';
import { RolesAndPermissions } from 'actions/permissions/permissions.types';

export const ability = new PureAbility();

store.subscribe(() => {
  const user: User | null = store.getState().auth?.user;
  const permissions: RolesAndPermissions | null = store.getState().permissions.rolesAndPermissions;
  if (user && permissions) {
    ability.update(defineRulesFor(user, permissions));
  }
});

export const Can = createCanBoundTo(ability);
