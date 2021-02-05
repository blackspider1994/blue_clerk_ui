import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import BCAdminProfile from '../../../components/bc-admin-profile/bc-admin-profile'
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from 'api/user.api';
import { updateCompanyProfileAction, getCompanyProfileAction } from 'actions/user/user.action';
import { CompanyProfile, CompanyProfileStateType } from 'actions/user/user.types';
import { phoneRegExp, digitsOnly } from 'helpers/format';
import BCCircularLoader from '../../../components/bc-circular-loader/bc-circular-loader';
import * as Yup from 'yup';
import { call, cancel, cancelled, fork, put, take } from 'redux-saga/effects';
import { loginActions, logoutAction } from 'actions/auth/auth.action';

const userProfileSchema = Yup.object().shape({
  firstName: Yup.string().required('Required'),
  lastName: Yup.string().required('Required'),
  phone: Yup.string().matches(phoneRegExp, 'Phone number is not valid'),
});

interface User {
  _id?: string,
  auth?: {
    email?: string,
    password?: string
  },
  profile?: {
    firstName?: string,
    lastName?: string,
    displayName?: string,
    imageUrl?: string,
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

function ViewProfilePage() {
  const dispatch = useDispatch();

  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  const [update, setUpdate] = useState(true)

  const userProfile: any = JSON.parse(localStorage.getItem('user') || '');


  const initialValues = {
    firstName: userProfile.profile.firstName,
    lastName: userProfile.profile.lastName,
    phone: userProfile.contact.phone,
    email: userProfile.auth.email,
  };

  const handleUpdateProfile = async (values: any) => {
    const { firstName, lastName, phone, logoUrl } = values;

    try {


      const response: any = await updateProfile(values);

      if (response.message === "Profile updated successfully.") {

        console.log(response, 'old');
        let oldUserProfile = userProfile;

        let profile = oldUserProfile.profile

        profile = {
          ...profile,
          firstName,
          lastName,
          imageUrl: logoUrl && logoUrl !== "" ? logoUrl : profile.imageUrl,
        }

        let contact = oldUserProfile.contact

        contact = {
          ...contact,
          phone,
        }
        oldUserProfile = {
          ...oldUserProfile,
          profile,
          contact,
        }

        let token = localStorage.getItem('token');
        localStorage.setItem('user', JSON.stringify(oldUserProfile));


        dispatch(loginActions.success({
          token,
          user: oldUserProfile,
        }))


      }

    } catch (err) {
      console.log(err)
    }
    setUpdate(!update);
  }

  useEffect(() => {

  }, [update]);

  console.log(userProfile)

  return (
    <MainContainer>
      <PageContainer>
        {
          isLoading ? (
            <BCCircularLoader />
          ) : (
              <BCAdminProfile
                title="Edit Profile"
                avatar={{
                  isEmpty: 'NO',
                  url: userProfile && userProfile.profile && userProfile.profile.imageUrl ? userProfile.profile.imageUrl : imageUrl,
                  imageUrl: imageUrl,
                }}
                apply={(value: any) => handleUpdateProfile(value)}
                initialValues={initialValues}
                schema={userProfileSchema}
                fields={[
                  {
                    left: {
                      id: 'firstName',
                      label: 'First Name:',
                      placehold: 'Input First Name',
                      value: userProfile.profile.firstName,
                    },
                    right: {
                      id: 'lastName',
                      label: 'Last Name:',
                      placehold: 'Input Last Name',
                      value: userProfile.profile.lastName,
                    },
                  },
                  {
                    left: {
                      id: 'phone',
                      label: 'Phone:',
                      placehold: 'Input Phone Number',
                      value: userProfile.contact.phone,
                    },
                    right: {
                      id: 'email',
                      label: 'Email:',
                      placehold: 'Input Email',
                      value: userProfile.auth.email,
                      disabled: true
                    },
                  },
                ]} />
            )
        }
      </PageContainer>
    </MainContainer>
  )
}

const MainContainer = styled.div`
  display: flex;
  flex: 1 1 100%;
  width: 90%;
  margin-left: 20px;
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


export default ViewProfilePage;
