// Import * as Yup from 'yup';
import * as CONSTANTS from '../../../constants';
import BCDateTimePicker from 'app/components/bc-date-time-picker/bc-date-time-picker';
import BCSent from '../../components/bc-sent';
import { recordPayment, updatePayment } from '../../../api/payment.api';
import styles from './bc-payment-record-modal.styles';
import { useFormik } from 'formik';
import AttachMoney from '@material-ui/icons/AttachMoney';
import {
  DialogActions,
  DialogContent,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  withStyles
} from '@material-ui/core';
import React, { useState } from 'react';
import { closeModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import InputAdornment from "@material-ui/core/InputAdornment";
import { error } from "../../../actions/snackbar/snackbar.action";
import {modalTypes} from "../../../constants";
import {formatCurrency} from "../../../helpers/format";
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';
interface ApiProps {
  customerId: string,
  invoiceId?:string,
  paymentId?:string,
  amount: number,
  paidAt: Date,
  referenceNumber?: string,
  paymentType?: string,
  note?: string
}

function BcPaymentVendorEditModal({
  classes,
  invoice,
  payment,
  fromHistory,
}: any): JSX.Element {
  const [sent, setSent] = useState(false);
  const dispatch = useDispatch();
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const paymentTypes = [
    {
      '_id': 0,
      'name': 'ACH'
    },
    {
      '_id': 1,
      'name': 'Bank Wire'
    },
    {
      '_id': 2,
      'name': 'Credit Card/Debit Card'
    },
    {
      '_id': 3,
      'name': 'Check'
    },
    {
      '_id': 4,
      'name': 'Cash'
    }
  ];

  const isValidate = () => {
    const amount = FormikValues.amount ?? 0;
    return (amount > 0);
  };

  const currentBalanceDue = invoice.balanceDue ?? invoice.total;

  const formatNumber = (number: number) => {
    return number.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    })
  }

  const findPaymentTypeIndex = (paymentType: string) => {
    if (paymentType === undefined) return -1;
    const i = paymentTypes.findIndex((type) => type.name === paymentType);
    return i;
  }

  const form = useFormik({
    initialValues: {
      paymentDate: payment ? new Date(payment.paidAt) : new Date(),
      amount: payment?.amountPaid,
      paymentMethod: findPaymentTypeIndex(payment?.paymentType),
      referenceNumber: payment?.referenceNumber || '',
      notes: payment?.note || ''
    },
    onSubmit: (values: any, { setSubmitting }: any) => {
      setSubmitting(true);

      const params: ApiProps = {
        customerId: invoice.customer._id,
        amount: FormikValues.amount ?? 0,
        paidAt: FormikValues.paymentDate,
        note: FormikValues.notes,
      }

      if (payment) {
        params.paymentId = payment._id;
      } else {
        params.invoiceId= invoice._id;
      }

      if (FormikValues.referenceNumber)
        params.referenceNumber = FormikValues.referenceNumber;

      if (FormikValues.paymentMethod >= 0)
        params.paymentType = paymentTypes.filter((type) => type._id == FormikValues.paymentMethod)[0].name;

      let request;

      if (payment) {
        request = updatePayment;
      } else {
        request = recordPayment;
      }

      dispatch(request(params,currentDivision.params)).then((response: any) => {
        if (response.status === 1) {
          setSent(true);
          setSubmitting(false);
          //closeModal()
        } else {
          dispatch(error(response.message))
        }
      }).catch((e: any) => {
        dispatch(error(e.message));
        setSubmitting(false);
      })
    }
  });


  const {
    'errors': FormikErrors,
    'values': FormikValues,
    'handleChange': formikChange,
    'handleSubmit': FormikSubmit,
    setFieldValue,
    getFieldMeta,
    isSubmitting
  } = form;

  const closeModal = () => {
    if (fromHistory) {
      dispatch(setModalDataAction({
        'data': {
          invoiceID: invoice._id,
          modalTitle: 'Payment History',
          removeFooter: false,
        },
        'type': modalTypes.PAYMENT_HISTORY_MODAL
      }));
    } else {
      dispatch(closeModalAction());
      setTimeout(() => {
        dispatch(setModalDataAction({
          'data': {},
          'type': ''
        }));
      }, 200);
    }
  };

  const {customer, dueDate} = invoice;
  const formatedDueDate = (new Date(dueDate)).toLocaleDateString('en-us',{ year: 'numeric', month: 'short', day: 'numeric' })
  const customerPO = invoice.customerPO ? invoice.customerPO : '\u00A0';

  return (
    <DataContainer className={'new-modal-design'}>
      {sent ?
        <BCSent title={payment ? 'The payment was updated.' : 'The payment was recorded.'}/>
        :
        <Grid container className={classes.modalPreview} justify={'space-around'}>
          <Grid item>
            <Typography variant={'caption'} className={classes.previewCaption}>BILL TO</Typography>
            <Typography variant={'h6'} className={classes.previewText}>{customer.profile.displayName}</Typography>
          </Grid>
          <Grid item>
            <Typography variant={'caption'} className={classes.previewCaption}>TOTAL AMOUNT</Typography>
            <Typography variant={'h6'} className={classes.previewText}>{formatCurrency(invoice.total)}</Typography>
          </Grid>
          <Grid item>
            <Typography variant={'caption'} className={classes.previewCaption}>BALANCE DUE</Typography>
            <Typography variant={'h6'} className={classes.previewText}>{formatCurrency(currentBalanceDue)}</Typography>
          </Grid>
          <Grid item>
            <Grid container direction={'row'} spacing={2}>
              <Grid item>
                <Grid container direction={'column'}>
                  <Typography variant={'caption'} align={'right'} className={classes.previewCaption2}>INVOICE
                    #:</Typography>
                  <Typography variant={'caption'} align={'right'} className={classes.previewCaption2}>CUSTOMER
                    P.O.:</Typography>
                  <Typography variant={'caption'} align={'right'} className={classes.previewCaption2}>DUE
                    DATE:</Typography>
                </Grid>
              </Grid>
              <Grid item>
                <Grid container direction={'column'}>
                  <Typography variant={'caption'} align={'right'}
                              className={classes.previewTextSm}>{invoice.invoiceId}</Typography>
                  <Typography variant={'caption'} align={'right'}
                              className={classes.previewTextSm}>{customerPO}</Typography>
                  <Typography variant={'caption'} align={'right'}
                              className={classes.previewTextSm}>{formatedDueDate}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

        </Grid>
      }

      <form onSubmit={FormikSubmit}>
        {!sent &&
          <>
            <DialogContent classes={{'root': classes.dialogContent}}>
            <Grid container direction={'column'} spacing={1}>

              <Grid item xs={12}>
                <Grid container direction={'row'} spacing={1}>
                  <Grid container item justify={'flex-end'} alignItems={'center'} xs={3}>
                    <Typography variant={'button'}>PAYMENT DATE</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <div style={{width: '70%'}}>
                      <BCDateTimePicker
                        handleChange={(e: any) => setFieldValue('paymentDate', e)}
                        name={'paymentDate'}
                        value={FormikValues.paymentDate}
                      />
                    </div>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Grid container direction={'row'} spacing={1}>
                  <Grid container item justify={'flex-end'} alignItems={'center'} xs={3}>
                    <Typography variant={'button'}>AMOUNT</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <TextField
                      autoFocus
                      autoComplete={'off'}
                      className={classes.fullWidth}
                      id={'outlined-textarea'}
                      label={''}
                      name={'amount'}
                      onChange={(e: any) => formikChange(e)}
                      type={'number'}
                      value={FormikValues.amount}
                      variant={'outlined'}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney style={{color: '#BDBDBD'}}/>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Grid container direction={'row'} spacing={1}>
                  <Grid container item justify={'flex-end'} alignItems={'center'} xs={3}>
                    <Typography variant={'button'}>PAYMENT METHOD</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <TextField
                      autoComplete={'off'}
                      className={classes.fullWidth}
                      id={'outlined-textarea'}
                      name={'paymentMethod'}
                      onChange={(e: any) => formikChange(e)}
                      select
                      value={FormikValues.paymentMethod}
                      variant={'outlined'}
                      placeholder='Select payment method'
                    >
                      <MenuItem value='-1' disabled>
                        Select payment method
                      </MenuItem>
                      {paymentTypes.map((option) => (
                        <MenuItem key={option._id} value={option._id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Grid container direction={'row'} spacing={1}>
                  <Grid container item justify={'flex-end'} alignItems={'center'} xs={3}>
                    <Typography variant={'button'}>REFERENCE NO.</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <TextField
                      autoComplete={'off'}
                      className={classes.fullWidth}
                      id={'outlined-textarea'}
                      label={''}
                      name={'referenceNumber'}
                      onChange={formikChange}
                      type={'text'}
                      value={FormikValues.referenceNumber}
                      variant={'outlined'}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Grid container direction={'row'} spacing={1}>
                  <Grid container item justify={'flex-end'} alignItems={'flex-start'} xs={3}>
                    <Typography variant={'button'} style={{marginTop: '10px'}}>NOTES</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <TextField
                      autoComplete={'off'}
                      className={classes.fullWidth}
                      id={'outlined-textarea'}
                      label={''}
                      name={'notes'}
                      multiline={true}
                      rows={3}
                      onChange={(e: any) => formikChange(e)}
                      type={'text'}
                      value={FormikValues.notes}
                      variant={'outlined'}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          </>
        }
        <DialogActions classes={{
          'root': classes.dialogActions
        }}>
          <Button
            aria-label={'record-payment'}
            classes={{
              'root': classes.closeButton
            }}
            disabled={isSubmitting}
            onClick={() => closeModal()}
            variant={'outlined'}>
            Close
          </Button>

          {!sent &&
          <Button
            disabled={!isValidate() || isSubmitting}
            aria-label={'create-job'}
            classes={{
              root: classes.submitButton,
              disabled: classes.submitButtonDisabled
            }}
            color="primary"
            type={'submit'}
            variant={'contained'}>
            Submit
          </Button>
          }

        </DialogActions>
      </form>

    </DataContainer >
  );
}

const Label = styled.div`
  color: red;
  font-size: 15px;
`;

const DataContainer = styled.div`

  margin: auto 0;

  .MuiFormLabel-root {
    font-style: normal;
    font-weight: normal;
    width: 800px;
    font-size: 20px;
    color: ${CONSTANTS.PRIMARY_DARK};
    /* margin-bottom: 6px; */
  }
  .MuiFormControl-marginNormal {
    margin-top: .5rem !important;
    margin-bottom: 1rem !important;
    /* height: 20px !important; */
  }
  .MuiInputBase-input {
    color: #383838;
    font-size: 16px;
    padding: 12px 14px;
  }
  .MuiInputAdornment-positionStart {
    margin-right: 0;
  }
  .MuiInputAdornment-root + .MuiInputBase-input {
    padding: 12px 14px 12px 0;
  }
  .MuiOutlinedInput-multiline {
    padding: 0;
  }
  .required > label:after {
    margin-left: 3px;
    content: "*";
    color: red;
  }
  .save-customer-button {
    color: ${CONSTANTS.PRIMARY_WHITE};
  }

  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type=number] {
    -moz-appearance: textfield;
  }
`;

export default withStyles(
  styles,
  { 'withTheme': true }
)(BcPaymentVendorEditModal);
