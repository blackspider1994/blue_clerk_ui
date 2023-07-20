import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import BCAdminProfile from '../../../../components/bc-admin-profile/bc-admin-profile';
import BCTabs from '../../../../components/bc-tab/bc-tab';
import BCBackButton from '../../../../components/bc-back-button/bc-back-button';
import BCCircularLoader from 'app/components/bc-circular-loader/bc-circular-loader';
import BCAdminCard from '../../../../components/bc-admin-card/bc-admin-card';
import ReportsIcon from 'assets/img/icons/customers/Reports';
import JobsIcon from 'assets/img/icons/customers/Jobs';
import ReceiptIcon from '@material-ui/icons/Receipt';
import PaymentIcon from '@material-ui/icons/Payment';
import validator from 'validator';
import { useDispatch, useSelector } from 'react-redux';
import { uploadImage } from 'actions/image/image.action';
import { updateCompanyProfileAction } from 'actions/user/user.action';
import { updateEmployeeEmailPreferences } from 'api/email-preferences.api';
import { useHistory, useLocation } from 'react-router-dom';
import { getEmployeeDetailAction, getEmployeePermissionsAction, getEmployees, loadingEmployees, loadingSingleEmployee, updateEmployeeRole } from 'actions/employee/employee.action';
import { Fab, Grid, withStyles } from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';
import styles from './view-more.styles';
import BCBackButtonNoLink from '../../../../components/bc-back-button/bc-back-button-no-link';
import BCEmailPreference from '../../../../components/bc-email-preference/bc-email-preference';
import { error, info, success } from 'actions/snackbar/snackbar.action';
import { openModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { modalTypes } from '../../../../../constants';
import { CSButton } from '../../../../../helpers/custom';
import BcRolesPermissions from 'app/components/bc-roles-permissions/bc-roles-permissions';

function EmployeeProfilePage({ classes }: any) {
  const dispatch = useDispatch();

  const { employeeDetails, loading = true } = useSelector((state: any) => state.employees);
  const location = useLocation<any>();
  const history = useHistory();
  const [curTab, setCurTab] = useState(0);


  const cancel = () => { };


  const apply = (values: any) => {
    console.log(values);
  };

  const applyEmployeeDetail = async (values: any) => {
    try {
      const response: any = await updateEmployeeEmailPreferences(values);

      if (response.message === 'preferences updated successfully.') {
        dispatch(success('Email Preferences successfully updated!'));
        return true;
      } else if (response.message === 'Email time is required for scheduled emails.') {
        dispatch(info('Email time is required for daily email.'));
        return true;
      }
      dispatch(error('Something went wrong, please try again later.'));
      return true;
    } catch (err) {
      return true;
    }
  };

  const handleTabChange = (newValue: number) => {
    setCurTab(newValue);
  };

  useEffect(() => {
    if (employeeDetails === undefined) {
      const obj: any = location.state;
      const employeeId = obj?.employeeId;

      if (!employeeId) {
        history.push('/main/admin/employees');
      }

      dispatch(loadingSingleEmployee());
      dispatch(getEmployeeDetailAction(employeeId));
      dispatch(getEmployeePermissionsAction(employeeId));
    }
  }, []);


  /*
   * UseEffect(() => {
   *   if (vendorObj) {
   *     console.log(vendorObj, 'vendorObj')
   *     if (vendorObj.info.companyName) {
   *       setCompanyName(vendorObj.info.companyName);
   *     }
   *     if (vendorObj.info.companyEmail) {
   *       setCompanyEmail(vendorObj.info.companyEmail);
   *     }
   *     if (vendorObj.info.logoUrl) {
   *       setCompanyLogo(vendorObj.info.logoUrl);
   *     }
   *     if (vendorObj.contact.phone) {
   *       setPhone(vendorObj.contact.phone);
   *     }
   *     if (vendorObj.address.city) {
   *       setCity(vendorObj.address.city);
   *     }
   *     if (vendorObj.address.state) {
   *       setState(vendorObj.address.state);
   *     }
   *     if (vendorObj.address.zipCode) {
   *       setZipCode(vendorObj.address.zipCode);
   *     }
   *     if (vendorObj.address.street) {
   *       setStreet(vendorObj.address.street);
   *     }
   *   }
   * }, [vendorObj]);
   */

  const initialValues = {
    'firstName': employeeDetails?.firstName,
    'lastName': employeeDetails?.lastName,
    'phone': employeeDetails?.phone,
    'email': employeeDetails?.email
  };

  const initialValuesEmail = {
    'employeeId': location.state?.employeeId,
    'emailPreferences': employeeDetails?.emailPreferences.preferences,
    'emailTime': employeeDetails?.emailPreferences.preferences === 1 ? employeeDetails?.emailPreferences.time : null
  };


  const renderGoBack = (location: any) => {
    const baseObj = location;

    const stateObj = baseObj && baseObj.currentPage !== undefined ? {
      'prevPage': baseObj.currentPage
    } : {};

    history.push({
      'pathname': `/main/admin/employees`,
      'state': stateObj
    });
  };

  const updateEmployee = async () => {
    const employeeId = employeeDetails?._id;
    const data: any = {
      'employeeId': employeeId,
      'newRole': 4
    };

    dispatch(setModalDataAction({
      'data': {
        'data': data,
        'modalTitle': ' ',
        'removeFooter': false
      },
      'type': modalTypes.MAKE_ADMIN_EMPLOYEE_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  return (
    <>
      <div className={classes.pageMainContainer}>
        <div className={classes.pageContainer}>
          <div className={classes.pageContent}>
            <Grid container>

              <BCBackButtonNoLink
                func={() => renderGoBack(location.state)}
              />

              <div className={'tab_wrapper'}>
                <BCTabs
                  curTab={curTab}
                  indicatorColor={'primary'}
                  onChangeTab={handleTabChange}
                  tabsData={[
                    {
                      'label': 'EMPLOYEE\'S INFO',
                      'value': 0
                    },
                    {
                      'label': 'EMAIL PREFERENCES',
                      'value': 1
                    },
                    {
                      'label': 'PERMISSIONS',
                      'value': 2
                    }
                  ]}
                />
              </div>

            </Grid>

            {loading
              ? <BCCircularLoader heightValue={'200px'} />
              : <SwipeableViews index={curTab} className={'swipe_wrapper'}>
                <div
                  className={`${classes.dataContainer} `}
                  hidden={curTab !== 0}
                  id={'0'}>
                  <MainContainer>
                    <PageContainer>
                      <BCAdminProfile
                        avatar={{
                          'isEmpty': 'NO',
                          'url': '',
                          'noUpdate': true
                        }}
                        apply={(values: any) => apply(values)}
                        cancel={cancel}
                        initialValues={initialValues}
                        inputError={{}}
                        employeeDetails={employeeDetails}
                        fields={[
                          {
                            'left': {
                              'id': 'firstName',
                              'label': 'First Name:',
                              'placehold': 'John',
                              'value': employeeDetails?.firstName.charAt(0).toUpperCase() + employeeDetails?.firstName.slice(1)
                            },
                            'right': {
                              'id': 'lastName',
                              'label': 'Last name:',
                              'placehold': 'Doe',
                              'value': employeeDetails?.lastName.charAt(0).toUpperCase() + employeeDetails?.lastName.slice(1)
                            }
                          },
                          {
                            'left': {
                              'id': 'email',
                              'label': 'Email:',
                              'placehold': 'john.doe@gmail.com',
                              'value': employeeDetails?.email
                            },
                            'right': {
                              'id': 'phone',
                              'label': 'Phone:',
                              'placehold': '1234567890',
                              'value': employeeDetails?.phone
                            }
                          }
                        ]}
                      />
                    </PageContainer>

                  </MainContainer>
                </div>

                <div
                  hidden={curTab !== 1}
                  style={{
                    'padding': '40px'
                  }}
                  id={'1'}>
                  <BCEmailPreference
                    apply={(values: any) => applyEmployeeDetail(values)}
                    initialValues={initialValuesEmail}
                  />
                </div>

                <div
                  hidden={curTab !== 2}
                  style={{
                    'padding': '40px'
                  }}
                  id={'1'}>
                  <BcRolesPermissions />
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
  button  {
    // display: none;
    width: 15%;
    padding-top: 7px;
    display: block;
    float: right;
    position: absolute;
    right: 73px;
    bottom: 58px;
  }
  input {
    color: black;
  }
`;


export default withStyles(
  styles,
  { 'withTheme': true }
)(EmployeeProfilePage);
