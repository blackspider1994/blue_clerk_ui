import React from 'react';
import styles from './bc-company-profile.style';
import { Button, Grid, Typography, withStyles } from "@material-ui/core";
import { CompanyLocation } from 'actions/user/user.types';
import { useDispatch } from 'react-redux';
import { openModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { modalTypes } from '../../../constants';

interface Props {
  fields: ColumnField[];
  classes: any;
  companyLocation: CompanyLocation | null
}

interface ColumnField {
  label: string;
  id: string;
  value: any;
}

function BCCompanyProfile({ fields, classes, companyLocation }: Props) {
  const dispatch = useDispatch();

  const handleUpdate = () => {
    dispatch(setModalDataAction({
      'data': {
        'companyLocation': companyLocation,
        'modalTitle': 'Edit Billing Address',
        'removeFooter': false
      },
      'type': modalTypes.EDIT_BILLING_ADDRESS
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }

  return (
    <div className={classes.fieldsPane}>
      <div className={classes.fieldsPaneContainer}>
        {fields.map((element) =>
          <div className={classes.fieldPane} key={element.id}>
            <span className={classes.filedLabel}>{element.label}</span>
            <span className={classes.fieldText}>{element.value}</span>
          </div>
        )}
      </div>
      <Grid container spacing={1} alignItems='center' className={classes.billingAddress}>
        <Grid direction={'row'} xs={9}>
          <Grid container className={classes.billingAddressTtitle}>
            <span className={classes.filedLabel}>Billing Address</span>
          </Grid>
          <Grid container className={classes.billingAddressTtitle}>
            <span className={classes.fieldText}>{companyLocation?.billingAddress?.street ? `${companyLocation?.billingAddress?.street}, ` : ' '}{companyLocation?.billingAddress?.city ? `${companyLocation?.billingAddress?.city}, ` : ' '} {companyLocation?.billingAddress?.state} {companyLocation?.billingAddress?.zipCode}</span>
          </Grid>
        </Grid>
        <Grid xs={3}>
          <Button
            aria-label={'update-billing-address'}
            color="primary"
            onClick={handleUpdate}
            className={classes.billingAddressUpdate}
            variant={'outlined'}>
            Update
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

export default withStyles(
  styles,
  { 'withTheme': true }
)(BCCompanyProfile);

function ErrorText({ text }: { text: string }) {
  return (
    <Typography align="left" variant="caption" color="error">
      {text}
    </Typography>
  );
}
