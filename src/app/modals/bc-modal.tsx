import BCAddVendorModal from './bc-add-vendor-modal/bc-add-vendor-modal';
import BCJobModal from './bc-job-modal/bc-job-modal';
import BCDeleteJobModal from './bc-job-modal/bc-delete-job-modal';
import BCModalTransition from './bc-modal-transition';
import BCServiceTicketModal from './bc-service-ticket-modal/bc-service-ticket-modal';
import BCCancelTicketModal from './bc-service-ticket-modal/bc-cancel-ticket-modal';
import BCAddBrandsModal from './bc-add-brands-modal/bc-add-brands-modal';
import BCAddContactModal from './bc-add-contact-modal/bc-add-contact-modal';
import BCDeleteContactModal from './bc-add-contact-modal/bc-delete-contact-modal';
import BCEditProfileModal from './bc-edit-profile-modal/bc-edit-profile-modal';
import BCAddJobTypeModal from './bc-add-job-type-modal/bc-add-job-type-modal';
import BCAddEquipmentTypeModal from './bc-add-equipment-type-modal/bc-add-equipment-type-modal';
import BCAddJobSiteModal from './bc-add-jobsite-modal/bc-add-jobsite-modal';
import BCAddJobLocationModal from './bc-add-job-location-modal/bc-add-job-location-modal';
import BCMapFilterModal from './bc-map-filter/bc-map-filter-popup';
import BCEditCutomerInfoModal from './bc-customer-info-modal/bc-customer-info-modal';
import BCAddBillingModal from './bc-add-billing-modal/bc-add-billing-modal';
import BCDeleteBillingConfirmModal from './bc-delete-billing-modal/bc-delete-billing-confirm';
import BCMakeAdminConfirmModal from './bc-make-admin-employee-modal/bc-make-admin-employee-confirm';
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
import EmailModal from './bc-email-modal/bc-email-modal';
import EmailModalOld from './bc-email-modal/bc-email-modal_old';
import BCViewServiceTicketModal from './bc-service-ticket-modal/bc-service-ticket-view-modal';
import BCContractViewModal from './bc-contract-modal/bc-contract-modal';
import BCSharedFormModal from './bc-shared-form-modal/bc-shared-form-modal';
import BCInvoiceEditModal from './bc-invoice-item-modal/bc-invoice-item-modal';
import BCSalesTaxModal from './bc-sales-tax-modal/bc-sales-tax-modal';
import BcPaymentTermsModal from './bc-payment-terms-modal/bc-payment-terms-modal';
import BcPaymentRecordModal from "./bc-payment-record-modal/bc-payment-record-modal";
import BCEditTiersModal from './bc-edit-tiers-modal/bc-edit-tiers.modal';
import BcUpdatePaymentTermsModal from "./bc-update-payment-terms-modal/bc-update-payment-terms-modal";
import BCQbDisconnectModal from "./bc-integration-modal/bc-disconnect-modal";
const BCTermsContent = React.lazy(() => import('../components/bc-terms-content/bc-terms-content'));

interface BCModal { }

interface RootState {
  modal: {
    open: boolean;
    data: any;
    type: string;
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

  useEffect(() => {
    switch (type) {
      case modalTypes.TERMS_AND_CONDITION_MODAL:
        setComponent(<BCTermsContent />);
        break;
      case modalTypes.CREATE_TICKET_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'md'
        });
        setComponent(<BCServiceTicketModal error={data.error} />);
        break;
      case modalTypes.EDIT_TICKET_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': data.detail ? 'lg' : 'md'
        });
        setComponent(<BCServiceTicketModal
          detail={data.detail}
          onSubmit={data.onSubmit}
          ticket={data.ticketData}
        />);
        break;
      case modalTypes.VIEW_SERVICE_TICKET_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'lg'
        });
        setComponent(<BCViewServiceTicketModal
          notificationId={data.notificationId}
          ticketId={data.ticketId}
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
          'fullWidth': true,
          'maxWidth': 'lg'
        });
        setComponent(<BCJobModal />);
        break;
      case modalTypes.EDIT_JOB_MODAL:
        setModalOptions({
          'disableBackdropClick': true,
          'disableEscapeKeyDown': true,
          'fullWidth': true,
          'maxWidth': 'lg'
        });
        setComponent(<BCJobModal
          detail={data.detail}
          job={data.job}
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
          'maxWidth': 'md'
        });
        setComponent(<BCAddContactModal props={data.data} />);
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
        setComponent(<BCAddJobTypeModal />);
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
          'maxWidth': 'md'
        });
        setComponent(<BCAddJobSiteModal jobSiteInfo={data.jobSiteInfo} />);
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
          'maxWidth': 'xs'
        });
        setComponent(<BCInvoiceEditModal
          item={data.item}
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
        />);
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


      default:
        setComponent(null);
    }
  }, [type]);

  const handleClose = () => {
    dispatch(closeModalAction());
    setTimeout(() => {
      dispatch(setModalDataAction({
        'data': {},
        'type': ''
      }));
    }, 200);
  };


  return (
    <div className={'modal-wrapper'}>
      <Dialog
        aria-labelledby={'responsive-dialog-title'}
        disableBackdropClick={modalOptions.disableBackdropClick}
        disableEscapeKeyDown={modalOptions.disableEscapeKeyDown}
        fullWidth={modalOptions.fullWidth}
        maxWidth={modalOptions.maxWidth}
        onClose={handleClose}
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
          ? <DialogTitle disableTypography>
            <Typography
              className={data.className ? data.className : ''}
              variant={'h6'}>
              <strong>
                {data.modalTitle}
              </strong>
            </Typography>
            <IconButton
              aria-label={'close'}
              onClick={handleClose}
              style={{
                'position': 'absolute',
                'right': 1,
                'top': 1
              }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          : null}
        {component ? component : null}
      </Dialog>
    </div>
  );
}

export default BCModal;
