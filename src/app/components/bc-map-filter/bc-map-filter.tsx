import { useFormik } from 'formik';
import {
  Button, Checkbox,   FormControlLabel,
  Grid, IconButton, InputAdornment, MenuItem, Select,
  withStyles
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import React, { useState } from 'react';
import styles from './bc-map-filter.styles';

import {
  FormGroup,
  TextField
} from '@material-ui/core';
import CloseIcon from "@material-ui/icons/Close";
import {STATUSES} from "../../../helpers/contants";
import { AM_COLOR, PM_COLOR } from "../../../constants";

function BCMapFilter({
  classes,
  filterType,
  currentFilter,
  resetFilter,
  callback,
  customers,
  contacts,
  dispatchGetContacts,
}: any): JSX.Element {
  const [menuOpen, setMenuOpen] = useState('');

  const onSubmit = async (values: any, { setSubmitting }: any) => {
    if (typeof callback === "function") callback(values);
  }

  const form = useFormik({
    initialValues: {
      jobId: currentFilter.jobId || '',
      customerNames: currentFilter.customerNames,
      contact: currentFilter.contact,
      jobStatus: currentFilter.jobStatus || [-1],
      isHomeOccupied: currentFilter.isHomeOccupied || false,
      filterAMJobs: currentFilter.filterAMJobs || false,
      filterPMJobs: currentFilter.filterPMJobs || false,
      filterAllDayJobs: currentFilter.filterAllDayJobs || false
    },
    onSubmit
  });

  const {
    errors: FormikErrors,
    values: FormikValues,
    handleChange: formikChange,
    handleSubmit: FormikSubmit,
    setFieldValue,
    isSubmitting
  } = form;

  const clearFilter = () => {
    resetFilter();
  }

  const closeFilter = () => {
    callback();
  }

  const handleCustomerChange = (newValue: any) => {
    setFieldValue('customerNames', newValue);
    if (newValue) {
      let data: any = {
        type: 'Customer',
        referenceNumber: newValue._id
      }
      dispatchGetContacts(data);
    } else {
      setFieldValue('contact', '');
    }
  }

  const handleCustomerContactChange = (newValue: any) => {
    setFieldValue('contact', newValue);
  }

  const handleJobStatusChange = (newValue: any) => {
    const {value} = newValue.props;
    const i = form.values.jobStatus.indexOf(value);
    let newArray = [...form.values.jobStatus];
    if (i >= 0) {
      newArray.splice(i,1);
    } else {
      if (value === -1) {
        newArray = [value];
      } else {
        newArray.push(value);
        const all = form.values.jobStatus.indexOf(-1);
        if (all >= 0) newArray.splice(all,1);
      }
    }
    if (newArray.length === 0) newArray.push(-1);
    setFieldValue('jobStatus', newArray);
  }

  const countSelected = () => {
    const all = form.values.jobStatus.indexOf(-1);
    if (all >= 0) return 7;
    return form.values.jobStatus.length;
  }

  const countTimeSelected = () => {
    return (form.values.filterAMJobs ? 1 : 0) + 
      (form.values.filterPMJobs ? 1 : 0) + 
      (form.values.filterAllDayJobs ? 1 : 0);
  }

  return (
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
              <Button size={"small"} onClick={clearFilter}>Clear Filters 1</Button>
              <IconButton aria-label="close" onClick={closeFilter}>
                <CloseIcon/>
              </IconButton>
            </div>
            <FormGroup className={'required'}>
              <TextField
                name={'jobId'}
                placeholder={filterType === 'ticket' ? 'Ticket ID' : 'Job ID'}
                variant={'outlined'}
                onChange={form.handleChange}
                //type={'search'}
                value={form.values.jobId}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="material-icons">search</i>
                    </InputAdornment>
                  ),
                }}
              />
            </FormGroup>
            <FormGroup>
              <Autocomplete
                onOpen={() => setMenuOpen('customer')}
                onClose={() => setMenuOpen('')}
                options={customers}
                getOptionLabel={(option) => option?.profile?.displayName}
                classes={{
                  inputRoot: menuOpen === 'customer' ? classes.menuOpen : '',
                  paper: classes.menuContainer
                }}
                onChange={(event: any, newValue: any) => handleCustomerChange(newValue)}
                value={form.values.customerNames}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Customer"
                  />
                )}
              />
            </FormGroup>
            <FormGroup>
              <Autocomplete
                onOpen={() => setMenuOpen('contact')}
                onClose={() => setMenuOpen('')}
                options={contacts}
                getOptionLabel={(option) => option?.name}
                value={form.values.contact}
                onChange={(event: any, newValue: any) => handleCustomerContactChange(newValue)}
                classes={{
                  inputRoot: menuOpen === 'contact' ? classes.menuOpen : '',
                  paper: classes.menuContainer
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name={'contact'}
                    variant="outlined"
                    placeholder={'Contact Name'}
                    //type={'search'}
                  />
                )}
              />
            </FormGroup>
            {filterType !== 'ticket' &&
            <FormGroup>
              <Select
                className={menuOpen === 'status' ? classes.menuOpen : ''}
                name={'jobStatus'}
                multiple
                value={form.values.jobStatus}
                onOpen={() => setMenuOpen('status')}
                onClose={() => setMenuOpen('')}
                onChange={(event: any, newValue: any) => handleJobStatusChange(newValue)}
                variant={'outlined'}
                renderValue={() =>
                  <>
                    Job Status&nbsp;&nbsp;
                    <span
                      className={classes.statusCount}>{countSelected()}</span>
                  </>}
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left"
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left"
                  },
                  getContentAnchorEl: null,
                  classes: {
                    paper: classes.menuContainer,
                    list: classes.menu,
                  }
                }}>
                <MenuItem value={-1} classes={{
                  root: classes.itemRoot,
                  selected: classes.itemSelected
                }}>
                  <div className={classes.menuItemContainer}>
                    <span>View All</span>
                    <p></p>
                    <Checkbox
                      checked={form.values.jobStatus.indexOf(-1) >= 0}
                      color="primary"
                      inputProps={{'aria-label': 'primary checkbox'}}
                    />
                  </div>
                </MenuItem>
                {STATUSES.map((status, index) => {
                    const StatusIcon = status.icon;
                    return <MenuItem
                      classes={{
                        root: classes.itemRoot,
                        selected: classes.itemSelected
                      }}
                      value={status.id}>
                      <div className={classes.menuItemContainer}>
                        <StatusIcon/>
                        <span style={{color: status.color}}>{status.title}</span>
                        <p></p>
                        <Checkbox
                          checked={form.values.jobStatus.indexOf(status.id) >= 0}
                          color="primary"
                          inputProps={{'aria-label': 'primary checkbox'}}
                        />
                      </div>
                    </MenuItem>
                  }
                )}
              </Select>
            </FormGroup>
            }
            {filterType === 'job' ?
            <div>
              <FormGroup>
                <Select
                  className={menuOpen === 'timeOfDay' ? classes.menuOpen : ''}
                  name={'timeOfDay'}
                  multiple
                  value={form.values.jobStatus}
                  onOpen={() => setMenuOpen('timeOfDay')}
                  onClose={() => setMenuOpen('')}
                  variant={'outlined'}
                  renderValue={() =>
                    <>
                      Time of the day&nbsp;&nbsp;
                      <span
                        className={classes.statusCount}>{countTimeSelected()}</span>
                    </>}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left"
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left"
                    },
                    getContentAnchorEl: null,
                    classes: {
                      paper: classes.menuContainer,
                      list: classes.menu,
                    }
                  }}>
                  <MenuItem value={-1} classes={{
                    root: classes.itemRoot,
                    selected: classes.itemSelected
                  }}>
                    <div className={classes.menuItemContainer}>
                      <span style={{
                        height: "20px",
                        width: "20px",
                        backgroundColor: "black",
                        borderRadius: "50%",
                        display: "inline-block"
                      }}></span>
                      <span>All day jobs</span>
                      <p></p>
                      <Checkbox
                        color={'primary'}
                        checked={form.values.filterAllDayJobs}
                        name="filterAllDayJobs"
                        classes={{root: classes.checkboxInput}}
                        onChange={(e) => {
                          setFieldValue('filterAllDayJobs', !form.values.filterAllDayJobs);
                        }}
                      />
                    </div>
                  </MenuItem>
                  <MenuItem value={-1} classes={{
                    root: classes.itemRoot,
                    selected: classes.itemSelected
                  }}>
                    <div className={classes.menuItemContainer}>
                      <span style={{
                        height: "20px",
                        width: "20px",
                        backgroundColor: AM_COLOR,
                        borderRadius: "50%",
                        display: "inline-block"
                      }}></span>
                      <span style={{color: AM_COLOR}}>AM Jobs</span>
                      <p></p>
                      <Checkbox
                        color={'primary'}
                        checked={form.values.filterAMJobs}
                        name="filterAMJobs"
                        classes={{root: classes.checkboxInput}}
                        onChange={(e) => {
                          setFieldValue('filterAMJobs', !form.values.filterAMJobs);
                        }}
                      />
                    </div>
                  </MenuItem>
                  <MenuItem value={-1} classes={{
                    root: classes.itemRoot,
                    selected: classes.itemSelected
                  }}>
                    <div className={classes.menuItemContainer}>
                      <span style={{
                        height: "20px",
                        width: "20px",
                        backgroundColor: PM_COLOR,
                        borderRadius: "50%",
                        display: "inline-block"
                      }}></span>
                      <span style={{color: PM_COLOR}}>PM Jobs</span>
                      <p></p>
                      <Checkbox
                        color={'primary'}
                        checked={form.values.filterPMJobs}
                        name="filterPMJobs"
                        classes={{root: classes.checkboxInput}}
                        onChange={(e) => {
                          setFieldValue('filterPMJobs', !form.values.filterPMJobs);
                        }}
                      />
                    </div>
                  </MenuItem>
                </Select>
              </FormGroup>
            </div> : ""}
            <FormGroup>
              <FormControlLabel
                classes={{label: classes.checkboxLabel}}
                control={
                  <Checkbox
                    color={'primary'}
                    checked={form.values.isHomeOccupied}
                    name="isHomeOccupied"
                    classes={{root: classes.checkboxInput}}
                    onChange={(e) => {
                      setFieldValue('isHomeOccupied', !form.values.isHomeOccupied);
                    }}
                  />
                }
                label={`ONLY OCCUPIED HOUSES`}
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
              disabled={isSubmitting}
              type={'submit'}
              size={"large"}
              variant={'contained'}>Apply</Button>
          </Grid>
        </Grid>
        }
      </div>
    </form>
    );
}

export default withStyles(
  styles,
  { 'withTheme': true },
)(BCMapFilter);
