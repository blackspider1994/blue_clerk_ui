import React from 'react';
import {
  Checkbox,
  FormHelperText,
  TextField
} from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import styles from '../signup.styles';
import { withStyles } from '@material-ui/core/styles';
import {modalTypes, PRIMARY_BLUE} from "../../../../../constants";
import BCEmailValidateInput from '../../../../components/bc-email-validate-input/bc-email-validate-input';
import PasswordInput from '../../../../components/bc-password-input/bc-password-input';
import BCPhoneNumberInput from '../../../../components/bc-phone-number-input/bc-phone-number-input';
import {FormDataModel} from "../../../../models/form-data";
import {
  openModalAction,
  setModalDataAction
} from "../../../../../actions/bc-modal/bc-modal.action";
import {useDispatch} from "react-redux";

interface Props {
  formData: any;
  onChange: (key: string, value: any) => void;
  classes: any
}

function SignUpDetail({formData, onChange, classes }: Props): JSX.Element {
  const dispatch = useDispatch();

  const handleClickOpen = () => {
    dispatch(setModalDataAction({
      'data': {
        'modalTitle': 'Terms and conditions',
        'removeFooter': true
      },
      'type': modalTypes.TERMS_AND_CONDITION_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  const handleTextField = (key: string, value: string) => {
    onChange(key, {
      value,
      errorMsg: value.length > 0 ? '' : 'This field is required',
      validate: value.length > 0,
    })
  }

  return (
    <>
      <p className={classes.Description}>
        {'Please fill in below form to create an account with us'}
      </p>

      <Grid
        container
        spacing={3}>
        <Grid
          item
          md={6}
          xs={12}>
          <TextField
            error={!formData.firstName.validate}
            fullWidth
            helperText={formData.firstName.errorMsg}
            id={'firstname'}
            label={'First Name'}
            onChange={(e) => handleTextField('firstName', e.target.value)}
            size={'small'}
            type={'text'}
            value={formData.firstName.value}
            variant={'outlined'}
          />
        </Grid>
        <Grid
          item
          md={6}
          xs={12}>
          <TextField
            error={!formData.lastName.validate}
            fullWidth
            helperText={formData.lastName.errorMsg}
            id={'lastName'}
            label={'Last Name'}
            onChange={(e) => handleTextField('lastName', e.target.value)}
            size={'small'}
            type={'text'}
            value={formData.lastName.value}
            variant={'outlined'}
          />
        </Grid>
        <Grid
          item
          md={6}
          xs={12}>
          <BCEmailValidateInput
            id={'email'}
            inputData={formData.email}
            disabled={formData.isci.value}
            label={'Email'}
            onChange={(newEmail: FormDataModel) => onChange('email', newEmail)}
            size={'small'}
            variant={'outlined'}
          />
        </Grid>
        <Grid
          item
          md={6}
          style={{ 'position': 'relative' }}
          xs={12}>
          <PasswordInput
            id={'password'}
            inputData={formData.password}
            label={'Password'}
            onChange={(newPassword: FormDataModel) => onChange('password', newPassword)}
            size={'small'}
            variant={'outlined'}
          />
        </Grid>
        <Grid
          item
          md={6}
          xs={12}>
          <BCEmailValidateInput
            id={'recoveryEmail'}
            inputData={formData.recoveryEmail}
            // disabled={formData.isci.value}
            label={'Recovery Email'}
            onChange={(newEmail: FormDataModel) => onChange('recoveryEmail', newEmail)}
            size={'small'}
            variant={'outlined'}
            referenceEmail={formData.email.value}
            infoText={'Recovery email is required in case you get locked out of your account or your account type changes.'}
          />
        </Grid>
        <Grid
          item
          md={6}
          xs={12}>
          <BCPhoneNumberInput
            changeData={(data: FormDataModel) => onChange('phone_number', data)}
            id={'phone_number'}
            inputData={formData.phone_number}
            label={'Phone Number'}
            size={'small'}
          />
        </Grid>
        <Grid
          item
          md={12}
          style={{
            'display': 'flex',
            'flexDirection': 'column'
          }}
          xs={12}>
          <div className={classes.AgreeTermDiv}>
            <Checkbox
              checked={formData.agreeTerm.value === 'Yes'}
              color={'primary'}
              name={'agree-term'}
              onChange={(e) => handleTextField('agreeTerm', e.target.checked ? 'Yes' : '')}
            />
            I agree to the 
            <span
              style={{marginLeft: 5}}
              onClick={handleClickOpen}
              role={'button'}>
              {'terms of use and privacy'}
            </span>
          </div>
          {!formData.agreeTerm.validate &&
          <FormHelperText
            error
            style={{ 'marginLeft': '30px' }}>
            {'Please agree to the terms of use and privacy'}
          </FormHelperText>
          }
        </Grid>

      </Grid>
    </>
  )
}

export default withStyles(
  styles,
  { 'withTheme': true }
)(SignUpDetail);


