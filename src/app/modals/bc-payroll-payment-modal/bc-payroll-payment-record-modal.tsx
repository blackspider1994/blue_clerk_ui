// Import * as Yup from 'yup';
import * as CONSTANTS from '../../../constants';
import BCDateTimePicker from 'app/components/bc-date-time-picker/bc-date-time-picker';
import BCSent from '../../components/bc-sent';
import styles from './bc-payroll-payment-modal.styles';
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
  withStyles,
  useTheme,
} from '@material-ui/core';
import React, {useState, useEffect} from 'react';
import { closeModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import InputAdornment from "@material-ui/core/InputAdornment";
import { error } from "../../../actions/snackbar/snackbar.action";
import {PAYMENT_TYPES} from "../../../utils/constants";
import {formatCurrency, formatDateYMD} from "../../../helpers/format";
import BCDateRangePicker
  from "../../components/bc-date-range-picker/bc-date-range-picker";
import {
  removeContractor, updateContractorPayment
} from "../../../actions/payroll/payroll.action";
import {
  recordPaymentContractorAPI,
  updatePaymentContractorAPI,
  recordAdvancePaymentContractorAPI,
  updateAdvancePaymentContractorAPI,
} from "../../../api/payroll.api";
import {updateVendorPayment} from "../../../actions/vendor/vendor.action";
import BCTabs2 from 'app/components/bc-tab2/bc-tab2';
import SwipeableViews from 'react-swipeable-views';
import {refreshContractorPayment} from "../../../actions/payroll/payroll.action";
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';

function BcPayrollPaymentRecordModal({
  classes,
  payroll,
  dateRange,
  payment,
  advancePayment,
}: any): JSX.Element {
  const [sent, setSent] = useState(false);
  const [sentAdvance, setSentAdvance] = useState(false);
  const [curTab, setCurTab] = useState(advancePayment ? 1 : 0);
  const dispatch = useDispatch();
  const theme = useTheme();

  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const isValidate = () => {
    const amount = FormikValues.amount ?? 0;
    return (amount >= 0);
  };

  const isValidateAdvance = () => {
    const amount = FormikValuesAdvance.amount ?? 0;
    return (amount > 0);
  };

  const findPaymentTypeIndex = (paymentType: string) => {
    if (paymentType === undefined) return -1;
    const i = PAYMENT_TYPES.findIndex((type) => type.name === paymentType);
    return i;
  }

  const amountValue = payroll.commissionTotal > payroll.creditAvailable ? payroll.commissionTotal - payroll.creditAvailable : 0;
  const creditUsedValue = payroll.commissionTotal > payroll.creditAvailable ? payroll.creditAvailable : payroll.commissionTotal;

  const form = useFormik({
    initialValues: {
      paymentDate: payment ? new Date(payment.paidAt) : new Date(),
      amount: payment ? payment.amountPaid : Math.round(amountValue * 100) / 100,
      creditUsed: creditUsedValue, 
      paymentMethod: findPaymentTypeIndex(payment?.paymentType),
      referenceNumber: payment?.referenceNumber || '',
      notes: payment?.note || ''
    },
    onSubmit: async(values: any, { setSubmitting }: any) => {
      setSubmitting(true);

      const params: any = {
        id: payroll._id,
        type: payroll.type,
        amount: FormikValues.amount ?? 0,
        creditUsed: FormikValues.creditUsed ?? 0,
        offset: new Date().getTimezoneOffset() / 60,
        paidAt: formatDateYMD(FormikValues.paymentDate),
        note: FormikValues.notes,
        companyLocation: payroll.companyLocation,
        workType: payroll.workType,
      }

      if (FormikValues.referenceNumber)
        params.referenceNumber = FormikValues.referenceNumber;

      if (FormikValues.paymentMethod >= 0)
        params.paymentType = PAYMENT_TYPES.filter((type) => type._id == FormikValues.paymentMethod)[0].name;

      if (dateRange) {
        params.startDate = formatDateYMD(dateRange.startDate);
        params.endDate = formatDateYMD(dateRange.endDate);
      }
      
      try {
        if (payment) {
          params.paymentId = payment._id;
          const response = await updatePaymentContractorAPI(params);
          if (response.status === 1) {
            setSent(true);
            dispatch(updateContractorPayment(response.payment));
            dispatch(updateVendorPayment(response.payment));
          } else {
            dispatch(error(response.message))
          }
        } else {
          if (payroll.invoiceIds) params.invoiceIds = `["${payroll.invoiceIds.join('","')}"]`;
          if (payroll.jobIds) params.jobIds = `["${payroll.jobIds.join('","')}"]`;
          console.log(payroll)
          const response = await recordPaymentContractorAPI(params);
          if (response.status === 1) {
            setSent(true);
            dispatch(removeContractor(payroll));
          } else {
            dispatch(error(response.message))
          }
        }
        setSubmitting(false);
      } catch(e) {
        let message = 'Unknown Error'
        if (error instanceof Error) {
          message = error.message
        }
        dispatch(error(message));
        setSubmitting(false);
      }
    }
  });

  const {
    'values': FormikValues,
    'handleChange': formikChange,
    'handleSubmit': FormikSubmit,
    setFieldValue,
    isSubmitting
  } = form;

  const renderPayrollTab = () => (
    <>
      {sent ?
        <BCSent showLine={false} title={payment ? 'The payment was updated.' : 'The payment was recorded.'} />
        :
        <Grid container className={classes.modalPreview} justify={'space-around'}>
          <Grid item>
            <Typography variant={'caption'} className={classes.previewCaption}>VENDOR</Typography>
            <Typography variant={'h6'} className={classes.previewText} style={{maxWidth: 120}}>{payroll.vendor}</Typography>
          </Grid>
          <Grid item>
            <Typography variant={'caption'} className={classes.previewCaption}>TIME PERIOD</Typography>
            <Typography variant={'h6'} className={classes.previewText}>
              <BCDateRangePicker
                noDay
                range={dateRange}
                disabled={true}
              />
            </Typography>
          </Grid>
          {!!payroll.creditAvailable && (
            <>
              <Grid item>
                <Typography variant={'caption'} className={classes.previewCaption}>TOTAL AMOUNT</Typography>
                <Typography variant={'h6'} className={classes.previewText}>
                  {formatCurrency(payroll.commissionTotal || payment?.amountPaid)}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant={'caption'} className={classes.previewCaption}>AMOUNT ADVANCED</Typography>
                <Typography variant={'h6'} className={classes.previewText}>
                  {formatCurrency(payroll.creditAvailable)}
                </Typography>
              </Grid>
            </>
          )}
          <Grid item>
            <Typography variant={'caption'} className={classes.previewCaption}>TOTAL BALANCE</Typography>
            <Typography variant={'h6'} className={classes.previewText}>
              {formatCurrency(payroll.commissionTotal-payroll.creditAvailable || payment?.amountPaid)}
            </Typography>
          </Grid>
        </Grid>
      }

      <form onSubmit={FormikSubmit}>
        {!sent &&
          <>
            <DialogContent classes={{ 'root': classes.dialogContent }}>
              <Grid container direction={'column'} spacing={1}>

                <Grid item xs={12}>
                  <Grid container direction={'row'} spacing={1}>
                    <Grid container item justify={'flex-end'} alignItems={'center'} xs={3}>
                      <Typography variant={'button'}>PAYMENT DATE</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <div style={{ width: '70%' }}>
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
                      <Typography variant={'button'}>AMOUNT TO BE PAID</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <TextField
                        autoFocus
                        disabled
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
                              <AttachMoney style={{ color: '#BDBDBD' }} />
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
                        {PAYMENT_TYPES.map((option) => (
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
                      <Typography variant={'button'} style={{ marginTop: '10px' }}>NOTES</Typography>
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
            aria-label={'close-payment'}
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
              aria-label={'record-payment'}
              classes={{
                root: classes.submitButton,
                disabled: classes.submitButtonDisabled
              }}
              color="primary"
              type={'submit'}
              variant={'contained'}>
              Save
            </Button>
          }

        </DialogActions>
      </form>
    </>
  );

  const closeModal = () => {
    dispatch(closeModalAction());
    setTimeout(() => {
      dispatch(setModalDataAction({
        'data': {},
        'type': ''
      }));
    }, 200);
  };

  const formAdvance = useFormik({
    initialValues: {
      paymentDate: advancePayment ? new Date(advancePayment.paidAt) : new Date(),
      appliedAt: advancePayment ? new Date(advancePayment.appliedAt) : new Date(),
      amount: advancePayment ? advancePayment.amountPaid : 0,
      paymentMethod: findPaymentTypeIndex(advancePayment?.paymentType),
      referenceNumber: advancePayment?.referenceNumber || '',
      notes: advancePayment?.note || ''
    },
    onSubmit: async(values: any, { setSubmitting }: any) => {
      setSubmitting(true);

      const params: any = {
        id: payroll._id,
        type: payroll.type,
        amount: FormikValuesAdvance.amount ?? 0,
        paidAt: formatDateYMD(FormikValuesAdvance.paymentDate),
        appliedAt: formatDateYMD(FormikValuesAdvance.appliedAt),
        note: FormikValuesAdvance.notes,
        companyLocation: payroll.companyLocation,
        workType: payroll.workType,
      }

      if (FormikValuesAdvance.referenceNumber)
        params.referenceNumber = FormikValuesAdvance.referenceNumber;

      if (FormikValuesAdvance.paymentMethod >= 0)
        params.paymentType = PAYMENT_TYPES.filter((type) => type._id == FormikValuesAdvance.paymentMethod)[0].name;

      try {
        if (advancePayment) {
          params.advancePaymentId = advancePayment._id;
          const response = await updateAdvancePaymentContractorAPI(params);
          if (response.status === 1) {
            setSentAdvance(true);
            dispatch(updateContractorPayment(response.payment));
            dispatch(updateVendorPayment(response.payment));
            dispatch(refreshContractorPayment(true));
          } else {
            dispatch(error(response.message))
          }
        } else {
          const response = await recordAdvancePaymentContractorAPI(params);
          if (response.status === 1) {
            setSentAdvance(true);
            dispatch(refreshContractorPayment(true));
          } else {
            dispatch(error(response.message))
          }
        }
        setSubmitting(false);
      } catch(e) {
        let message = 'Unknown Error'
        if (error instanceof Error) {
          message = error.message
        }
        dispatch(error(message));
        setSubmitting(false);
      }
    }
  });

  const {
    'values': FormikValuesAdvance,
    'handleChange': formikChangeAdvance,
    'handleSubmit': FormikSubmitAdvance,
    'setFieldValue': setFieldValueAdvance,
    'isSubmitting': isSubmittingAdvance
  } = formAdvance;

  useEffect(() => {
    if(advancePayment){
      formAdvance.setFieldValue('paymentDate', new Date(advancePayment.paidAt))
      formAdvance.setFieldValue('appliedAt', new Date(advancePayment.appliedAt))
      formAdvance.setFieldValue('amount', advancePayment.amountPaid)
      formAdvance.setFieldValue('paymentMethod', findPaymentTypeIndex(advancePayment.paymentType))
      formAdvance.setFieldValue('referenceNumber', advancePayment.referenceNumber || '')
      formAdvance.setFieldValue('notes', advancePayment.note || '')
    }
  }, [curTab])
  

  const handleTabChange = (newValue: number) => {
    if(sent || sentAdvance){
      return
    }
    setCurTab(newValue);
  };

  const renderAdvanceTab = () => (
    <>
      {sentAdvance ?
        <BCSent showLine={false} title={advancePayment ? 'The advance payment was updated.' : 'The advance payment was recorded.'} />
        :
        <Grid container className={classes.modalPreview} justify={'space-around'}>

          <Grid item xs={3}/>
          <Grid item xs={6}>
            <Typography variant={'caption'} className={classes.previewCaption}>VENDOR</Typography>
            <Typography variant={'h6'} className={classes.previewText}>{payroll.vendor}</Typography>
          </Grid>
          <Grid item xs={3}/>
        </Grid>
      }

      <form onSubmit={FormikSubmitAdvance}>
        {!sentAdvance &&
          <>
            <DialogContent classes={{ 'root': classes.dialogContent }}>
              <Grid container direction={'column'} spacing={1}>

                <Grid item xs={12}>
                  <Grid container direction={'row'} spacing={1}>
                    <Grid container item justify={'flex-end'} alignItems={'center'} xs={3}>
                      <Typography variant={'button'}>PAYMENT DATE</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <div style={{ width: '70%' }}>
                        <BCDateTimePicker
                          handleChange={(e: any) => setFieldValueAdvance('paymentDate', e)}
                          name={'paymentDate'}
                          value={FormikValuesAdvance.paymentDate}
                        />
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container direction={'row'} spacing={1}>
                    <Grid container item justify={'flex-end'} alignItems={'center'} xs={3}>
                      <Typography variant={'button'}>DATE TO APPLY</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <div style={{ width: '70%' }}>
                        <BCDateTimePicker
                          handleChange={(e: any) => setFieldValueAdvance('appliedAt', e)}
                          name={'appliedAt'}
                          value={FormikValuesAdvance.appliedAt}
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
                        onChange={(e: any) => formikChangeAdvance(e)}
                        type={'number'}
                        value={FormikValuesAdvance.amount}
                        variant={'outlined'}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoney style={{ color: '#BDBDBD' }} />
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
                        onChange={(e: any) => formikChangeAdvance(e)}
                        select
                        value={FormikValuesAdvance.paymentMethod}
                        variant={'outlined'}
                        placeholder='Select payment method'
                      >
                        <MenuItem value='-1' disabled>
                          Select payment method
                        </MenuItem>
                        {PAYMENT_TYPES.map((option) => (
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
                        onChange={formikChangeAdvance}
                        type={'text'}
                        value={FormikValuesAdvance.referenceNumber}
                        variant={'outlined'}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Grid container direction={'row'} spacing={1}>
                    <Grid container item justify={'flex-end'} alignItems={'flex-start'} xs={3}>
                      <Typography variant={'button'} style={{ marginTop: '10px' }}>NOTES</Typography>
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
                        onChange={(e: any) => formikChangeAdvance(e)}
                        type={'text'}
                        value={FormikValuesAdvance.notes}
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
            aria-label={'close-advance-payment'}
            classes={{
              'root': classes.closeButton
            }}
            disabled={isSubmittingAdvance}
            onClick={() => closeModal()}
            variant={'outlined'}>
            Close
          </Button>

          {!sentAdvance &&
            <Button
              disabled={!isValidateAdvance() || isSubmittingAdvance}
              aria-label={'record-advance-payment'}
              classes={{
                root: classes.submitButton,
                disabled: classes.submitButtonDisabled
              }}
              color="primary"
              type={'submit'}
              variant={'contained'}>
              Save
            </Button>
          }

        </DialogActions>
      </form>
    </>
  );

  return (
    <DataContainer className={'new-modal-design'} style={{borderTop: '1px solid #C4C4C4'}}>
      <BCTabs2
        curTab={curTab}
        indicatorColor={'primary'}
        onChangeTab={handleTabChange}
        tabsData={[
          {
            'label': 'PAYROLL',
            'value': 0,
            'disabled': !!sentAdvance || !!advancePayment,
          },
          {
            'label': 'ADVANCE',
            'value': 1,
            'disabled': !!sent || !!payment,
          },
        ]}
      />
      <div className={'modalDataContainer'} style={{ maxHeight: sent || sentAdvance ? '54vh' : '70vh', overflow:  sent || sentAdvance ? 'hidden' : 'auto'}}>
        <SwipeableViews
          axis={theme.direction === "rtl" ? "x-reverse" : "x"}
          index={curTab}
          disabled
          slideStyle={{ overflow: 'hidden' }}
        >
          {renderPayrollTab()}
          {renderAdvanceTab()}
        </SwipeableViews>
      </div>

    </DataContainer >
  );
}
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
)(BcPayrollPaymentRecordModal);
