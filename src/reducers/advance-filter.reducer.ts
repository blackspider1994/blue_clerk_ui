import {
  AdvanceFilterInvoiceState,
  AdvanceFilterInvoiceActionType
} from 'actions/advance-filter/advance-filter.types';
import { Reducer } from 'redux';

export const initialAdvanceFilterInvoiceState: AdvanceFilterInvoiceState = {
  checkDateOrRange: false,
  dateRangeType: 0,
  invoiceDate: null,
  invoiceDateRange: null,
  checkInvoiceId: false,
  invoiceId: '',
  checkJobId: false,
  jobId: '',
  checkPoNumber: false,
  checkMissingPo: false,
  poNumber: '',
  checkPaymentStatus: false,
  selectedPaymentStatus: '',
  checkCustomer: false,
  selectedCustomer: null,
  checkTechnician: false,
  selectedTechnician: null,
  checkContact: false,
  selectedContact: null,
  checkLastEmailSentDateRange: false,
  lastEmailSentDateRange: null,
  checkAmountRange: false,
  amountRangeFrom: '',
  amountRangeTo: '',
  checkSubdivision: false,
  selectedSubdivision: null,
  checkJobAddress: false,
  jobAddressStreet: '',
  jobAddressCity: '',
  selectedJobAddressState: '',
  jobAddressZip: '',
  checkBouncedEmails: false
};

export const AdvanceFilterInvoiceReducer: Reducer<any> = (state = initialAdvanceFilterInvoiceState, action) => {
  switch (action.type) {
    case AdvanceFilterInvoiceActionType.RESET:
      return {
        ...initialAdvanceFilterInvoiceState
      };
    case AdvanceFilterInvoiceActionType.APPLY:
      return {
        ...action.payload
      };
  }
  return state;
};


