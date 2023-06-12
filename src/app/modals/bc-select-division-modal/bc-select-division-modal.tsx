import React, { useState } from "react";
import styles from "./bc-select-division-modal.style";
import { useDispatch, useSelector } from "react-redux";
import { setModalDataAction, closeModalAction } from "actions/bc-modal/bc-modal.action";
import { withStyles, DialogContent, Grid, DialogActions, Button, TextField } from "@material-ui/core";
import styled from "styled-components";
import { Autocomplete } from "@material-ui/lab";
import { IDivision } from "actions/filter-division/fiter-division.types";
import { setCurrentDivision, setDivisionParams } from "actions/filter-division/filter-division.action";
import LogoPng from '../../../assets/img/logo_blue.png';

interface Props {
  classes: any;
  user?: any;
}

function BCSelectDivisionModal({classes, user}: Props):JSX.Element {
  const dispatch = useDispatch();
  const divisions = useSelector((state: any) => state.divisions.data);
  const [selectedDivision, setSelectedDivision] = useState<IDivision | undefined>();

  const selectDivision = () =>{
    if (selectedDivision != undefined) {
      dispatch(setDivisionParams({
        companyLocation: JSON.stringify(selectedDivision?.name != "All" ? [selectedDivision?.locationId] : selectedDivision?.locationId),
        workType: JSON.stringify(selectedDivision?.name != "All" ? [selectedDivision?.workTypeId] : selectedDivision?.workTypeId)
      }));
      dispatch(setCurrentDivision(selectedDivision));
      closeModal();
    }
  }

  const closeModal = () => {
    dispatch(closeModalAction());
    setTimeout(() => {
      dispatch(setModalDataAction({
        'data': {},
        'type': ''
      }));
    }, 200);
  };

  return (
    <DataContainer>
      <DialogContent classes={{ 'root': classes.dialogContent }}>
        <Grid
          container 
          className={'modalContent'}
          direction={'column'}
          justify={'flex-start'}
          alignItems={'flex-start'}
        >
          <Grid 
            container
            xs={12}
            justify={'center'}
            alignItems={'center'}   
        >
            <img
              alt={'logo-blue'}
              className={classes.logoimg}
              src={LogoPng}
            />
          </Grid>
          <Grid item>
            <div style={{fontWeight: 'bold',  width: 430, fontSize: '18px', textAlign: 'left'}}>
              Welcome, {user?.profile?.displayName}
            </div>
            <span>Please select what you would like to view</span>
          </Grid>
          <Grid container direction={'row'} spacing={1} className={classes.inputState}>
              <Grid item xs={12}>
                <Autocomplete
                  disableClearable
                  getOptionLabel={(option: any) => {
                    return `${option?.name || ''}`
                  }}
                  id={'tags-standard'}
                  options={divisions}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select a Division"
                      variant={'outlined'}
                    />
                  )}
                  onChange={(event: any, newValue: IDivision | undefined) => {
                    setSelectedDivision(newValue);
                  }}
                  value={selectedDivision}
                />
              </Grid>
            </Grid>
        </Grid>
      </DialogContent>
      <DialogActions classes={{ 'root': classes.dialogActions }}>
        <Button
          classes={{
            root: classes.submitButton,
            disabled: classes.submitButtonDisabled
          }}
          color="primary"
          onClick={selectDivision}
          variant={'contained'}>
          Next
        </Button>

      </DialogActions>
    </DataContainer>
  )
}

const DataContainer = styled.div`
  margin: auto 0;
`;

export default withStyles(styles, { withTheme: true })(BCSelectDivisionModal);
