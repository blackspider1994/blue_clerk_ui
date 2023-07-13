export type RolesAndPermissions = {
  [key: string]: {
    [key: string]: boolean
  }
}


export enum UserPermissionsActionType {
  LOADING = "IS_LOADING",
  UPDATE_SUCCESS = "USER_PERMISSIONS_UPDATE_SUCCESSFUL",
  FETCH_SUCCESS = 'FETCH_USER_PERMISSIONS_SUCCESSFUL',
  NO_RECORD = 'NO_RECORD',
  ON_UPDATE_ERROR = "USER_PERMISSIONS_UPDATE_FAILED",
  ON_FETCH_ERROR = "USER_PERMISSIONS_FETCH_FAILED",
}

export interface PermissionsState {
  readonly loading: boolean
  readonly error?: string
  readonly rolesAndPermissions?: RolesAndPermissions | null
}