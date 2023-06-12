import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { withStyles } from "@material-ui/core";
import styles from "../customer.styles";
import styled from "styled-components";
import { useLocation, useParams } from "react-router-dom";
import BCCircularLoader from "../../../components/bc-circular-loader/bc-circular-loader";
import BCEditInvoice from "../../../components/bc-invoice/bc-edit-invoice";
import { getAllPaymentTermsAPI } from "api/payment-terms.api";
import { loadInvoiceItems } from "actions/invoicing/items/items.action";
import { resetEmailState } from "actions/email/email.action";
import { getInvoiceEmailTemplate } from "api/emailDefault.api";
import { openModalAction, setModalDataAction } from "actions/bc-modal/bc-modal.action";
import { modalTypes } from "../../../../constants";
import { error as errorSnackBar, success } from "actions/snackbar/snackbar.action";
import { getAllSalesTaxAPI } from "api/tax.api";
import { getCustomerDetailAction, getCustomers, resetCustomer } from "actions/customer/customer.action";
import { getCompanyProfile } from "api/user.api";
import { getItems } from 'api/items.api'
import { callCreateInvoiceAPI, updateInvoice as updateInvoiceAPI, voidInvoice as voidInvoiceAPI } from "api/invoicing.api";
import { getCompanyLocations } from "api/user.api";
import { ISelectedDivision } from "actions/filter-division/fiter-division.types";

const newInvoice = {
  createdAt: new Date().toISOString(),
  items: [],
  isDraft: true,
}

function ViewInvoice() {
  const dispatch = useDispatch();
  const history = useHistory();
  let { invoice } = useParams<any>();
  const { user } = useSelector(({ auth }: any) => auth);
  const { state } = useLocation<any>();
  const [invoiceDetail, setInvoiceDetail] = useState(state ? state.invoiceDetail : newInvoice);
  const { 'data': paymentTerms } = useSelector(({ paymentTerms }: any) => paymentTerms);
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const customerId = state ? state.customerId : '';

  const { customerObj: customer, data: customersData, customers } = useSelector(({ customers }: any) => customers);
  const taxes = useSelector(({ tax }: any) => tax.data);

  useEffect(() => {
    async function getCompany(company: string) {
      const res = await getCompanyProfile(user.company as string);
      const companyLocations = await getCompanyLocations();

      setInvoiceDetail({ ...invoiceDetail, company: res.company,locations: companyLocations.companyLocations });
    }

    if (user && !invoice) {
      getCompany(user.company as string);
      //dispatch(getCompanyProfileAction(user.company as string));
    }

    if (customerId) {
      dispatch(getCustomerDetailAction({ customerId }));
    } else {
      dispatch(resetCustomer());
      dispatch(getCustomers());
    }

    dispatch(loadInvoiceItems.fetch());
    dispatch(getAllPaymentTermsAPI());
    dispatch(getAllSalesTaxAPI());

  }, []);

  const showSendInvoiceModalHandler = async (invoiceId: string, customerId: string) => {
    try {
      const response = await getInvoiceEmailTemplate(invoiceId);
      const { emailTemplate: emailDefault, status, message } = response.data;
      if (status === 1) {
        dispatch(setModalDataAction({
          data: {
            'modalTitle': 'Send this invoice',
            'customer': customer?.profile?.displayName,
            'customerEmail': emailDefault?.to || customer?.info?.email,
            'id': invoiceId,
            'typeText': 'Invoice',
            'className': 'wideModalTitle',
            emailDefault,
            customerId: customerId || customer._id
          },
          'type': modalTypes.EMAIL_JOB_REPORT_MODAL
        }));
        dispatch(resetEmailState());
        setTimeout(() => {
          dispatch(openModalAction());
        }, 200);
      } else {
        dispatch(errorSnackBar(message));
      }
    } catch (e) {
      dispatch(errorSnackBar('Something went wrong. Please try again'));
    }
  }

  const updateInvoiceHandler = (data: any) => {
    console.log(data);
    
    return new Promise((resolve, reject) => {
      dispatch(setModalDataAction({
        data: {
          modalTitle: 'Status',
          progress: true,
          removeFooter: false,
          className: 'serviceTicketTitle',
        },
        type: modalTypes.RECORD_SYNC_STATUS_MODAL,
      }));

      if (!data.isDraft) {
        setTimeout(() => {
          dispatch(openModalAction());
        }, 200);
      }

      // this is to set Hour to 12:00 so when backend generate invoice for email it wont render wrong date because of timezone difference
      data.invoice_date = new Date(data.invoice_date)
      data.invoice_date = data.invoice_date.setHours(data.invoice_date.getHours() + 12)
      data.due_date = new Date(data.due_date)
      data.due_date = data.due_date.setHours(data.due_date.getHours() + 12)
      const params: any = {
        invoiceId: data.invoice_id,
        issuedDate: new Date(data.invoice_date).toISOString(),
        dueDate: new Date(data.due_date).toISOString(),
        ...(data.paymentTerm && { paymentTermId: data.paymentTerm }),
        note: data.note,
        isDraft: data.isDraft,
        items: JSON.stringify(data.items.map((o: any) => {
          const item: any = {
            description: o.description ?? '',
            price: parseFloat(o.price),
            quantity: parseInt(o.quantity),
            tax: parseFloat(o.tax) ?? 0,
            isFixed: o.isFixed,
          }
          if (o._id)
            item.item = o._id;
          else
            item.name = o.name;
          return item;
        })),
        charges: 0,
      }
      if (data.customer_po) params.customerPO = data.customer_po;

      updateInvoiceAPI(params).then((response: any) => {
        if (data.isDraft) {
          dispatch(success(`Draft ${data.invoiceId + 1 || ''} Updated`));
          history.replace(`/main/invoicing/invoices-list`, history.location.state)
          return
        }
        const { status, invoice, quickbookInvoice } = response;
        dispatch(setModalDataAction({
          data: {
            modalTitle: 'Status',
            progress: false,
            keyword: 'Invoice',
            created: status === 1,
            synced: !!quickbookInvoice,
            closeAction: () => history.replace(`/main/invoicing/view/${data.invoice_id}`, history.location.state),
            removeFooter: false,
            className: 'serviceTicketTitle',
          },
          type: modalTypes.RECORD_SYNC_STATUS_MODAL,
        }));
      })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  const createInvoiceHandler = (data: any) => {
    return new Promise((resolve, reject) => {
      const params: any = {
        invoiceNumber: data.invoiceId,
        issuedDate: data.invoice_date,
        dueDate: data.due_date,
        paymentTermId: data.paymentTerm,
        note: data.note,
        isDraft: data.isDraft,
        customerId: data.customer._id,
        items: JSON.stringify(data.items.map((o: any) => {
          const item: any = {
            description: o.description ?? '',
            price: parseFloat(o.price),
            quantity: parseInt(o.quantity),
            tax: parseFloat(o.tax) ?? 0,
            isFixed: o.isFixed,
          }
          if (o._id)
            item.item = o._id;
          else
            item.name = o.name;
          return item;
        })),
        charges: 0,
      }
      if (data.customer_po) params.customerPO = data.customer_po;

      if (currentDivision.data?.locationId) {
        params.companyLocation = currentDivision.data?.locationId;
      }

      if (currentDivision.data?.workTypeId) {
        params.workType = currentDivision.data?.workTypeId;
      }

      dispatch(setModalDataAction({
        data: {
          modalTitle: 'Status',
          progress: true,
          removeFooter: false,
          className: 'serviceTicketTitle',
        },
        type: modalTypes.RECORD_SYNC_STATUS_MODAL,
      }));

      if (!data.isDraft) {
        setTimeout(() => {
          dispatch(openModalAction());
        }, 200);
      }

      callCreateInvoiceAPI(params).then((response: any) => {
        if (data.isDraft) {
          dispatch(success(`Draft Invoice ${data.company.currentInvoiceId + 1 || ''} Created`));
          history.goBack()
          return
        }
        const { status, invoice, quickbookInvoice } = response;
        dispatch(setModalDataAction({
          data: {
            modalTitle: 'Status',
            keyword: 'Invoice',
            created: status === 1,
            synced: !!quickbookInvoice,
            closeAction: () => history.goBack(),
            removeFooter: false,
            className: 'serviceTicketTitle',
          },
          type: modalTypes.RECORD_SYNC_STATUS_MODAL,
        }));
      })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  const voidInvoiceHandler = (invoiceId: string) => {
    dispatch(
      setModalDataAction({
        'data': {
          'data': {
            handleOnConfirm: async () => {
              try {
                const res: any = await voidInvoiceAPI({ invoiceId })
                if (res.status === 1) {
                  dispatch(success(res.message));
                  history.push({
                    'pathname':  currentDivision.urlParams ? `/main/invoicing/invoices-list/${currentDivision.urlParams}` : "/main/invoicing/invoices-list",
                  });
                } else {
                  dispatch(errorSnackBar(res.message));
                }
              } catch (error) {
                dispatch(errorSnackBar(`Something went wrong`))
              }
            }
          },
          'modalTitle': '',
          'removeFooter': false
        },
        type: modalTypes.CONFIRM_VOID_INVOICE_MODAL,
      })
    );
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }

  if ((customerId && !customer?._id) || (!customerId && customers?.length === 0) || !invoiceDetail.company)
    return <BCCircularLoader heightValue={'200px'} />

  return (
    <MainContainer>
      <PageContainer>
        <BCEditInvoice
          invoiceData={invoiceDetail}
          isOld={!!invoice}
          paymentTerms={paymentTerms}
          customer={customer}
          customersData={customersData} taxes={taxes}
          showSendInvoiceModalHandler={showSendInvoiceModalHandler}
          updateInvoiceHandler={updateInvoiceHandler}
          createInvoiceHandler={createInvoiceHandler}
          voidInvoiceHandler={voidInvoiceHandler}
          getItems={getItems}
        />
      </PageContainer>
    </MainContainer>
  )
}


export const MainContainer = styled.div`
  display: flex;
  flex: 1 1 100%;
  width: 100%;
  overflow-x: hidden;
`;

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  padding: 30px;
  width: 100%;
  padding-left: 65px;
  padding-right: 65px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 18px;
  }
`;

export const PageHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex: 1 1 100%;
  padding: 10px 0;
  width: 100%;
  margin: 0 auto;
  align-items: center;
`;

export default withStyles(styles, { 'withTheme': true })(ViewInvoice);
