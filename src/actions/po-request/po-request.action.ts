import { types } from './po-request.types';

export const setPORequest = (PORequests: any) => {
  return {
    'payload': PORequests,
    'type': types.SET_PO_REQUEST
  };
};

export const setPORequestLoading = (isLoading: any) => {
  return {
    'payload': isLoading,
    'type': types.SET_PO_REQUEST_LOADING
  };
};

export const refreshPORequests = (refresh: any) => {
  return {
    'payload': refresh,
    'type': types.SET_REFRESH_PO_REQUEST_STATUS
  };
};

export const setPreviousPORequestCursor = (prevCursor: string) => {
  return {
    'payload': prevCursor,
    'type': types.SET_PREVIOUS_PO_REQUEST_CURSOR
  };
};

export const setNextPORequestCursor = (nextCursor: string) => {
  return {
    'payload': nextCursor,
    'type': types.SET_NEXT_PO_REQUEST_CURSOR
  };
};

export const setTotal = (total: number) => {
  return {
    'payload': total,
    'type': types.SET_PO_REQUEST_TOTAL
  };
};

export const setCurrentPageIndex = (currentPageIndex: number) => {
  return {
    'payload': currentPageIndex,
    'type': types.SET_CURRENT_PO_REQUEST_PAGE_INDEX
  };
};

export const setCurrentPageSize = (currentPageSize: number) => {
  return {
    'payload': currentPageSize,
    'type': types.SET_CURRENT_PO_REQUEST_PAGE_SIZE
  };
};

export const setKeyword = (keyword: string) => {
  return {
    'payload': keyword,
    'type': types.SET_PO_REQUEST_SEARCH_KEYWORD
  };
};

export const getPORequestDetailAction = (ticketId:string) => {
  return {
    'payload': ticketId,
    'type': types.GET_PO_REQUEST_DETAIL
  };
};

