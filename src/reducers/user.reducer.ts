import { Reducer } from 'redux';
import { initialCompanyProfileState, CompanyProfileActonType } from "../actions/user/user.types";
import {DEFAULT_COORD} from "../utils/constants";

export const CompanyProfileReducer: Reducer<any> = (state = initialCompanyProfileState, action) => {
  switch (action.type) {
    case CompanyProfileActonType.LOADING:
      return { ...state, isLoading: action.payload }
    case CompanyProfileActonType.SET_LOCATIONS_LOADING:
      return { ...state, isLocationLoading: action.payload }
    case CompanyProfileActonType.ONCHANGE: {
      const { id, value, inputError } = action.payload

      return { ...state, [id]: value, inputError }
    }
    case CompanyProfileActonType.UPDATE_SUCCESS:
      return { ...state }
    case CompanyProfileActonType.FETCH_SUCCESS: {
      const { address, contact, info, paymentTerm, admin } = action.payload;
      const newState = {
        companyName: info.companyName,
        companyEmail: info.companyEmail,
        logoUrl: info.logoUrl,
        fax: contact.fax,
        phone: contact.phone,
        city: address.city,
        state: address.state,
        street: address.street,
        zipCode: address.zipCode,
        coordinates: address.coordinates || DEFAULT_COORD,
        paymentTerm: paymentTerm,
        companyAdmin: admin
      }
      return { ...newState, locations: state.locations, inputError: {}, serverError: null, isLocationLoading: state.isLocationLoading }
    }
    case CompanyProfileActonType.ON_UPDATE_ERROR:
      return {
        ...state, serverError: action.payload
      }
    case CompanyProfileActonType.ON_FETCH_ERROR:
      return {
        ...state, serverError: action.payload
      }
    case CompanyProfileActonType.SET_LOCATIONS:
      return {...state, locations: action.payload};
    case CompanyProfileActonType.ADD_LOCATION:
      return {...state, locations: [...state.locations, action.payload]};
    case CompanyProfileActonType.UPDATE_LOCATION:
      const currentLocations = [...state.locations];
      const index = currentLocations.findIndex((location) => location._id === action.payload._id)
      if (index >= 0) {
        currentLocations[index] = action.payload;
        return {...state, locations: currentLocations};
      } else {
        return state;
      }
    default:
  }
  return state;
}
