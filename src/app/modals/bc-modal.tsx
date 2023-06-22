import BCAddVendorModal from './bc-add-vendor-modal/bc-add-vendor-modal';
import BCJobModal from './bc-job-modal/bc-job-modal';
import BCViewJobModal from './bc-job-modal/bc-view-job-modal';
import BCViewJobRequestModal from './bc-job-request-modal/bc-view-job-request-modal';
import BCCancelJobRequestModal from './bc-job-request-modal/bc-cancel-job-request-modal';
import BCDeleteJobModal from './bc-job-modal/bc-delete-job-modal';
import BCMarkCompleteJobModal from './bc-job-modal/bc-mark-complete-job-modal';
import BCModalTransition from './bc-modal-transition';
import BCServiceTicketModal from './bc-service-ticket-modal/bc-service-ticket-modal';
import BCCancelTicketModal from './bc-service-ticket-modal/bc-cancel-ticket-modal';
import BCEditTicketConfirmationModal from './bc-service-ticket-modal/bc-edit-ticket-confirmation-modal';
import BCAddBrandsModal from './bc-add-brands-modal/bc-add-brands-modal';
import BCAddContactModal from './bc-add-contact-modal/bc-add-contact-modal';
import BCDeleteContactModal from './bc-add-contact-modal/bc-delete-contact-modal';
import BCEditProfileModal from './bc-edit-profile-modal/bc-edit-profile-modal';
import BCAddJobTypeModal from './bc-add-job-type-modal/bc-add-job-type-modal';
import BCAddEquipmentTypeModal from './bc-add-equipment-type-modal/bc-add-equipment-type-modal';
import BCAddJobSiteModal from './bc-add-jobsite-modal/bc-add-jobsite-modal';
import BCAddJobLocationModal from './bc-add-job-location-modal/bc-add-job-location-modal';
import BCActivateJobLocationModal from './bc-activate-job-location-modal/bc-activate-job-location-modal';
import BCActivateJobSiteModal from './bc-activate-job-site-modal/bc-activate-job-site-modal';
import BCMapFilterModal from './bc-map-filter/bc-map-filter-popup';
import BCEditCutomerInfoModal from './bc-customer-info-modal/bc-customer-info-modal';
import BCAddBillingModal from './bc-add-billing-modal/bc-add-billing-modal';
import BCDeleteBillingConfirmModal from './bc-delete-billing-modal/bc-delete-billing-confirm';
import BCVoidInvoiceConfirmModal from './bc-void-invoice-confirm-modal/bc-void-invoice-confirm-modal';
import BcManualSyncModalInvoice from './bc-manual-sync-modal/bc-manual-sync-invoices';
import BcManualSyncModalPayments from './bc-manual-sync-modal/bc-manual-sync-payments';
import BCEditPaidInvoiceConfirmModal from './bc-edit-paid-invoice-confirm-modal/bc-edit-paid-invoice-confirm-modal';
import BCEditPaymentConfirmModal from './bc-edit-payment-confirm-modal/bc-edit-payment-confirm-modal';
import BCMakeAdminConfirmModal from './bc-make-admin-employee-modal/bc-make-admin-employee-confirm';
import EmailReportModal from './bc-email-modal/bc-email-report-modal';
import CompanyLocationAssignModal from './bc-company-location-assign-modal/bc-company-location-assign-modal';
import CompanyLocationBillingAddressModal from './bc-company-location-billing-address-modal/bc-company-location-billing-address-modal';
import CompanyLocationAssignDeleteModal from './bc-delete-company-location-assign-modal/bc-delete-company-location-assign-modal';
import CloseIcon from '@material-ui/icons/Close';
import {
  closeModalAction,
  setModalDataAction
} from 'actions/bc-modal/bc-modal.action';
import { modalTypes } from '../../constants';
import { Dialog, DialogTitle, IconButton, Typography } from '@material-ui/core';
import '../../scss/index.scss';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ViewJobReportsPage from '../../app/pages/customer/job-reports/view-job-report';
import SaveInvoiceAndEmailModal from './bc-save-invoice-and-email-modal/bc-save-invoice-and-email-modal';
import EmailModal from './bc-email-modal/bc-email-modal';
import EmailModalOld from './bc-email-modal/bc-email-modal_old';
import BCViewServiceTicketModal from './bc-service-ticket-modal/bc-service-ticket-view-modal';
import BCContractViewModal from './bc-contract-modal/bc-contract-modal';
import BCSharedFormModal from './bc-shared-form-modal/bc-shared-form-modal';
import BCInvoiceEditModal from './bc-invoice-item-modal/bc-invoice-item-modal';
import BCDiscountEditModal from './bc-discount-modal/bc-discount-modal';
import BCSalesTaxModal from './bc-sales-tax-modal/bc-sales-tax-modal';
import BcPaymentTermsModal from './bc-payment-terms-modal/bc-payment-terms-modal';
import BcPaymentRecordModal from "./bc-payment-record-modal/bc-payment-record-modal";
import BcPaymentHistoryModal from "./bc-payment-record-modal/bc-payment-history-modal";
import BCEditTiersModal from './bc-edit-tiers-modal/bc-edit-tiers.modal';
import BcUpdatePaymentTermsModal from "./bc-update-payment-terms-modal/bc-update-payment-terms-modal";
import BCQbDisconnectModal from "./bc-integration-modal/bc-disconnect-modal";
import BCRescheduleJobModal from "./bc-job-modal/bc-reschedule-job-modal";
import BcEditCommissionModal from "./bc-edit-commission-modal/bc-edit-commission-modal";
import BcViewCommissionHistoryModal from "./bc-edit-commission-modal/bc-view-commission-history-modal";
import BcPayrollPaymentRecordModal from "./bc-payroll-payment-modal/bc-payroll-payment-record-modal";
import BcPayrollPaymentDetailModal from "./bc-payroll-payment-modal/bc-payroll-payment-detail-modal";
import BCEditInvoiceNumber from './bc-edit-invoice-number/bc-edit-invoice-number';
import BcWarningModal from "./bc-warning-modal/bc-warning-modal";
import BCSendInvoicesModal from './bc-send-invoices-modal/bc-send-invoices-modal';
import BCBulkPaymentModal from './bc-bulk-payment-modal/bc-bulk-payment-modal';
import BCEditBulkPaymentModal from './bc-bulk-payment-modal/bc-edit-bulk-payment-modal';
import BcBulkPaymentHistoryModal from "./bc-bulk-payment-modal/bc-bulk-payment-history-modal";
import BCCompanyLocationModal from "./bc-company-location-modal/bc-company-location-modal";
import BCCustomizeRevenueReportModal from "./bc-customize-revenue-report-modal/bc-customize-revenue-report-modal";
import BCMemorizeReportModal from "./bc-memorize-report-modal/bc-memorize-report-modal";
import BcRecordSyncStatusModal from "./bc-record-sync-modal/bc-record-sync-modal";
import BCAdvanceFilterInvoiceModal from "./bc-advance-filter-invoice-modal/bc-advance-filter-invoice-modal";
import BcArReportModal from "./bc-ar-report-modal/bc-ar-report-modal";
import BCSetDisplayNameModal
  from "./bc-set-display-name-modal/bc-set-display-name-modal";
import BcDivisionConfirmModal from './bc-division-confirm-modal/bc-division-confirm-modal';
import BcDivisionWarningModal from './bc-division-warning-modal/bc-division-warning-modal';
import BcBillingAddressWarning from './bc-billing-address-warning-modal/bc-billing-address-warning';
import BcSelectDivisionModal from './bc-select-division-modal/bc-select-division-modal';
import BcAddTicketDetailsModal
  from "./bc-add-ticket-details-modal/bc-add-ticket-details-modal";

const BCTermsContent = React.lazy(() => import('../components/bc-terms-content/bc-terms-content'));

interface BCModal { }

interface RootState {
  modal: {
    open: boolean;
    data: any;
    type: string;
    // Flag to force refresh on modal
    refresh: boolean;
  };
}

function BCModal() {
  const [component, setComponent] = useState<any>(null);
  const [modalOptions, setModalOptions] = useState<any>({
    'fullWidth': true,
    'maxWidth': 'md' // Xs, sm, md, lg, xl
  });
  const dispatch = useDispatch();
  const open = useSelector(({ modal }: RootState) => modal.open);
  const data = useSelector(({ modal }: RootState) => modal.data);
  const type = useSelector(({ modal }: RootState) => modal.type);
  const refresh = useSelector(({ modal }: RootState) => modal.refresh);

  useEffect(() => {
    switch (type) {
      case modalTypes.TERMS_AND_CONDITION_MODAL:
        setComponent(<BCTermsContent />);
        break;
      case modalTypes.CREATE_TICKET_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'newDesign': true,
          'fullWidth': true,
          'maxWidth': 'lg'
        });
        setComponent(<BCServiceTicketModal error={data.error} />);
        break;
      case modalTypes.EDIT_TICKET_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'newDesign': true,
          'fullWidth': true,
          'maxWidth': 'lg'
        });
        setComponent(<BCServiceTicketModal
          detail={data.detail}
          onSubmit={data.onSubmit}
          ticket={data.ticketData}
          allowEditWithJob={data.allowEditWithJob}
          refreshTicketAfterEditing={data.refreshTicketAfterEditing}
        />);
        break;
      case modalTypes.VIEW_SERVICE_TICKET_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'newDesign': true,
          'fullWidth': true,
          'maxWidth': 'lg'
        });
        setComponent(<BCViewServiceTicketModal
          job={data.job}
        />);
        break;
      case modalTypes.CANCEL_SERVICE_TICKET_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BCCancelTicketModal props={data} />);
        break;
      case modalTypes.EDIT_SERVICE_TICKET_CONFIRMATION_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BCEditTicketConfirmationModal props={data} />);
        break;
      case modalTypes.QUICKBOOKS_DISCONNECT_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BCQbDisconnectModal props={data} />);
        break;
      case modalTypes.CREATE_JOB_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'newDesign': true,
          'fullWidth': true,
          'maxWidth': 'lg'
        });
        data.maxHeight='100%';
        setComponent(<BCJobModal />);
        break;
      case modalTypes.EDIT_JOB_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'newDesign': true,
          'fullWidth': true,
          'maxWidth': 'lg'
        });
        data.maxHeight='100%';
        setComponent(<BCJobModal
          detail={data.detail}
          job={data.job}
        />);
        break;
      case modalTypes.VIEW_JOB_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'newDesign': true,
          'fullWidth': true,
          'maxWidth': 'lg'
        });
        setComponent(<BCViewJobModal
          job={data.job}
          isTicket={data.isTicket}
        />);
        break;
      case modalTypes.VIEW_JOB_REQUEST_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'newDesign': true,
          'fullWidth': true,
          'maxWidth': 'lg'
        });
        setComponent(<BCViewJobRequestModal
          jobRequest={data.jobRequest}
        />);
        break;
      case modalTypes.REJECT_JOB_REQUEST_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'sm'
        });
        setComponent(<BCCancelJobRequestModal
          jobRequest={data.jobRequest}
        />);
        break;
      case modalTypes.CANCEL_JOB_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BCDeleteJobModal props={data} />);
        break;
      case modalTypes.MARK_COMPLETE_JOB_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BCMarkCompleteJobModal props={data} />);
        break;
      case modalTypes.RESCEDULE_JOB_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BCRescheduleJobModal props={data} />);
        break;
      case modalTypes.ADD_VENDOR_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BCAddVendorModal />);
        break;
      case modalTypes.ADD_BRAND:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BCAddBrandsModal />);
        break;
      case modalTypes.ADD_CONTACT_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'sm'
        });
        setComponent(<BCAddContactModal props={data.data} />);
        break;
      case modalTypes.CONFIRM_VOID_INVOICE_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BCVoidInvoiceConfirmModal data={data.data} />);
        break;
      case modalTypes.MANUAL_SYNC_MODAL_INVOICES:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'lg'
        });
        setComponent(<BcManualSyncModalInvoice data={data.data} />);
        break;
      case modalTypes.MANUAL_SYNC_MODAL_PAYMENTS:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'lg'
        });
        setComponent(<BcManualSyncModalPayments data={data.data} />);
        break;
      case modalTypes.CONFIRM_EDIT_PAID_INVOICE_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BCEditPaidInvoiceConfirmModal data={data.data} />);
        break;
      case modalTypes.CONFIRM_EDIT_PAYMENT_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BCEditPaymentConfirmModal data={data.modalDataForEditPayment} />);
        break;
      case modalTypes.DELETE_BILLING_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BCDeleteBillingConfirmModal data={data.data} />);
        break;
      case modalTypes.MAKE_ADMIN_EMPLOYEE_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BCMakeAdminConfirmModal data={data?.data} />);
        break;
      case modalTypes.DELETE_CONTACT_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BCDeleteContactModal props={data.data} />);
        break;
      case modalTypes.EDIT_PROFILE:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'md'
        });
        setComponent(<BCEditProfileModal props={data.props} />);
        break;
      case modalTypes.ADD_JOB_TYPE:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BCAddJobTypeModal jobType={data.jobType}/>);
        break;
      case modalTypes.ADD_EQIPMENT_TYPE:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BCAddEquipmentTypeModal />);
        break;
      case modalTypes.ADD_JOB_SITE:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'md',
        });
        setComponent(<BCAddJobSiteModal jobSiteInfo={data.jobSiteInfo} ticket={data.ticket}/>);
        break;
      case modalTypes.ACTIVATE_JOB_SITE:
          setModalOptions({
            'disableBackdropClick': true,
            'disableEscapeKeyDown': true,
            'fullWidth': true,
            'maxWidth': 'sm'
          });
          setComponent(<BCActivateJobSiteModal jobSiteInfo={data.siteObj} />);
          break;
      case modalTypes.EDIT_CUSTOMER_INFO:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'md'
        });
        setComponent(<BCEditCutomerInfoModal customerInfo={data.customerObj} />);
        break;
      case modalTypes.ADD_JOB_LOCATION:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'md'
        });
        setComponent(<BCAddJobLocationModal jobLocationInfo={data.locationObj} />);
        break;
      case modalTypes.ACTIVATE_JOB_LOCATION:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'sm'
        });
        setComponent(<BCActivateJobLocationModal jobLocationInfo={data.locationObj} />);
        break;
      case modalTypes.SHOW_MAP_FILTER_POPUP:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BCMapFilterModal />);
        break;
      case modalTypes.JOB_REPORTS_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<ViewJobReportsPage />);
        break;
      case modalTypes.SAVE_INVOICE_AND_EMAIL_JOB_REPORT_MODAL:
        setModalOptions({
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<SaveInvoiceAndEmailModal
          data = {data}
        />);
        break;
      case modalTypes.EMAIL_JOB_REPORT_MODAL:
        setModalOptions({
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'sm'
        });
        setComponent(<EmailModal
          data = {data}
        />);
        break;
      case modalTypes.EMAIL_JOB_REPORT_MODAL_OLD:
        setModalOptions({
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'sm'
        });
        setComponent(<EmailModalOld
          customer={data.customer}
          customerEmail={data.customerEmail}
          id={data.id}
          onClick={data.handleClick}
          typeText={data.typeText}
        />);
        break;
      case modalTypes.ADD_BILLING_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BCAddBillingModal error={data.error} />);
        break;

      case modalTypes.SHARED_FORM_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'lg'
        });
        setComponent(<BCSharedFormModal
          formData={data.formData}
          formId={data.formId}
          onClose={handleClose}
          onSubmit={data.handleSubmit}
        />);
        break;
      case modalTypes.CONTRACT_VIEW_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BCContractViewModal
          contractId={data.contractId}
          message={data.message}
          notificationId={data.notificationId}
          notificationType={data.notificationType}
        />);
        break;
      case modalTypes.EDIT_ITEM_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'sm'
        });
        setComponent(<BCInvoiceEditModal
          item={data.item}
        />);
        break;
      case modalTypes.ADD_ITEM_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'sm'
        });
        setComponent(<BCInvoiceEditModal
          item={data.item}
        />);
        break;
      case modalTypes.EDIT_DISCOUNT_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'sm'
        });
        setComponent(<BCDiscountEditModal
          item={data.discountItem}
        />);
        break;
      case modalTypes.ADD_DISCOUNT_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'sm'
        });
        setComponent(<BCDiscountEditModal
          item={data.discountItem}
        />);
        break;
      case modalTypes.SALES_TAX_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BCSalesTaxModal />);
        break;
      case modalTypes.EDIT_INVOICE_NUMBER_MODAL:
          setModalOptions({
            'disableBackdropClick': true,
            'disableEscapeKeyDown': true,
            'fullWidth': true,
            'maxWidth': 'sm'
          });
          setComponent(<BCEditInvoiceNumber />);
          break;
      case modalTypes.PAYMENT_TERMS_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BcPaymentTermsModal />);
        break;
      case modalTypes.PAYMENT_RECORD_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'md'
        });
        setComponent(<BcPaymentRecordModal
          invoice={data.invoice}
          payment={data.payment}
          fromHistory={!!data.fromHistory}
        />);
        break;
      case modalTypes.PAYMENT_HISTORY_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'md'
        });
        setComponent(<BcPaymentHistoryModal
          invoiceID={data.invoiceID}
        />);
        break;
      case modalTypes.BULK_PAYMENT_HISTORY_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'md'
        });
        setComponent(<BcBulkPaymentHistoryModal data={data.data} />);
        break;
      case modalTypes.SEND_INVOICES_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'lg'
        });
        setComponent(<BCSendInvoicesModal modalOptions={modalOptions} setModalOptions={setModalOptions} />);
        break;
      case modalTypes.BULK_PAYMENT_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'lg'
        });
        setComponent(<BCBulkPaymentModal modalOptions={modalOptions} setModalOptions={setModalOptions} />);
        break;
      case modalTypes.EDIT_BULK_PAYMENT_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'lg'
        });
        setComponent(<BCEditBulkPaymentModal payments={data.payments} modalOptions={modalOptions} setModalOptions={setModalOptions} />);
        break;
      case modalTypes.UPDATE_PAYMENT_TERMS_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BcUpdatePaymentTermsModal customerId={data.customerId}/>);
        break;
      case modalTypes.EDIT_TIERS_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xs'
        });
        setComponent(<BCEditTiersModal />);
        break;
      case modalTypes.EDIT_COMMISSION_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'sm'
        });
        setComponent(<BcEditCommissionModal
          vendorCommission={data.vendorCommission}
          // payment={data.payment}
          // fromHistory={!!data.fromHistory}
        />);
        break;
      case modalTypes.VIEW_COMMISSION_HISTORY_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'md'
        });
        setComponent(<BcViewCommissionHistoryModal vendorId={data.vendorId} handleGoingBack={data.handleGoingBack} />);
        break;
      case modalTypes.PAYROLL_RECORD_PAYMENT_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'md'
        });
        setComponent(<BcPayrollPaymentRecordModal
          payroll={data.payroll}
          payment={data.payment}
          advancePayment={data.advancePayment}
          dateRange={data.dateRange}
        />);
        break;
      case modalTypes.PAYROLL_DETAIL_PAYMENT_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'md'
        });
        data.maxHeight='100%';
        setComponent(<BcPayrollPaymentDetailModal
          payment={data.payment}
          dateRange={data.dateRange}
        />);
        break;
      case modalTypes.CUSTOMIZE_AR_REPORT_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'sm'
        });
        // data.maxHeight='100%';
        setComponent(<BcArReportModal
          asOfDate={data.asOf}
          selectedCustomers={data.customers}
        />);
        break;
      case modalTypes.COMPANY_LOCATION_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'md'
        });
        // data.maxHeight='100%';
        setComponent(<BCCompanyLocationModal
          companyLocation={data.companyLocation} companyLocationList={data.companyLocationList}
        />);
        break;
      case modalTypes.WARNING_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'sm'
        });
        setComponent(<BcWarningModal
          message={data.message}
          subMessage={data.subMessage}
          action={data.action}
          closeAction={data.closeAction}
        />);
        break;
      case modalTypes.CUSTOMIZE_REVENUE_REPORT_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'sm'
        });
        setComponent(<BCCustomizeRevenueReportModal />);
        break;
      case modalTypes.ADVANCE_FILTER_INVOICE_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'xl'
        });
        setComponent(<BCAdvanceFilterInvoiceModal handleFilterSubmit={data.handleFilterSubmit} formFilter={data.formFilter} loading={data.loading}/>);
        break;
      case modalTypes.MEMORIZE_REPORT_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'sm'
        });
        setComponent(<BCMemorizeReportModal data = {data.paramObject} memorizedReportId={data.memorizedReportId} />);
        break;
      case modalTypes.RECORD_SYNC_STATUS_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'sm'
        });
        setComponent(<BcRecordSyncStatusModal data={data} />);
        break;
      case modalTypes.EMAIL_REPORT_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'sm'
        });
        setComponent(<EmailReportModal reportData={data.reportData} reportName={data.reportName}/>);
        break;
      case modalTypes.LOCATION_ASSIGN_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'sm'
        });
        setComponent(<CompanyLocationAssignModal companyLocation={data.companyLocation} page={data.page} formMode={data.formMode} formData={data.formData} />);
        break;
      case modalTypes.LOCATION_ASSIGN_DELETE_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'sm'
        });
        setComponent(<CompanyLocationAssignDeleteModal companyLocation={data.companyLocation} assignee={data.assignee} page={data.page}/>);
        break;
      case modalTypes.SET_DISPLAY_NAME_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'sm'
        });
        setComponent(<BCSetDisplayNameModal props={data} />);
        break;
      case modalTypes.EDIT_BILLING_ADDRESS:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'md'
        });
        setComponent(<CompanyLocationBillingAddressModal companyLocation={data.companyLocation} />);
        break;
      case modalTypes.DIVISION_CONFIRM_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'sm'
        });
        setComponent(<BcDivisionConfirmModal
          message={data.message}
          action={data.action}
        />);
        break;
        case modalTypes.DIVISION_WARNING_MODAL:
          setModalOptions({
            'disableBackdropClick': true,
            'disableEscapeKeyDown': true,
            'fullWidth': true,
            'maxWidth': 'sm'
          });
          setComponent(<BcDivisionWarningModal
            action={data.action}
          />);
          break;
        case modalTypes.BILLING_ADDRESS_WARNING_MODAL:
          setModalOptions({
            'disableBackdropClick': true,
            'disableEscapeKeyDown': true,
            'fullWidth': true,
            'maxWidth': 'sm'
          });
          setComponent(<BcBillingAddressWarning
            action={data.action}
          />);
          break;
        case modalTypes.SELECT_DIVISION_MODAL:
          setModalOptions({
            'disableBackdropClick': true,
            'disableEscapeKeyDown': true,
            'fullWidth': true,
            'showCloseIcon': false,
            'maxWidth': 'sm'
          });
          setComponent(<BcSelectDivisionModal
            user={data.user}
          />);
          break;
      case modalTypes.TICKET_DETAILS_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'newDesign': true,
          'fullWidth': true,
          'maxWidth': 'lg'
        });
        setComponent(<BcAddTicketDetailsModal props={data}/>);
        break;
      default:
        setComponent(null);
    }
  }, [type, refresh]);

  const handleClose = () => {
    dispatch(closeModalAction());
    setTimeout(() => {
      dispatch(setModalDataAction({
        'data': {},
        'type': ''
      }));
    }, 200);
  };

  const showCloseIcon = type !== modalTypes.RECORD_SYNC_STATUS_MODAL;

  return (
    <div className={'modal-wrapper'}>
      <Dialog
        aria-labelledby={'responsive-dialog-title'}
        disableBackdropClick={modalOptions.disableBackdropClick}
        disableEscapeKeyDown={modalOptions.disableEscapeKeyDown}
        fullWidth={modalOptions.fullWidth}
        maxWidth={modalOptions.maxWidth}
        onClose={handleClose}
        // disableEnforceFocus
        open={open}
        PaperProps={{
          'style': {
            'maxHeight': `${data && data.maxHeight ? data.maxHeight : ''}`,
            'height': `${data && data.height ? data.height : ''}`
          }
        }}
        scroll={'paper'}
        TransitionComponent={BCModalTransition}>
        {data && data.modalTitle !== ''
          ? <DialogTitle className={`${modalOptions.newDesign ? 'new-modal-design' : ''}`} disableTypography>
            {data.modalTitle?.split('\n').map((title:string, titleIndex:number) => (
              <Typography
                key={titleIndex}
                className={data.className ? data.className : ''}
                variant={'h6'}>
                <strong>
                  {title}
                </strong>
              </Typography>
            ))}
            {showCloseIcon && <IconButton
              aria-label={'close'}
              onClick={handleClose}
              style={{
                'position': 'absolute',
                'right': 1,
                'top': 1
              }}>
              <CloseIcon/>
            </IconButton>
            }
          </DialogTitle>
          : <IconButton
            aria-label={'close'}
            onClick={handleClose}
            style={{
              'position': 'absolute',
              'right': 1,
              'top': 1
            }}>
            <CloseIcon />
          </IconButton>}
        {component ? component : null}
      </Dialog>
    </div>
  );
}

export default BCModal;
