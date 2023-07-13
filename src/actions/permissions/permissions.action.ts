import { getUserPermissions } from "api/permissions.api";
import { UserPermissionsActionType } from "./permissions.types";

export const getUserPermissionsAction = (userId: string) => {
  return async (dispatch: any) => {
    dispatch({ type: UserPermissionsActionType.LOADING, payload: true });
    const response = await getUserPermissions(userId);

    if (response.hasOwnProperty('message')) {
      dispatch({ type: UserPermissionsActionType.LOADING, payload: false });
      dispatch({ type: UserPermissionsActionType.ON_FETCH_ERROR, payload: response.message });
    } else if (response.permissions) {
      dispatch({ type: UserPermissionsActionType.FETCH_SUCCESS, payload: response.permissions });
    } else if (!response.permissions) {
      dispatch({ type: UserPermissionsActionType.NO_RECORD });
    }
  }
}
