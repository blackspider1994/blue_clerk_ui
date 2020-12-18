import { Reducer } from 'redux';
import { UsersState, UsersActionType, types } from './../actions/employee/employee.types';

const initialEmployees: UsersState = {
  loading: false,
  data: [],
  added: false
}

export const EmployeesReducer: Reducer<any> = (state = initialEmployees, action) => {
  console.log(action.type);
  switch (action.type) {
    case UsersActionType.GET:
      return {
        loading: true,
        data: initialEmployees,
      };
    case UsersActionType.SUCCESS:
    case types.SET_EMPLOYEES:
      return {
        loading: false,
        data: [...action.payload],
      }
    case UsersActionType.FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    case UsersActionType.ADDED:
      return {
        added: true
      }
    default:
  }
  return state;
}