import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCompanyProfileAction,
  getCompanyLocationsAction,
  updateCompanyProfileAction,
} from 'actions/user/user.action';
import {
  CompanyLocation,
  CompanyProfile,
  CompanyProfileStateType
} from 'actions/user/user.types';
import { openModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import BCCircularLoader from '../../../components/bc-circular-loader/bc-circular-loader';
import BCCompanyLocation
  from "../../../components/bc-company-profile/bc-company-location";
import BCCompanyProfile
  from "../../../components/bc-company-profile/bc-company-profile";
import {
  companyLocationFields,
  companyProfileFields,
} from "../../../components/bc-company-profile/fields";
import * as Yup from "yup";
import {
  phoneRegExp,
  zipCodeRegExp
} from "../../../../helpers/format";
import {modalTypes} from '../../../../constants';
import styles from "./company-profile.styles";
import BCTabs from 'app/components/bc-tab/bc-tab';
import SwipeableViews from 'react-swipeable-views';
import { useTheme, withStyles } from '@material-ui/core';
import TabEmployeesGrid  from "./employees/employees";
import TabVendorsGrid  from "./vendors/vendors";
import { getDivision } from 'actions/division/division.action';

interface User {
  _id?: string,
  auth?: {
    email?: string,
    password?: string
  },
  profile?: {
    firstName?: string,
    lastName?: string,
    displayName?: string
  },
  address?: {
    street?: string,
    city?: string,
    state?: string,
    zipCode?: string
  },
  contact?: {
    phone?: string
  },
  permissions?: {
    role?: 0
  },
  info?: {
    companyName?: string,
    companyEmail?: string,
    fax?: string,
    phone?: string,
    city?: string,
    state?: string,
    zipCode?: string,
    logoUrl?: string,
    industry?: string
  },
  company?: string
}

function CompanyProfilePage({ classes }: any) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const profileState: CompanyProfileStateType = useSelector((state: any) => state.profile);
  const [location, setLocation] = useState<CompanyLocation| null>(null);
  const [curTab, setCurTab] = useState(0);
  const { user } = useSelector((state: any) => state.auth);
  const [loading, setLoading] = useState<boolean>(true);

  const handleTabChange = (newValue: number) => {
    setCurTab(newValue);
  }

  useEffect(() => {
    let user: User = {};
    user = JSON.parse(localStorage.getItem('user') || "");
    dispatch(getCompanyProfileAction(user?.company as string));
    dispatch(getCompanyLocationsAction());
  }, []);


  useEffect(()=> {
    if (user._id && profileState.locations?.length) dispatch(getDivision(user._id))
    if(!profileState.isLoading && !profileState.isLocationLoading){
     setLoading(false); 
    }
  }, [profileState])
  const handleUpdateCompanyProfile = async (values: any) => {
    const {
      companyName,
      companyEmail,
      phone,
      logoUrl,
      fax,
      city,
      state,
      zipCode,
      street,
      paymentTerm
    } = values


    const data: CompanyProfile = {
      companyName,
      companyEmail,
      phone,
      logoUrl,
      fax,
      city,
      state,
      zipCode,
      street,
      paymentTerm
    }

    await dispatch(updateCompanyProfileAction(data));
    let user: any = {};
    user = JSON.parse(localStorage.getItem('user') || "");
    dispatch(getCompanyProfileAction(user?.company as string));
  }

  const companyProfileSchema = Yup.object().shape({
    companyName: Yup.string().required('Required'),
    companyEmail: Yup.string().email('Email is not email').required('Required'),
    phone: Yup.string().matches(phoneRegExp, 'Phone number is not valid'),
    zipCode: Yup.string().matches(zipCodeRegExp, 'Zip code is not valid')
  });

  const openAddContactModal = () => {
    dispatch(setModalDataAction({
      'data': {
        'props': {
          avatar: {url: profileState.logoUrl},
          apply: (value: any) => handleUpdateCompanyProfile(value),
          fields: companyProfileFields(profileState),
          initialValues: profileState,
          schema: companyProfileSchema,
          userProfile: false
        },
        'modalTitle': 'Edit Company Profile',
        'removeFooter': false
      },
      'type': modalTypes.EDIT_PROFILE
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };


  const editItem = (selectedItem: any) => {
    const fullItem = profileState.locations.find((location) => location._id === selectedItem?.id);
    dispatch(
      setModalDataAction({
        data: {
          companyLocation: fullItem,
          //modalTitle: 'Add New Location',
          removeFooter: false,
          companyLocationList: profileState.locations,
        },
        type: modalTypes.COMPANY_LOCATION_MODAL,
      })
    );
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }

  const handleAddLocation = () => {
    dispatch(
      setModalDataAction({
        data: {
          companyLocation: profileState.locations.length > 4 ? null : {
            contact: {phone: profileState?.phone || ''},
            info: {companyEmail: profileState?.companyEmail || ''},
          },
          companyLocationList: profileState.locations,
          removeFooter: false,
        },
        type: modalTypes.COMPANY_LOCATION_MODAL,
      })
    );
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }

  return (
    <MainContainer>
      <PageContainer>
        {
          loading ? (
              <BCCircularLoader/>
            ) :
            <div>
              <BCCompanyLocation
                setLocation={setLocation}
                profileState={profileState}
                openAddContactModal={openAddContactModal}
                editItem={editItem}
                handleAddLocation={handleAddLocation}
              />
              <br />

              <BCTabs
                curTab={curTab}
                indicatorColor={"primary"}
                onChangeTab={handleTabChange}
                tabsData={[
                  {
                    label: "Details",
                    value: 0,
                  },
                  {
                    label: "Employees",
                    value: 1,
                  },
                  {
                    label: "Vendors",
                    value: 2,
                  }
                ]}
              />
              <SwipeableViews
                axis={theme.direction === "rtl" ? "x-reverse" : "x"}
                index={curTab}
              >
                <div
                  className={classes.dataContainer}
                  hidden={curTab !== 0}
                  id={'0'}>
                    {location &&
                      <BCCompanyProfile
                        fields={companyLocationFields(location)}
                        companyLocation={location}
                      />
                    }
                </div>
                <div
                  className={classes.dataContainer}
                  hidden={curTab !== 1}
                  id={'1'}>
                    {location && <TabEmployeesGrid companyLocation={location}>
                    </TabEmployeesGrid>
                    }
                </div>
                <div
                  className={classes.dataContainer}
                  hidden={curTab !== 2}
                  id={'2'}>
                  {
                    location && <TabVendorsGrid companyLocation={location}>
                    </TabVendorsGrid>
                  }
                </div>
              </SwipeableViews>
            </div>
        }
      </PageContainer>
    </MainContainer>
  )
}

const MainContainer = styled.div`
  display: flex;
  flex: 1 1 100%;
  width: 100%;
  margin-left: 10px;
  overflow-x: hidden;
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  padding: 30px;
  width: 100%;
  padding-left: 65px;
  padding-right: 65px;
  margin: 0 auto;
`;


export default withStyles(styles, { withTheme: true })(CompanyProfilePage);
