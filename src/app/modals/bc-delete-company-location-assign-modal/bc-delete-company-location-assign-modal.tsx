import styles from "./bc-delete-company-location-assign-modal.styles";
import { Box, Button, DialogActions, DialogContent, Fab, Grid, Typography, withStyles } from "@material-ui/core";
import React, {useState } from "react";
import { UpdateCompanyLocationAssignmentsAction } from "actions/user/user.action";
import { CompanyLocation } from "actions/user/user.types";
import { success } from "actions/snackbar/snackbar.action";
import { closeModalAction, setModalDataAction } from "actions/bc-modal/bc-modal.action";
import WarningIcon from "@material-ui/icons/Warning";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { setFlagUnsignedVendors } from "actions/vendor/vendor.action";
import { refreshDivision } from "actions/division/division.action";

interface API_PARAMS {
  companyLocationId?: string;
  workTypes?: string[];
  assignedVendors?: {
    vendorId: string,
    workTypes: string[]
  }[];
  assignedEmployees?: {
    employeeId: string,
    workTypes: string[]
  }[]
}

function BCDeleteCompanyLocationAssignModal({
    classes,
    companyLocation,
    assignee,
    page
  }: { classes: any, companyLocation: CompanyLocation, assignee: {[key: string]: any}, page: string}): JSX.Element {
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
    
    const onDelete = () => {
      setSubmitting(true);
      let payload: API_PARAMS = {
        companyLocationId: companyLocation._id,
        workTypes: companyLocation?.workTypes ? companyLocation?.workTypes.map(res => res._id): []
      };
      
      if (page == "Employee") {
        let newAssignedEmployees = companyLocation?.assignedEmployees?.filter(res => res._id != assignee._id);
        const newAssignedEmployeesFormatted = newAssignedEmployees?.map(res => {
          return {
            employeeId: res?.employee?._id,
            workTypes: res?.workTypes?.map((workType: any) => workType?._id)
          }
        });
        payload.assignedEmployees = newAssignedEmployeesFormatted;      
      }else{
        let newAssignedVendors = companyLocation?.assignedVendors?.filter(res => res._id != assignee._id);
        const newAssignedVendorsFormatted = newAssignedVendors?.map(res => {
          return {
            vendorId: res?.vendor?._id,
            workTypes: res?.workTypes?.map((workType: any) => workType?._id)
          }
        });
        payload.assignedVendors = newAssignedVendorsFormatted;        
      }
      
      dispatch(UpdateCompanyLocationAssignmentsAction(payload, (status) => {
        if (status) {
          closeModal();
          dispatch(success("Assignment deleted successfully"));
          dispatch(setFlagUnsignedVendors({assignedVendorsIncluded: true}));
          dispatch(refreshDivision(true));
        }else{
          setSubmitting(false);
        }
      }))
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
                <div style={{fontWeight: 'bold', fontSize: 25, width: 300, textAlign: 'center'}}>
                  {`Are you sure you want to delete ${(assignee?.employee?.profile?.displayName ?? assignee?.vendor?.info?.companyName) || "the data"}`}
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
              onClick={onDelete}
              variant={'contained'}
            >{'Delete'}</Button>
          </DialogActions>
        </DataContainer>
    )
}

const DataContainer = styled.div`
  margin: auto 0;
`;

  export default withStyles(
    styles,
    { 'withTheme': true }
  )(BCDeleteCompanyLocationAssignModal);
