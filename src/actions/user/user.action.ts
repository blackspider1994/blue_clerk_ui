import {
  updateCompanyProfile,
  getCompanyProfile,
  getCompanyLocations, createCompanyLocation, updateCompanyLocation, updateCompanyLocationAssignments, updateCompanyLocationBillingAddress
} from 'api/user.api';
import { CompanyProfile, CompanyProfileRes, CompanyProfileActonType } from '../../actions/user/user.types'
import Geocode from "react-geocode";
import Config from "../../config";
import {error, success} from "../snackbar/snackbar.action";

export const updateCompanyProfileAction = (formData: CompanyProfile) => {
  return async (dispatch: any) => {
    dispatch({ type: CompanyProfileActonType.LOADING, payload: true });
    const response: CompanyProfileRes = await updateCompanyProfile(formData);
    if (response.hasOwnProperty('message')) {
      dispatch({ type: CompanyProfileActonType.LOADING, payload: false });
      dispatch({ type: CompanyProfileActonType.UPDATE_SUCCESS, payload: response });
    } else {
      dispatch({ type: CompanyProfileActonType.LOADING, payload: false });
      dispatch({ type: CompanyProfileActonType.ON_UPDATE_ERROR, payload: response.message });
    }
  }
}

export const getCompanyProfileAction = (companyId: string) => {
  return async (dispatch: any) => {
    dispatch({ type: CompanyProfileActonType.LOADING, payload: true });
    const response = await getCompanyProfile(companyId);

    if (response.hasOwnProperty('message')) {
      dispatch({ type: CompanyProfileActonType.LOADING, payload: false });
      dispatch({ type: CompanyProfileActonType.ON_FETCH_ERROR, payload: response.message });
    } else {
      Geocode.setApiKey(Config.REACT_APP_GOOGLE_KEY);
      const {street = '', city = '', state = '', zipCode = ''} = response.company.address || {};

      if (state ||  zipCode) {
        const address = `${street} ${city} ${state} ${zipCode} USA`;
        const mapResponse = await Geocode.fromAddress(address);
        const {lat, lng} = mapResponse?.results[0]?.geometry?.location || {};
        response.company.address.coordinates = {lat, lng};
      }

      dispatch({ type: CompanyProfileActonType.LOADING, payload: false });
      dispatch({ type: CompanyProfileActonType.FETCH_SUCCESS, payload: response.company });
    }
  }
}

export const getCompanyLocationsAction = () => {
  return async (dispatch: any) => {
    dispatch({ type: CompanyProfileActonType.SET_LOCATIONS_LOADING, payload: true });
    const {status, message, companyLocations} = await getCompanyLocations();
    if (status === 1) {
      dispatch({ type: CompanyProfileActonType.SET_LOCATIONS_LOADING, payload: false });
      dispatch({type: CompanyProfileActonType.SET_LOCATIONS, payload: companyLocations});
    } else {
      dispatch(error(message));
    }
  }
}

export const AddCompanyLocationAction = (data: any, callback:(status: number) => void) => {
  return async (dispatch: any) => {
    const {status, message, companyLocation} = await createCompanyLocation(data);
    if (status === 1) {
      dispatch({type: CompanyProfileActonType.ADD_LOCATION, payload: companyLocation});
      dispatch(success('Location added successfully'));
    } else {
      dispatch(error(message));
    }
    callback(status);
  }
}

export const UpdateCompanyLocationAction = (data: any, callback:(status: number) => void) => {
  return async (dispatch: any) => {
    const {status, message, companyLocation} = await updateCompanyLocation(data);
    if (status === 1) {
      dispatch({type: CompanyProfileActonType.UPDATE_LOCATION, payload: companyLocation});
      dispatch(success('Location updated successfully'));
    } else {
      dispatch(error(message));
    }
    callback(status);
  }
}

export const UpdateCompanyLocationAssignmentsAction = (data: any, callback:(status: number) => void) => {
  return async (dispatch: any) => {
    const {status, message, companyLocation} = await updateCompanyLocationAssignments(data);
    if (status === 1) {
      dispatch({type: CompanyProfileActonType.UPDATE_LOCATION, payload: companyLocation});
      dispatch(success('Location updated successfully'));
    } else {
      dispatch(error(message));
    }
    callback(status);
  }
}

export const UpdateCompanyLocationBillingAddressAction = (data: any, callback:(status: number) => void) => {
  return async (dispatch: any) => {
    const {status, message, companyLocation} = await updateCompanyLocationBillingAddress(data);
    if (status === 1) {
      dispatch({type: CompanyProfileActonType.UPDATE_LOCATION, payload: companyLocation});
      dispatch(success('Location updated successfully'));
    } else {
      dispatch(error(message));
    }
    callback(status);
  }
}
