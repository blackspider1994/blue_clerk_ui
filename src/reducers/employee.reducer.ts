import { Reducer } from 'redux';
import { UsersState, UsersActionType, types } from './../actions/employee/employee.types';

const initialEmployees: UsersState = {
  loading: false,
  data: [],
  added: false,
}

export const EmployeesReducer: Reducer<any> = (state = initialEmployees, action) => {

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
    case UsersActionType.GET_SINGLE_EMPLOYEE:
      return {
        ...state,
        loading: true,
      }
    case UsersActionType.SET_SINGLE_EMPLOYEE:
      return {
        ...state,
        loading: false,
        employeeDetails: action.payload.employee
      }
    case UsersActionType.SET_SINGLE_EMPLOYEE_PERMISSIONS:
      return {
        ...state,
        loading: false,
        employeePermissions: action.payload
      }  
    default:
  }
  return state;
}
