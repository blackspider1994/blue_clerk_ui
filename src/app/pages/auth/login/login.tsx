import { Action } from 'redux-actions';
import BCEmailValidateInputut from '../../../components/bc-email-validate-input/bc-email-validate-input';
import BCPasswordInputut from '../../../components/bc-password-input/bc-password-input';
import BCSocialButton from '../../../components/bc-social-button/bc-social-button';
import { Button } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import Config from '../../../../config';
import { Dispatch } from 'redux';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import { FormDataModel } from '../../../models/form-data';
import Grid from '@material-ui/core/Grid';
import LogoSvg from '../../../../assets/img/Logo.svg';
import Paper from '@material-ui/core/Paper';
import { connect, useSelector } from 'react-redux';
import styles from './login.styles';
import { useSnackbar } from 'notistack';
import { withStyles } from '@material-ui/core/styles';
import { Auth, AuthInfo } from 'app/models/user';
import { Link, useHistory, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { loginActions, setAuthAction } from 'actions/auth/auth.action';
import { modalTypes } from '../../../../constants';
import { useDispatch } from 'react-redux';
import {
  openModalAction,
  setModalDataAction
} from 'actions/bc-modal/bc-modal.action';
import {error, info} from 'actions/snackbar/snackbar.action';
import AuthTemplatePage from "../template";
import { callSelectDivisionModal } from 'actions/filter-division/filter-division.action';

const SOCIAL_FACEBOOK_CONNECT_TYPE = 0;
const SOCIAL_GOOGLE_CONNECT_TYPE = 1;

interface Props {
  loginAction: (loginInfo: Auth) => Action<any>;
  loginActionClear: (message: string) => Action<any>;
  setAuthAction: (authInfo: AuthInfo) => Action<any>;
  isLoading: boolean;
  token: string;
  tokenCustomerAPI: string;
  user: object;
  errMessage: string;
  classes: any;
}

interface LocationState {
  requestedPath: string;
}

function LoginPage({
  loginAction,
  loginActionClear,
  setAuthAction,
  isLoading,
  token,
  tokenCustomerAPI,
  user,
  errMessage,
  classes
}: Props): JSX.Element | null {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const dispatch = useDispatch();

  useEffect(() => {
    if (token !== null && token !== '' && tokenCustomerAPI !== null && tokenCustomerAPI !== '') {
      localStorage.setItem('token', token || '');
      localStorage.setItem('tokenCustomerAPI', tokenCustomerAPI || '');
      localStorage.setItem('user', JSON.stringify(user));
      dispatch(callSelectDivisionModal(true));
    }
  }, [token,tokenCustomerAPI,  user]);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  function action(key: any) {
    return <Button
      className={classes.dismiss}
      onClick={() => {
        closeSnackbar(key);
      }}
      variant={'contained'}>
      {'Dismiss'}
    </Button>;
  }

  useEffect(() => {
    errMessage !== '' &&
      dispatch(error(errMessage));
    /*
     * EnqueueSnackbar(errMessage, {
     *   variant: "error",
     *   persist: false,
     *   action
     * });
     */
  }, [enqueueSnackbar, errMessage]);

  const [formData, setFormData] = useState<{ [k: string]: FormDataModel }>({
    'email': {
      'errorMsg': '',
      'validate': true,
      'value': ''
    },
    'password': {
      'errorMsg': '',
      'showPassword': false,
      'validate': true,
      'value': ''
    }
  });

  const [remember, setRemember] = useState<any>(false);
  const [showAgreeTerms] = useState(localStorage.getItem('agreed'));
  const [agreeTerm, setAgreeTerm] = useState({
    'showError': false,
    'showModal': false,
    'value': false
  });

  const storageAuth: AuthInfo = {
    'token': localStorage.getItem('token'),
    'tokenCustomerAPI': localStorage.getItem('tokenCustomerAPI'),
    'user': JSON.parse(localStorage.getItem('user') || '{}')
  };

  const loginFromStorage =
    (token === null || token === '') &&
    (tokenCustomerAPI === null || tokenCustomerAPI === '') &&
    storageAuth.token !== null &&
    storageAuth.token !== '' &&
    storageAuth.tokenCustomerAPI !== null &&
    storageAuth.tokenCustomerAPI !== '' &&
    storageAuth.user !== null;

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

  useEffect(() => {
    loginFromStorage && setAuthAction(storageAuth);
    return () => {
      dispatch(info(''));
      loginActionClear('');
    }
  }, []);

  useEffect(() => {
    if (token !== null && token !== '') {
      history.push(location.state?.requestedPath ?? '/main/dashboard');
    } else {
      if (localStorage.getItem('rememberMe')) {
        const data: any = localStorage.getItem('rememberMe');
        const rememberMeData: any = JSON.parse(data);

        setRemember(rememberMeData.rememberMe);
        setAgreeTerm({ ...agreeTerm,
          'value': rememberMeData.agreed });
        setFormData({
          'email': {
            'errorMsg': '',
            'validate': true,
            'value': rememberMeData.email
          },
          'password': {
            'errorMsg': '',
            'showPassword': false,
            'validate': true,
            'value': rememberMeData.password
          }
        });
      }

      if (showAgreeTerms) {
        const data: any = localStorage.getItem('agreed');
        const agreed: any = JSON.parse(data);

        setAgreeTerm({ ...agreeTerm,
          'value': agreed });
      }
    }
  }, [token, history, location]);

  if (loginFromStorage || token) {
    return null;
  }

  const checkValidate = (): boolean => {
    closeSnackbar();

    const formDataTemp = { ...formData };
    let isValidate = true;
    Object.keys(formData).forEach(item => {
      const dataValue = formDataTemp[item];
      if (dataValue.value.length === 0) {
        formDataTemp[item].validate = false;
        formDataTemp[item].errorMsg = 'This field is required';
        isValidate = false;
      }
      if (!dataValue.validate) {
        isValidate = false;
      }
    });

    if (!isValidate) {
      setFormData({
        ...formDataTemp
      });
    }

    if (!agreeTerm.value) {
      setAgreeTerm({
        ...agreeTerm,
        'showError': true
      });
      isValidate = false;
    }

    return isValidate;
  };

  const handleClickLogin = async (event: any) => {
    event.preventDefault();

    if (!checkValidate()) {
      return;
    }

    await loginAction({
      'email': formData.email.value,
      'password': formData.password.value
    });

    if (agreeTerm.value) {
      localStorage.setItem('agreed', 'true');
    }

    if (remember) {
      localStorage.setItem(
        'rememberMe',
        JSON.stringify({
          'email': formData.email.value,
          'password': formData.password.value,
          'rememberMe': true
        })
      );
    }
  };

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleClickLogin(event);
    }
  };

  const handleSocialLogin = (user: any, connectorType: number): void => { };

  const handleSocialLoginFailure = (err: any, connectorType: number): void => {
    console.log(`${connectorType} login error`);
    console.log(err);
  };

  return (
    <AuthTemplatePage isLoading={isLoading}>
      <form
        onKeyDown={handleKeyDown}
        onSubmit={handleClickLogin}>
        <Paper
          className={classes.LoginPaper}
          onKeyPress={handleKeyDown}>
          <img
            alt={'logo'}
            className={classes.logoimg}
            src={LogoSvg}
          />
          <Grid
            container
            spacing={3}>
            <Grid
              item
              xs={12}>
              <BCEmailValidateInputut
                id={'email'}
                inputData={formData.email}
                label={'Email'}
                onChange={(emailData: FormDataModel) => {
                  setFormData({
                    ...formData,
                    'email': {
                      ...emailData
                    }
                  });
                }}
                size={'small'}
                variant={'outlined'}
              />
            </Grid>
            <Grid
              item
              style={{ 'position': 'relative' }}
              xs={12}>
              <BCPasswordInputut
                id={'login-password'}
                inputData={formData.password}
                label={'Password'}
                onChange={(passwordValue: FormDataModel) => {
                  setFormData({
                    ...formData,
                    'password': {
                      ...passwordValue
                    }
                  });
                }}
                size={'small'}
              />
            </Grid>
          </Grid>
          <div className={classes.forgetremember}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={remember}
                  color={'primary'}
                  name={'remember'}
                  onChange={e => {
                    setRemember(e.target.checked);
                  }}
                />
              }
              label={'Remember Me'}
            />

            <div className={classes.AgreeTermDiv}>
              {
                !showAgreeTerms &&
                  <>
                    <Checkbox
                      checked={agreeTerm.value}
                      color={'primary'}
                      name={'agree-term'}
                      onChange={() => {
                        setAgreeTerm({
                          ...agreeTerm,
                          'showError': false,
                          'value': !agreeTerm.value
                        });
                      }}
                    />
                    <span
                      onClick={handleClickOpen}
                      role={'button'}>
                      {'I agree with the terms of use and privacy'}
                    </span>
                  </>

              }
            </div>
          </div>
          <div className={classes.agreementHelperText}>
            {agreeTerm.showError &&
              <FormHelperText error>
                {'Please agree to the terms of use and privacy'}
              </FormHelperText>
            }
          </div>
          <Grid
            container
            spacing={2}>
            <Grid
              item
              xs={12}>

              <Button
                color={'primary'}
                fullWidth
                size={'large'}
                type={'submit'}
                variant={'contained'}>
                {'Login'}
              </Button>
            </Grid>
            <Grid
              item
              style={{display: 'flex'}}
              container
              justify='flex-end'
              md={6}
              xs={12}>
              <BCSocialButton
                appId={Config.GOOGLE_APP_ID}
                image={'https://img.icons8.com/color/48/000000/google-logo.png'}
                onLoginFailure={(err: any): void => {
                  handleSocialLoginFailure(err, SOCIAL_GOOGLE_CONNECT_TYPE);
                }}
                onLoginSuccess={(user: any): void => {
                  handleSocialLogin(user, SOCIAL_GOOGLE_CONNECT_TYPE);
                }}
                provider={'google'}>
                {'Login with Google'}
              </BCSocialButton>
            </Grid>
            <Grid
              item
              md={6}
              xs={12}>
              <BCSocialButton
                image={'https://img.icons8.com/color/48/000000/facebook-circled.png'}
                appId={Config.FACEBOOK_APP_ID}
                onLoginFailure={(err: any): void => {
                  handleSocialLoginFailure(
                    err,
                    SOCIAL_FACEBOOK_CONNECT_TYPE
                  );
                }}
                onLoginSuccess={(user: any): void => {
                  handleSocialLogin(user, SOCIAL_FACEBOOK_CONNECT_TYPE);
                }}
                provider={'facebook'}>
                {'Login with Facebook'}
              </BCSocialButton>
            </Grid>
            <Grid
              className={classes.register}
              item
              xs={12}>
              <div>
                {"Don't have an account?"}
                {' '}
                <Link
                  className={classes.link}
                  to={'/signup'}>
                  {'Sign Up'}
                </Link>
              </div>
              <Link
                className={classes.link}
                to={'/recover'}>
                {'Forgot password?'}
              </Link>
            </Grid>
          </Grid>
        </Paper>
      </form>
    </AuthTemplatePage>
  );
}

const mapStateToProps = (state: {
  auth: {
    loginApi: {
      isLoading: boolean;
      msg: string;
    };
    token: string;
    tokenCustomerAPI: string;
    user: object;
  };
}) => {
  return {
    'errMessage': state.auth.loginApi.msg,
    'isLoading': state.auth.loginApi.isLoading,
    'token': state.auth.token,
    'tokenCustomerAPI': state.auth.tokenCustomerAPI,
    'user': state.auth.user
  };
};


const mapDispatchToProps = (dispatch: Dispatch) => ({
  'loginAction': (loginInfo: Auth) => dispatch(loginActions.fetch(loginInfo)),
  'loginActionClear': (message: string) => dispatch(loginActions.fault(message)),
  'setAuthAction': (authInfo: AuthInfo) => dispatch(setAuthAction(authInfo))
});

export default withStyles(styles, { 'withTheme': true })(connect(mapStateToProps, mapDispatchToProps)(LoginPage));
