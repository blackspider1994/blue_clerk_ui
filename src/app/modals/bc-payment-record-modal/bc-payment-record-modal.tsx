// Import * as Yup from 'yup';
import * as CONSTANTS from '../../../constants';
import BCDateTimePicker from 'app/components/bc-date-time-picker/bc-date-time-picker';
import {recordPayment} from '../../../api/payment.api';
import styles from './bc-payment-record-modal.styles';
import {Form, useFormik} from 'formik';
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
import React, { useEffect, useMemo, useState } from 'react';
import { closeModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import BCCircularLoader from 'app/components/bc-circular-loader/bc-circular-loader';
import InputAdornment from "@material-ui/core/InputAdornment";
import {error} from "../../../actions/snackbar/snackbar.action";


function BcPaymentRecordModal({
  classes,
  invoice,
  detail = false
}: any): JSX.Element {
  const dispatch = useDispatch();
  const isLoading = useSelector((state: any) => state.jobLocations.loading);

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


  useEffect(() => {

  }, []);


  const isValidate = () => {
    console.log(FormikValues.amount);
    return (FormikValues.paymentMethod >= 0 && FormikValues.amount > 0);
  };

  const formatSchedulingTime = (time: string) => {
    const timeAr = time.split('T');
    const timeWithSeconds = timeAr[1].substr(0, 5);
    const hours = timeWithSeconds.substr(0, 2);
    const minutes = timeWithSeconds.substr(3, 5);

    return { hours,
      minutes };
  };


  const form = useFormik({
    initialValues: {
      paymentDate: new Date(),
      amount: invoice.balanceDue,
      paymentMethod: -1,
      referenceNumber: '',
      notes: ''
    },
    onSubmit: (values: any, { setSubmitting }: any) => {
      setSubmitting(true);

      const params = {
        customerId: invoice.customer._id,
        invoiceId:invoice._id,
        amount:FormikValues.amount,
        referenceNumber: FormikValues.referenceNumber,
        paymentType: paymentTypes.filter((type) => type._id == FormikValues.paymentMethod)[0].name,
        paidAt: FormikValues.paymentDate,
    }
    dispatch(recordPayment(params)).then((response: any) => {
      if (response.status === 1) {
        closeModal();
      } else {
        console.log(response.message);
        dispatch(error(response.message))
      }
    })
      setSubmitting(false);
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
    dispatch(closeModalAction());
    setTimeout(() => {
      dispatch(setModalDataAction({
        'data': {},
        'type': ''
      }));
    }, 200);
  };

  if (isLoading) {
    return <BCCircularLoader />;
  }

  const {customer, dueDate} = invoice;
  const formatedDueDate = (new Date(dueDate)).toLocaleDateString('en-us',{ year: 'numeric', month: 'short', day: 'numeric' })
  return (
    <DataContainer >
      <Grid container className={classes.modalPreview} justify={'space-around'}>
        <Grid item>
          <Typography variant={'caption'} className={classes.previewCaption}>BILL TO</Typography>
          <Typography variant={'h6'} className={classes.previewText}>{customer.profile.displayName}</Typography>
        </Grid>
        <Grid item>
          <Typography variant={'caption'} className={classes.previewCaption}>AMOUNT DUE</Typography>
          <Typography variant={'h6'} className={classes.previewText}>${invoice.balanceDue}</Typography>
        </Grid>
        <Grid item>
          <Grid container direction={'column'}>
            <Typography variant={'caption'} align={'right'} className={classes.previewCaption2}>INVOICE #:</Typography>
            <Typography variant={'caption'} align={'right'} className={classes.previewCaption2}>CUSTOMER P.O.:</Typography>
            <Typography variant={'caption'} align={'right'} className={classes.previewCaption2}>DUE DATE:</Typography>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container direction={'column'}>
            <Typography variant={'caption'} align={'right'} className={classes.previewTextSm}>{invoice.invoiceId}</Typography>
            <Typography variant={'caption'} align={'right'} className={classes.previewTextSm}>{customer.address.zipCode}</Typography>
            <Typography variant={'caption'} align={'right'} className={classes.previewTextSm}>{formatedDueDate}</Typography>
          </Grid>
        </Grid>

      </Grid>
      <form  onSubmit={FormikSubmit} >
        <DialogContent classes={{ 'root': classes.dialogContent }}>
          <Grid container direction={'column'} spacing ={1}>

            <Grid item xs={12}>
              <Grid container direction={'row'} spacing={1}>
                <Grid container item justify={'flex-end'} alignItems={'center'} xs={4}>
                  <Typography variant={'button'}>PAYMENT DATE</Typography>
                </Grid>
                <Grid item xs={8}>
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
                <Grid container item justify={'flex-end'} alignItems={'center'} xs={4}>
                  <Typography variant={'button'}>AMOUNT</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    autoComplete={'off'}
                    className={classes.fullWidth}
                    id={'outlined-textarea'}
                    label={''}
                    name={'amount'}
                    onChange={(e: any) => formikChange(e)}
                    type={'text'}
                    value={FormikValues.amount}
                    variant={'outlined'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney style={{ color: '#BDBDBD' }}/>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Grid container direction={'row'} spacing={1}>
                <Grid container item justify={'flex-end'} alignItems={'center'} xs={4}>
                  <Typography variant={'button'}>PAYMENT METHOD</Typography>
                </Grid>
                <Grid item xs={8}>
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
                <Grid container item justify={'flex-end'} alignItems={'center'} xs={4}>
                  <Typography variant={'button'}>REFERENCE NO.</Typography>
                </Grid>
                <Grid item xs={8}>
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
                <Grid container item justify={'flex-end'} alignItems={'flex-start'} xs={4}>
                  <Typography variant={'button'} style={{marginTop: '10px'}}>NOTES</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    autoComplete={'off'}
                    className={classes.fullWidth}
                    id={'outlined-textarea'}
                    label={''}
                    name={'notes'}
                    multiline={true}
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

        <hr/>

        <Grid
          alignItems={'center'}
          container
          justify={'flex-end'} >
          <Grid
            item
            sm={7}>
            <DialogActions classes={{
              'root': classes.dialogActions
            }}>
              <Button
                aria-label={'create-job'}
                classes={{
                  'root': classes.closeButton
                }}
                disabled={isSubmitting}
                onClick={() => closeModal()}
                variant={'outlined'}>
                {'Close'}
              </Button>

              <Button
                disabled={!isValidate()|| isSubmitting}
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

            </DialogActions>
          </Grid>
        </Grid>
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
  .required > label:after {
    margin-left: 3px;
    content: "*";
    color: red;
  }
  .save-customer-button {
    color: ${CONSTANTS.PRIMARY_WHITE};
  }
`;

export default withStyles(
  styles,
  { 'withTheme': true }
)(BcPaymentRecordModal);
