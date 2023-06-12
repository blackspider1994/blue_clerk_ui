
import { ISelectedDivision, types } from 'actions/filter-division/fiter-division.types';
import { Reducer } from 'redux';

const initialSelectedDivision: ISelectedDivision = {
  'data': {},
  'params': {},
  "isDivisionFeatureActivated": true,
  "urlParams": "",
  "openSelectDivisionModal": false
};

export const FilterDivisionReducer: Reducer<any> = (state = initialSelectedDivision, action) => {
  switch (action.type) {
    case types.SET_CURRENT_LOCATION:
      return {
        ...state,
        'data': action.payload
      };
    case types.SET_DIVISION_PARAMS:
      return {
        ...state,
        'params': action.payload
      };
    case types.SET_IS_DIVISION_ACTIVATED:
      return {
        ...state,
        isDivisionFeatureActivated: action.payload
      }
    case types.SET_DIVISION_URL_PARAMS:
      return {
        ...state,
        urlParams: action.payload
      }
    case types.CALL_SELECT_DIVISION_MODAL:
      return {
        ...state,
        openSelectDivisionModal: action.payload
      }
    default:
      return state;
  }
};
