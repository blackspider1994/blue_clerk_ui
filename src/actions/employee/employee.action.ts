
import { RolesAndPermissions } from 'actions/permissions/permissions.types';
import { createApiAction } from '../action.utils';
import { UserProfile, UsersActionType, types, updateEmployeeLocPermParam } from './employee.types';
import { addAdministrator, addManager, addOfficeAdmin, addTechnician, getEmployees as fetchEmployees, getEmployeeDetail, updateAdminRole, updateLocPermission } from 'api/employee.api';
import { getUserPermissions } from 'api/permissions.api';
import { initialRolesAndPermissions } from 'reducers/permissions.reducer';

export const loadAllEmployeesActions = createApiAction(types.EMPLOYEE_LOAD);
export const newCustomerAction = createApiAction(types.EMPLOYEE_NEW);
export const deleteCustomerActions = createApiAction(types.EMPLOYEE_REMOVE);

export const loadingEmployees = () => {
  return {
    'type': UsersActionType.GET
  };
};

export const getEmployees = () => {
  return async (dispatch: any) => {
    const employees: any = await fetchEmployees();
    dispatch(setEmployees(employees));
  };
};

export const setEmployees = (employees: any) => {
  return {
    'type': types.SET_EMPLOYEES,
    'payload': employees
  };
};

export const createTechnician = (data: UserProfile) => {
  return async (dispatch: any) => {
    return await addTechnician(data);
  };
};

export const createAdministrator = (data: UserProfile) => {
  return async (dispatch: any) => {
    return await addAdministrator(data);
  };
};

export const createManager = (data: UserProfile) => {
  return async (dispatch: any) => {
    return await addManager(data);
  };
};

export const createOfficeAdmin = (data: UserProfile) => {
  return async (dispatch: any) => {
    return await addOfficeAdmin(data);
  };
};

export const updateEmployeeRole = (data: UserProfile) => {
  return async (dispatch: any) => {
    return await updateAdminRole(data);
  };
};

export const updateEmployeeLocPermission = (data: updateEmployeeLocPermParam) => {
  return async (dispatch: any) => {
    return await updateLocPermission(data);
  };
};


export const loadingSingleEmployee = () => {
  return {
    'type': UsersActionType.GET_SINGLE_EMPLOYEE
  };
};

export const getEmployeeDetailAction = (data: any) => {
  return async (dispatch: any) => {
    const employee: any = await getEmployeeDetail(data);

    dispatch({ 'type': UsersActionType.SET_SINGLE_EMPLOYEE,
      'payload': employee });
  };
};

export const getEmployeePermissionsAction = (data: any) => {
  return async (dispatch: any) => {
    const response: RolesAndPermissions = await getUserPermissions(data);

    dispatch({ type: UsersActionType.SET_SINGLE_EMPLOYEE_PERMISSIONS, payload: response.permissions || initialRolesAndPermissions });
  };
}

