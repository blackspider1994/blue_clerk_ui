import React, { useState } from "react";
import styles from "./bc-billing-address-warning.style";
import { useDispatch } from "react-redux";
import { setModalDataAction, closeModalAction } from "actions/bc-modal/bc-modal.action";
import { withStyles, DialogContent, Typography, Box, Fab, Grid, DialogActions, Button } from "@material-ui/core";
import WarningIcon from "@material-ui/icons/Warning";
import styled from "styled-components";

interface Props {
  classes: any;
  action: Function;
}

function BCBillingAddressWarningModal({classes, action}: Props):JSX.Element {
  const dispatch = useDispatch();
  const [isSubmitting, setSubmitting] = useState(false)
  
  const closeModal = () => {
    setTimeout(() => {
      dispatch(
        setModalDataAction({
          data: {},
          type: "",
        })
      );
    }, 200);
    dispatch(closeModalAction());
  }

  const onSubmit = () => {
    action();
    dispatch(closeModalAction());
  }

  return (
    <DataContainer className={'new-modal-design'} >
      <DialogContent classes={{ 'root': classes.dialogContent }}>
        <Grid
          container 
          className={'modalContent'}
          direction={'column'}
          justify={'center'}
          alignItems={'center'}
        >
          <Grid item>
            <WarningIcon />
          </Grid>
          <Grid item>
            <div style={{fontWeight: 'bold',  width: 430, fontSize: '18px', textAlign: 'center'}}>
              Do you want to change the billing address for all invoices previously made and for all invoices starting now?
            </div>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={isSubmitting}
          onClick={closeModal}
          variant={'outlined'}
        >Cancel</Button>
        <Button
          color={'primary'}
          disabled={isSubmitting}
          onClick={onSubmit}
          variant={'contained'}
        >Update</Button>
      </DialogActions>
    </DataContainer>
  )
}

const DataContainer = styled.div`
  margin: auto 0;
`;

export default withStyles(styles, { withTheme: true })(BCBillingAddressWarningModal);
