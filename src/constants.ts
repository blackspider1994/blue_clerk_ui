export const PRIMARY_BLUE = '#00aaff';
export const PRIMARY_DARK = '#000';
export const PRIMARY_RED = '#c00707';
export const PRIMARY_WHITE = '#fff';
export const PRIMARY_GRAY = '#ebebeb';
export const LIGHT_GREY = '#BDBDBD';
export const LIGHT_BLUE = '#F9FDFF';
export const SECONDARY_GREY = '#c4c4c4';
export const PRIMARY_DARK_GREY = 'rgba(0, 0, 0, 0.5)';
export const SECONDARY_DARK_GREY = 'rgba(0, 0, 0, 0.25)';
export const PRIMARY_ORANGE = '#FE5500';
export const PRIMARY_YELLOW = '#FEBF00';
export const ASH = '#EAECF3';
export const DARK_ASH = '#D0D3DC';
export const GRAY1 = '#333333';
export const GRAY2 = '#4F4F4F';
export const GRAY3 = '#828282';
export const GRAY4 = '#BDBDBD';
export const GRAY5 = '#E0E0E0';
export const GRAY6 = '#F2F2F2';
// AM/PM feature colors
export const AM_COLOR = '#fba306';
export const PM_COLOR = '#0d5892';
// Home owner colors
export const OCCUPIED_ORANGE = '#db4b02';
export const OCCUPIED_GREEN = '#44d62c';
export const NON_OCCUPIED_GREY = '#c0c0c0';

// export const PRIMARY_GREEN = 'rgb(77, 189, 116)';
export const PRIMARY_GREEN = '#50AE55';
export const PRIMARY_CARD_BLUE = '#66B8F9';
export const ERROR_RED = '#FF0000';

export const ADMIN_SIDEBAR_WIDTH = 240;
export const ADMIN_SIDEBAR_WIDTH_MINI = 76;
export const ADMIN_HEADER_HEIGHT = 58;
export const ADMIN_SIDEBAR_BG = '#D0D3DC';
export const ADMIN_SIDEBAR_TOGGLE_BG = '#f2f2f2';
export const ADMIN_MAP_SIDEBAR_WIDTH = 290;

export const SECONDARY_CARD_BLUE = '#3582BE';
export const PRIMARY_CARD_PURPLE = '#6846D3';
export const SIDEBAR_WIDTH = '233';

export const INVOICE_TOP = '#EAECF3';
export const INVOICE_BORDER = '#BDBDBD';
export const INVOICE_TOTAL_CONTAINER = '#D0D3DC';
export const INVOICE_HEADING = '#4F4F4F';
export const INVOICE_TABLE_HEADING = '#828282';
export const MENU_TEXT_COLOR = '#828282';

export const TABLE_HOVER = 'rgba(0,170,255,0.34)';
export const TABLE_ACTION_BUTTON = '#00AAFF';
export const TABLE_ACTION_BUTTON_HOVER = '#45bfff';

export const CALENDAR_BUTTON_COLOR = '#828282';

export const BUTTON_PURPLE = '#A107FF';
export const BUTTON_PURPLE_HOVER = '#6C02AD';

export const PRIMARY_GREY = '#e5e5e5';
export const LABEL_GREY = '#828282';
export const TEXT_GREY = '#333333';

export const modalTypes = {
  'ADD_VENDOR_MODAL': 'add-vendor-modal',
  'CREATE_JOB_MODAL': 'create-job',
  'CREATE_TICKET_MODAL': 'create-ticket-modal',
  'EDIT_JOB_MODAL': 'edit-job-modal',
  'VIEW_JOB_MODAL': 'view-job-modal',
  'VIEW_JOB_REQUEST_MODAL': 'view-job-request-modal',
  'REJECT_JOB_REQUEST_MODAL': 'reject-job-request-modal',
  'CANCEL_JOB_MODAL': 'cancel-job-modal',
  'MARK_COMPLETE_JOB_MODAL': 'mark-complete-job-modal',
  'EDIT_TICKET_MODAL': 'edit-ticket-modal',
  'CANCEL_SERVICE_TICKET_MODAL': 'cancel-service-ticket-modal',
  'EDIT_SERVICE_TICKET_CONFIRMATION_MODAL': 'edit-service-ticket-confirmation-modal',
  'VIEW_SERVICE_TICKET_MODAL': 'view-service-ticket-modal',
  'TERMS_AND_CONDITION_MODAL': 'terms-and-condition',
  'ADD_BRAND': 'add-brand',
  'ADD_JOB_TYPE': 'add-job-type',
  'ADD_EQIPMENT_TYPE': 'add-equipment-type',
  'ADD_JOB_SITE': 'add-job-site',
  'EDIT_CUSTOMER_INFO': 'edit-customer-info',
  'ADD_JOB_LOCATION': 'add-job-location',
  'ACTIVATE_JOB_LOCATION': 'activate-job-location',
  'ACTIVATE_JOB_SITE': 'activate-job-site',
  'SHOW_MAP_FILTER_POPUP': 'show-map-filter-popup',
  'JOB_REPORTS_MODAL': 'job-reports-modal',
  'ADD_BILLING_MODAL': 'add-billing-modal',
  'QUICKBOOKS_LOGIN_MODAL': 'quickbook-login-modal',
  'QUICKBOOKS_DISCONNECT_MODAL': 'quickbook-disconnect-modal',
  'ADD_CONTACT_MODAL': 'add-contact-modal',
  'DELETE_CONTACT_MODAL': 'delete-contact-modal',
  'EDIT_PROFILE': 'edit-profile-modal',
  'DELETE_BILLING_MODAL': 'delete-billing-modal',
  'MAKE_ADMIN_EMPLOYEE_MODAL': 'make-admin-employee-modal',
  'CONFIRM_VOID_INVOICE_MODAL': 'confirm-void-invoice-modal',
  'CONFIRM_EDIT_PAID_INVOICE_MODAL': 'confirm-edit-paid-invoice-modal',
  'CONFIRM_EDIT_PAYMENT_MODAL': 'confirm-edit-payment-modal',
  'SAVE_INVOICE_AND_EMAIL_JOB_REPORT_MODAL': 'save-invoice-and-email-job-report-modal',
  'EMAIL_JOB_REPORT_MODAL': 'email-job-report-modal',
  'EMAIL_JOB_REPORT_MODAL_OLD': 'email-job-report-modal-old',
  'CONTRACT_VIEW_MODAL': 'contract-view-modal',
  'SHARED_FORM_MODAL': 'shared-form-modal',
  'EDIT_ITEM_MODAL': 'edit-item-modal',
  'ADD_ITEM_MODAL': 'add-item-modal',
  'EDIT_DISCOUNT_MODAL': 'edit-discount-modal',
  'ADD_DISCOUNT_MODAL': 'add-discount-modal',
  'SALES_TAX_MODAL': 'sales-tax-modal',
  'EDIT_INVOICE_NUMBER_MODAL': 'edit-invoice-number-modal',
  'PAYMENT_TERMS_MODAL': 'payment-terms-modal',
  'UPDATE_PAYMENT_TERMS_MODAL': 'update-payment-terms-modal',
  'PAYMENT_RECORD_MODAL': 'payment_record_modal',
  'PAYMENT_HISTORY_MODAL': 'payment_history_modal',
  'SEND_INVOICES_MODAL': 'send_invoices_modal',
  'BULK_PAYMENT_HISTORY_MODAL': 'bulk_payment_history_modal',
  'BULK_PAYMENT_MODAL': 'bulk_payment_modal',
  'EDIT_BULK_PAYMENT_MODAL': 'edit_bulk_payment_modal',
  'EDIT_TIERS_MODAL': 'edit-tiers-modal',
  'RESCEDULE_JOB_MODAL': 'reschedule_job_modal',
  'EDIT_COMMISSION_MODAL': 'edit_commission_modal',
  'VIEW_COMMISSION_HISTORY_MODAL': 'view_commission_history_modal',
  'PAYROLL_RECORD_PAYMENT_MODAL': 'payroll_record_payment_modal',
  'PAYROLL_DETAIL_PAYMENT_MODAL': 'payroll_detail_payment_modal',
  'COMPANY_LOCATION_MODAL': 'company_location_modal',
  'WARNING_MODAL': 'warning_modal',
  'CUSTOMIZE_REVENUE_REPORT_MODAL': 'customize-revenue-report-modal',
  'MEMORIZE_REPORT_MODAL': 'memorize-report-modal',
  'MANUAL_SYNC_MODAL_INVOICES': 'manual_sync_modal_invoices',
  'MANUAL_SYNC_MODAL_PAYMENTS': 'manual_sync_modal_payments',
  'RECORD_SYNC_STATUS_MODAL' : 'record_sync_status_modal',
  'ADVANCE_FILTER_INVOICE_MODAL' : 'ADVANCE_FILTER_INVOICE_MODAL',
  'CUSTOMIZE_AR_REPORT_MODAL' : 'CUSTOMIZE_AR_REPORT_MODAL',
  'EMAIL_REPORT_MODAL': 'EMAIL_REPORT_MODAL',
  'LOCATION_ASSIGN_MODAL': 'location-assign-modal',
  'LOCATION_ASSIGN_DELETE_MODAL': 'location-assign-delete-modal',
  'SET_DISPLAY_NAME_MODAL': 'set-display-name-modal',
  'EDIT_BILLING_ADDRESS': 'edit-billing-address',
  'DIVISION_CONFIRM_MODAL': 'division-confirm-modal',
  'DIVISION_WARNING_MODAL': 'division-warning-modal',
  'SELECT_DIVISION_MODAL': 'select-division-modal',
  'BILLING_ADDRESS_WARNING_MODAL': 'billing-address-warning-modal',
  'EDIT_JOB_COSTING_MODAL': 'edit-job-costing-modal',
};

export const rejectionReason = [
  {
    value: 'not-enough-time',
    label: 'Not enough time',
  },
  {
    value: 'out-of-scope',
    label: 'Out of scope',
  },
  {
    value: 'other',
    label: 'Other',
  },
]
