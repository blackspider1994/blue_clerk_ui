import { PureAbility } from '@casl/ability';
import { createCanBoundTo } from '@casl/react';
import defineRulesFor from './ability';
import store from '../../store';
import { User } from 'actions/employee/employee.types';

export const ability = new PureAbility();

store.subscribe(() => {
  const user: User | null = store.getState().auth?.user;
  if (user) {
    ability.update(defineRulesFor(user));
  }
});

export const Can = createCanBoundTo(ability);
