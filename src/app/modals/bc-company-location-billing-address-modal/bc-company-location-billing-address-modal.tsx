import { useFormik } from "formik";
import styles from "./bc-company-location-billing-address-modal.styles";
import { Button, Checkbox, DialogActions, DialogContent, FormControlLabel, Grid, TextField, Typography, withStyles } from "@material-ui/core";
import React, { useState } from "react";
import { useDispatch } from 'react-redux';
import styled from "styled-components";
import * as CONSTANTS from '../../../constants';
import { closeModalAction, openModalAction, setModalDataAction } from "actions/bc-modal/bc-modal.action";
import { UpdateCompanyLocationBillingAddressAction } from "actions/user/user.action";
import { CompanyLocation } from "actions/user/user.types";
import { allStates } from "utils/constants";
import AutoComplete from "app/components/bc-autocomplete/bc-autocomplete_2";
import { emailRegExp, zipCodeRegExp } from "helpers/format";
import * as Yup from "yup";
import { createFilterOptions } from "@material-ui/lab";

interface API_PARAMS {
  companyLocationId?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emailSender?: string;
  isAddressAsBillingAddress? : boolean;
}

const billingAddressSchema = Yup.object().shape({
  zipCode: Yup.string().matches(zipCodeRegExp, 'Zip code is not valid'),
  emailSender: Yup.string().matches(emailRegExp, 'Email address is not valid'),
});

function BCCompanyLocationBillingAddressModal({
  classes,
  companyLocation
}: { classes: any, companyLocation: CompanyLocation }): JSX.Element {
  const dispatch = useDispatch();

  const {
    'values': FormikValues,
    'handleSubmit': FormikSubmit,
    'handleChange': formikChange,
    'errors': FormikErrors,
    setFieldValue,
    setFieldTouched,
    isSubmitting,
    submitForm
  } = useFormik({
    initialValues: {
      street: companyLocation?.billingAddress?.street || '',
      city: companyLocation?.billingAddress?.city || '',
      state: allStates.find((state) => state.name === companyLocation?.billingAddress?.state) ?? null,
      zipCode: companyLocation?.billingAddress?.zipCode ?? '',
      isAddressAsBillingAddress: companyLocation.isAddressAsBillingAddress,
      emailSender: companyLocation?.billingAddress?.emailSender || ''
    },
    onSubmit: (values, { setSubmitting }) => {
      let payload: API_PARAMS = {
        companyLocationId: companyLocation?._id,
        street: FormikValues.street,
        city: FormikValues.city,
        state: FormikValues.state?.name || '',
        zipCode: FormikValues.zipCode,
        isAddressAsBillingAddress: FormikValues.isAddressAsBillingAddress,
        emailSender: FormikValues.emailSender
      };

      const action = () => {
        dispatch(UpdateCompanyLocationBillingAddressAction(payload, (status) => {
          if (status) closeModal();
          else {
            setSubmitting(false);
          }
        }))
      }


      dispatch(setModalDataAction({
        'data': {
          'action': action
        },
        'type': CONSTANTS.modalTypes.BILLING_ADDRESS_WARNING_MODAL
      }));
      setTimeout(() => {
        dispatch(openModalAction());
      }, 200);

    },
    validationSchema: billingAddressSchema
  })

  const closeModal = () => {
    dispatch(closeModalAction());
    setTimeout(() => {
      dispatch(setModalDataAction({
        'data': {},
        'type': ''
      }));
    }, 200);
  };

  const validateNumber = (field: string, value: string, max: number) => {
    if (value.length <= max) setFieldValue(field, value);
    if (FormikValues.isAddressAsBillingAddress) {
      changeField('isAddressAsBillingAddress', false);
    }
  }

  const stateFilterOptions = createFilterOptions({
    stringify: (option: any) => option.name + option.abbreviation,
  });

  const changeField = (name: string, value: any) => {
    setFieldValue(name, value);
    setFieldTouched(name, true);
  }

  const handleSetBillingAdress = (isChecked:boolean) =>{
    changeField('street', isChecked ? companyLocation.address?.street : "");
    changeField('city', isChecked ? companyLocation.address?.city : "");
    changeField('state', isChecked ? allStates.find((state) => state.name === companyLocation?.address?.state) ?? null : null);
    changeField('zipCode', isChecked ? companyLocation.address?.zipCode : "");
    changeField('isAddressAsBillingAddress', isChecked);
  }

  const handleFormChange = (event:any) => {
    formikChange(event);
    if (FormikValues.isAddressAsBillingAddress) {
      changeField('isAddressAsBillingAddress', false);
    }
  };

  return (
    <DataContainer>
      <form onSubmit={FormikSubmit}>
        <DialogContent classes={{ 'root': classes.dialogContent }}>
          <Grid container direction={'column'} spacing={1}>
            <Grid item xs={12}>
              <Grid container direction={'row'} spacing={1}>
                  <Grid container item justify={'flex-end'} xs={3}>
                    <Typography variant={'button'}>Send invoices from</Typography>
                  </Grid>
                  <Grid item xs={5}>
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
                  alignItems={'center'} xs={3}>
                  <Typography variant={'button'}>STREET</Typography>
                </Grid>
                <Grid item xs={9}>
                  <TextField
                    autoComplete={'off'}
                    id={'outlined-textarea'}
                    label={''}
                    name={'street'}
                    onChange={handleFormChange}
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
                    id={'outlined-textarea'}
                    label={''}
                    name={'city'}
                    onChange={handleFormChange}
                    type={'text'}
                    value={FormikValues.city}
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
                    handleChange={handleFormChange}
                    name={"state"}
                    data={allStates}
                    value={FormikValues.state}
                    margin={"dense"}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        label="Search"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>

                <Grid container item justify={'flex-end'} style={{ marginTop: 8 }} xs={1}>
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
                    label="Same as main location"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
      </form>
      <DialogActions classes={{ 'root': classes.dialogActions }}>
        <Button
          aria-label={'record-payment'}
          classes={{
            'root': classes.closeButton
          }}
          disabled={isSubmitting}
          onClick={() => closeModal()}
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
          onClick={submitForm}
          variant={'contained'}>
          Save
        </Button>

      </DialogActions>
    </DataContainer>
  )
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
`

export default withStyles(
  styles,
  { 'withTheme': true }
)(BCCompanyLocationBillingAddressModal);
