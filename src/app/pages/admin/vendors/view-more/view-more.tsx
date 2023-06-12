import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import BCAdminProfile
  from '../../../../components/bc-admin-profile/bc-admin-profile';
import BCTabs from '../../../../components/bc-tab/bc-tab';
import BCBackButton from '../../../../components/bc-back-button/bc-back-button';
import BCCircularLoader
  from 'app/components/bc-circular-loader/bc-circular-loader';
import BCAdminCard from '../../../../components/bc-admin-card/bc-admin-card';
import ReportsIcon from 'assets/img/icons/customers/Reports';
import JobsIcon from 'assets/img/icons/customers/Jobs';
import ReceiptIcon from '@material-ui/icons/Receipt';
import PaymentIcon from '@material-ui/icons/Payment';
import validator from 'validator';
import {useDispatch, useSelector} from 'react-redux';
import {uploadImage} from 'actions/image/image.action';
import {updateCompanyProfileAction} from 'actions/user/user.action';
import {CompanyProfile} from 'actions/user/user.types'
import {useLocation, useHistory} from "react-router-dom";
import {
  getVendorDetailAction,
  loadingSingleVender
} from 'actions/vendor/vendor.action';
import {
  Grid,
  InputLabel,
  Switch,
  Typography,
  withStyles
} from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';
import styles from './view-more.styles';
import BCBackButtonNoLink
  from '../../../../components/bc-back-button/bc-back-button-no-link';
import {
  openModalAction,
  setModalDataAction
} from 'actions/bc-modal/bc-modal.action';
import {callAddVendorAPI, finishVendorApi} from 'api/vendor.api';
import {LIGHT_GREY, modalTypes, PRIMARY_GREEN} from '../../../../../constants';
import VendorPayment from "./vendor-payment";
import {
  error as errorSnackBar
} from "../../../../../actions/snackbar/snackbar.action";
import BCInput from "../../../../components/bc-input/bc-input";
import BCTextField from "../../../../components/bc-text-field/bc-text-field";
import BCButtonDashboard
  from "../../../../components/bc-button-dashboard/bc-button-dashboard";
import {CSButton} from "../../../../../helpers/custom";


function CompanyProfilePage({classes}: any) {
  const dispatch = useDispatch();
  const image = useSelector((state: any) => state.image);
  const {
    vendorObj,
    response,
    loading = true
  } = useSelector((state: any) => state.vendors);
  const location = useLocation<any>();
  const history = useHistory();
  const [curTab, setCurTab] = useState(0);


  const [companyName, setCompanyName] = useState('');
  const [companyNameValid] = useState(true);
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [companyEmailValid, setCompanyEmailValid] = useState(true);
  const [phone, setPhone] = useState('');
  const [phoneValid, setPhoneValid] = useState(true);
  const [fax, setFax] = useState('');
  const [faxValid] = useState(true);
  const [street, setStreet] = useState('');
  const [streetValid] = useState(true);
  const [city, setCity] = useState('');
  const [cityValid] = useState(true);
  const [state, setState] = useState('');
  const [stateValid] = useState(true);
  const [zipCode, setZipCode] = useState('');
  const [zipCodeValid, setZipCodeValid] = useState(true);
  const [vendorStatus, setVendorStatus] = useState(localStorage.getItem('companyContractStatus') === 'true');
  const [displayName, setDisplayName] = useState('');

  const cancel = () => {
  }
  const apply = () => {
  }

  const imageSelected = (f: File) => {
    if (!f) return;
    const formData = new FormData();
    formData.append('image', f);
    dispatch(uploadImage(formData));
  }

  const handleTabChange = (newValue: number) => {
    setCurTab(newValue);
  };

  useEffect(() => {

    if (vendorObj === undefined) {
      const obj: any = location.state;
      const vendorId = obj.vendorId;
      dispatch(loadingSingleVender());
      dispatch(getVendorDetailAction(vendorId));
    }
  }, []);

  useEffect(() => {
    if (response === 'Contract finished successfully.') {
      setTimeout(() => renderGoBack(location.state), 2000);
    }
  }, [response]);

  useEffect(() => {
    if (vendorObj) {
      if (vendorObj.info.companyName) {
        setCompanyName(vendorObj.info.companyName);
      }
      if (vendorObj.info.companyEmail) {
        setCompanyEmail(vendorObj.info.companyEmail);
      }
      if (vendorObj.info.logoUrl) {
        setCompanyLogo(vendorObj.info.logoUrl);
      }
      if (vendorObj.info.displayName) {
        setDisplayName(vendorObj.info.displayName);
      }
      if (vendorObj.contact.phone) {
        setPhone(vendorObj.contact.phone);
      }
      if (vendorObj.address.city) {
        setCity(vendorObj.address.city);
      }
      if (vendorObj.address.state) {
        setState(vendorObj.address.state);
      }
      if (vendorObj.address.zipCode) {
        setZipCode(vendorObj.address.zipCode);
      }
      if (vendorObj.address.street) {
        setStreet(vendorObj.address.street);
      }
    }
  }, [vendorObj]);


  const renderGoBack = (location: any) => {
    const baseObj = location;

    const stateObj = baseObj && baseObj['currentPage'] !== undefined ? {
      prevPage: baseObj['currentPage']
    } : {}

    history.push({
      pathname: `/main/admin/vendors`,
      state: stateObj
    });

  }

  const requestVendorAction = () => {
    dispatch(setModalDataAction({
      data: {
        message: `Are you sure you want to ${vendorStatus ? 'deactivate' : 'activate'} this vendor?`,
        action: vendorStatus ? finishVendor() : startVendor(),
      },
      'type': modalTypes.WARNING_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }

  const finishVendor = () => {
    return async () => {
      const companyContractId = localStorage.getItem('companyContractId');
      const result: any = await finishVendorApi({
        contractId: companyContractId || '',
        status: 'finish'
      });

      if (result?.status === 1) {
        setVendorStatus(false);
      } else {
        dispatch(errorSnackBar(result?.message || 'Something went wrong'));
      }
      return {
        'type': null,
        'payload': null,
      };
    }
  }

  const startVendor = () => {
    return async () => {
      const result: any = await callAddVendorAPI({
        contractorId: vendorObj._id,
      });

      if (result?.status === 1) {
        setVendorStatus(true);
      } else {
        dispatch(errorSnackBar(result?.message || 'Something went wrong'));
      }
      return {
        'type': null,
        'payload': null,
      };
    }
  }

  const editVendor = async () => {
    const companyContractId = localStorage.getItem('companyContractId');
    const result: any = await finishVendorApi({
      contractId: companyContractId || '',
      status: 'finish'
    });
    setVendorStatus(result?.status === 0);
    localStorage.setItem('companyContractStatus', (result?.status === 0).toString());
    dispatch(setModalDataAction({
      'data': {
        'removeFooter': false,
        'maxHeight': '450px',
        'height': '100%',
        'message': {
          'title': result?.status !== 0 ? `Contract finished with ${companyName}` : result.message
        },
        'contractId': companyContractId,
        'notificationType': 'ContractInvitation'
      },
      'type': modalTypes.CONTRACT_VIEW_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  const setDisplayNameModal = () => {
    dispatch(setModalDataAction({
      data: {
        modalTitle: 'Set Display Name',
        contractorId: vendorObj._id,
        displayName,
        removeFooter: false
      },
      type: modalTypes.SET_DISPLAY_NAME_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }

  return (
    <>
      <div className={classes.pageMainContainer}>
        <div className={classes.pageContainer}>
          <div className={classes.pageContent}>
            <Grid container>

              <BCBackButtonNoLink
                func={() => renderGoBack(location.state)}
              />

              <div className="tab_wrapper">
                <BCTabs
                  curTab={curTab}
                  indicatorColor={'primary'}
                  onChangeTab={handleTabChange}
                  tabsData={[
                    {
                      'label': 'VENDOR INFO',
                      'value': 0
                    },
                    {
                      'label': 'JOBS/REPORTS INFO',
                      'value': 1
                    },
                    {
                      'label': 'Payments',
                      'value': 2
                    }
                  ]}
                />
              </div>

            </Grid>

            {loading ?
              <BCCircularLoader heightValue={'200px'}/>
              : <SwipeableViews index={curTab} className={'swipe_wrapper'}>
                <div
                  className={`${classes.dataContainer} `}
                  hidden={curTab !== 0}
                  id={'0'}>
                  <MainContainer>
                    <PageContainer>
                      <Grid
                        container
                        spacing={0}
                        alignItems="center"
                        justify="space-between"
                      >
                        <Grid item className={classes.displayNameContainer}>
                          <Grid>
                            <Typography variant={'caption'}>Display
                              Name</Typography>
                            <BCInput
                              readonly
                              value={displayName}
                              handleChange={() => {
                              }}
                              className={classes.displayNameInput}
                              name={'displayName'}
                            />
                          </Grid>
                          <CSButton
                            aria-label={'display-name'}
                            variant="contained"
                            color="primary"
                            size="small"
                            className={'make-inactive'}
                            onClick={() => setDisplayNameModal()}>
                            {'Update'}
                          </CSButton>
                        </Grid>
                        <Grid item className={classes.switchContainer}>
                          <GreenSwitch
                            checked={vendorStatus}
                            onChange={requestVendorAction}
                            name="checkedA"
                            inputProps={{'aria-label': 'secondary checkbox'}}
                          />
                          <span
                            className={vendorStatus ? classes.switchLabelActive : classes.switchLabelInActive}>
                            {vendorStatus ? 'Active' : 'Inactive'}
                          </span>
                        </Grid>
                      </Grid>
                      <BCAdminProfile
                        avatar={{
                          isEmpty: 'NO',
                          url: companyLogo !== '' ? companyLogo : '',
                          onChange: imageSelected,
                          noUpdate: true
                        }}
                        apply={apply}
                        cancel={cancel}
                        inputError={{}}
                        fields={[
                          {
                            left: {
                              id: 'companyName',
                              label: 'Company Name:',
                              placehold: 'Input Company Name',
                              value: companyName,
                              valid: companyNameValid
                            },
                            right: {
                              id: 'companyEmail',
                              label: 'Company Email:',
                              placehold: 'Input Company Emaill',
                              value: companyEmail,
                              valid: companyEmailValid
                            },
                          },
                          {
                            left: {
                              id: 'phone',
                              label: 'Phone:',
                              placehold: 'Input Phone Number',
                              value: phone,
                              valid: phoneValid
                            },
                            right: {
                              id: 'fax',
                              label: 'Fax:',
                              placehold: 'Input Fax',
                              value: fax,
                              valid: faxValid
                            }
                          },
                          {
                            left: {
                              id: 'street',
                              label: 'Street:',
                              placehold: 'Input Street',
                              value: street,
                              valid: streetValid
                            },
                            right: {
                              id: 'city',
                              label: 'City:',
                              placehold: 'Input City',
                              value: city,
                              valid: cityValid
                            }
                          },
                          {
                            left: {
                              id: 'state',
                              label: 'State:',
                              placehold: 'Input State',
                              value: state,
                              valid: stateValid
                            },
                            right: {
                              id: 'zipCode',
                              label: 'Zip Code:',
                              placehold: 'Input Zip Code',
                              value: zipCode,
                              valid: zipCodeValid
                            }
                          },
                        ]}/>

                    </PageContainer>

                  </MainContainer>
                </div>

                <div
                  hidden={curTab !== 1}
                  style={{
                    'padding': '40px'
                  }}
                  id={'1'}>
                  <Grid container spacing={5}>
                    <Grid item>
                      <BCAdminCard
                        cardText={'Reports'}
                        color={'primary'}
                        func={() => {
                        }}
                      >
                        <ReportsIcon/>
                      </BCAdminCard>
                    </Grid>

                    <Grid item>
                      <BCAdminCard
                        cardText={'Jobs'}
                        color={'secondary'}
                        func={() => {
                        }}
                      >
                        <JobsIcon/>
                      </BCAdminCard>
                    </Grid>

                    <Grid
                      item>
                      <BCAdminCard
                        cardText={'Invoices'}
                        color={'primary-orange'}
                        func={() => {
                        }}
                      >
                        <ReceiptIcon/>
                      </BCAdminCard>
                    </Grid>

                    <Grid
                      item>
                      <BCAdminCard
                        cardText={'Estimates'}
                        color={'primary-green'}
                        func={() => {
                        }}
                      >
                        <PaymentIcon/>
                      </BCAdminCard>
                    </Grid>

                  </Grid>
                </div>
                <div
                  hidden={curTab !== 2}
                  style={{
                    'padding': '40px'
                  }}
                  id={'2'}>
                  <VendorPayment/>
                </div>

              </SwipeableViews>
            }
          </div>
        </div>
      </div>
    </>
  );
}

const MainContainer = styled.div`
  display: flex;
  flex: 1 1 100%;
  width: 100%;
  overflow-x: hidden;
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  padding: 30px;
  width: 100%;
  /* padding-left: 65px; */
  padding-right: 65px;
  margin: 0 auto;

  button:not(.make-inactive) { {
    display: none;
  }

    input {
      color: black;
    }
`;

const GreenSwitch = withStyles({
  switchBase: {
    color: LIGHT_GREY,
    '&$checked': {
      color: PRIMARY_GREEN,
    },
    '&$checked + $track': {
      backgroundColor: `${PRIMARY_GREEN}88`,
    },
  },
  checked: {},
  track: {
    backgroundColor: `${LIGHT_GREY}88`,
  },
})(Switch);

export default withStyles(
  styles,
  {'withTheme': true}
)(CompanyProfilePage);
