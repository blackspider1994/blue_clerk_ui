export interface AdvanceFilterInvoiceState {
    checkDateOrRange: boolean;
    dateRangeType: number;
    invoiceDate: any;
    invoiceDateRange: any;
    checkInvoiceId: boolean;
    invoiceId: string;
    checkJobId: boolean;
    jobId: string;
    checkPoNumber: boolean;
    checkMissingPo: boolean;
    poNumber: string;
    checkPaymentStatus: boolean;
    selectedPaymentStatus: string;
    checkCustomer: boolean;
    selectedCustomer: {value:any; label:any} | null;
    checkContact: boolean;
    selectedContact: {value:any; label:any} | null;
    checkTechnician: boolean;
    selectedTechnician: {value:any; label:any} | null;
    checkLastEmailSentDateRange: boolean;
    lastEmailSentDateRange: any;
    checkAmountRange: boolean;
    amountRangeFrom: string;
    amountRangeTo: string;
    checkSubdivision: boolean;
    selectedSubdivision: {value:any; label:any} | null;
    checkJobAddress: boolean;
    jobAddressStreet: string;
    jobAddressCity: string;
    selectedJobAddressState: string;
    jobAddressZip: string;
    checkBouncedEmails: boolean
}

export enum AdvanceFilterInvoiceActionType {
    RESET = 'resetAdvanceFilterInvoice',
    APPLY = 'applyAdvanceFilterInvoice',
}
