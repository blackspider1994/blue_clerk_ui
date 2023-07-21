import React, { useState } from "react";
import styles from "./bc-po-request-warning-modal.style";
import { useDispatch } from "react-redux";
import { setModalDataAction, closeModalAction, openModalAction } from "actions/bc-modal/bc-modal.action";
import { withStyles, DialogContent, Grid, DialogActions, Button } from "@material-ui/core";
import styled from "styled-components";
import WarningIcon from "@material-ui/icons/Warning";
import { modalTypes } from '../../../constants';

interface Props {
  classes: any;
  po_request_id: string;
}

function BCPORequestWarningModal({ classes, po_request_id }: Props):JSX.Element {
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
    dispatch(setModalDataAction({
      'data': {
        'po_request_id': po_request_id,
        'modalTitle': `Send PO Request`,
        'removeFooter': false,
      },
      'type': modalTypes.EMAIL_PO_REQUEST_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
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
              A Customer PO is required for this customer in order to create this ticket
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
        >Send PO Request</Button>
      </DialogActions>
    </DataContainer>
  )
}

const DataContainer = styled.div`
  margin: auto 0;
`;

export default withStyles(styles, { withTheme: true })(BCPORequestWarningModal);
