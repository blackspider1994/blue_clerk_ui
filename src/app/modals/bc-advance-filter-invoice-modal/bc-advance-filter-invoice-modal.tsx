import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  Grid,
  TextField,
  withStyles,
  InputAdornment,
  useTheme,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import SwipeableViews from 'react-swipeable-views';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { closeModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import styled from 'styled-components';
import styles from './bc-advance-filter-invoice-modal.styles';
import { useDispatch, useSelector } from 'react-redux';
import * as CONSTANTS from "../../../constants";
import { useFormik } from "formik";
import DropDownMenu, { Option } from "app/components/bc-select-dropdown/bc-select-dropdown";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import BCDateRangePicker from "app/components/bc-date-range-picker/bc-date-range-picker";
import BCTabs from 'app/components/bc-tab/bc-tab';
import { getCustomers } from 'actions/customer/customer.action';
import { getContacts } from 'api/contacts.api';
import { getVendors } from 'actions/vendor/vendor.action';
import { getEmployeesForJobAction } from 'actions/employees-for-job/employees-for-job.action';
import { getJobLocationsAction } from 'actions/job-location/job-location.action';

import {
  PAYMENT_STATUS_OPTIONS,
} from './constants'

import { allStates } from 'utils/constants';
import { applyAdvanceFilterInvoice } from 'actions/advance-filter/advance-filter.action'
import { AdvanceFilterInvoiceState } from 'actions/advance-filter/advance-filter.types'
import BCCircularLoader from 'app/components/bc-circular-loader/bc-circular-loader';


function BCAdvanceFilterInvoiceModal({ classes, handleFilterSubmit, loading = false }: any) {
  const theme = useTheme();
  const customers: any[] = useSelector(({ customers }: any) => customers.data);
  const contacts: any[] = useSelector(({ contacts }: any) => contacts.contacts);
  const subdivisions = useSelector(({ jobLocations }: any) => jobLocations.data);
  const vendors: any[] = useSelector(({ vendors }: any) => vendors.data);
  const employees = useSelector(({ employeesForJob }: any) => employeesForJob.data);
  const advanceFilterInvoiceData: any = useSelector(({ advanceFilterInvoiceState }: any) => advanceFilterInvoiceState)
  const dispatch = useDispatch();
  const [openContactList, setOpenContactList] = useState(false);
  const [curTab, setCurTab] = useState(advanceFilterInvoiceData.dateRangeType);


  const [visibleTabs, setVisibleTabs] = useState<number[]>([advanceFilterInvoiceData.dateRangeType])

  const handleTabChange = (newValue: number) => {
    setCurTab(newValue);
    if (visibleTabs.indexOf(newValue) === -1) setVisibleTabs([...visibleTabs, newValue]);
    FormikSetFieldValue('dateRangeType', newValue);
    FormikSetFieldValue('invoiceDateRange', null);
    FormikSetFieldValue('invoiceDate', null);
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

  useEffect(() => {
    dispatch(getCustomers());
    dispatch(getVendors());
    dispatch(getEmployeesForJobAction());
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>, item: Option, fieldName: string) => {
    FormikSetFieldValue(fieldName, item.value);
  }

  const customerOptions = customers.map((cust: any) => ({ value: cust._id, label: cust.profile.displayName }))
  customerOptions.sort((a, b) => a.label.localeCompare(b.label))

  const contactOptions = contacts.map((contact: any) => ({ value: contact._id, label: contact.name }))
  contactOptions.sort((a, b) => a.label.localeCompare(b.label))

  const subdivisionOptions = subdivisions.map((subdivision: any) => ({ value: subdivision._id, label: subdivision.name }))
  contactOptions.sort((a, b) => a.label.localeCompare(b.label))

  const vendorOptions = vendors.reduce((acc: any[], vendor: any) => {
    if (vendor.status === 1) acc.push({ value: vendor.contractor._id, label: vendor.contractor.info.companyName });
    return acc;
  }, []).sort((a, b) => a.label.localeCompare(b.label));

  const employeeOptions = employees.reduce((acc: any[], employee: any) => {
    acc.push({ value: employee._id, label: employee.profile.displayName });
    return acc;
  }, []).sort((a: any, b: any) => a.label.localeCompare(b.label));

  const technicianOptions = [...employeeOptions, ...vendorOptions]

  const allStatesOptions = allStates.map(state => ({ value: state.name, label: state.name }))

  const form = useFormik<AdvanceFilterInvoiceState>({
    initialValues: {
      checkDateOrRange: advanceFilterInvoiceData.checkDateOrRange,
      dateRangeType: advanceFilterInvoiceData.dateRangeType,
      invoiceDate: advanceFilterInvoiceData.invoiceDate,
      invoiceDateRange: advanceFilterInvoiceData.invoiceDateRange,
      checkInvoiceId: advanceFilterInvoiceData.checkInvoiceId,
      invoiceId: advanceFilterInvoiceData.invoiceId,
      checkJobId: advanceFilterInvoiceData.checkJobId,
      jobId: advanceFilterInvoiceData.jobId,
      checkPoNumber: advanceFilterInvoiceData.checkPoNumber,
      checkMissingPo: advanceFilterInvoiceData.checkMissingPo,
      poNumber: advanceFilterInvoiceData.poNumber,
      checkPaymentStatus: advanceFilterInvoiceData.checkPaymentStatus,
      selectedPaymentStatus: advanceFilterInvoiceData.selectedPaymentStatus,
      checkCustomer: advanceFilterInvoiceData.checkCustomer,
      selectedCustomer: advanceFilterInvoiceData.selectedCustomer,
      checkContact: advanceFilterInvoiceData.checkContact,
      selectedContact: advanceFilterInvoiceData.selectedContact,
      checkTechnician: advanceFilterInvoiceData.checkTechnician,
      selectedTechnician: advanceFilterInvoiceData.selectedTechnician,
      checkLastEmailSentDateRange: advanceFilterInvoiceData.checkLastEmailSentDateRange,
      lastEmailSentDateRange: advanceFilterInvoiceData.lastEmailSentDateRange,
      checkAmountRange: advanceFilterInvoiceData.checkAmountRange,
      amountRangeFrom: advanceFilterInvoiceData.amountRangeFrom,
      amountRangeTo: advanceFilterInvoiceData.amountRangeTo,
      checkSubdivision: advanceFilterInvoiceData.checkSubdivision,
      selectedSubdivision: advanceFilterInvoiceData.selectedSubdivision,
      checkJobAddress: advanceFilterInvoiceData.checkJobAddress,
      jobAddressStreet: advanceFilterInvoiceData.jobAddressStreet,
      jobAddressCity: advanceFilterInvoiceData.jobAddressCity,
      selectedJobAddressState: advanceFilterInvoiceData.selectedJobAddressState,
      jobAddressZip: advanceFilterInvoiceData.jobAddressZip,
      checkBouncedEmails: advanceFilterInvoiceData.checkBouncedEmails
    },
    onSubmit: (values) => {
      dispatch(applyAdvanceFilterInvoice(values));
      setTimeout(() => {
        handleFilterSubmit(values);
      }, 200);
    }
  });

  const {
    'values': FormikValues,
    'handleSubmit': FormikSubmit,
    handleChange: FormikHandleChange,
    setFieldValue: FormikSetFieldValue,
  } = form;

  const {
    checkDateOrRange,
    checkInvoiceId,
    checkJobId,
    checkPoNumber,
    checkMissingPo,
    checkPaymentStatus,
    checkCustomer,
    checkContact,
    checkTechnician,
    checkLastEmailSentDateRange,
    checkAmountRange,
    checkSubdivision,
    checkJobAddress,
    checkBouncedEmails
  } = FormikValues;

  const getContactsData = async (data: any) => {
    const res: any = await dispatch(getContacts(data));
    if (FormikValues.selectedContact && res && res.result && !res.result?.find((contact: any) => contact._id === FormikValues.selectedContact?.value)) {
      FormikSetFieldValue('selectedContact', null)
    }
  }
  const getSubdivisionData = async (customerId: any) => {
    const res: any = await dispatch(getJobLocationsAction({ customerId }));
    if (FormikValues.selectedSubdivision && res && res.result && !res.result?.find((subdivision: any) => subdivision._id === FormikValues.selectedSubdivision?.value)) {
      FormikSetFieldValue('selectedSubdivision', null)
    }
  }

  useEffect(() => {
    if (FormikValues.selectedCustomer && FormikValues.selectedCustomer.value) {
      const data: any = {
        'type': 'Customer',
        'referenceNumber': FormikValues.selectedCustomer.value
      };
      getContactsData(data);
      getSubdivisionData(FormikValues.selectedCustomer.value);
    }
  }, [FormikValues.selectedCustomer]);

  useEffect(() => {
    if (!checkDateOrRange) {
      FormikSetFieldValue('dateRangeType', 0);
      FormikSetFieldValue('invoiceDate', null);
      FormikSetFieldValue('invoiceDateRange', null);
      handleTabChange(0)
    }
    if (!checkInvoiceId) {
      FormikSetFieldValue('invoiceId', '');
    }
    if (!checkJobId) {
      FormikSetFieldValue('jobId', '');
    }
    if (!checkPoNumber) {
      FormikSetFieldValue('poNumber', '');
    }
    if (checkMissingPo) {
      FormikSetFieldValue('checkPoNumber', false);
      FormikSetFieldValue('poNumber', '');
    }
    if (checkBouncedEmails) {
      FormikSetFieldValue('checkBouncedEmails', true);
    }
    if (!checkPaymentStatus) {
      FormikSetFieldValue('selectedPaymentStatus', '');
    }
    if (!checkCustomer) {
      FormikSetFieldValue('selectedCustomer', null);
      FormikSetFieldValue('checkContact', null);
      FormikSetFieldValue('selectedContact', null);
      FormikSetFieldValue('checkSubdivision', null);
      FormikSetFieldValue('selectedSubdivision', null);
    }
    if (!checkContact) {
      FormikSetFieldValue('selectedContact', null);
    }
    if (!checkTechnician) {
      FormikSetFieldValue('selectedTechnician', null);
    }
    if (!checkLastEmailSentDateRange) {
      FormikSetFieldValue('lastEmailSentDateRange', null);
    }
    if (!checkAmountRange) {
      FormikSetFieldValue('amountRangeFrom', '');
      FormikSetFieldValue('amountRangeTo', '');
    }
    if (!checkSubdivision) {
      FormikSetFieldValue('selectedSubdivision', null);
    }
    if (!checkJobAddress) {
      FormikSetFieldValue('jobAddressStreet', '');
      FormikSetFieldValue('jobAddressCity', '');
      FormikSetFieldValue('selectedJobAddressState', '');
      FormikSetFieldValue('jobAddressZip', '');
    }
  }, [
    checkDateOrRange,
    checkInvoiceId,
    checkJobId,
    checkPoNumber,
    checkMissingPo,
    checkPaymentStatus,
    checkCustomer,
    checkContact,
    checkTechnician,
    checkLastEmailSentDateRange,
    checkAmountRange,
    checkSubdivision,
    checkJobAddress,
    checkBouncedEmails
  ]);

  return <DataContainer>
    <hr style={{ height: '1px', background: '#D0D3DC', borderWidth: '0px' }} />

    <form onSubmit={FormikSubmit}>
      <DialogContent classes={{ 'root': classes.dialogContent }}>
        {loading ? (
          <BCCircularLoader heightValue={'200px'} />
        ) : (
          <div>
            <Grid container>
              <Grid item md={6} lg={3} container justify={'center'}>
                <Grid item style={{ maxWidth: 'calc(100% - 20px)' }}>
                  <Checkbox
                    color="primary"
                    className={classes.checkbox}
                    checked={FormikValues.checkDateOrRange}
                    onChange={(e) => FormikSetFieldValue('checkDateOrRange', e.target.checked)}
                  />
                  DATE OR RANGE
                  <div style={{ marginLeft: 20, marginBottom: 30, display: 'block', width: 'calc(100% - 20px)', border: '1px solid #D0D3DC', borderRadius: 8 }}>
                    <BCTabs
                      curTab={curTab}
                      indicatorColor={'primary'}
                      onChangeTab={handleTabChange}
                      variant={'fullWidth'}
                      minWidth={'170px'}
                      disabled={!FormikValues.checkDateOrRange}
                      tabsData={[
                        {
                          'label': 'DATE',
                          'value': 0
                        },
                        {
                          'label': 'RANGE',
                          'value': 1
                        },
                      ]}
                    />
                    <SwipeableViews
                      axis={
                        theme.direction === 'rtl'
                          ? 'x-reverse'
                          : 'x'}
                      index={curTab}>
                      {(visibleTabs.indexOf(0) >= 0 || curTab === 0) ?
                        <div hidden={curTab !== 0} id={"0"} style={{ padding: 20, display: 'flex', justifyContent: 'center' }}>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              autoOk
                              disabled={!FormikValues.checkDateOrRange}
                              onChange={(e) => FormikSetFieldValue('invoiceDate', e)}
                              format={'MM/dd/yy'}
                              variant={'inline'}
                              inputVariant={'outlined'}
                              value={FormikValues.invoiceDate}
                              fullWidth
                              InputProps={{
                                className: classes.datePicker,
                              }}
                            />
                          </MuiPickersUtilsProvider>
                        </div> : <div />
                      }
                      {(visibleTabs.indexOf(1) >= 0 || curTab === 1) ?
                        <div hidden={curTab !== 1} id={"1"} style={{ padding: 20 }}>
                          <BCDateRangePicker
                            biggerButton
                            placement={window.innerWidth < 1500 ? 'bottom-start' : 'right'}
                            disabled={!FormikValues.checkDateOrRange}
                            range={FormikValues.invoiceDateRange}
                            onChange={(e) => FormikSetFieldValue('invoiceDateRange', e)}
                            showClearButton={true}
                            title={'Filter by Date Range...'}
                            classes={{ button: classes.noLeftMargin }}
                          />
                        </div> : <div />
                      }

                    </SwipeableViews>
                  </div>
                </Grid>
              </Grid>
              <Grid item md={6} lg={3} direction='column' style={{justifyContent:'start'}} container justify={'center'}>
                <Grid item style={{ maxWidth: 'calc(100% - 20px)' }}>
                  <Checkbox
                    color="primary"
                    className={classes.checkbox}
                    checked={FormikValues.checkInvoiceId}
                    onChange={(e) => FormikSetFieldValue('checkInvoiceId', e.target.checked)}
                  />
                  INVOICE ID
                  <div className={classes.inputRow}>
                    <CustomTextField
                      variant='outlined'
                      disabled={!FormikValues.checkInvoiceId}
                      onChange={FormikHandleChange}
                      name={'invoiceId'}
                      value={FormikValues.invoiceId}
                    />
                  </div>
                </Grid>
                <Grid item>
                    <Checkbox color="primary"
                      className={classes.checkbox}
                      checked={FormikValues.checkBouncedEmails}
                      onChange={(e) => FormikSetFieldValue('checkBouncedEmails', e.target.checked)} />
                      BOUNCED EMAILS
                </Grid>
              </Grid>
              <Grid item md={6} lg={3} container justify={'center'}>
                <Grid item style={{ maxWidth: 'calc(100% - 20px)' }}>
                  <Checkbox
                    color="primary"
                    className={classes.checkbox}
                    checked={FormikValues.checkJobId}
                    onChange={(e) => FormikSetFieldValue('checkJobId', e.target.checked)}
                  />
                  JOB ID
                  <div className={classes.inputRow}>
                    <CustomTextField
                      variant='outlined'
                      disabled={!FormikValues.checkJobId}
                      onChange={FormikHandleChange}
                      name={'jobId'}
                      value={FormikValues.jobId}
                    />
                  </div>
                </Grid>
              </Grid>
              <Grid item md={6} lg={3} container justify={'center'}>
                <Grid item style={{ maxWidth: 'calc(100% - 20px)' }}>
                  <Grid container>
                    <Grid item xs={8}>
                      <Checkbox
                        color="primary"
                        disabled={FormikValues.checkMissingPo}
                        className={classes.checkbox}
                        checked={FormikValues.checkPoNumber}
                        onChange={(e) => FormikSetFieldValue('checkPoNumber', e.target.checked)}
                      />
                      P.O. NUMBER
                    </Grid>
                    <Grid item xs={4}>
                      <Checkbox
                        color="primary"
                        className={classes.checkbox}
                        checked={FormikValues.checkMissingPo}
                        onChange={(e) => FormikSetFieldValue('checkMissingPo', e.target.checked)}
                      />
                      MISSING P.O.
                    </Grid>
                  </Grid>
                  <div className={classes.inputRow}>
                    <CustomTextField
                      variant='outlined'
                      disabled={!FormikValues.checkPoNumber || FormikValues.checkMissingPo}
                      onChange={FormikHandleChange}
                      name={'poNumber'}
                      value={FormikValues.poNumber}
                    />
                  </div>
                </Grid>
              </Grid>
            </Grid>
            <Grid container>
              <Grid item md={6} lg={3} container justify={'center'}>
                <Grid item style={{ maxWidth: 'calc(100% - 20px)' }}>
                  <Checkbox
                    color="primary"
                    className={classes.checkbox}
                    checked={FormikValues.checkCustomer}
                    onChange={(e) => FormikSetFieldValue('checkCustomer', e.target.checked)}
                  />
                  CUSTOMER
                  <div className={classes.inputRow}>
                    <Autocomplete
                      disabled={!FormikValues.checkCustomer}
                      getOptionLabel={option => option.label || ''}
                      id={'tags-standard'}
                      onChange={(e, item) => FormikSetFieldValue('selectedCustomer', item)}
                      options={customerOptions}
                      renderInput={params =>
                        <TextField
                          required
                          {...params}
                          variant={'outlined'}
                        />
                      }
                      classes={{ root: classes.autocompleteStyle, inputRoot: classes.autoCompleteInputRoot }}
                      value={FormikValues.selectedCustomer}
                    />
                  </div>
                </Grid>
              </Grid>
              <Grid item md={6} lg={3} container justify={'center'}>
                <Grid item style={{ maxWidth: 'calc(100% - 20px)' }}>
                  <Checkbox
                    disabled={!FormikValues.selectedCustomer}
                    color="primary"
                    className={classes.checkbox}
                    checked={FormikValues.checkContact}
                    onChange={(e) => FormikSetFieldValue('checkContact', e.target.checked)}
                  />
                  CUSTOMER CONTACT
                  <div className={classes.inputRow}>
                    <Autocomplete
                      open={openContactList}
                      onInputChange={(_, value) => {
                        if (value.length === 0) {
                          if (openContactList) setOpenContactList(false);
                        } else {
                          if (!openContactList) setOpenContactList(true);
                        }
                      }}
                      onClose={() => setOpenContactList(false)}
                      disabled={!FormikValues.checkContact}
                      getOptionLabel={option => option.label || ''}
                      id={'tags-standard'}
                      onChange={(e, item) => FormikSetFieldValue('selectedContact', item)}
                      options={contactOptions}
                      renderInput={params =>
                        <TextField
                          required
                          {...params}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                          }}
                          variant={'outlined'}
                        />
                      }
                      classes={{ root: classes.autocompleteStyle, inputRoot: classes.autoCompleteInputRoot, endAdornment: classes.autoCompleteEndAdornment }}
                      value={FormikValues.selectedContact}
                    />
                  </div>
                </Grid>
              </Grid>
              <Grid item md={6} lg={3} container justify={'center'}>
                <Grid item style={{ maxWidth: 'calc(100% - 20px)' }}>
                  <Checkbox
                    disabled={!FormikValues.selectedCustomer}
                    color="primary"
                    className={classes.checkbox}
                    checked={FormikValues.checkSubdivision}
                    onChange={(e) => FormikSetFieldValue('checkSubdivision', e.target.checked)}
                  />
                  SUBDIVISION
                  <div className={classes.inputRow}>
                    <Autocomplete
                      disabled={!FormikValues.checkSubdivision}
                      getOptionLabel={option => option.label || ''}
                      id={'tags-standard'}
                      onChange={(e, item) => FormikSetFieldValue('selectedSubdivision', item)}
                      options={subdivisionOptions}
                      renderInput={params =>
                        <TextField
                          required
                          {...params}
                          variant={'outlined'}
                        />
                      }
                      classes={{ root: classes.autocompleteStyle, inputRoot: classes.autoCompleteInputRoot }}
                      value={FormikValues.selectedSubdivision}
                    />
                  </div>
                </Grid>
              </Grid>
              <Grid item md={6} lg={3} container justify={'center'}>
                <Grid item style={{ maxWidth: 'calc(100% - 20px)' }}>
                  <Checkbox
                    color="primary"
                    className={classes.checkbox}
                    checked={FormikValues.checkJobAddress}
                    onChange={(e) => FormikSetFieldValue('checkJobAddress', e.target.checked)}
                  />
                  JOB ADDRESS
                  <div className={classes.inputRow}>
                    <CustomTextField
                      variant='outlined'
                      disabled={!FormikValues.checkJobAddress}
                      onChange={FormikHandleChange}
                      name={'jobAddressStreet'}
                      value={FormikValues.jobAddressStreet}
                      placeholder=""
                    />
                  </div>
                  <div className={classes.inputRow}>
                    <CustomTextField
                      variant='outlined'
                      disabled={!FormikValues.checkJobAddress}
                      onChange={FormikHandleChange}
                      name={'jobAddressCity'}
                      value={FormikValues.jobAddressCity}
                      width={120}
                      placeholder="City"
                    />
                    <div className={classes.separator2} />
                    <DropDownMenu
                      disabled={!FormikValues.checkJobAddress}
                      minwidth='120px'
                      selectedItem={FormikValues.selectedJobAddressState}
                      items={allStatesOptions}
                      fontSize={17}
                      onSelect={(e, item) => handleClick(e, item, 'selectedJobAddressState')}
                      placeholder="State"
                    />
                    <div className={classes.separator2} />
                    <CustomTextField
                      variant='outlined'
                      disabled={!FormikValues.checkJobAddress}
                      onChange={FormikHandleChange}
                      name={'jobAddressZip'}
                      value={FormikValues.jobAddressZip}
                      width={120}
                      placeholder="Zip"
                    />
                  </div>
                </Grid>
              </Grid>
            </Grid>
            <Grid container>
              <Grid item md={6} lg={3} container justify={'center'}>
                <Grid item style={{ maxWidth: 'calc(100% - 20px)' }}>
                  <Checkbox
                    color="primary"
                    className={classes.checkbox}
                    checked={FormikValues.checkPaymentStatus}
                    onChange={(e) => FormikSetFieldValue('checkPaymentStatus', e.target.checked)}
                  />
                  PAYMENT STATUS
                  <div className={classes.inputRow}>
                    <DropDownMenu
                      disabled={!FormikValues.checkPaymentStatus}
                      minwidth={window.innerWidth > 1600 ? '350px' : '260px'}
                      selectedItem={FormikValues.selectedPaymentStatus}
                      items={PAYMENT_STATUS_OPTIONS}
                      fontSize={17}
                      onSelect={(e, item) => handleClick(e, item, 'selectedPaymentStatus')}
                    />
                  </div>
                </Grid>
              </Grid>
              <Grid item md={6} lg={3} container justify={'center'}>
                <Grid item style={{ maxWidth: 'calc(100% - 20px)' }}>
                  <Checkbox
                    color="primary"
                    className={classes.checkbox}
                    checked={FormikValues.checkTechnician}
                    onChange={(e) => FormikSetFieldValue('checkTechnician', e.target.checked)}
                  />
                  TECHNICIAN
                  <div className={classes.inputRow}>
                    <Autocomplete
                      disabled={!FormikValues.checkTechnician}
                      getOptionLabel={option => option.label || ''}
                      id={'tags-standard'}
                      onChange={(e, item) => FormikSetFieldValue('selectedTechnician', item)}
                      options={technicianOptions}
                      renderInput={params =>
                        <TextField
                          required
                          {...params}
                          variant={'outlined'}
                        />
                      }
                      classes={{ root: classes.autocompleteStyle, inputRoot: classes.autoCompleteInputRoot }}
                      value={FormikValues.selectedTechnician}
                    />
                  </div>
                </Grid>
              </Grid>
              <Grid item md={6} lg={3} container justify={'center'}>
                <Grid item style={{ maxWidth: 'calc(100% - 20px)' }}>
                  <Checkbox
                    color="primary"
                    className={classes.checkbox}
                    checked={FormikValues.checkAmountRange}
                    onChange={(e) => FormikSetFieldValue('checkAmountRange', e.target.checked)}
                  />
                  AMOUNT RANGE
                  <div className={classes.inputRow}>
                    <CustomTextField
                      variant='outlined'
                      disabled={!FormikValues.checkAmountRange}
                      onChange={FormikHandleChange}
                      name={'amountRangeFrom'}
                      value={FormikValues.amountRangeFrom}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      placeholder=""
                      width={180}
                    />
                    <div className={classes.separator}>to</div>
                    <CustomTextField
                      variant='outlined'
                      disabled={!FormikValues.checkAmountRange}
                      onChange={FormikHandleChange}
                      name={'amountRangeTo'}
                      value={FormikValues.amountRangeTo}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      placeholder=""
                      width={180}
                    />
                  </div>
                </Grid>
              </Grid>
              <Grid item md={6} lg={3} container justify={'center'}>
                <Grid item style={{ width: 'calc(100% - 20px)' }}>
                  <Checkbox
                    color="primary"
                    className={classes.checkbox}
                    checked={FormikValues.checkLastEmailSentDateRange}
                    onChange={(e) => FormikSetFieldValue('checkLastEmailSentDateRange', e.target.checked)}
                  />
                  LAST EMAIL SENT DATE RANGE
                  <div style={{
                    paddingLeft: 20,
                    width: window.innerWidth > 1600 ? '100%' : '280px',
                  }}>
                    <BCDateRangePicker
                      biggerButton
                      preventOverflow
                      disabled={!FormikValues.checkLastEmailSentDateRange}
                      range={FormikValues.lastEmailSentDateRange}
                      onChange={(e) => FormikSetFieldValue('lastEmailSentDateRange', e)}
                      showClearButton={true}
                      title={'Filter by Date Range...'}
                      classes={{ button: classes.noLeftMargin }}
                    />
                  </div>
                </Grid>
              </Grid>
            </Grid>

          </div>
        )
        }
      </DialogContent>

      <hr style={{ height: '1px', background: '#D0D3DC', borderWidth: '0px' }} />
      <DialogActions classes={{
        'root': classes.dialogActions
      }}>
        <Grid
          container
          justify={'space-between'}>
          <Grid item />
          <Grid item>
            <Button
              disabled={loading}
              aria-label={'cancel'}
              classes={{
                'root': classes.closeButton
              }}
              onClick={closeModal}
              variant={'outlined'}>
              Cancel
            </Button>

            <Button
              disabled={loading}
              aria-label={'run-report'}
              classes={{
                root: classes.submitButton,
                disabled: classes.submitButtonDisabled || loading
              }}
              color="primary"
              type={'submit'}
              variant={'contained'}>
              Apply
            </Button>
          </Grid>


        </Grid>
      </DialogActions>
    </form>

  </DataContainer>;

}

const CustomTextField: any = withStyles({
  root: {
    width: (props: any) => props.width || 390,
    '& .MuiOutlinedInput-root': {
      height: 43,
      '& fieldset': {
        borderWidth: 1,
        borderRadius: 8,
        borderColor: '#BDBDBD',
      },
      '&:hover fieldset': {
        borderColor: '#BDBDBD',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#00aaff',
      },
      '&.Mui-disabled fieldset': {
        borderColor: '#E0E0E0',
      },
    },
  },
})(TextField);

const Row = styled.div`
  display: flex;
`

const Col = styled.div`
  flex: 1;
`

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
    padding: 5px 14px;
    align-items: flex-start;
  }
`;

export default withStyles(
  styles,
  { 'withTheme': true }
)(BCAdvanceFilterInvoiceModal);
