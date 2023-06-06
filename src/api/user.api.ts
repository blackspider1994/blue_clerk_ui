import request from "utils/http.service";
import { CompanyProfile } from '../actions/user/user.types'

export const updateCompanyProfile = async (data: CompanyProfile) => {
  let responseData;
  try {
    const response: any = await request("/updateCompanyProfile", "POST", data, false);
    responseData = response.data;
  } catch (err) {
    responseData = { message: '' };
    responseData.message = 'We are facing some issues, please try again.'
  }

  return responseData;
}

export const getCompanyProfile = async (companyId: string) => {
  let responseData;
  try {
    const response: any = await request(`/getCompanyProfile/${companyId}`, "GET", false);
    responseData = response.data;

  } catch (err) {
    responseData = { message: '' };
    responseData.message = 'Sorry, we were un able to load your profile, please try again'
  }
  return responseData;
}


export const updateProfile = async (data: any) => {
  let responseData;


  let formData = new FormData();

  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  })
  try {
    const response: any = await request("/updateProfile", "POST", formData, false);
    responseData = response.data;
  } catch (err) {
    responseData = { message: '' };
    responseData.message = 'We are facing some issues, please try again.'
  }

  return responseData;

}

export const getCompanyLocations = async () => {
  let responseData;
  try {
    const response: any = await request("/getCompanyLocations", "GET", {}, false);
    responseData = response.data;
  } catch (err) {
    responseData = {
      status: 0,
      message: 'We are facing some issues, please try again.\''
    };
  }
  return responseData;
}

export const createCompanyLocation = async (data: any) => {
  let responseData;

  try {
    const response: any = await request("/createCompanyLocation", "POST", data, false);
    responseData = response.data;
  } catch (err) {
    responseData = {
      status: 0,
      message: 'We are facing some issues, please try again.\''
    };
  }
  return responseData;
}

export const updateCompanyLocation = async (data: any) => {
  let responseData;

  try {
    const response: any = await request("/updateCompanyLocation", "PUT", data, false);
    responseData = response.data;
  } catch (err) {
    responseData = {
      status: 0,
      message: 'We are facing some issues, please try again.\''
    };
  }
  return responseData;
}

export const updateCompanyLocationAssignments = async (data: any) => {
  let responseData;

  try {
    const response: any = await request("/updateCompanyLocationAssignments", "PUT", data, false);
    responseData = response.data;
  } catch (err) {
    responseData = {
      status: 0,
      message: 'We are facing some issues, please try again.\''
    };
  }
  return responseData;
}

export const updateCompanyLocationBillingAddress = async (data: any) => {
  let responseData;

  try {
    const response: any = await request("/updateCompanyLocationBillingAddress", "PUT", data, false);
    responseData = response.data;
  } catch (err) {
    responseData = {
      status: 0,
      message: 'We are facing some issues, please try again.\''
    };
  }
  return responseData;
}

