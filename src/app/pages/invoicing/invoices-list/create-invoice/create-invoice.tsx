import BCInvoiceForm from 'app/components/bc-shared-form/bc-shared-form';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { callCreateInvoiceAPI } from 'api/invoicing.api';
import styles from '../invoices-list.styles';
import { useHistory } from 'react-router-dom';
import { withStyles } from '@material-ui/core';
import { FormDefaultValues } from 'app/components/bc-shared-form/bc-shared-form-default-values';
import { FormTypes } from 'app/components/bc-shared-form/bc-shared-form.types';
import { getCustomerDetailAction, resetCustomer, getCustomers } from 'actions/customer/customer.action';
import { openModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { RootState } from 'reducers';
import { loadInvoiceItems } from 'actions/invoicing/items/items.action';
import { getAllSalesTaxAPI } from 'api/tax.api';
import {modalTypes} from "../../../../../constants";
import {formatCurrency} from "../../../../../helpers/format";
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';

function CreateInvoice({ classes }: any) {
  const dispatch = useDispatch();
  const history = useHistory();
  const customer = useSelector(({ customers }:any) => customers.customerObj);
  const customers = useSelector(({ customers }: any) => customers.data);
  const { 'items': invoiceItems } = useSelector(({ invoiceItems }:RootState) => invoiceItems);
  const taxes = useSelector(({ tax }: any) => tax.data);
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const getCustomersDispatcher = () => {
    dispatch(getCustomers());
  }

  const getSharedFormInitialData = () => {
    dispatch(loadInvoiceItems.fetch());
    dispatch(getAllSalesTaxAPI());
  }

  const getCustomerDetailActionHandler = (customerId: string) => {
    dispatch(getCustomerDetailAction({ customerId }));
  }

  const resetCustomerHandler = () => {
    dispatch(resetCustomer());
  }

  const openPreviewFormModalHandler = (modalDataAction:any) => {
    dispatch(setModalDataAction(modalDataAction));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 10);
  }

  const columns = [
    {
      'Cell'({ row }: any) {
        return null;
      },
      'Header': 'Item',
      'borderRight': true,
      'fieldName': 'name',
      'fieldType': 'jobType',
      'id': 'invoice-name',
      'inputType': 'text',
      'sortable': false,
      'width': 450
    },
    {
      'Cell'({ row }: any) {
        return null;
      },
      'Header': 'Quantity',
      'borderRight': true,
      'className': 'font-bold',
      'fieldName': 'quantity',
      'fieldType': 'input',
      'id': 'invoice-quantity',
      'inputType': 'number',
      'width': 60
    },
    {
      'Cell'({ row }: any) {
        return null;
      },
      'Header': 'Price',
      'borderRight': true,
      'className': 'font-bold',
      'fieldName': 'price',
      'fieldType': 'input',
      'id': 'invoice-price',
      'inputType': 'number',
      'width': 60
    },
    {

      'Cell'({ row }: any) {
        return <div className={'flex items-center'}>
          {row.original.isFixed
            ? 'Fixed'
            : '/hr'}
        </div>;
      },
      'Header': 'Unit',
      'borderRight': true,
      'className': 'font-bold',
      'fieldName': 'isFixed',
      'id': 'invoice-unit',
      'inputType': null,
      'width': 60
    },
    {
      'Cell'({ row }: any) {
        return null;
      },
      'Header': 'Tax %',
      'borderRight': true,
      'className': 'font-bold',
      'fieldName': 'tax',
      'fieldType': 'select',
      'id': 'invoice-tax',
      'inputType': null,
      'width': 80
    },
    {
      'accessor': (originalRow: any) => formatCurrency(originalRow.taxAmount),
      'Header': 'Tax Amount',
      'borderRight': true,
      'currency': true,
      'fieldName': 'taxAmount',
      'fieldType': 'text',
      'id': 'invoice-taxAmount',
      'inputType': null,
      'sortable': false,
      'width': 60
    },
    {
      'accessor': (originalRow: any) => formatCurrency(originalRow.total),
      'Header': 'Total',
      'borderRight': true,
      'currency': true,
      'fieldName': 'total',
      'fieldType': 'text',
      'id': 'invoice-total',
      'inputType': null,
      'sortable': false,
      'width': 60
    },
    {
      'Header': 'Action',
      'fieldName': 'action',
      'fieldType': 'action',
      'id': 'invoice-action',
      'inputType': null,
      'sortable': false,
      'width': 60
    }
  ];
  const item = {
    'description': '',
    'isFixed': true,
    'name': '',
    'price': 0,
    'quantity': 1,
    'tax': 0,
    'taxAmount': 0,
    'total': 0

  };

  const redirectURL = currentDivision.urlParams ? `/main/invoicing/invoices-list/${currentDivision.urlParams}` : `/main/invoicing/invoices-list`;

  const handleFormSubmit = (data: any) => {
    return new Promise((resolve, reject) => {
      data.charges = 0;
      data.items = JSON.stringify(data.items.map((o: any) => {
        o.description = o.name;
        o.price = parseFloat(o.price);
        o.quantity = parseInt(o.quantity);
        delete o.taxAmount;
        delete o.total;
        return o;
      }));

      dispatch(setModalDataAction({
        data: {
          modalTitle: 'Status',
          progress: true,
          removeFooter: false,
          className: 'serviceTicketTitle',
        },
        type: modalTypes.RECORD_SYNC_STATUS_MODAL,
      }));
      setTimeout(() => {
        dispatch(openModalAction());
      }, 200);

      callCreateInvoiceAPI(data).then((response: any) => {
        {const {status, invoice, quickbookInvoice} = response;
          dispatch(setModalDataAction({
            data: {
              modalTitle: 'Status',
              keyword: 'Invoice',
              created: status === 1,
              synced: !!quickbookInvoice,
              closeAction: () => history.push(redirectURL),
              removeFooter: false,
              className: 'serviceTicketTitle',
            },
            type: modalTypes.RECORD_SYNC_STATUS_MODAL,
          }));
        }
      }).catch((err: any) => {
        reject(err);
      });
    });
  };


  return (
    <div className={classes.pageMainContainer}>
      <div className={classes.pageContainer}>
        <div className={classes.pageContent}>
          <BCInvoiceForm
            columnSchema={columns}
            formTypeValues={FormDefaultValues[FormTypes.INVOICE]}
            itemSchema={item}
            onFormSubmit={handleFormSubmit}
            pageTitle={'New Invoice'}
            redirectUrl={redirectURL}
            customer={customer}
            getCustomerDetailActionHandler={getCustomerDetailActionHandler}
            resetCustomerHandler={resetCustomerHandler}
            openPreviewFormModalHandler={openPreviewFormModalHandler}
            invoiceItems={invoiceItems}
            taxes={taxes}
            getSharedFormInitialData={getSharedFormInitialData}
            customers={customers}
            getCustomersDispatcher={getCustomersDispatcher}
          />
        </div>
      </div>
    </div >
  );
}

export default withStyles(styles, { 'withTheme': true })(CreateInvoice);
