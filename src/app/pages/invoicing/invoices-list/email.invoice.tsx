import React from 'react';

import { useDispatch } from 'react-redux';
import EmailButton from '../../../components/bc-email-button/bc-email-button';
import { sendEmailAction } from 'actions/email/email.action';
import {error as errorSnackBar} from "actions/snackbar/snackbar.action";
import { openModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { resetEmailState } from 'actions/email/email.action';
import { modalTypes } from '../../../../constants';
import {getInvoiceEmailTemplate} from "api/emailDefault.api";


interface EmailReportProps {
    invoice: any,
    Component: any,
    showLoader?: boolean,
    from?:string | null
}


export default function EmailInvoiceButton({ invoice, Component, showLoader = true, from=null }: EmailReportProps) {
  
  const { customer, _id, invoiceId } = invoice;
  const dispatch = useDispatch();
  let emailToSend: string;
  let customerName: string;
  if (typeof (from) === 'string' && from === 'view-invoice') {
    emailToSend = invoice?.customerContactId?.email || customer?.info?.email
    customerName = invoice?.customerContactId?.name || customer?.profile?.displayName
  } else {
    emailToSend = invoice?.customerContactId ? invoice?.customerContactId?.email : customer?.info?.email
    customerName = invoice?.customerContactId ? invoice?.customerContactId?.name : customer?.profile?.displayName
  }
  

  const sendInvoice = () => {
    dispatch(sendEmailAction.fetch({ 'email': emailToSend,
      'id': _id,
      'type': 'invoice'
    }));
  };

  const errorDispatcher = (message:string) => {
    dispatch(errorSnackBar(message))
  }

  const draftInvoiceHandler = (data:any, emailDefault:string) => {
    dispatch(setModalDataAction({
      data: {...data, emailDefault, modalTitle: 'Save & Send', from: invoice?.companyLocation?.billingAddress?.emailSender},
      'type': modalTypes.SAVE_INVOICE_AND_EMAIL_JOB_REPORT_MODAL
    }));
    dispatch(resetEmailState());
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }

  const invoiceHandler = (data:any, emailDefault:string) => {
    dispatch(setModalDataAction({
      data: {...data, emailDefault,  from: invoice?.companyLocation?.billingAddress?.emailSender},
      'type': modalTypes.EMAIL_JOB_REPORT_MODAL
    }));
    dispatch(resetEmailState());
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }

  const oldJobReportHandler = (data:any) => {
    dispatch(setModalDataAction({
      data: {...data,  from: invoice?.companyLocation?.billingAddress?.emailSender},
      'type': modalTypes.EMAIL_JOB_REPORT_MODAL_OLD,
    }));
    dispatch(resetEmailState());
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }

  const data = {
    'modalTitle': 'Send this invoice',
    'customer': customerName,
    // 'customerEmail': customer?.info?.email,
    'customerEmail': emailToSend,
    'handleClick': sendInvoice,
    'id': _id,
    'typeText': 'Invoice',
    'className': 'wideModalTitle',
    'customerId': customer?._id,
    'invoice': invoice,
  };

  return <EmailButton
    Component={Component}
    data={data}
    showLoader={showLoader}
    errorDispatcher={errorDispatcher}
    draftInvoiceHandler={draftInvoiceHandler}
    invoiceHandler={invoiceHandler}
    oldJobReportHandler={oldJobReportHandler}
    getInvoiceEmailTemplate={getInvoiceEmailTemplate}
  />;
}


