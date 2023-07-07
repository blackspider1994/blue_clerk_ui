import { ArrowDropDown } from '@material-ui/icons';
import { CSButton } from 'helpers/custom';
import { RolesAndPermissions } from 'actions/employee/employee.types';
import axios from 'axios';
import styles from './bc-roles-permissions.style';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
  WithStyles,
  withStyles
} from '@material-ui/core';
import React, { FC, useEffect, useState } from 'react';
import initialRolesAndPermissions, { permissionDescriptions } from './rolesAndPermissions';


interface BcRolesPermissionsProps extends WithStyles<typeof styles> {}

const BcRolesPermissions: FC<BcRolesPermissionsProps> = ({ classes }) => {
  const { employeeDetails } = useSelector((state: any) => state.employees);
  const location = useLocation<any>();
  const obj: any = location.state;
  const { employeeId } = obj;
  let { rolesAndPermissions } : { rolesAndPermissions: RolesAndPermissions } = employeeDetails;

  if (!Object.keys(rolesAndPermissions).length) {
    rolesAndPermissions = initialRolesAndPermissions;
  }

  const [roles, setRoles] = useState<RolesAndPermissions>(rolesAndPermissions);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({ });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setRoles(rolesAndPermissions);
  }, [rolesAndPermissions]);

  const handleUpdateRoles = (key: string) => {
    const permissions = roles[key];
    let value = false;

    if (Object.values(permissions).some(p => p)) {
      // Turn off everything if one sub permission is on
      value = false;
    } else {
      value = true;
    }

    Object.keys(permissions).forEach(p => {
      permissions[p] = value;
    });

    setRoles((state: RolesAndPermissions) => ({ ...state,
      [key]: permissions }));
  };

  const handleUpdatePermissions = (roleKey: string, permissionKey: string) => {
    const permissions = roles[roleKey];
    permissions[permissionKey] = !permissions[permissionKey];

    setRoles((state: RolesAndPermissions) => ({ ...state,
      [roleKey]: permissions }));
  };

  const getIsRoleActive = (key: string) => {
    const permissions = roles[key];
    // If one of the permissions is active, role is active
    return Object.values(permissions).some(a => a);
  };

  const handleExpand = (key: string) => {
    setExpanded(state => {
      return { ...state,
        [key]: !state[key] };
    });
  };

  const handleSavePermission = async () => {
    await axios.post(`${process.env.REACT_APP_LAMBDA_URL}/permissions/${employeeId}`, { 'permission': roles });

    setIsEditing(false);
  };

  return (
    <Grid container direction={'column'} className={classes.container}>
      <div className={classes.headerContainer}>
        <Typography align={'left'} variant={'h4'} color={'primary'}>
          <strong>{'Roles / Permissions'}</strong>
        </Typography>
        {!isEditing &&
          <CSButton
            aria-label={'new-ticket'}
            color={'primary'}
            onClick={() => {
              setIsEditing(true);
            }}
            variant={'contained'}>
            {'Edit Role/Permissions\r'}
          </CSButton>
        }
      </div>
      <div className={classes.contentContainer}>
        {Object.keys(roles).filter(roleKey => permissionDescriptions[roleKey])
          .map(roleKey => {
            const permissions = rolesAndPermissions[roleKey];
            const roleText = permissionDescriptions[roleKey];
            let permissionKeys: string[] = [];

            if (permissions) {
              permissionKeys = Object.keys(permissions);
            }
            if (isEditing) {
              return (
                <Accordion expanded={Boolean(expanded[roleKey])} className={classes.card} style={{ 'borderTopLeftRadius': '10px',
                  'borderTopRightRadius': '10px' }}>
                  <AccordionSummary
                    expandIcon={
                      <ArrowDropDown
                        style={{ 'cursor': 'pointer' }}
                        onClick={() => {
                          handleExpand(roleKey);
                        }}
                      />
                    }>
                    <FormControlLabel
                      classes={{ 'label': classes.checkboxLabel }}
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
                    {permissionKeys.filter(key => permissionDescriptions[key]).map(key => {
                      const permissionValue = permissions[key];
                      const permissionText = permissionDescriptions[key];
                      return (
                        <FormControlLabel
                          classes={{ 'label': classes.checkboxLabel }}
                          control={
                            <Checkbox
                              color={'primary'}
                              checked={permissionValue}
                              onChange={() => handleUpdatePermissions(roleKey, key)}
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
            }
            return (
              <div className={classes.card} style={{ 'borderTopLeftRadius': '10px',
                'borderTopRightRadius': '10px',
                'padding': '1rem' }}>
                <Typography>{roleText}</Typography>
              </div>
            );
          })}
        {isEditing &&
          <div className={classes.actionsContainer}>
            <Button onClick={() => setIsEditing(false)} variant={'outlined'} className={classes.cancelBtn}>{'Cancel'}</Button>
            <CSButton onClick={handleSavePermission}>{'Save Changes'}</CSButton>
          </div>
        }
      </div>
    </Grid>
  );
};

export default withStyles(
  styles,
  { 'withTheme': true }
)(BcRolesPermissions);

