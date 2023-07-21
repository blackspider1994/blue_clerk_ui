import { Typography, withStyles } from '@material-ui/core';
import React, { FC } from 'react';
import styles from './no-location-assigned.styles';

function NoLocationAssignedPage({ classes }: any) {
  return (
    <div className={classes.mainContainer}>
      <Typography variant='h3' align='center' style={{ width: '75%', padding: '3rem' }}>
        You are not assigned any locations or work types. Please contact your company admin.
      </Typography>
    </div>
  );
};

export default withStyles(styles, { 'withTheme': true })(NoLocationAssignedPage);
