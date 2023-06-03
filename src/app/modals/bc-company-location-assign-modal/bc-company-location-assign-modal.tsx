import { useFormik } from "formik";
import styles from "./bc-company-location-assign-modal.styles";
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, TextField, Typography, withStyles } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Autocomplete, createFilterOptions } from "@material-ui/lab";
import { useDispatch, useSelector } from 'react-redux';
import styled from "styled-components";
import * as CONSTANTS from '../../../constants';
import { closeModalAction, setModalDataAction } from "actions/bc-modal/bc-modal.action";
import { getEmployees } from "actions/employee/employee.action";
import { getVendors, setFlagUnsignedVendors } from "actions/vendor/vendor.action";
import * as Yup from "yup";
import { UpdateCompanyLocationAssignmentsAction } from "actions/user/user.action";
import { CompanyLocation } from "actions/user/user.types";
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

interface formAssignWorkType {
  assignee: any;
  workTypes: any[]
}

const assignSchema = Yup.object().shape({
  workTypes: Yup.array().required("Required"),
  assignee: Yup.object().required("Required"),
});

function BCCompanyLocationAssignModal({
  classes,
  companyLocation,
  page,
  formMode,
  formData
}: { classes: any, companyLocation: CompanyLocation, page: "Employee" | "Vendor", formMode: "add" | "edit", formData: any }): JSX.Element {
  const employees = useSelector((state: any) => state.employees.data);
  const vendors = useSelector((state: any) => state.vendors.data);
  const [assigneeList, setAssigneeList] = useState([]);


  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getEmployees())
    dispatch(getVendors())
  }, [])

  useEffect(() => {
    if (page == "Employee") {
      try {
        let filteredEmployees = employees;
        if (companyLocation?.assignedEmployees?.length) {
          let assignedEmployees = companyLocation.assignedEmployees.map(res => res.employee._id);
          filteredEmployees = employees?.filter((employee: any) => !assignedEmployees.includes(employee._id) || employee._id == formData?.employee._id);
        }
        setAssigneeList(filteredEmployees.map((res: any) => { 
          return { 
            _id: res._id, 
            name: res.profile?.displayName, 
            filter: res.profile?.displayName + res.auth?.email
          } }));
      } catch (error) { }
    }
  }, [employees])

  useEffect(() => {
    if (page == "Vendor") {
      try {
        let filteredVendors = vendors.filter((vendor: any) => vendor.contractor?._id != undefined);
        if (companyLocation?.assignedVendors?.length) {
          let assignedVendors = companyLocation.assignedVendors.map(res => res.vendor._id);
          filteredVendors = filteredVendors?.filter((vendor: any) => vendor.contractor?._id == formData?.vendor?._id || !assignedVendors.includes(vendor.contractor?._id));
        }
        setAssigneeList(filteredVendors.map((res: any) => { 
          return { 
              _id: res?.contractor?._id, 
              name: res?.contractor?.info?.displayName ? res?.contractor?.info?.displayName : res?.contractor?.info?.companyName,
              filter: (res?.contractor?.info?.displayName ? res?.contractor?.info?.displayName : res?.contractor?.info?.companyName) + res?.contractor?.info?.companyEmail
            } }));
      } catch (error) { }
    }
  }, [vendors])

  let initalValues: formAssignWorkType = {
    assignee: '',
    workTypes: []
  };

  useEffect(() => {
    if (formMode == "edit" && formData) {
      initalValues.assignee = formData.assignee;
      try {
        initalValues.workTypes = formData.workTypes
      } catch (error) { }
    }
  }, [assigneeList])

  const {
    'values': FormikValues,
    'handleSubmit': FormikSubmit,
    isSubmitting,
    setFieldValue,
    setFieldTouched,
    submitForm,
    touched,
    errors
  } = useFormik({
    initialValues: initalValues,
    onSubmit: (values, { setSubmitting }) => {
      let assigneeList = [
        {
          [page == "Employee" ? 'employeeId' : 'vendorId']: values.assignee?._id,
          workTypes: values.workTypes.map((res: any) => res._id)
        }
      ];

      let payload: API_PARAMS = {
        companyLocationId: companyLocation?._id,
        workTypes: companyLocation.workTypes ? companyLocation.workTypes.map(res => res._id) : [],
      };

      if (page == "Employee") {
        const oldAssignedEmployee = companyLocation.assignedEmployees?.filter(res => res.employee?._id != values.assignee?._id && res.employee?._id != formData?.assignee?._id).map(res => {
          return {
            employeeId: res?.employee?._id,
            workTypes: res?.workTypes?.map((workType: any) => workType?._id)
          }
        });
        payload.assignedEmployees = oldAssignedEmployee?.concat(assigneeList as any);
      } else {
        const oldAssignedVendors = companyLocation.assignedVendors?.filter(res => res.vendor?._id != values.assignee?._id && res.vendor?._id != formData?.assignee?._id).map(res => {
          return {
            vendorId: res?.vendor?._id,
            workTypes: res?.workTypes?.map((workType: any) => workType?._id)
          }
        });
        payload.assignedVendors = oldAssignedVendors?.concat(assigneeList as any);
      }

      dispatch(UpdateCompanyLocationAssignmentsAction(payload, (status) => {
        if (status) {
          closeModal()
          dispatch(setFlagUnsignedVendors({assignedVendorsIncluded: true}));
          dispatch(refreshDivision(true));
        } else {
          setSubmitting(false);
        }
      }))
    },
    validationSchema: assignSchema
  })


  const changeField = (name: string, value: any) => {
    setFieldValue(name, value);
    setFieldTouched(name, true);
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


  const assigneeFilterOptions = createFilterOptions({
    stringify: (option: any) => option.filter
  });


  return (
    <DataContainer>
      <form onSubmit={FormikSubmit}>
        <DialogContent classes={{ 'root': classes.dialogContent }}>
          <Grid item xs={12}>
            <Grid container direction={'row'} spacing={1}>
              <Grid container item justify={'flex-end'}
                style={{ marginTop: 8 }} xs={3}>
                <Typography variant={'button'}>Work Type</Typography>
              </Grid>
              <Grid item xs={9}>
                <Autocomplete
                  getOptionLabel={option => {
                    return `${option?.title || ''}`
                  }}
                  id={'tags-standard'}
                  multiple
                  onChange={(ev: any, newValue: any) => changeField("workTypes", newValue)}
                  options={companyLocation?.workTypes ?? []}
                  renderInput={(params) => {
                    return (
                      <TextField
                        error={
                          touched.workTypes &&
                          Boolean(errors.workTypes) &&
                          !FormikValues.workTypes.length
                        }
                        helperText={
                          touched.workTypes &&
                          errors.workTypes &&
                          !FormikValues.workTypes.length
                        }
                        {...params}
                        variant={'outlined'}
                      />
                    )
                  }}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => {
                      return (
                        <Chip
                          label={`${option?.title || ''}`}
                          {...getTagProps({ index })}
                        />
                      );
                    }
                    )
                  }
                  value={FormikValues.workTypes}
                />
              </Grid>
            </Grid>
            <Grid container direction={'row'} spacing={1}>
              <Grid container item justify={'flex-end'}
                style={{ marginTop: 8 }} xs={3}>
                <Typography variant={'button'}>{page}</Typography>
              </Grid>
              <Grid item xs={9}>
                <Autocomplete
                  disableClearable
                  getOptionLabel={(option: any) => {
                    return `${option?.name || ''}`
                  }}
                  id={'tags-standard'}
                  filterOptions={assigneeFilterOptions}
                  onChange={(ev: any, newValue: any) => changeField("assignee", newValue)}
                  options={assigneeList}
                  renderInput={(params) => (
                    <TextField
                      error={
                        touched.assignee &&
                        Boolean(errors.assignee)
                      }
                      helperText={
                        touched.assignee &&
                        errors.assignee
                      }
                      {...params}
                      variant={'outlined'}
                    />
                  )}
                  value={FormikValues.assignee}
                />
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
      </form>
      <DialogActions classes={{ 'root': classes.dialogActions }}>
        <Button
          aria-label={'record-payment'}
          classes={{
            'root': classes.closeButton
          }}
          disabled={isSubmitting}
          onClick={() => closeModal()}
          variant={'outlined'}>
          Cancel
        </Button>

        <Button
          disabled={isSubmitting}
          aria-label={'create-job'}
          classes={{
            root: classes.submitButton,
            disabled: classes.submitButtonDisabled
          }}
          color="primary"
          onClick={submitForm}
          variant={'contained'}>
          Submit
        </Button>

      </DialogActions>
    </DataContainer>
  )
}

const DataContainer = styled.div`
    margin: auto 0;

    .MuiFormLabel-root {
      font-style: normal;
      font-weight: normal;
      width: 800px;
      font-size: 20px;
      color: ${CONSTANTS.PRIMARY_DARK};
      /* margin-bottom: 6px; */
    }
    .MuiFormControl-marginNormal {
      margin-top: .5rem !important;
      margin-bottom: 1rem !important;
      /* height: 20px !important; */
    }
    .MuiInputBase-input {
      color: #383838;
      font-size: 16px;
      padding: 12px 14px;
    }
    .MuiOutlinedInput-root{
      border-radius: 8px;
      padding: 2px;
    }
    .MuiInputAdornment-positionStart {
      margin-right: 0;
    }
    .MuiInputAdornment-root + .MuiInputBase-input {
      padding: 12px 14px 12px 0;
    }
    .MuiOutlinedInput-multiline {
      padding: 0;
    }
    .required > label:after {
      margin-left: 3px;
      content: "*";
      color: red;
    }

    /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* Firefox */
    input[type=number] {
      -moz-appearance: textfield;
    }
`

export default withStyles(
  styles,
  { 'withTheme': true }
)(BCCompanyLocationAssignModal);
