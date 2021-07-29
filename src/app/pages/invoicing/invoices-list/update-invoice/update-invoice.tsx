import BCInvoiceForm from 'app/components/bc-shared-form/bc-shared-form';
import React from 'react';
import { updateInvoice } from 'api/invoicing.api';
import styles from '../invoices-list.styles';
import { useHistory } from 'react-router-dom';
import { withStyles } from '@material-ui/core';
import { FormDefaultValues } from 'app/components/bc-shared-form/bc-shared-form-default-values';
import { FormTypes } from 'app/components/bc-shared-form/bc-shared-form.types';

function UpdateInvoice({ classes }: any) {
  const history = useHistory();
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
      'Cell'({ row }: any) {
        return <div className={'flex items-center'}>
          {`$${row.original.taxAmount}`}
        </div>;
      },
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
      'Cell'({ row }: any) {
        return <div className={'flex items-center'}>
          {`$${row.original.total}`}
        </div>;
      },
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

  const redirectURL = '/main/invoicing/invoices-list';

  const handleFormSubmit = (data: any) => {
    return new Promise((resolve, reject) => {
      data.items = JSON.stringify(data.items.map((o: any) => {
        o.description = o.name;
        o.price = parseFloat(o.price);
        o.quantity = parseInt(o.quantity);
        delete o.taxAmount;
        delete o.total;
        return o;
      }));
      data.charges = 0;
      updateInvoice(data).then((response: any) => {
        history.push(redirectURL);
        return resolve(response);
      })
        .catch((err: any) => {
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
            edit
            formTypeValues={FormDefaultValues[FormTypes.INVOICE]}
            itemSchema={item}
            onFormSubmit={handleFormSubmit}
            pageTitle={'Update Invoice'}
            redirectUrl={redirectURL}
          />
        </div>
      </div>
    </div >
  );
}

export default withStyles(styles, { 'withTheme': true })(UpdateInvoice);