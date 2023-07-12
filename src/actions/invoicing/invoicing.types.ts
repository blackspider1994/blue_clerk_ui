export interface InvoicingState {
    readonly loading: boolean
    readonly loadingDraft: boolean
    readonly data?: any
    readonly draft?: any
    readonly error?: string
    prevCursor: string;
    nextCursor: string;
    total: number;
    currentPageIndex: number;
    currentPageSize: number;
    keyword: string;
    prevCursorDraft: string;
    nextCursorDraft: string;
    totalDraft: number;
    currentPageIndexDraft: number;
    currentPageSizeDraft: number;
    keywordDraft: string;
    unpaid: any[],
    totalUnpaid: number,
    currentPageIndexUnpaid: number,
    currentPageSizeUnpaid: number,
    prevCursorUnpaid: string,
    nextCursorUnpaid: string,
    keywordUnpaid: string,
    loadingUnpaid: boolean,
    unSyncedInvoices: any[];
    unSyncedInvoicesCount: number;
}

export enum InvoicingTodosActionType {
    GET = 'getTodos',
    SET = 'setTodos',
    SUCCESS = 'getTodosSuccess',
    FAILED = 'getTodosFailed',
}

export enum InvoicingListActionType {
    GET = 'getInvoicingList',
    SET = 'setInvoicingList',
    SUCCESS = 'getInvoicingListSuccess',
    FAILED = 'getInvoicingListFailed',
    SET_INVOICES_LOADING = 'SET_INVOICES_LOADING',
    SET_INVOICES = 'SET_INVOICES',
    SET_UNSYNCED_INVOICES = 'SET_UNSYNCED_INVOICES',
    SET_UNSYNCED_INVOICES_COUNT = 'SET_UNSYNCED_INVOICES_COUNT',
    UPDATE_SYNCED_INVOICES = 'UPDATE_SYNCED_INVOICES',
    SET_PREVIOUS_INVOICES_CURSOR = 'SET_PREVIOUS_INVOICES_CURSOR',
    SET_NEXT_INVOICES_CURSOR = 'SET_NEXT_INVOICES_CURSOR',
    SET_INVOICES_TOTAL = 'SET_INVOICES_TOTAL',
    SET_CURRENT_INVOICES_PAGE_INDEX = 'SET_CURRENT_INVOICES_PAGE_INDEX',
    SET_CURRENT_INVOICES_PAGE_SIZE = 'SET_CURRENT_INVOICES_PAGE_SIZE',
    SET_INVOICES_SEARCH_KEYWORD = 'SET_INVOICES_SEARCH_KEYWORD',
    SET_DRAFT_INVOICES_LOADING = 'SET_DRAFT_INVOICES_LOADING',
    SET_DRAFT_INVOICES = 'SET_DRAFT_INVOICES',
    SET_PREVIOUS_DRAFT_INVOICES_CURSOR = 'SET_PREVIOUS_DRAFT_INVOICES_CURSOR',
    SET_NEXT_DRAFT_INVOICES_CURSOR = 'SET_NEXT_DRAFT_INVOICES_CURSOR',
    SET_DRAFT_INVOICES_TOTAL = 'SET_DRAFT_INVOICES_TOTAL',
    SET_CURRENT_DRAFT_INVOICES_PAGE_INDEX = 'SET_CURRENT_DRAFT_INVOICES_PAGE_INDEX',
    SET_CURRENT_DRAFT_INVOICES_PAGE_SIZE = 'SET_CURRENT_DRAFT_INVOICES_PAGE_SIZE',
    SET_DRAFT_INVOICES_SEARCH_KEYWORD = 'SET_DRAFT_INVOICES_SEARCH_KEYWORD',
    SET_UNPAID_INVOICES = 'SET_UNPAID_INVOICES',
    SET_UNPAID_INVOICES_LOADING = 'SET_UNPAID_INVOICES_LOADING',
    SET_CURRENT_UNPAID_INVOICES_PAGE_INDEX = 'SET_CURRENT_UNPAID_INVOICES_PAGE_INDEX',
    SET_CURRENT_UNPAID_INVOICES_PAGE_SIZE = 'SET_CURRENT_UNPAID_INVOICES_PAGE_SIZE',
    SET_UNPAID_INVOICES_SEARCH_KEYWORD = 'SET_UNPAID_INVOICES_SEARCH_KEYWORD',
}

export enum InvoicingPurchaseOrdersActionType {
    GET = 'getPurchaseOrders',
    SET = 'setPurchaseOrders',
    SUCCESS = 'getPurchaseOrdersSuccess',
    FAILED = 'getPurchaseOrdersFailed',
}

export enum InvoicingEstimatesActionType {
    GET = 'getEstimates',
    SET = 'setEstimates',
    SUCCESS = 'getEstimatesSuccess',
    FAILED = 'getEstimatesFailed',
}

export enum InvoiceActionType{
    LOAD_INVOICE_DETAIL = 'LOAD_INVOICE_DETAIL',
    UPDATE_EMAIL_HISTORY = 'UPDATE_EMAIL_HISTORY'
}
