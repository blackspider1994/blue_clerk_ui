import { RolesAndPermissions } from "actions/permissions/permissions.types";
import axios from "axios";
import { requestApiV2 } from "utils/http.service";

export const getUserPermissions = async (userId: string) => {
  let responseData;

  try {
    const response = await requestApiV2(`/getUserPermission/${userId}`, 'GET');
    responseData = response.data;
  } catch (err) {
    responseData = {
      status: 0,
      message: 'We are facing some issues, please try again.\''
    };
  }
  return responseData;
}

export const updateUserPermissions = async (userId: string, permissions: RolesAndPermissions) => {
  let responseData;

  try {
    const response = await requestApiV2(`/updateUserPermission/${userId}`, 'POST', { permissions });
    responseData = response.data;
  } catch (err) {
    responseData = {
      status: 0,
      message: 'We are facing some issues, please try again.\''
    };
  }
  return responseData;
}