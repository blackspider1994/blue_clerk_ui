import * as CONSTANTS from '../../../constants';
import { LIGHT_GREY, PRIMARY_BLUE } from '../../../constants';
import styles from './bc-company-location-modal.styles';
import { useFormik } from 'formik';
import {
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
  withStyles
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import {
  closeModalAction,
  openModalAction,
  setModalDataAction
} from 'actions/bc-modal/bc-modal.action';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  Business as BusinessIcon,
  Cancel as CancelIcon
} from "@material-ui/icons";
import classnames from "classnames";
import BCSwitch from "../../components/bc-switch";
import '../../../scss/job-poup.scss';
import * as Yup from "yup";
import { emailRegExp, phoneRegExp, zipCodeRegExp } from "../../../helpers/format";
import {
  AddCompanyLocationAction,
  UpdateCompanyLocationAction
} from "../../../actions/user/user.action";
import { CompanyLocation } from "../../../actions/user/user.types";
import BCSent from "../../components/bc-sent";
import { allStates } from "../../../utils/constants";
import AutoComplete from "../../components/bc-autocomplete/bc-autocomplete_2";
import { Autocomplete, createFilterOptions } from '@material-ui/lab';
import { getWorkType } from 'actions/work-type/work-type.action';
import { getContractors } from 'actions/payroll/payroll.action';
import Geocode from "react-geocode";
import Config from "../../../config";

const companyLocationSchema = Yup.object().shape({
  locationName: Yup.string().required('Required'),
  contactEmail: Yup.string().matches(emailRegExp, 'Email address is not valid'),
  contactNumber: Yup.string().matches(phoneRegExp, 'Phone number is not valid'),
  zipCode: Yup.string().matches(zipCodeRegExp, 'Zip code is not valid'),
});

interface API_PARAMS {
  companyLocationId?: string;
  name: string;
  isMainLocation: string;
  isActive: string;
  isAddressAsBillingAddress: string;
  contactName?: string;
  email?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;
  billingEmailSender?: string;
  phone?: string;
  workTypes?: string[];
  assignedVendors?: {
    vendorId: string,
    workTypes: string[]
  }[];
  assignedEmployees?: {
    employeeId: string,
    workTypes: string[]
  }[];
  coordinates?: {
    lat: number,
    lng: number
  }
}


function BCCompanyLocationModal({
  classes,
  companyLocation,
  companyLocationList,
}: { classes: any, companyLocation: CompanyLocation, companyLocationList: CompanyLocation[] }): JSX.Element {
  const [showWarning, setShowWarning] = useState(false);
  const dispatch = useDispatch();

  const workTypes = useSelector((state: any) => state.workTypes.data);
  const [openWarning, setOpenWarning] = useState(false);

  useEffect(() => {
    dispatch(getWorkType())
    dispatch(getContractors())
  }, [companyLocation]);


  const form = useFormik({
    initialValues: {
      id: companyLocation?._id || '',
      locationName: companyLocation?.name || '',
      isMainLocation: companyLocation?.isMainLocation ?? false,
      divisionName: '',
      contactName: companyLocation?.contactName || '',
      contactNumber: companyLocation?.contact?.phone || '',
      contactEmail: companyLocation?.info?.companyEmail || '',
      fax: '',
      street: companyLocation?.address?.street || '',
      city: companyLocation?.address?.city || '',
      state: allStates.find((state) => state.name === companyLocation?.address?.state),
      zipCode: companyLocation?.address?.zipCode || '',
      isActive: companyLocation?.isActive ?? true,
      workTypes: companyLocation?.workTypes || [],
      isAddressAsBillingAddress: companyLocation?.isAddressAsBillingAddress ?? false,
      billingStreet: companyLocation?.billingAddress?.street || '',
      billingCity: companyLocation?.billingAddress?.city || '',
      billingState: allStates.find((state) => state.name === companyLocation?.billingAddress?.state),
      billingZipCode: companyLocation?.billingAddress?.zipCode ?? '',
      emailSender: companyLocation?.billingAddress?.emailSender ?? '',
    },
    onSubmit: async (values: any, { setSubmitting }: any) => {
      let workTypes = FormikValues.workTypes.map(res => res._id);
      let oldAssignedVendors: any[] = [];
      let oldAssignedEmployee: any[] = [];

      if (companyLocation?.assignedEmployees) {
        let filteredAssignedEmployees = companyLocation.assignedEmployees?.filter(res => {
          return res.workTypes.filter((workType: any) => workTypes.includes(workType?._id))?.length
        });

        oldAssignedEmployee = filteredAssignedEmployees?.map(res => {
          let filteredWorkTypes = res.workTypes.filter((workType: any) => workTypes.includes(workType?._id))
          return {
            employeeId: res?.employee?._id,
            workTypes: filteredWorkTypes?.map((workType: any) => workType?._id)
          }
        });
      }

      if (companyLocation?.assignedVendors) {
        let filteredAssignedVendors = companyLocation.assignedVendors?.filter(res => {
          return res.workTypes.filter((workType: any) => workTypes.includes(workType?._id))?.length
        });

        oldAssignedVendors = filteredAssignedVendors?.map(res => {
          let filteredWorkTypes = res.workTypes.filter((workType: any) => workTypes.includes(workType?._id))
          return {
            vendorId: res?.vendor?._id,
            workTypes: filteredWorkTypes?.map((workType: any) => workType?._id)
          }
        });
      }

      const params: API_PARAMS = {
        companyLocationId: FormikValues.id,
        name: FormikValues.locationName,
        isMainLocation: FormikValues.isMainLocation.toString(),
        isActive: FormikValues.isActive.toString(),
        contactName: FormikValues.contactName,
        email: FormikValues.contactEmail,
        street: FormikValues.street,
        city: FormikValues.city,
        state: FormikValues.state?.name || '',
        zipCode: FormikValues.zipCode,
        phone: FormikValues.contactNumber,
        workTypes: workTypes,
        isAddressAsBillingAddress: FormikValues.isAddressAsBillingAddress.toString(),
        billingStreet: FormikValues.billingStreet,
        billingCity: FormikValues.billingCity,
        billingState: FormikValues.billingState?.name || '',
        billingZipCode: FormikValues.billingZipCode,
        billingEmailSender: FormikValues.emailSender,
        assignedVendors: oldAssignedVendors,
        assignedEmployees: oldAssignedEmployee,
      };

      //Update the billing addres if address has changed
      if (FormikValues.isAddressAsBillingAddress) {
        params.billingStreet = FormikValues.street;
        params.billingCity = FormikValues.city;
        params.billingState = FormikValues.state?.name || '';
        params.billingZipCode = FormikValues.zipCode
      }

      Geocode.setApiKey(Config.REACT_APP_GOOGLE_KEY);

      if (params.state ||  params.zipCode) {
        const address = `${params.street} ${params.city} ${params.state} ${params.zipCode} USA`;
        const mapResponse = await Geocode.fromAddress(address);
        const {lat, lng} = mapResponse?.results[0]?.geometry?.location || {};
        params.coordinates = {lat, lng};
      }

      Object.entries(params).forEach(([key, value]) => {
        if (typeof value === 'string' && value === '') {
          // @ts-ignore
          delete params[key]
        }
      })

      if (companyLocation?._id) {
        dispatch(UpdateCompanyLocationAction(params, (status) => {
          if (status) {
            closeModal();
          }else {
            setSubmitting(false);
            setShowWarning(false);
          }
        }))
      } else {
        dispatch(AddCompanyLocationAction(params, (status) => {
          if (status){
            closeModal();
          }else {
            setSubmitting(false);
            setShowWarning(false);
          }
        }))
      }
    },
    validationSchema: companyLocationSchema,
  });

  const {
    'errors': FormikErrors,
    'values': FormikValues,
    'handleChange': formikChange,
    'handleSubmit': FormikSubmit,
    setFieldValue,
    submitForm,
    isSubmitting,
    touched,
    setFieldTouched,
  } = form;

  const changeField = (name: string, value: any) => {
    setFieldValue(name, value);
    setFieldTouched(name, true);
  }

  const validateNumber = (field: string, value: string, max: number) => {
    if (value.length <= max) setFieldValue(field, value);
  }

  const handleSubmit = () => {
    if (touched.isMainLocation && FormikValues.isMainLocation && !showWarning) {
      setShowWarning(true);
      return;
    } else {
      if (FormikValues.workTypes.length && (!companyLocationList.length || (companyLocationList.length && !companyLocationList.filter((res: any) => res.workTypes?.length).length))) {
        setOpenWarning(true);
        dispatch(setModalDataAction({
          'data': {
            action: submitForm
          },
          'type': CONSTANTS.modalTypes.DIVISION_WARNING_MODAL
        }));
        setTimeout(() => {
          dispatch(openModalAction());
        }, 200);
      } else {
        submitForm();
      }
    }
  }

  const closeModal = () => {
    dispatch(closeModalAction());
    setTimeout(() => {
      dispatch(setModalDataAction({
        'data': {},
        'type': ''
      }));
    }, 200);
  };

  const stateFilterOptions = createFilterOptions({
    stringify: (option: any) => option.name + option.abbreviation,
  });

  const handleSetBillingAdress = (isChecked:boolean) =>{
    changeField('isAddressAsBillingAddress', isChecked);
    changeField('billingStreet', isChecked ? FormikValues.street : "");
    changeField('billingCity', isChecked ? FormikValues.city : "");
    changeField('billingState', isChecked ? FormikValues.state : "");
    changeField('billingZipCode', isChecked ? FormikValues.zipCode : "");
  }

  return (
    <DataContainer className={'new-modal-design'} style={{ marginTop: -20 }}>
      {showWarning ?
        <BCSent
          title={`Are you sure you want to set ${FormikValues.locationName} as your Default Headquarters?`}
          type={'warning'}
          color={PRIMARY_BLUE}
        />
        :
        <form onSubmit={FormikSubmit}>
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingRight: 30
          }}>
            <BCSwitch
              isActive={FormikValues.isActive}
              onChange={() => changeField('isActive', !FormikValues.isActive)}
              activeText={'Active'}
              inactiveText={'Inactive'}
            />
          </div>

          <Typography
            className={classes.dialogTitle}
            variant={'h6'}>
            <strong>{companyLocation?._id ? 'Edit' : 'Add New'} Location</strong>
          </Typography>
          <Grid container className={classes.modalPreview}
            justify={'space-around'}>
            <Grid item xs={12}>
              <Grid container direction={'row'} spacing={1}>
                <Grid container item justify={'flex-end'} style={{ marginTop: 8 }}
                  xs={3}>
                  <Typography variant={'button'}>LOCATION NAME</Typography>
                </Grid>
                <Grid item xs={9}>
                  <TextField
                    autoFocus
                    autoComplete={'off'}
                    className={classes.fullWidth}
                    id={'outlined-textarea'}
                    label={''}
                    name={'locationName'}
                    onChange={(e: any) => formikChange(e)}
                    type={'text'}
                    value={FormikValues.locationName}
                    variant={'outlined'}
                    error={!!FormikErrors.locationName && touched.locationName}
                    helperText={FormikErrors.locationName}
                  />
                </Grid>
              </Grid>

              <Grid container direction={'row'} spacing={1}>
                <Grid container item justify={'flex-end'} alignItems={'center'} xs={3}>
                  <Typography variant={'button'}></Typography>
                </Grid>
                <Grid item xs={9}>
                  <Button
                    classes={{ root: classnames(classes.hqButton, { [classes.hqButtonActive]: FormikValues.isMainLocation }) }}
                    onClick={() => changeField('isMainLocation', true)}
                    variant={'outlined'}
                    endIcon={FormikValues.isMainLocation ? <CancelIcon
                      style={{ color: LIGHT_GREY }}
                      onClick={(e) => {
                        changeField('isMainLocation', false);
                        e.stopPropagation();
                      }} /> : null}
                  >Set as Main</Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <>
            <DialogContent classes={{ 'root': classes.dialogContent }}>
              <Grid container direction={'column'} spacing={1}>

                {/*<Grid item xs={12}>*/}
                {/*  <Grid container direction={'row'} spacing={1}>*/}
                {/*    <Grid container item justify={'flex-end'}*/}
                {/*          alignItems={'center'} xs={3}>*/}
                {/*      <Typography variant={'button'}>DIVISION NAME</Typography>*/}
                {/*    </Grid>*/}
                {/*    <Grid item xs={9}>*/}
                {/*      <TextField*/}
                {/*        autoFocus*/}
                {/*        autoComplete={'off'}*/}
                {/*        className={classes.fullWidth}*/}
                {/*        id={'outlined-textarea'}*/}
                {/*        label={''}*/}
                {/*        name={'divisionName'}*/}
                {/*        onChange={(e: any) => formikChange(e)}*/}
                {/*        type={'text'}*/}
                {/*        value={FormikValues.divisionName}*/}
                {/*        variant={'outlined'}*/}
                {/*      />*/}
                {/*    </Grid>*/}
                {/*  </Grid>*/}
                {/*</Grid>*/}

                <Grid item xs={12}>
                  <Grid container direction={'row'} spacing={1}>
                    <Grid container item justify={'flex-end'}
                      alignItems={'center'} xs={3}>
                      <Typography variant={'button'}>CONTACT NAME</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <TextField
                        autoComplete={'off'}
                        className={classes.fullWidth}
                        id={'outlined-textarea'}
                        label={''}
                        name={'contactName'}
                        onChange={formikChange}
                        type={'text'}
                        value={FormikValues.contactName}
                        variant={'outlined'}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Grid container direction={'row'} spacing={1}>
                    <Grid container item justify={'flex-end'}
                      style={{ marginTop: 8 }} xs={3}>
                      <Typography variant={'button'}>CONTACT NUMBER</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <TextField
                        autoComplete={'off'}
                        className={classes.fullWidth}
                        id={'outlined-textarea'}
                        label={''}
                        name={'contactNumber'}
                        onChange={(e) => validateNumber('contactNumber', e.target.value, 10)}
                        type={'number'}
                        value={FormikValues.contactNumber}
                        variant={'outlined'}
                        error={!!FormikErrors.contactNumber}
                        helperText={FormikErrors.contactNumber}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Grid container direction={'row'} spacing={1}>
                    <Grid container item justify={'flex-end'}
                      style={{ marginTop: 8 }} xs={3}>
                      <Typography variant={'button'}>CONTACT EMAIL</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <TextField
                        autoComplete={'off'}
                        className={classes.fullWidth}
                        id={'outlined-textarea'}
                        label={''}
                        name={'contactEmail'}
                        onChange={formikChange}
                        type={'email'}
                        value={FormikValues.contactEmail}
                        variant={'outlined'}
                        error={!!FormikErrors.contactEmail}
                        helperText={FormikErrors.contactEmail}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/*<Grid item xs={12}>*/}
                {/*  <Grid container direction={'row'} spacing={1}>*/}
                {/*    <Grid container item justify={'flex-end'}*/}
                {/*          alignItems={'center'} xs={3}>*/}
                {/*      <Typography variant={'button'}>FAX</Typography>*/}
                {/*    </Grid>*/}
                {/*    <Grid item xs={9}>*/}
                {/*      <TextField*/}
                {/*        autoComplete={'off'}*/}
                {/*        className={classes.fullWidth}*/}
                {/*        id={'outlined-textarea'}*/}
                {/*        label={''}*/}
                {/*        name={'fax'}*/}
                {/*        onChange={formikChange}*/}
                {/*        type={'number'}*/}
                {/*        value={FormikValues.fax}*/}
                {/*        variant={'outlined'}*/}
                {/*      />*/}
                {/*    </Grid>*/}
                {/*  </Grid>*/}
                {/*</Grid>*/}

                <Grid item xs={12}>
                  <Grid container direction={'row'} spacing={1}>
                    <Grid container item justify={'flex-end'}
                      alignItems={'center'} xs={3}>
                      <Typography variant={'button'}>STREET</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <TextField
                        autoComplete={'off'}
                        className={classes.fullWidth}
                        id={'outlined-textarea'}
                        label={''}
                        name={'street'}
                        onChange={formikChange}
                        type={'text'}
                        value={FormikValues.street}
                        variant={'outlined'}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Grid container direction={'row'} spacing={1}>
                    <Grid container item justify={'flex-end'}
                      alignItems={'center'} xs={3}>
                      <Typography variant={'button'}>CITY</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <TextField
                        autoComplete={'off'}
                        className={classes.fullWidth}
                        id={'outlined-textarea'}
                        label={''}
                        name={'city'}
                        onChange={formikChange}
                        type={'text'}
                        value={FormikValues.city}
                        variant={'outlined'}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Grid container direction={'row'} spacing={1} className={classes.inputState}>
                    <Grid container item justify={'flex-end'}
                      style={{ marginTop: 8 }} xs={3}>
                      <Typography variant={'button'}>STATE</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <AutoComplete
                        filterOptions={stateFilterOptions}
                        handleChange={formikChange}
                        name={"state"}
                        data={allStates}
                        value={FormikValues.state}
                        margin={"dense"}
                      //placeholder={'Select state'}
                      />
                    </Grid>

                    <Grid container item justify={'flex-end'}
                      style={{ marginTop: 8 }} xs={2}>
                      <Typography variant={'button'}>ZIP</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        autoComplete={'off'}
                        className={classes.fullWidth}
                        id={'outlined-textarea'}
                        label={''}
                        name={'zipCode'}
                        onChange={(e) => validateNumber('zipCode', e.target.value, 5)}
                        type={'number'}
                        value={FormikValues.zipCode}
                        variant={'outlined'}
                        error={!!FormikErrors.zipCode}
                        helperText={FormikErrors.zipCode}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container direction={'row'} spacing={1}>
                    <Grid container item justify={'flex-end'}
                      alignItems={'center'} xs={3}>
                    </Grid>
                    <Grid item xs={9}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={FormikValues.isAddressAsBillingAddress}
                            onChange={(e, checked) => handleSetBillingAdress(checked)}
                            color="primary"
                            name="isSetBillingAddress" />
                        }
                        label="Set as Billing Address"
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                <Grid container direction={'row'} spacing={1}>
                    <Grid container item justify={'flex-end'}
                      style={{ marginTop: 8 }} xs={3}>
                      <Typography variant={'button'}>Send invoices from</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <TextField
                        autoComplete={'off'}
                        className={classes.fullWidth}
                        id={'outlined-textarea'}
                        label={''}
                        name={'emailSender'}
                        onChange={formikChange}
                        type={'email'}
                        value={FormikValues.emailSender}
                        variant={'outlined'}
                        error={!!FormikErrors.emailSender}
                        helperText={FormikErrors.emailSender}
                      />
                      <small style={{textAlign: 'center', color: '#828282'}}>*If no email is set here, invoices will be sent from the logged in user</small>
                    </Grid>
                  </Grid>
              </Grid>
                <Grid item xs={12}>
                  <Grid container direction={'row'} spacing={1}>
                    <Grid container item justify={'flex-end'}
                      style={{ marginTop: 8 }} xs={3}>
                      <Typography variant={'button'}>WORK TYPES</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Autocomplete
                        getOptionLabel={option => {
                          return `${option.title || ''}`
                        }}
                        id={'tags-standard'}
                        multiple
                        onChange={(ev: any, newValue: any) => changeField("workTypes", newValue)}
                        options={workTypes}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant={'outlined'}
                          />
                        )}
                        classes={{ popper: classes.popper }}
                        renderTags={(tagValue, getTagProps) =>
                          tagValue.map((option, index) => {
                            return (
                              <Chip
                                label={`${option.title || ''}`}
                                {...getTagProps({ index })}
                              />
                            );
                          }
                          )
                        }
                        value={FormikValues.workTypes}
                        getOptionSelected={() => false}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
          </>

          {/* Billing Address */}
          {
            !FormikValues.isAddressAsBillingAddress &&
            <div className={classes.billingAddress}>
              <Divider />
              <Grid container className={classes.billingAddressTtitle}>
                <Typography variant={'button'}>Billing Address</Typography>
              </Grid>
              <DialogContent classes={{ 'root': classes.dialogContent }}>
                <Grid container direction={'column'} spacing={1}>
                  <Grid item xs={12}>
                    <Grid container direction={'row'} spacing={1}>
                      <Grid container item justify={'flex-end'}
                        alignItems={'center'} xs={3}>
                        <Typography variant={'button'}>STREET</Typography>
                      </Grid>
                      <Grid item xs={9}>
                        <TextField
                          autoComplete={'off'}
                          className={classes.fullWidth}
                          id={'outlined-textarea'}
                          label={''}
                          name={'billingStreet'}
                          onChange={formikChange}
                          type={'text'}
                          value={FormikValues.billingStreet}
                          variant={'outlined'}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Grid container direction={'row'} spacing={1}>
                      <Grid container item justify={'flex-end'}
                        alignItems={'center'} xs={3}>
                        <Typography variant={'button'}>CITY</Typography>
                      </Grid>
                      <Grid item xs={9}>
                        <TextField
                          autoComplete={'off'}
                          className={classes.fullWidth}
                          id={'outlined-textarea'}
                          label={''}
                          name={'billingCity'}
                          onChange={formikChange}
                          type={'text'}
                          value={FormikValues.billingCity}
                          variant={'outlined'}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Grid container direction={'row'} spacing={1} className={classes.inputState}>
                      <Grid container item justify={'flex-end'} style={{ marginTop: 8 }} xs={3}>
                        <Typography variant={'button'}>STATE</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <AutoComplete
                          filterOptions={stateFilterOptions}
                          handleChange={formikChange}
                          name={"billingState"}
                          data={allStates}
                          value={FormikValues.billingState}
                          margin={"dense"}
                        />
                      </Grid>

                      <Grid container item justify={'flex-end'} style={{ marginTop: 8 }} xs={2}>
                        <Typography variant={'button'}>ZIP</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          autoComplete={'off'}
                          className={classes.fullWidth}
                          id={'outlined-textarea'}
                          label={''}
                          name={'billingZipCode'}
                          onChange={(e) => validateNumber('billingZipCode', e.target.value, 5)}
                          type={'number'}
                          value={FormikValues.billingZipCode}
                          variant={'outlined'}
                          error={!!FormikErrors.billingZipCode}
                          helperText={FormikErrors.billingZipCode}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </DialogContent>
            </div>
          }
        </form>
      }
      <DialogActions classes={{ 'root': classes.dialogActions }}>
        <Button
          aria-label={'record-payment'}
          classes={{
            'root': classes.closeButton
          }}
          disabled={isSubmitting}
          onClick={() => showWarning ? setShowWarning(false) : closeModal()}
          variant={'outlined'}>
          Cancel
        </Button>

        <Button
          disabled={isSubmitting}
          aria-label={'create-job'}
          classes={{
            root: classes.submitButton,
            disabled: classes.submitButtonDisabled
          }}
          color="primary"
          onClick={handleSubmit}
          variant={'contained'}>
          {showWarning ? 'Confirm' : 'Submit'}
        </Button>

      </DialogActions>
    </DataContainer>
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
  .MuiOutlinedInput-root{
    border-radius: 8px;
    padding: 2px;
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
)(BCCompanyLocationModal);
