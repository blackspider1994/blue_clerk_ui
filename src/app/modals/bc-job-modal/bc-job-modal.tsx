// Import * as Yup from 'yup';
import BCDateTimePicker from 'app/components/bc-date-time-picker/bc-date-time-picker';
import BCInput from 'app/components/bc-input/bc-input';
import BCSelectOutlined from 'app/components/bc-select-outlined/bc-select-outlined';
import { getInventory } from 'actions/inventory/inventory.action';
import { refreshJobs } from 'actions/job/job.action';
import { refreshServiceTickets, setOpenServiceTicket, setOpenServiceTicketLoading } from 'actions/service-ticket/service-ticket.action';
import styles from './bc-job-modal.styles';
import { useFormik } from 'formik';
import { DialogActions, DialogContent, Fab, Grid, withStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { callCreateJobAPI, callEditJobAPI, getAllJobTypesAPI } from 'api/job.api';
import { closeModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { useDispatch, useSelector } from 'react-redux';
import { formatToMilitaryTime, formatDate } from 'helpers/format';
import styled from 'styled-components';
import { getEmployeesForJobAction } from 'actions/employees-for-job/employees-for-job.action';
import { getVendors } from 'actions/vendor/vendor.action';
import { getJobSites, clearJobSiteStore } from 'actions/job-site/job-site.action';
import { getJobLocationsAction, loadingJobLocations } from 'actions/job-location/job-location.action';
import BCCircularLoader from 'app/components/bc-circular-loader/bc-circular-loader';
import "../../../scss/job-poup.scss";


const initialJobState = {
  'customer': {
    '_id': ''
  },
  'description': '',
  'employeeType': false,
  'equipment': {
    '_id': ''
  },
  'dueDate':'',
  'scheduleDate': null,
  'scheduledEndTime': null,
  'scheduledStartTime': null,
  'technician': {
    '_id': ''
  },
  'contractor': {
    '_id': ''
  },
  'ticket': {
    '_id': ''
  },
  'type': {
    '_id': ''
  },
  'jobLocation': {
    '_id': ''
  },
  'jobSite': {
    '_id': ''
  }
}


function BCJobModal({
  classes,
  job = initialJobState
}: any): JSX.Element {
  const dispatch = useDispatch();

  const equipments = useSelector(({ inventory }: any) => inventory.data);
  const employeesForJob = useSelector(({ employeesForJob} : any) => employeesForJob.data);
  const vendorsList = useSelector(({ vendors } : any) => vendors.data);
  const jobTypes = useSelector(({ jobTypes }: any) => jobTypes.data);
  const jobLocations = useSelector((state : any) => state.jobLocations.data);
  const isLoading = useSelector((state : any) => state.jobLocations.loading);
  const jobSites = useSelector((state: any) => state.jobSites.data);
  const [scheduledEndTimeMsg, setScheduledEndTimeMsg] = useState('');
  const [startTimeLabelState, setStartTimeLabelState] = useState(false);
  const [endTimeLabelState, setEndTimeLabelState] = useState(false);
  const [showVendorFlag, setShowVendorFlag] = useState(false);
  
  const { ticket = {} } = job;
  const { customer = {} } = ticket;
  const { profile: {
    displayName = ''
  } = {} } = customer
  const employeeTypes = [
    {
      '_id': '0',
      'name': 'Employee'
    },
    {
      '_id': '1',
      'name': 'Contractor'
    }
  ];
  const handleEmployeeTypeChange = (fieldName: string, data: string) => {
    if(data === '0'){
      setFieldValue(fieldName, 0);
      setShowVendorFlag(false);
      setFieldValue('technicianId', '');
    } else if(data === '1'){
      setFieldValue(fieldName, 1);
      setShowVendorFlag(true);
      setFieldValue('contractorId', '');
    }
  }
  const handleLocationChange = (event: any, fieldName: any, setFieldValue: any) => {
    const locationId = event.target.value;
    const customerId = job.ticket.customer._id;
    setFieldValue(fieldName, locationId);
    setFieldValue('jobSiteId', '');
    if(locationId !== ''){
      dispatch(getJobSites({customerId, locationId}));
    }else {
      dispatch(clearJobSiteStore());
    }
    
  }
  
  const dateChangeHandler = (date: string, fieldName: string) => setFieldValue(fieldName, date);

  const formatRequestObj = (rawReqObj: any) => {
    for ( let key in rawReqObj ) {
        if(rawReqObj[key] === '' || rawReqObj[key] === null){
          delete rawReqObj[key];
        }
    }
    return rawReqObj;
  }

  useEffect(() => {
    const customerId = job.ticket.customer._id;
    dispatch(getInventory());
    dispatch(getEmployeesForJobAction());
    dispatch(getVendors());
    dispatch(getAllJobTypesAPI());
    dispatch(getJobLocationsAction(customerId));
  }, []);

  const isValidate = (requestObj: any) => {
    let validateFlag = true;
    if(requestObj.scheduledStartTime === null && requestObj.scheduledEndTime !==null){
      setScheduledEndTimeMsg('');
      setStartTimeLabelState(true);
      validateFlag = false;
    }else if(requestObj.scheduledStartTime !== null && requestObj.scheduledEndTime ===null){
      setScheduledEndTimeMsg('End time is required.');
      setEndTimeLabelState(true);
      validateFlag = false;
    }else if(requestObj.scheduledStartTime > requestObj.scheduledEndTime) {
      setScheduledEndTimeMsg('End time should be greater than start time.');
      setEndTimeLabelState(true);
      setStartTimeLabelState(false);
      validateFlag = false;
    }else {
      setScheduledEndTimeMsg('');
      setStartTimeLabelState(false);
      setEndTimeLabelState(false);
      validateFlag = true;
    }
    return validateFlag;
  }
  
  const onSubmit = (values: any, { setSubmitting }: any) => {
    setSubmitting(true);
  
    const customerId = customer._id;
    let jobFromMapFilter = job.jobFromMap;
    let resetDateFilter = job.resetDateFilter;

    const tempData = {
      ...job,
      ...values,
      customerId
    };
    
    const editJob = (tempData: any) => {
      tempData.jobId = job._id;
      return callEditJobAPI(tempData)
    }
    
    const createJob = (tempData: any) => {
      return callCreateJobAPI(tempData)
    }
    
    let request = null;
    
    if (job._id) {
      request = editJob;
    } else {
      request = createJob;
    }
    if(isValidate(tempData)) {
      const requestObj = formatRequestObj(tempData);
      if(requestObj.scheduledStartTime && requestObj.scheduledStartTime !== null)
        requestObj.scheduledStartTime = formatToMilitaryTime(requestObj.scheduledStartTime);
      if(requestObj.scheduledEndTime && requestObj.scheduledEndTime !== null)
        requestObj.scheduledEndTime = formatToMilitaryTime(requestObj.scheduledEndTime);
      if(requestObj.companyId)
        delete requestObj.companyId;
        delete requestObj.dueDate;
        
        request(requestObj)
          .then((response: any) => {
            dispatch(refreshServiceTickets(true));
            dispatch(refreshJobs(true));
            dispatch(closeModalAction());
            dispatch(setOpenServiceTicketLoading(false));
            //Executed only when job is created from Map View.
            if(jobFromMapFilter){
             if(resetDateFilter)
                  resetDateFilter();
            } 
            setTimeout(() => {
              dispatch(setModalDataAction({
                'data': {},
                'type': ''
              }));
            }, 200);
          })
          .catch((err: any) => {
            throw err;
          })
          .finally(() => { setSubmitting(false) });
    } else {
        setSubmitting(false);
    }
  }
  const form = useFormik({
    initialValues: {
      customerId: job.customer._id,
      description: job.ticket.note,
      employeeType: !job.employeeType
        ? 0
        : 1,
      equipmentId: job.equipment && job.equipment._id
        ? job.equipment._id
        : '',
      jobTypeId: job.ticket.jobType,
      dueDate: job.ticket.dueDate ? formatDate(job.ticket.dueDate) : '',
      scheduleDate: job.scheduleDate,
      scheduledEndTime: job.scheduledEndTime,
      scheduledStartTime: job.scheduledStartTime,
      technicianId: job.technician._id,
      contractorId: job.contractor ? job.contractor._id : '',
      ticketId: job.ticket._id,
      jobLocationId: job.ticket.jobLocation,
      jobSiteId: job.ticket.jobSite
    },
    onSubmit
  });
 
  const {
    errors: FormikErrors,
    values: FormikValues,
    handleChange: formikChange,
    handleSubmit: FormikSubmit,
    setFieldValue,
    getFieldMeta,
    isSubmitting
  } = form;

  const closeModal = () => {
    dispatch(closeModalAction());
    setTimeout(() => {
      dispatch(setModalDataAction({
        'data': {},
        'type': ''
      }));
    }, 200);
  };
  if(isLoading){
    return  <BCCircularLoader />
  }else{
 
    return (
      <form onSubmit={FormikSubmit}>
        <DialogContent classes={{ 'root': classes.dialogContent }}>
          <h4 className="MuiTypography-root MuiTypography-subtitle1 modal_heading"><span>{`Customer : ${displayName}`}</span>
          <span id='dueDate'>{`Due Date : ${FormikValues.dueDate}`}</span>
          </h4>
          {/* <h4 className="MuiTypography-root MuiTypography-subtitle1">{`Ticket ID : ${ticket.ticketId}`}</h4> */}
          <Grid
            container
            spacing={2}>
            <Grid
              item
              sm={6}
              xs={12}
            >
              <BCSelectOutlined
                error={{
                  'isError': true,
                  'message': FormikErrors.employeeType
                }}
                handleChange={(event: any) => handleEmployeeTypeChange('employeeType', event.target.value)}
                items={{
                  'data': employeeTypes,
                  'displayKey': 'name',
                  'valueKey': '_id'
                }}
                label={'Employee Type'}
                name={'employeeType'}
                required
                value={FormikValues.employeeType}
              />
              {/* <BCSelectOutlined
                handleChange={formikChange}
                items={{
                  'data': [
                    ...ticketData.map((o: any) => {
                      return {
                        '_id': o._id,
                        'ticketId': o.ticketId
                      };
                    })
                  ],
                  'displayKey': 'ticketId',
                  'valueKey': '_id'
                }}
                label={'Ticket No'}
                name={'ticketId'}
                required
                value={FormikValues.ticketId}
              /> */}
              { !showVendorFlag ? <BCSelectOutlined
                handleChange={formikChange}
                items={{
                  'data': [
                    ...employeesForJob.map((o: any) => {
                      return {
                        '_id': o._id,
                        'displayName': o.profile.displayName
                      };
                    })
                  ],
                  'displayKey': 'displayName',
                  'valueKey': '_id'
                }}
                label={'Select Technician'}
                name={'technicianId'}
                required
                value={FormikValues.technicianId}
              />
                : null
              }
              {
                showVendorFlag ? 
                <BCSelectOutlined
                handleChange={formikChange}
                items={{
                  'data': [
                    ...vendorsList.map((o: any) => {
                      return {
                        '_id': o.contractor._id,
                        'displayName': o.contractor.info.companyName
                      };
                    })
                  ],
                  'displayKey': 'displayName',
                  'valueKey': '_id'
                }}
                label={'Select Contractor'}
                name={'contractorId'}
                required
                value={FormikValues.contractorId}
              /> :
              null
              }
              <BCSelectOutlined
                handleChange={formikChange}
                items={{
                  'data': [
                    ...jobTypes.map((o: any) => {
                      return {
                        '_id': o._id,
                        'title': o.title
                      };
                    })
                  ],
                  'displayKey': 'title',
                  'valueKey': '_id'
                }}
                label={'Select Job Type'}
                name={'jobTypeId'}
                required
                disabled={job.ticket.jobType ? true : false}
                value={FormikValues.jobTypeId}
              />
              <BCSelectOutlined
                items={{
                  'data': [
                    ...jobLocations.map((o: any) => {
                      return {
                        '_id': o._id,
                        'name': o.name
                      };
                    })
                  ],
                  'displayKey': 'name',
                  'valueKey': '_id'
                }}
                label={'Select Job Location'}
                name={'jobLocationId'}
                disabled={job.ticket.jobLocation ? true : false}
                value={FormikValues.jobLocationId}
                handleChange={(event: any) => handleLocationChange(event, 'jobLocationId', setFieldValue)}
              />

              <BCSelectOutlined
                handleChange={formikChange}
                items={{
                  'data': [
                    ...jobSites.map((o: any) => {
                      return {
                        '_id': o._id,
                        'name': o.name
                      };
                    })
                  ],
                  'displayKey': 'name',
                  'valueKey': '_id',
                }}
                label={'Select Job Site'}
                name={'jobSiteId'}
                disabled={job.ticket.jobSite ? true : false}
                value={FormikValues.jobSiteId}
              />
              <BCSelectOutlined
                handleChange={formikChange}
                items={{
                  'data': [
                    ...equipments.map((o: any) => {
                      return {
                        '_id': o._id,
                        'displayName': o.company
                      };
                    })
                  ],
                  'displayKey': 'displayName',
                  'valueKey': '_id'
                }}
                label={'Select Equipment'}
                name={'equipmentId'}
                value={FormikValues.equipmentId}
              />
              <BCInput
                handleChange={formikChange}
                label={'Description'}
                multiline
                name={'description'}
                value={FormikValues.description}
              />
            </Grid>
            <Grid
              item
              sm={6}
              xs={12}>
              <BCDateTimePicker
                disablePast={!job._id}
                handleChange={(e: any) => dateChangeHandler(e, 'scheduleDate')}
                label={'Scheduled Date'}
                name={'scheduleDate'}
                required
                value={FormikValues.scheduleDate}
              />
              <BCDateTimePicker
                dateFormat={'HH:mm:ss'}
                placeholder='Start Time'
                disablePast={!job._id}
                handleChange={(e: any) => dateChangeHandler(e, 'scheduledStartTime')}
                label={'Start Time'}
                name={'scheduledStartTime'}
                pickerType={'time'}
                value={FormikValues.scheduledStartTime}
              />
                {startTimeLabelState ? <Label>Start time is required.</Label>: ''}
              <BCDateTimePicker
                dateFormat={'HH:mm:ss'}
                placeholder='End Time'
                disablePast={!job._id}
                handleChange={(e: any) => dateChangeHandler(e, 'scheduledEndTime')}
                label={'End Time'}
                name={'scheduledEndTime'}
                pickerType={'time'}
                value={FormikValues.scheduledEndTime}
              />
                {endTimeLabelState ? <Label>{scheduledEndTimeMsg}</Label>: ''}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions classes={{
          'root': classes.dialogActions
        }}>
          <Fab
            aria-label={'create-job'}
            classes={{
              'root': classes.fabRoot
            }}
            color={'secondary'}
            disabled={isSubmitting}
            onClick={() => closeModal()}
            variant={'extended'}>
            {'Cancel'}
          </Fab>
          <Fab
            aria-label={'create-job'}
            classes={{
              'root': classes.fabRoot
            }}
            color={'primary'}
            disabled={isSubmitting}
            type={'submit'}
            variant={'extended'}>
            {job._id
              ? 'Edit'
              : 'Submit'}
          </Fab>
        </DialogActions>
      </form>
    );
  }
}

const Label = styled.div`
  color: red;
  font-size: 15px;
`;
export default withStyles(
  styles,
  { 'withTheme': true }
)(BCJobModal);