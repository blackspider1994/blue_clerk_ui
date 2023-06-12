import { ReducerParamsInterface } from 'reducers';
import { HomeOwnerState, HomeOwnerType } from '../actions/home-owner/home-owner.types';

const initialHomeOwnerTypes : HomeOwnerState = {
  loading: false,
  refresh: false,
  data: [],
  error: ''
};

export default (state = initialHomeOwnerTypes, { payload, type }: ReducerParamsInterface) => {
  switch (type) {
    case HomeOwnerType.SET:
      return {
        loading: false,
        refresh: false,
        data: [...payload],
        error: ""
      };
    case HomeOwnerType.GET:
      return {
        ...state,
        loading: true,
      };
    case HomeOwnerType.CLEAR_HOME_OWNER_STORE:
      return {
        ...state,
        data: []
      };
    case HomeOwnerType.FAILED:
      return {
        ...state,
        'error': payload
      };
    default:
      return state;
  }
};