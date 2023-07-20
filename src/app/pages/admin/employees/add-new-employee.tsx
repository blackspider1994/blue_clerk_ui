import React, { useState } from 'react';
import styled from 'styled-components';
import styles from './add-new-employee.style';
import {
  Checkbox,
  Fab,
  FormControlLabel,
  Grid,
  IconButton,
  TextField,
  withStyles,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@material-ui/core';
import { ArrowDropDown } from '@material-ui/icons';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import validator from 'validator';
import { UserProfile } from 'actions/employee/employee.types';
import { useDispatch, useSelector } from 'react-redux';
import { createOfficeAdmin } from 'actions/employee/employee.action';
import { useLocation, useHistory } from 'react-router-dom';
import { info, error, success } from 'actions/snackbar/snackbar.action';
import { permissionDescriptions } from 'app/components/bc-roles-permissions/rolesAndPermissions';
import axios from 'axios';
import { RolesAndPermissions } from 'actions/permissions/permissions.types';
import { updateUserPermissionsAction } from 'actions/permissions/permissions.action';

export enum Roles {
  Technician = 'Technician',
  Administrator = 'Administrator',
  Manager = 'Manager',
  OfficeAdmin = 'OfficeAdmin',
}

interface Props {
  classes: any;
  children?: React.ReactNode;
}

function AdminAddNewEmployeePage({ classes, children }: Props) {
  const dispatch = useDispatch();
  const { rolesAndPermissions } = useSelector((state: any) => state.permissions)
  const [roles, setRoles] = useState<RolesAndPermissions>(rolesAndPermissions);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const location = useLocation<any>();
  const history = useHistory();

  const renderGoBack = (location: any) => {
    const baseObj = location;

    const stateObj =
      baseObj && baseObj['currentPage'] !== undefined
        ? {
            prevPage: baseObj['currentPage'],
          }
        : {};

    history.push({
      pathname: `/main/admin/employees`,
      state: stateObj,
    });
  };

  const submit = async (
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    allLocation: boolean
  ) => {
    const data: UserProfile = {
      firstName,
      lastName,
      email,
      phone: phoneNumber,
      canAccessAllLocations: allLocation,
    };

    let response: any;
    response = await dispatch(createOfficeAdmin(data));
    
    if (response.employee?._id) {
      try {
        dispatch(updateUserPermissionsAction(response.employee._id, roles));
      } catch (err) {
        dispatch(info('Something went wrong.'));
      }
    }

    if (response.status) {
      await renderGoBack(location.state);
      dispatch(success('Employee created successfully.'));
    } else if (
      response.message ===
      'Email address already registered. Please try with some other email address'
    ) {
      dispatch(info(response.message));
    }
  };

  const [firstName, setFirstName] = useState('');
  const [firstNameValid, setFirstNameValid] = useState(true);

  const firstNameChanged = (newValue: string) => {
    setFirstName(newValue);
    if (newValue === '') setFirstNameValid(false);
    else setFirstNameValid(true);
  };

  const [lastName, setLastName] = useState('');
  const [lastNameValid, setLastNameValid] = useState(true);

  const lastNameChanged = (newValue: string) => {
    setLastName(newValue);
    if (newValue === '') setLastNameValid(false);
    else setLastNameValid(true);
  };

  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(true);

  const emailChanged = (newValue: string) => {
    setEmail(newValue);
    if (newValue === '' || !validator.isEmail(newValue)) setEmailValid(false);
    else setEmailValid(true);
  };

  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumberValid, setPhoneNumberValid] = useState(true);

  const phoneNumberChanged = (newValue: string) => {
    setPhoneNumber(newValue);
    if (newValue === '' || !validator.isMobilePhone(newValue))
      setPhoneNumberValid(false);
    else setPhoneNumberValid(true);
  };

  const next = () => {
    if (!firstNameValid || !lastNameValid || !emailValid || !phoneNumberValid)
      return;
    if (!firstName || !lastName || !email || !phoneNumber) return;
    else {
      submit(
        firstName,
        lastName,
        email,
        phoneNumber,
        showAllLocation
      );
    }
  };

  const [showAllLocation, setShowLocation] = useState<boolean>(false);
  const handleShowAllLocation = (event: any) => {
    setShowLocation(event.target.checked);
  };

  const prev = () => {
    renderGoBack(location.state);
  };

  const handleUpdateRoles = (key: string) => {
    const permissions = roles[key];
    let value = false;

    if (Object.values(permissions).some((p) => p)) {
      // Turn off everything if one sub permission is on
      value = false;
    } else {
      value = true;
    }

    Object.keys(permissions).forEach((p) => {
      permissions[p] = value;
    });

    setRoles((state: RolesAndPermissions) => ({
      ...state,
      [key]: permissions,
    }));
  };

  const handleUpdatePermissions = (roleKey: string, permissionKey: string) => {
    const permissions = roles[roleKey];
    permissions[permissionKey] = !permissions[permissionKey];

    setRoles((state: RolesAndPermissions) => ({
      ...state,
      [roleKey]: permissions,
    }));
  };

  const getIsRoleActive = (key: string) => {
    const permissions = roles[key];
    // If one of the permissions is active, role is active
    return Object.values(permissions).some((a) => a);
  };

  const handleExpand = (key: string) => {
    setExpanded((state) => {
      return { ...state, [key]: !state[key] };
    });
  };

  return (
    <>
      <div className={classes.pageMainContainer}>
        <div className={classes.pageContainer}>
          <div className={classes.pageContent}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <IconButton
                onClick={prev}
                className={classes.roundBackground}
                color={'primary'}
              >
                <ArrowBackIcon fontSize={'small'} />
              </IconButton>
              <div className={classes.mainPane}>
                <div className={classes.infoPane}>
                  <h2>Add New Employee</h2>
                  <h4 className={classes.required}>
                    <span className={classes.asterisk}>*</span>All fields are
                    required
                  </h4>
                  <Grid container spacing={2}>
                    <Grid xs={12} md={6}>
                      <TextField
                        id={'first-name'}
                        placeholder={'First Name'}
                        variant={'outlined'}
                        error={!firstNameValid}
                        value={firstName}
                        onChange={(e) => {
                          firstNameChanged(e.target.value);
                        }}
                        autoComplete="off"
                        style={{
                          width: '100%',
                          padding: '15px 15px 15px 0',
                        }}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <TextField
                        id={'last-name'}
                        placeholder={'Last Name'}
                        variant={'outlined'}
                        error={!lastNameValid}
                        value={lastName}
                        onChange={(e) => {
                          lastNameChanged(e.target.value);
                        }}
                        autoComplete="off"
                        style={{
                          width: '100%',
                          padding: '15px 0 15px 0',
                        }}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <TextField
                        id={'email'}
                        placeholder={'Email'}
                        variant={'outlined'}
                        error={!emailValid}
                        value={email}
                        onChange={(e) => {
                          emailChanged(e.target.value);
                        }}
                        autoComplete="off"
                        style={{
                          width: '100%',
                          padding: '15px 15px 15px 0',
                        }}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <TextField
                        id={'phone-number'}
                        placeholder={'Phone Number'}
                        variant={'outlined'}
                        error={!phoneNumberValid}
                        value={phoneNumber}
                        onChange={(e) => {
                          phoneNumberChanged(e.target.value);
                        }}
                        autoComplete="off"
                        style={{
                          width: '100%',
                          padding: '15px 0 15px 0',
                        }}
                      />
                    </Grid>
                    <Grid container item xs>
                      <FormControlLabel
                        control={
                          <Checkbox
                            color={'primary'}
                            checked={showAllLocation}
                            onChange={handleShowAllLocation}
                            name="ShowAllLocation"
                          />
                        }
                        label={'Access All Locations'}
                      />
                    </Grid>
                    <div className={classes.contentContainer}>
                      {Object.keys(roles)
                        .filter((roleKey) => permissionDescriptions[roleKey])
                        .map((roleKey) => {
                          const permissions = roles[roleKey];
                          const roleText = permissionDescriptions[roleKey];
                          let permissionKeys: string[] = [];

                          if (permissions) {
                            permissionKeys = Object.keys(permissions);
                          }

                          return (
                            <Accordion
                              expanded={Boolean(expanded[roleKey])}
                              className={classes.card}
                              style={{
                                borderTopLeftRadius: '10px',
                                borderTopRightRadius: '10px',
                              }}
                            >
                              <AccordionSummary
                                className={classes.accordionSummary}
                                onClick={() => handleExpand(roleKey)}
                                expandIcon={
                                  <ArrowDropDown
                                    style={{ cursor: 'pointer' }}
                                  />
                                }
                              >
                                <FormControlLabel
                                  classes={{ label: classes.checkboxLabel }}
                                  control={
                                    <Checkbox
                                      color={'primary'}
                                      checked={getIsRoleActive(roleKey)}
                                      onChange={() => {
                                        handleUpdateRoles(roleKey);
                                      }}
                                      name={roleKey}
                                    />
                                  }
                                  label={roleText}
                                />
                              </AccordionSummary>
                              <AccordionDetails className={classes.permissions}>
                                {permissionKeys
                                  .filter((key) => permissionDescriptions[key])
                                  .map((key) => {
                                    const permissionValue = permissions[key];
                                    const permissionText =
                                      permissionDescriptions[key];
                                    return (
                                      <FormControlLabel
                                        classes={{
                                          label: classes.checkboxLabel,
                                        }}
                                        control={
                                          <Checkbox
                                            color={'primary'}
                                            checked={permissionValue}
                                            onChange={() =>
                                              handleUpdatePermissions(
                                                roleKey,
                                                key
                                              )
                                            }
                                            name={permissionText}
                                          />
                                        }
                                        label={permissionText}
                                      />
                                    );
                                  })}
                              </AccordionDetails>
                            </Accordion>
                          );
                        })}
                    </div>
                  </Grid>
                </div>
                <div className={classes.buttonPane}>
                  <Fab
                    aria-label={'new-ticket'}
                    classes={{
                      root: classes.fabRoot,
                    }}
                    color={'primary'}
                    style={{
                      width: '15%',
                    }}
                    onClick={next}
                    variant={'extended'}
                  >
                    {'Save'}
                  </Fab>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default withStyles(styles, { withTheme: true })(AdminAddNewEmployeePage);
