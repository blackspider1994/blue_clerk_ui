// Import { Reducer } from 'redux';
import { ReducerParamsInterface } from 'reducers';
import { types } from '../actions/po-request/po-request.types';

const initialPORequest = {
  'isLoading': false,
  'refresh': true,
  'po_request': [],
  'prevCursor': '',
  'nextCursor': '',
  'total': 0,
  'currentPageIndex': 0,
  'currentPageSize': 10,
  'keyword': '',
};

export default (state = initialPORequest, { payload, type }: ReducerParamsInterface) => {
  switch (type) {
    case types.SET_PO_REQUEST:
      return {
        ...state,
        'po_request': [...payload]
      };
    case types.SET_PO_REQUEST_LOADING:
      return {
        ...state,
        'isLoading': payload
      };
    case types.SET_REFRESH_PO_REQUEST_STATUS:
      return {
        ...state,
        'refresh': payload
      };
    case types.SET_PREVIOUS_PO_REQUEST_CURSOR:
      return {
        ...state,
        prevCursor: payload,
      };
    case types.SET_NEXT_PO_REQUEST_CURSOR:
      return {
        ...state,
        nextCursor: payload,
      };
    case types.SET_PO_REQUEST_TOTAL:
      return {
        ...state,
        total: payload,
      };
    case types.SET_CURRENT_PO_REQUEST_PAGE_INDEX:
      return {
        ...state,
        currentPageIndex: payload,
      };
    case types.SET_CURRENT_PO_REQUEST_PAGE_SIZE:
      return {
        ...state,
        currentPageSize: payload,
      };
    case types.SET_PO_REQUEST_SEARCH_KEYWORD:
      return {
        ...state,
        keyword: payload,
      };
    default:
      return state;
  }
};

