import { getUserPermissions, updateUserPermissions } from "api/permissions.api";
import { RolesAndPermissions, UserPermissionsActionType } from "./permissions.types";
import { UsersActionType } from "actions/employee/employee.types";

export const getUserPermissionsAction = (userId: string) => {
  return async (dispatch: any) => {
    dispatch({ type: UserPermissionsActionType.LOADING, payload: true });
    const response = await getUserPermissions(userId);
    if (response?.hasOwnProperty('message')) {
      dispatch({ type: UserPermissionsActionType.LOADING, payload: false });
      dispatch({ type: UserPermissionsActionType.ON_FETCH_ERROR, payload: response.message });
    } else if (response.permissions) {
      dispatch({ type: UserPermissionsActionType.FETCH_SUCCESS, payload: response.permissions });
    } else if (!response.permissions) {
      dispatch({ type: UserPermissionsActionType.NO_RECORD });
    }
  }
}

export const updateUserPermissionsAction = (userId: string, permissions: RolesAndPermissions) => {
  return async (dispatch: any) => {
    dispatch({ type: UserPermissionsActionType.LOADING, payload: true });
    const response = await updateUserPermissions(userId, permissions);
    if (response?.hasOwnProperty('message')) {
      dispatch({ type: UserPermissionsActionType.LOADING, payload: false });
      dispatch({ type: UserPermissionsActionType.ON_FETCH_ERROR, payload: response.message });
    } else if (response.permissions) {
      dispatch({ type: UserPermissionsActionType.UPDATE_SUCCESS, payload: response.permissions });
      dispatch({ type: UsersActionType.SET_SINGLE_EMPLOYEE_PERMISSIONS, payload: response.permissions });
    } else if (!response.permissions) {
      dispatch({ type: UserPermissionsActionType.NO_RECORD });
    }
  }
}
