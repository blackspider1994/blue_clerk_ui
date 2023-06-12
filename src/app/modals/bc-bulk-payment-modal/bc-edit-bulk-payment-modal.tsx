import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import AttachMoney from '@material-ui/icons/AttachMoney';
import {
  Button,
  DialogActions,
  DialogContent,
  Grid,
  TextField,
  Typography,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  withStyles,
} from '@material-ui/core';
import { closeModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import styles from './bc-bulk-payment-modal.styles';
import BCDateTimePicker from 'app/components/bc-date-time-picker/bc-date-time-picker';
import BCTableContainer from 'app/components/bc-table-container/bc-table-container';
import BCSent from 'app/components/bc-sent';
import { createStyles, makeStyles } from '@material-ui/core';
import styled from 'styled-components';
import { CSButtonSmall } from "helpers/custom";
import {formatCurrency, formatShortDateNoDay} from 'helpers/format';
import { updatePayment } from 'api/payment.api';
import { error } from "actions/snackbar/snackbar.action";
import { voidPayment } from 'api/payment.api';
import { modalTypes } from '../../../constants';
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';

const StyledGrid = withStyles(() => ({
  item: {
    '& .form-filter-input': {
      maxWidth: 200,
      margin: 'auto',
    },
  },
}))(Grid);

const useInputStyles = makeStyles(() =>
  createStyles({
    textField: {
      '& .MuiOutlinedInput-input': {
        padding: '5px 10px',
      }
    }
  })
);

function BCBulkPaymentModal({ classes, modalOptions, setModalOptions, payments }: any): JSX.Element {
  const dispatch = useDispatch();
  const [localPaymentList, setLocalPaymentList] = useState<any[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputStyles = useInputStyles();
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const paymentList = payments.line;

  const paymentTypeReference = [
    {
      '_id': 0,
      'label': 'ACH'
    },
    {
      '_id': 1,
      'label': 'Bank Wire'
    },
    {
      '_id': 2,
      'label': 'Credit Card/Debit Card'
    },
    {
      '_id': 3,
      'label': 'Check'
    },
    {
      '_id': 4,
      'label': 'Cash'
    }
  ];

  const bgColors: { [index: string]: string } = { PAID: '#81c784', UNPAID: '#F50057', PARTIALLY_PAID: '#FA8029' };

  const initialTotalAmount = paymentList.reduce((total:number, payment:any) => {
    return total + payment.amountPaid;
  }, 0)

  const {
    'values': FormikValues,
    'handleChange': formikChange,
    'handleSubmit': FormikSubmit,
    setFieldValue,
    isSubmitting,
  } = useFormik({
    'initialValues': {
      'customerId': payments.customer._id,
      'paymentId': payments._id,
      'paymentType': payments.paymentType ? paymentTypeReference.filter(type => type.label == payments.paymentType)[0]._id : '',
      'paymentDate': new Date(payments.paidAt),
      'referenceNumber': payments.referenceNumber,
      'showPaid': false,
      totalAmount: initialTotalAmount,
      totalAmountToBePaid: initialTotalAmount,
    },
    'onSubmit': (values: any, { setSubmitting }: any) => {
      setSubmitting(true);
      if(!isValid()){
        return setSubmitting(false);
      }
      const line:any = []
      localPaymentList.forEach(payment => {
        if(payment.checked && payment.amountToBeApplied){
          const lineObject:any = {
            invoiceId: payment.invoice._id,
            amountPaid: payment.amountToBeApplied,
          };
          line.push(lineObject)
        }
      })
      const paramObj:any = {
        line: JSON.stringify(line),
        customerId: values.customerId,
        paidAt: values.paymentDate,
        referenceNumber: values.referenceNumber,
        paymentId: values.paymentId
      };
      if(values.paymentType !== ''){
        paramObj.paymentType = paymentTypeReference.filter(type => type._id == values.paymentType)[0].label
      }
      dispatch(updatePayment(paramObj, currentDivision.params))
        .then((response: any) => {
          if (response.status === 1) {
            setIsSuccess(true);
            setSubmitting(false);
          } else {
            dispatch(error(response.message))
            setSubmitting(false);
          }
        }).catch((e: any) => {
          dispatch(error(e.message));
          setSubmitting(false);
        })
    },
  });

  const isSumAmountDifferent = () => parseFloat(`${FormikValues.totalAmountToBePaid}`).toFixed(2) != parseFloat(`${FormikValues.totalAmount}`).toFixed(2);

  const isValid = () => {
    if(!FormikValues.customerId) {
      return false;
    }
    // if(localPaymentList.filter(payment => payment.checked && !payment.amountToBeApplied).length){
    //   return false
    // }
    if(localPaymentList.filter(payment => payment.checked && payment.amountToBeApplied).length === 0){
      return false
    }
    if(isSumAmountDifferent()){
      return false
    }
    return true;
  };

  const handlePaymentDateChange = (date: string) => {
    setFieldValue('paymentDate', date);
  };

  const handleAmountToBeAppliedChange = (id: string, value: string) => {
    let newPaymentList: any = [...localPaymentList];
    const index = newPaymentList.findIndex((payment: any) => payment._id === id);
    newPaymentList[index].amountToBeApplied = parseFloat(value);
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      newPaymentList[index].amountToBeApplied = parsedValue;
    } else {
      newPaymentList[index].amountToBeApplied = 0;
    }
    // newPaymentList = newPaymentList.map((payment:any) => ({...payment, checked: payment.amountToBeApplied ? 1 : 0}));
    // newPaymentList.sort((paymentA: any, paymentB: any) => paymentB.checked - paymentA.checked);
    setLocalPaymentList(newPaymentList);
  };

  const handleOnFocus = (setCellValue: (text: string) => void, value: string) => {
    if(value === '0'){
      setCellValue('')
    }
  };

  // const handleCheckedChange = (id: string, checkedValue: boolean) => {
  //   const newPaymentList: any = [...localPaymentList];
  //   const index = newPaymentList.findIndex((payment: any) => payment._id === id);
  //   newPaymentList[index].checked = checkedValue ? 1 : 0;
  //   if(!checkedValue){
  //     newPaymentList[index].amountToBeApplied = 0;
  //   }
  //   newPaymentList.sort((paymentA: any, paymentB: any) => paymentB.checked - paymentA.checked)
  //   setLocalPaymentList(newPaymentList);
  // }

  const handleVoidPaymentButtonClick = () => {
    const closeAction = setModalDataAction({
      'data': {
        'modalTitle': 'Edit Bulk Payment',
        'removeFooter': false,
        payments,
      },
      'type': modalTypes.EDIT_BULK_PAYMENT_MODAL
    });
    dispatch(setModalDataAction({
      data: {
        modalTitle: '         ',
        message: 'Are you sure you want to void this bulk payment?',
        subMessage: 'This action cannot be undone.',
        action: voidPayment({type: 'customer', paymentId: payments._id},currentDivision.params),
        closeAction,
      },
      'type': modalTypes.WARNING_MODAL
    }));
  };

  const closeModal = () => {
    dispatch(closeModalAction());
    setTimeout(() => {
      dispatch(setModalDataAction({
        'data': {},
        'type': ''
      }));
    }, 200);
  };

  const columns: any = [
    {
      Cell({ row }: any) {
        return <div>
          {/* <FormControlLabel
            control={
              <Checkbox
                disabled={row.original.status === "PAID"}
                checked={!!row.original.checked}
                // onChange={(event) => handleCheckedChange(row.original._id, event.target.checked)}
                name="checkedB"
                color="primary"
              />
            }
            label=""
          /> */}
          {row.original.invoice?.dueDate
            ? formatShortDateNoDay(row.original.invoice.dueDate)
            : 'N/A'}
        </div>
      },
      'Header': 'Due Date',
      'accessor': 'dueDate',
      'className': 'font-bold',
    },
    {
      'Header': 'Invoice ID',
      'accessor': 'invoice.invoiceId',
      'className': 'font-bold',
    },
    {
      Cell() {
        return payments.customer.profile.displayName;
      },
      'Header': 'Customer',
      'className': 'font-bold',
    },
    {
      Cell({ row }: any) {
        return <div>
          <span>
            {row.original.invoice?.customerPO || '-'}
          </span>
        </div>;
      },
      'Header': 'Customer PO',
    },
    {
      'accessor': (originalRow: any) => formatCurrency(originalRow.invoice?.balanceDue),
      'Header': 'Amount Due',
      'width': 20
    },
    {
      Cell({ row }: any) {
        const { status = '' } = row.original.invoice;
        const textStatus = status.split('_').join(' ').toLowerCase();
        return (
          <div>
            <CSButtonSmall
              variant="contained"
              style={{
                backgroundColor: bgColors[status],
                color: '#fff',
              }}
            >
              <span style={{ textTransform: 'capitalize' }}>{textStatus}</span>
            </CSButtonSmall>
          </div>
        )
      },
      'Header': 'Payment Status',
      'accessor': 'paid',
    },
    {
      'accessor': (originalRow: any) => formatCurrency(originalRow.amountPaid),
      'Header': 'Current Amount',
      'width': 20
    },
    {
      Cell({ row }: any) {
        const [cellValue, setCellValue] = useState(row.original.amountToBeApplied)
        useEffect(() => {
          setCellValue(row.original.amountToBeApplied)
        }, [row.original.amountToBeApplied])

        return (
          <TextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoney style={{color: '#BDBDBD'}}/>
                </InputAdornment>
              ),
              style: { background: '#fff' },
            }}
            disabled={row.original.status === "PAID"}
            classes={{ root: inputStyles.textField }}
            onFocus={(event: any)=> handleOnFocus(setCellValue, event.target.value)}
            onBlur={(event: any) => handleAmountToBeAppliedChange(row.original._id, event.target.value)}
            onChange={(event: any) => setCellValue(event.target.value)}
            type={'number'}
            value={cellValue}
            variant={'outlined'}
          />
        )
      },
      'Header': 'New Amount',
      'accessor': 'amountToBeApplied'
    },
  ];

  useEffect(() => {
    if (paymentList.length > 0) {
      const newPaymentList = paymentList.map((item: any) => ({
        ...item,
        'amountToBeApplied': item.amountPaid,
        'checked': 1,
      }));
      setLocalPaymentList([...newPaymentList]);
    } else {
      setLocalPaymentList([]);
    }
  }, [paymentList])

  useEffect(() => {
    setFieldValue('totalAmount', localPaymentList.reduce((total, payment) => {
      return total + payment.amountToBeApplied;
    }, 0))
  }, [localPaymentList])

  return (
    <DataContainer className={'new-modal-design'}>
      <form onSubmit={FormikSubmit}>
        {isSuccess ? (
          <BCSent title={'The payment was successfully edited.'}/>
        ) : (
          <>
            <Grid container className={'modalPreview'} justify={'space-between'} spacing={4}>
              <StyledGrid item xs={3}>
                <div className={'form-filter-input'} style={{ paddingBottom: 5 }}>
                  <Typography variant={'caption'} className={classes.previewCaption}>CUSTOMER</Typography>
                  <Typography variant={'h6'} className={classes.previewText}>{payments.customer.profile.displayName}</Typography>
                </div>
                <div className={'form-filter-input'}>
                  <Typography variant={'caption'} className={'previewCaption'}>Payment date</Typography>
                  <BCDateTimePicker
                    handleChange={handlePaymentDateChange}
                    name={'paymentDate'}
                    id={'paymentDate'}
                    placeholder={'Date'}
                    value={FormikValues.paymentDate}
                    whiteBackground
                  />
                </div>
              </StyledGrid>
              <StyledGrid item xs={3}>
                <div className={'form-filter-input'} style={{ paddingBottom: 5 }}>
                  <div style={{marginTop: 21, height: 32}} />
                </div>
                <div className={'form-filter-input'}>
                  <Typography variant={'caption'} className={'previewCaption'}>Total Amount To Be Paid</Typography>
                  <TextField
                    fullWidth
                    variant={'outlined'}
                    type={'number'}
                    name={'totalAmountToBePaid'}
                    onFocus={(e) => {
                      if(e.target.value === '0'){
                        setFieldValue('totalAmountToBePaid', '')
                      }
                    }}
                    onBlur={(e) => {
                      const parsedValue = parseFloat(e.target.value);
                      if (!isNaN(parsedValue)) {
                        setFieldValue('totalAmountToBePaid', parsedValue);
                      } else {
                        setFieldValue('totalAmountToBePaid', 0);
                      }
                    }}
                    onChange={formikChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney style={{color: '#BDBDBD'}}/>
                        </InputAdornment>
                      ),
                      style: { background: '#fff' },
                    }}
                    value={FormikValues.totalAmountToBePaid}
                    error={isSumAmountDifferent()}
                    // helperText={isSumAmountDifferent() && 'The total amount is not the same as the sum of all invoice payments'}
                    helperText={isSumAmountDifferent() && 'The total amount is not match'}
                  />
                  {!!FormikValues.totalAmount && (
                    <div style={{marginTop: 10}}>
                      <Typography variant={'caption'} className={'previewCaption'}>Total Amount Applied</Typography>
                      <br />
                      <Typography variant={'h6'} className={'previewCaption'} style={{marginBottom: 0, width: 147, textAlign: 'center'}}>
                        $ {parseFloat(`${FormikValues.totalAmount}`).toFixed(6).slice(-6) === '000000' ? FormikValues.totalAmount : parseFloat(`${FormikValues.totalAmount}`).toFixed(2)}
                        {/* $ {FormikValues.totalAmount} */}
                      </Typography>
                    </div>
                  )}
                </div>
              </StyledGrid>
              <StyledGrid item xs={3}>
                <div className={'form-filter-input'} style={{ paddingBottom: 5 }}>
                  <div style={{marginTop: 21, height: 32}} />
                </div>
                <div className={'form-filter-input'}>
                  <Typography variant={'caption'} className={'previewCaption'}>Mode of Payment</Typography>
                  <FormControl variant="outlined" fullWidth>
                    <Select
                      name={'paymentType'}
                      value={FormikValues.paymentType}
                      onChange={formikChange}
                      style={{ background: '#fff' }}
                    >
                      {paymentTypeReference.map(({ label, _id }: { label: string; _id: number }) => {
                        return <MenuItem key={_id} value={_id}>{label}</MenuItem>
                      })}
                    </Select>
                  </FormControl>
                </div>
              </StyledGrid>
              <StyledGrid item xs={3}>
                <div className={'form-filter-input'} style={{ paddingBottom: 5 }}>
                  <div style={{marginTop: 21, height: 32}} />
                </div>
                <div className={'form-filter-input'} style={{ paddingBottom: 5 }}>
                  <Typography variant={'caption'} className={'previewCaption'}>Reference No.</Typography>
                  <TextField
                    fullWidth
                    variant={'outlined'}
                    name={'referenceNumber'}
                    onChange={formikChange}
                    InputProps={{
                      style: { background: '#fff' },
                    }}
                    value={FormikValues.referenceNumber}
                  />
                </div>
              </StyledGrid>
            </Grid>
            <DialogContent>
              <BCTableContainer
                columns={columns}
                tableData={localPaymentList}
              />
            </DialogContent>
          </>
        )}
        <div className={'modalDataContainer'}>
          <DialogActions>
            <Button
              disabled={isSubmitting}
              disableElevation={true}
              onClick={() => closeModal()}
              variant={'outlined'}
            >
              Close
            </Button>
            {!isSuccess && (
              <>
                <Button
                  color={'secondary'}
                  disableElevation={true}
                  disabled={isSubmitting}
                  onClick={handleVoidPaymentButtonClick}
                  variant={'contained'}
                  style={{ marginLeft: 15 }}
                >
                  Void Bulk Payment
                </Button>
                <Button
                  color={'primary'}
                  disableElevation={true}
                  disabled={isSubmitting || !isValid()}
                  type={'submit'}
                  variant={'contained'}
                >
                  Submit All
                </Button>
              </>
            )}
          </DialogActions>
        </div>
      </form>
    </DataContainer >
  );
};

const DataContainer = styled.div`
  *:not(.MuiGrid-container) > .MuiGrid-container {
    width: 100%;
    padding: 10px 40px;
  }
  .MuiGrid-spacing-xs-4 > .MuiGrid-spacing-xs-4 {
    margin: -16px 0;
  }
  .MuiGrid-grid-xs-true {
    padding: 16px;
  }
  .MuiOutlinedInput-root {
    border-radius: 8px;
    padding: 2px;
  }

  .MuiOutlinedInput-input {
    padding: 9.5px 4px;
  }

  span.required:after {
    margin-left: 3px;
    content: "*";
    color: red;
  }
`;


export default withStyles(
  styles,
  { 'withTheme': true }
)(BCBulkPaymentModal);
