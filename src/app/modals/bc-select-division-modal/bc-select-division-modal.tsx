import React, { useState } from "react";
import styles from "./bc-select-division-modal.style";
import { useDispatch } from "react-redux";
import { setModalDataAction, closeModalAction } from "actions/bc-modal/bc-modal.action";
import { withStyles, DialogContent, Typography, Box, Fab, Grid, DialogActions, Button } from "@material-ui/core";
import WarningIcon from "@material-ui/icons/Warning";
import styled from "styled-components";

interface Props {
  classes: any;
  user: any;
}

function BCSelectDivisionModal({classes, user}: Props):JSX.Element {
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

  console.log(user);
  

  const onSubmit = () => {
    dispatch(closeModalAction());
  }

  return (
    <DataContainer className={'new-modal-design'} >
      <DialogContent classes={{ 'root': classes.dialogContent }}>
        <Grid
          container 
          className={'modalContent'}
          direction={'column'}
          justify={'flex-start'}
          alignItems={'flex-start'}
        >
          <Grid item>
            <div style={{fontWeight: 'bold',  width: 430, fontSize: '18px', textAlign: 'left'}}>
              Welcome {user?.info?.displayName}
            </div>
          </Grid>
        </Grid>
      </DialogContent>
    </DataContainer>
  )
}

const DataContainer = styled.div`
  margin: auto 0;
`;

export default withStyles(styles, { withTheme: true })(BCSelectDivisionModal);
