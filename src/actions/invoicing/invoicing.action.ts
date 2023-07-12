import {
  getInvoicingEstimates as fetchInvoicingEstimates,
  getInvoicingList as fetchInvoicingList,
  getPurchaseOrder as fetchPurchaseOrder,
  getTodos as fetchTodos
} from 'api/invoicing.api';
import {
  InvoiceActionType,
  InvoicingEstimatesActionType,
  InvoicingListActionType,
  InvoicingPurchaseOrdersActionType,
  InvoicingTodosActionType
} from '../../actions/invoicing/invoicing.types';
import { createApiAction } from 'actions/action.utils';


export const loadingTodos = () => {
  return {
    'type': InvoicingTodosActionType.GET
  };
};

export const getTodos = () => {
  return async (dispatch: any) => {
    const todos: any = await fetchTodos();
    dispatch(setTodos(todos));
  };
};

export const setTodos = (managers: any) => {
  return {
    'type': InvoicingTodosActionType.SET,
    'payload': managers
  };
};

export const loadingInvoicingList = () => {
  return {
    'type': InvoicingListActionType.GET
  };
};

export const getInvoicingList = () => {
  return async (dispatch: any) => {
    const invoicingList: any = await fetchInvoicingList();
    dispatch(setInvoicingList(invoicingList));
  };
};

export const setInvoicingList = (invoicingList: any) => {
  return {
    'type': InvoicingListActionType.SET,
    'payload': invoicingList
  };
};

export const loadingPurchaseOrder = () => {
  return {
    'type': InvoicingPurchaseOrdersActionType.GET
  };
};

export const getPurchaseOrder = () => {
  return async (dispatch: any) => {
    const purchaseOrder: any = await fetchPurchaseOrder();
    dispatch(setPurchaseOrder(purchaseOrder));
  };
};

export const setPurchaseOrder = (purchaseOrder: any) => {
  return {
    'type': InvoicingPurchaseOrdersActionType.SET,
    'payload': purchaseOrder
  };
};

export const loadingInvoicingEstimates = () => {
  return {
    'type': InvoicingEstimatesActionType.GET
  };
};

export const getInvoicingEstimates = () => {
  return async (dispatch: any) => {
    const invoicingEstimates: any = await fetchInvoicingEstimates();
    dispatch(setInvoicingEstimates(invoicingEstimates));
  };
};

export const setInvoicingEstimates = (managers: any) => {
  return {
    'type': InvoicingEstimatesActionType.SET,
    'payload': managers
  };
};

export const updateInvoiceEmailHistory = (payload:any) => {
  return {
    payload,
    'type': InvoiceActionType.UPDATE_EMAIL_HISTORY
  };
};


export const loadInvoiceDetail = createApiAction(InvoiceActionType.LOAD_INVOICE_DETAIL);


export const setInvoicesLoading = (isLoading: any) => {
  return {
    'payload': isLoading,
    'type': InvoicingListActionType.SET_INVOICES_LOADING
  };
};

export const setInvoices = (invoices: any) => {
  return {
    'payload': invoices,
    'type': InvoicingListActionType.SET_INVOICES
  };
};
export const setUnsyncedInvoices = (invoices: any) => {
  return {
    'payload': invoices,
    'type': InvoicingListActionType.SET_UNSYNCED_INVOICES
  };
};
export const setUnsyncedInvoicesCount = (count: any) => {
  return {
    'payload': count,
    'type': InvoicingListActionType.SET_UNSYNCED_INVOICES_COUNT
  };
};
export const updateSyncedInvoices = (invoices: any[]) => {
  return {
    'payload': invoices,
    'type': InvoicingListActionType.UPDATE_SYNCED_INVOICES
  };
};
export const setPreviousInvoicesCursor = (prevCursor: string) => {
  return {
    'payload': prevCursor,
    'type': InvoicingListActionType.SET_PREVIOUS_INVOICES_CURSOR
  };
};
export const setNextInvoicesCursor = (nextCursor: string) => {
  return {
    'payload': nextCursor,
    'type': InvoicingListActionType.SET_NEXT_INVOICES_CURSOR
  };
};
export const setInvoicesTotal = (total: number) => {
  return {
    'payload': total,
    'type': InvoicingListActionType.SET_INVOICES_TOTAL
  };
};
export const setCurrentPageIndex = (currentPageIndex: number) => {
  return {
    'payload': currentPageIndex,
    'type': InvoicingListActionType.SET_CURRENT_INVOICES_PAGE_INDEX
  };
};
export const setCurrentPageSize = (currentPageSize: number) => {
  return {
    'payload': currentPageSize,
    'type': InvoicingListActionType.SET_CURRENT_INVOICES_PAGE_SIZE
  };
};
export const setKeyword = (keyword: string) => {
  return {
    'payload': keyword,
    'type': InvoicingListActionType.SET_INVOICES_SEARCH_KEYWORD
  };
};

export const setDraftInvoicesLoading = (isLoading: any) => {
  return {
    'payload': isLoading,
    'type': InvoicingListActionType.SET_DRAFT_INVOICES_LOADING
  };
};

export const setDraftInvoices = (invoices: any) => {
  return {
    'payload': invoices,
    'type': InvoicingListActionType.SET_DRAFT_INVOICES
  };
};
export const setPreviousDraftInvoicesCursor = (prevCursor: string) => {
  return {
    'payload': prevCursor,
    'type': InvoicingListActionType.SET_PREVIOUS_DRAFT_INVOICES_CURSOR
  };
};
export const setNextDraftInvoicesCursor = (nextCursor: string) => {
  return {
    'payload': nextCursor,
    'type': InvoicingListActionType.SET_NEXT_DRAFT_INVOICES_CURSOR
  };
};
export const setDraftInvoicesTotal = (total: number) => {
  return {
    'payload': total,
    'type': InvoicingListActionType.SET_DRAFT_INVOICES_TOTAL
  };
};
export const setCurrentDraftPageIndex = (currentPageIndex: number) => {
  return {
    'payload': currentPageIndex,
    'type': InvoicingListActionType.SET_CURRENT_DRAFT_INVOICES_PAGE_INDEX
  };
};
export const setCurrentDraftPageSize = (currentPageSize: number) => {
  return {
    'payload': currentPageSize,
    'type': InvoicingListActionType.SET_CURRENT_DRAFT_INVOICES_PAGE_SIZE
  };
};
export const setDraftKeyword = (keyword: string) => {
  return {
    'payload': keyword,
    'type': InvoicingListActionType.SET_DRAFT_INVOICES_SEARCH_KEYWORD
  };
};

export const setUnpaidInvoices = (invoices: any[], prevCursor: string, nextCursor: string, total: number) => {
  return {
    'payload': {
      invoices,
      prevCursor,
      nextCursor,
      total,
    },
    'type': InvoicingListActionType.SET_UNPAID_INVOICES
  };
};
export const setUnpaidInvoicesLoading = (isLoading: any) => {
  return {
    'payload': isLoading,
    'type': InvoicingListActionType.SET_UNPAID_INVOICES_LOADING
  };
};
export const setCurrentUnpaidPageIndex = (currentPageIndex: number) => {
  return {
    'payload': currentPageIndex,
    'type': InvoicingListActionType.SET_CURRENT_UNPAID_INVOICES_PAGE_INDEX
  };
};
export const setCurrentUnpaidPageSize = (currentPageSize: number) => {
  return {
    'payload': currentPageSize,
    'type': InvoicingListActionType.SET_CURRENT_UNPAID_INVOICES_PAGE_SIZE
  };
};
export const setUnpaidKeyword = (keyword: string) => {
  return {
    'payload': keyword,
    'type': InvoicingListActionType.SET_UNPAID_INVOICES_SEARCH_KEYWORD
  };
};
