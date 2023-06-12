import React, {useState, useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { withStyles, ClickAwayListener, Grid, Button, IconButton, FormGroup, InputAdornment, TextField, Checkbox } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CloseIcon from "@material-ui/icons/Close";
import SearchIcon from '@material-ui/icons/Search';
import { useFormik } from 'formik';
import { DatePicker } from "@material-ui/pickers";
import styles from "./bc-map-filter.styles";
import {ReactComponent as IconCalendar} from "../../../assets/img/icons/map/icon-calendar.svg";
import { getEmployeesForJobAction } from 'actions/employees-for-job/employees-for-job.action';
import { getVendors } from 'actions/vendor/vendor.action';
import { applyMapTechnicianFilter, resetMapTechnicianFilter } from 'actions/map-technician-filter/map-technician-filter.action';
import { initialMapTechnicianFilterState } from 'reducers/map-technician-filter.reducer';
import { getAllJobsByTechnicianAndDateAPI } from 'api/job.api';
import { setMapTechnicianJobs } from 'actions/map-technician-jobs/map-technician-jobs.action'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" htmlColor='#00AAFF'/>;

const BCMapFilterTech = ({classes}:any) => {
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const mapTechnicianFilterData: any = useSelector(({mapTechnicianFilterState}: any) => mapTechnicianFilterState)

  const employeesList = useSelector(({ employeesForJob }: any) =>
    employeesForJob.data
      .map((employee: any) => ({ name: employee.profile.displayName, id: employee._id }))
      .sort((a: any, b: any) =>
        a.name > b.name
          ? 1
          : b.name > a.name
            ? -1
            : 0
      )
  );
  const vendorsList = useSelector(({ vendors }: any) =>
    vendors.data.reduce((acc: any[], vendor: any) => {
      if (vendor.status === 1) acc.push(vendor.contractor);
      return acc;
    }, []).map((vendor: any) => ({ name: vendor?.info?.displayName ? vendor?.info?.displayName : vendor?.info?.companyName, id: vendor._id }))
      .sort((a: any, b: any) =>
        a.name > b.name
          ? 1
          : b.name > a.name
            ? -1
            : 0
      )
  );

  useEffect(() => {
    dispatch(getEmployeesForJobAction());
    dispatch(getVendors());
  }, [])

  const technicians:any[] = [...employeesList, ...vendorsList];

  const toggle = (reset?:boolean) => {
    if(reset){
      setValues(mapTechnicianFilterData);
    }
    setShow(current => !current);
  }

  const clearFilter = () => {
    dispatch(resetMapTechnicianFilter())
    setValues(initialMapTechnicianFilterState)
    toggle();
  }

  const closeFilter = () => {
    toggle(true);
  }

  const getJobByTechnicianAndDate = (values = FormikValues) => {
    dispatch(getAllJobsByTechnicianAndDateAPI(values.selectedTechnician, values.jobDate))
  }

  const form = useFormik({
    initialValues: {
      selectedTechnician: mapTechnicianFilterData.selectedTechnician,
      jobDate: mapTechnicianFilterData.jobDate,
    },
    onSubmit: (values,{setSubmitting}) => {
      dispatch(applyMapTechnicianFilter(values));
      setTimeout(() => {
        setSubmitting(false);
        toggle();
      }, 200);
    }
  });

  const {
    values: FormikValues,
    handleSubmit: FormikSubmit,
    setValues,
    setFieldValue,
    isSubmitting
  } = form;

  useEffect(() => {
    if(mapTechnicianFilterData.selectedTechnician.length){
      getJobByTechnicianAndDate(mapTechnicianFilterData);
    } else {
      dispatch(setMapTechnicianJobs([]));
    }
  }, [mapTechnicianFilterData]);

  const hasFilter = JSON.stringify(initialMapTechnicianFilterState) !== JSON.stringify(mapTechnicianFilterData);

  return (
    <>
      <TechFilterContainer onClick={() => toggle()} hasFilter={hasFilter}>
        <TextContent>
          View Scheduled Tech
        </TextContent>
        <ArrowDropDownIcon/>
      </TechFilterContainer>
      {show && (
        <ClickAwayListener onClickAway={() => toggle(true)}>
          <DropDownWrapper>
            <form onSubmit={FormikSubmit}>
              <div className={classes.filterContainer}>
                {<Grid
                  container
                  spacing={2}>
                  <Grid
                    item
                    sm={12}
                    xs={12}
                  >
                    <div className={classes.actionContainer}>
                      <Button size={"small"} onClick={clearFilter}>Clear Filters</Button>
                      <IconButton aria-label="close" onClick={closeFilter}>
                        <CloseIcon />
                      </IconButton>
                    </div>
                    <FormGroup className={'required'}>
                      <Autocomplete
                        multiple
                        options={technicians}
                        getOptionLabel={(option) => option?.name || ''}
                        getOptionSelected={(option: any, value: any) => option.id === value.id}
                        value={FormikValues.selectedTechnician}
                        onChange={(event: any, newValue: any) => {
                          setFieldValue('selectedTechnician', newValue)
                        }}
                        renderOption={(option, { selected }) => (
                          <>
                            <span>
                              {option.name}
                            </span>
                            <Checkbox
                              icon={icon}
                              checkedIcon={checkedIcon}
                              style={{ marginLeft: 8 }}
                              checked={selected}
                            />
                          </>
                        )}
                        classes={{
                          paper: classes.menuContainerAutocomplete
                        }}
                        renderInput={(params) => {
                          return (
                          <TextField
                            {...params}
                            name={'contact'}
                            variant="outlined"
                            placeholder={'View Scheduled Technician'}
                            InputProps={{
                              ...params.InputProps,
                              style: {paddingLeft: 14},
                              startAdornment: <InputAdornment position="start"><SearchIcon htmlColor='#D0D3DC'/></InputAdornment>,
                              endAdornment: (
                                <>
                                  {!!FormikValues.selectedTechnician.length && (
                                    <InputAdornment
                                      position="end"
                                      style={{
                                        width: 20,
                                        height: 20,
                                        border: '1px solid #00AAFF',
                                        borderRadius: '50%',
                                        color: '#00AAFF',
                                        padding: 5
                                      }}>
                                      {FormikValues.selectedTechnician.length}
                                    </InputAdornment>
                                  )}
                                  {params.InputProps.endAdornment}
                                </>
                              )
                            }}
                          />
                        )}}
                      />
                    </FormGroup>
                    <FormGroup className={'required'}>
                      <DatePicker
                        autoOk
                        disablePast={false}
                        format={"MMM d, yyyy"}
                        id={`datepicker-technician-${"scheduleDate"}`}
                        inputProps={{
                          name: "scheduleDate",
                          placeholder: "Scheduled Date",
                        }}
                        inputVariant={"outlined"}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><IconCalendar className="calendar_icon" /></InputAdornment>,
                        }}
                        name={"scheduleDate"}
                        onChange={(newValue: any) => setFieldValue('jobDate', newValue)}
                        required={false}
                        value={FormikValues.jobDate}
                        variant={"inline"}
                      />
                    </FormGroup>
                  </Grid>
                  <Grid
                    item
                    sm={12}
                    xs={12}>
                    <Button
                      aria-label={'apply'}
                      color={'primary'}
                      disabled={isSubmitting || !FormikValues.jobDate || !FormikValues.selectedTechnician?.length}
                      type={'submit'}
                      size={"large"}
                      variant={'contained'}>Apply</Button>
                  </Grid>
                </Grid>
                }
              </div>
            </form>
          </DropDownWrapper>
        </ClickAwayListener>
      )}
    </>
  )
}

const TechFilterContainer = styled.div<{hasFilter?:boolean}>`
  cursor: pointer;
  background: #fff;
  height: 40px;
  padding: 6px;
  padding-left: 10px;
  font-style: normal;
  font-size: 14px;
  line-height: 17px;
  text-align: center;
  color: #4F4F4F !important;
  border-radius: 8px;
  border: 1px solid #c4c4c4;
  border-color: ${p => p.hasFilter ? '#00AAFF' : '#c4c4c4'};
`

const TextContent = styled.span`
  position: relative;
  top: -5px
`

const DropDownWrapper = styled.div`
  position: absolute;
  z-index: 99;
  top: 50px;
  left: -120px;
  width: 360px;
  background: #ffffff;
  border: 1px solid #c4c4c4;
  box-sizing: border-box;
  border-radius: 5px;
  padding-bottom: 10px;
  box-shadow: 0 4px 6px 0 rgb(0 0 0 / 14%), 0 4px 5px 0 rgb(0 0 0 / 12%), 0 1px 10px 0 rgb(0 0 0 / 20%);
  .MuiGrid-root {
    width: 100%;
    margin: 0;
    padding: 5px 0;
  }
  &:before {
    left: unset !important;
    right: 26px;
  }
  &:after {
    left: unset !important;
    right: 24px;
  }
  &::after {
    content: "";
    position: absolute;
    top: -12px;
    left: 14px;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 12px solid #c4c4c4;
  }
  &::before {
    content: "";
    position: absolute;
    top: -11px;
    left: 16px;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 11px solid #ffffff;
    z-index: 1;
  }
`

export default withStyles(
  styles,
  {'withTheme': true},
)(BCMapFilterTech);
