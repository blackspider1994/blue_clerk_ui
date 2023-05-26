import BCDateTimePicker from 'app/components/bc-date-time-picker/bc-date-time-picker';
import BCInput from 'app/components/bc-input/bc-input';
import BCTableContainer from 'app/components/bc-table-container/bc-table-container';
import { getInventory } from 'actions/inventory/inventory.action';
import { refreshJobs } from 'actions/job/job.action';
import {
  refreshServiceTickets,
  setTicket2JobID,
  setOpenServiceTicket,
  setOpenServiceTicketLoading,
} from 'actions/service-ticket/service-ticket.action';
import { refreshJobRequests } from 'actions/job-request/job-request.action';
import styles from './bc-job-modal.styles';
import { useFormik } from 'formik';
import {
  Button,
  Chip,
  DialogActions,
  Grid, IconButton,
  TextField,
  Typography,
  withStyles,
} from '@material-ui/core';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  callCreateJobAPI,
  callEditJobAPI, callUpdateJobAPI,
  getAllJobTypesAPI,
} from 'api/job.api';
import {
  closeModalAction,
  setModalDataAction,
} from 'actions/bc-modal/bc-modal.action';
import { useDispatch, useSelector } from 'react-redux';
import {
  convertMilitaryTime,
  formatDate,
  formatISOToDateStringFixedDate,
  formatToMilitaryTimeWithOffset, parseISODate,
  shortenStringWithElipsis,
} from 'helpers/format';
import styled from 'styled-components';
import { getEmployeesForJobAction } from 'actions/employees-for-job/employees-for-job.action';
import { getVendors } from 'actions/vendor/vendor.action';
import { markNotificationAsRead } from 'actions/notifications/notifications.action';
import {
  clearJobSiteStore,
  getJobSites,
} from 'actions/job-site/job-site.action';
import {
  getJobLocationsAction,
  setJobLocations,
} from 'actions/job-location/job-location.action';
import BCCircularLoader from 'app/components/bc-circular-loader/bc-circular-loader';
import { getOpenServiceTickets } from 'api/service-tickets.api';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  error,
  success,
} from 'actions/snackbar/snackbar.action';
import { getContacts } from 'api/contacts.api';
import { modalTypes } from '../../../constants';
import { stringSortCaseInsensitive } from '../../../helpers/sort';
import moment from 'moment';
import BCDragAndDrop from "../../components/bc-drag-drop/bc-drag-drop";
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';

const initialTask = {
  employeeType: 0,
  contractor: null,
  employee: null,
  jobTypes: [],
}

const initialJobState = {
  customer: {
    _id: '',
  },
  description: '',
  employeeType: false,
  equipment: {
    _id: '',
  },
  dueDate: '',
  scheduleDate: null,
  scheduledEndTime: null,
  scheduledStartTime: null,
  technician: {
    _id: '',
  },
  contractor: {
    _id: '',
  },
  ticket: {
    _id: '',
  },
  type: {
    _id: '',
  },
  jobLocation: {
    _id: '',
  },
  jobSite: {
    _id: '',
  },
  jobRescheduled: false,
  tasks: [initialTask],
};


/**
 * Helper function to get job data from jobTypes
 */
const getJobData = (ids: any, items: any) => {
  if (!ids) {
    return;
  }
  return ids.map((id:string)=>{
    const currentItem = items.filter((item: {jobType: string}) => item.jobType === id)[0];
    return {_id:currentItem?.jobType, title:currentItem?.name, description:currentItem?.description}
  })
  // return ids.map((id: string)=> jobTypes.filter((job: {_id:string}) => job._id === id)[0]).filter((jobType:string)=>jobType);
};

/**
 * Helper function to get job tasks
 */
const getJobTasks = (job: any, items: any) => {
  if (job._id) {
    const tasks = job.tasks.map((task: any) => ({
      employeeType: task.employeeType ? 1 : 0,
      employee: !task.employeeType && task.technician ? task.technician : null,
      contractor: task.employeeType && task.contractor ? task.contractor : null,
      jobTypes: getJobData(task.jobTypes.map((task: any) => task.jobType?._id), items)
    }));
    return tasks;
  } else {
    return [{
      employeeType: 0,
      contractor: null,
      employee: null,
      jobTypes: getJobData(job.ticket.tasks.map((task: any) => task.jobType?._id || task.jobType || task._id), items),
    }]
  }
};

function BCJobModal({
  classes,
  job = initialJobState,
  detail = false,
}: any): JSX.Element {
  const dispatch = useDispatch();
  const [thumbs, setThumbs] = useState<any[]>([]);
  // Selected variable with useSelector from the store
  const equipments = useSelector(({ inventory }: any) => inventory.data);
  const items = useSelector((state: any) => state.invoiceItems.items);
  const { loading, data } = useSelector(
    ({ employeesForJob }: any) => employeesForJob
  );
  const vendorsList = useSelector(({ vendors }: any) =>
    vendors.data.reduce((acc: any[],vendor: any) => {
      if (vendor.status === 1) acc.push(vendor.contractor);
      return acc;
    }, [])
  );

  const {isLoading: jobTypesLoading, data: jobTypes} = useSelector((state: any) => state.jobTypes);
  const jobLocations = useSelector((state: any) => state.jobLocations.data);
  const isLoading = useSelector((state: any) => state.jobLocations.loading);
  const jobSites = useSelector((state: any) => state.jobSites.data);
  const { contacts } = useSelector((state: any) => state.contacts);
  const openServiceTicketFilter = useSelector(
    (state: any) => state.serviceTicket.filterTicketState
  );

  const employeesForJob = useMemo(() => [...data], [data]);

  // componenet usestate variables
  const [jobLocationValue, setJobLocationValue] = useState<any>([]);
  const [jobSiteValue, setJobSiteValue] = useState<any>([]);
  const [contactValue, setContactValue] = useState<any>([]);


  let { ticket = {} } = job;

  if(job.request){
    ticket = job.request;
    job.ticket = job.request;
  }
  const { customer = {} } = ticket;

  const { profile: { displayName = '' } = {} } = customer;

  const employeeTypes = [
    {_id: 0, name: 'Employee',},
    {_id: 1, name: 'Contractor'},
  ];

  const timeRangeOptions = [
    {name: 'N/A', index: 0}, 
    {name: 'AM', index: 1}, 
    {name: 'PM', index: 2}, 
    {name: 'All Day', index: 3}
  ];

  /**
   * Handle task's items change
   */
  const handleTaskChange = (fieldName: string, data: any, index: number) => {
    const tasks = [...FormikValues.tasks];
    switch (fieldName) {
      case 'employeeType':
        const _id = data ? data._id : 0;
        tasks[index].employeeType = _id;
        tasks[index].contractor = null;
        tasks[index].employee = null;
        break;
      case 'contractorId':
        tasks[index].contractor = data;
        break;
      case 'technicianId':
        tasks[index].employee = data;
        break;
      case 'jobTypes':
        tasks[index].jobTypes = data;
    }
    setFieldValue('tasks', tasks);
  };

  /**
   * Handle role field change
   */
  const handleSelectChange = (fieldName: string, newValue: string, setState?: any) => {
    if (fieldName === 'contractorId') {
      setFieldValue('technicianId', '');
    }
    if (fieldName === 'technicianId') {
      setFieldValue('contractorId', '');
    }

    if (setState !== undefined) {
      setState();
    }
    setFieldValue(fieldName, newValue ? newValue : '');
  };

  /**
   * Handle close job modal
   */
  const openCancelJobModal = async (job: any, jobOnly?: boolean) => {
    dispatch(
      setModalDataAction({
        data: {
          job: job,
          jobOnly,
          modalTitle: `Cancel Job`,
          removeFooter: false,
        },
        type: modalTypes.CANCEL_JOB_MODAL,
      })
    );
  };
  /**
   * Handle mark complete job modal
   */
  const openMarkCompleteJobModal = async (job: any) => {
    dispatch(
      setModalDataAction({
        data: {
          job: job,
          modalTitle: `Mark Job as Complete`,
          removeFooter: false,
        },
        type: modalTypes.MARK_COMPLETE_JOB_MODAL,
      })
    );
  };

  /**
   * Handle Job Address changes field
   */
  const handleJobSiteChange = (fieldName: any, newValue: any) => {
    const jobSiteId = newValue ? newValue._id : '';
    setFieldValue(fieldName, jobSiteId);
    setJobSiteValue(newValue);
  };

  /**
   * Handle Location field change
   */
  const handleLocationChange = async (fieldName: any, newValue: any) => {
    const locationId = newValue ? newValue._id : '';

    const customerId = job.ticket.customer?._id
      ? job.ticket.customer?._id
      : job.customer?._id;

    await setFieldValue(fieldName, '');
    await setFieldValue('jobSiteId', '');
    await setJobSiteValue([]);
    await setJobLocationValue(newValue);

    if (locationId !== '') {
      await dispatch(getJobSites({ customerId, locationId }));
    } else {
      await dispatch(clearJobSiteStore());
    }
    await setFieldValue(fieldName, locationId);
  };

  /**
   * Handle date fields change
   */
  const dateChangeHandler = (date: string, fieldName: string) => {
    setFieldValue(fieldName, date);
    if (fieldName === 'scheduleDate') {
      delete FormikErrors.scheduleDate;
    } else if(fieldName === 'scheduledStartTime' || fieldName === 'scheduledEndTime') {
      delete FormikErrors.scheduledStartTime;
      delete FormikErrors.scheduledEndTime;
    }
  };

  /**
   * Format the request object
   */
  const formatRequestObj = (rawReqObj: any) => {
    for (const key in rawReqObj) {
      //check for property with empty string  or null as value
      if (rawReqObj[key] === '' || rawReqObj[key] === null || rawReqObj[key] === undefined) {
        delete rawReqObj[key];
      }
    }
    return rawReqObj;
  };

  useEffect(() => {
    const customerId =
      job.ticket.customer?._id !== undefined
        ? job.ticket.customer?._id
        : job.ticket.customer;
    dispatch(getInventory());
    dispatch(getEmployeesForJobAction());
    dispatch(getVendors());
    dispatch(getAllJobTypesAPI());
    dispatch(getJobLocationsAction({customerId: customerId}));

    const data: any = {
      type: 'Customer',
      referenceNumber: customerId,
    };
    dispatch(getContacts(data));
  }, []);

  useEffect(() => {
    const tasks = getJobTasks(job, items);
    setFieldValue('tasks', tasks);
  }, [items]);

  useEffect(() => {
    if (ticket.customer || ticket.customer._id) {
      const jobLocationId = job._id ? job.jobLocation?._id : ticket.jobLocation?._id || ticket.jobLocation;
      const jobLocation = jobLocations.find((jobLocation: any) => jobLocation._id === jobLocationId);

      if (jobLocation) {
        setJobLocationValue(jobLocation);
        if (jobLocation.isActive) {
          dispatch(
            getJobSites({
              customerId: ticket.customer._id || ticket.customer,
              locationId: jobLocation._id,
            })
          );
        }
      }
      const activeJobLocations = jobLocations.filter((location: any) => location.isActive || location._id === jobLocation?._id);
      if (activeJobLocations.length !== jobLocations.length) dispatch(setJobLocations(activeJobLocations)) ;
    }
  }, [jobLocations]);

  useEffect(() => {
    if (ticket.customer?._id !== '') {
      if (jobSites.length !== 0) {
        const jobSiteId = job._id && job?.jobSite?._id ? job.jobSite._id : ticket?.jobSite?._id || ticket?.jobSite;
        const jobSite = jobSites.find((jobSite: any) => jobSite._id === jobSiteId);
        setJobSiteValue(jobSite);
      }
    }
  }, [jobSites]);

  useEffect(() => {
    if (ticket.customer?._id !== '') {
      if (contacts.length !== 0) {
        const jobCustomerContact_id = job?.customerContactId?._id && contacts.find((contact: any) => job?.customerContactId?._id === contact._id);
        const jobCustomerContact = job?.customerContactId && contacts.find((contact: any) => job?.customerContactId === contact._id);
        const ticketCustomerContact_id = ticket?.customerContactId?._id && contacts.find((contact: any) => ticket?.customerContactId?._id === contact._id);
        const ticketCustomerContact = ticket?.customerContactId && contacts.find((contact: any) => ticket?.customerContactId === contact._id);
        const requestCustomerContact_id = ticket?.customerContact?._id && contacts.find((contact: any) => ticket?.customerContact?._id === contact._id);
        const requestCustomerContact = ticket?.customerContact && contacts.find((contact: any) => ticket?.customerContact === contact._id);
        const requestCustomerContact_idUserId = ticket?.customerContact?._id && contacts.find((contact: any) => ticket?.customerContact?._id === contact.userId);
        const requestCustomerContactUserId = ticket?.customerContact && contacts.find((contact: any) => ticket?.customerContact === contact.userId);
        setContactValue(
          jobCustomerContact_id || jobCustomerContact || ticketCustomerContact_id || ticketCustomerContact || requestCustomerContact_id || requestCustomerContact || requestCustomerContact_idUserId || requestCustomerContactUserId
        );
      }
    }
  }, [contacts]);

  useEffect(() => {
    if (job?.jobRescheduled) {
      dispatch(
        markNotificationAsRead.fetch({ id: job?.jobRescheduled, isRead: true })
      );
    }
  }, [job?.jobRescheduled]);

  const addEmptyTask =() => {
    const tasks = [...FormikValues.tasks];
    tasks.push({...initialTask});
    setFieldValue('tasks', tasks);
  }

  const removeTask = (index: number) => {
    const tasks = [...FormikValues.tasks];
    tasks.splice(index, 1);
    setFieldValue('tasks', tasks);
  }

  const jobValue = JSON.parse(JSON.stringify(job));

  /**
   * Formik form configuration
   */
  const form = useFormik({
    initialValues: {
      customerId: jobValue.customer?._id,
      description: jobValue.description || ticket.note,
      equipmentId:
        jobValue.equipment && jobValue.equipment._id
          ? jobValue.equipment._id
          : '',
      tasks: [{...initialTask}],
      dueDate: jobValue.ticket.dueDate
        ? formatDate(jobValue.ticket.dueDate)
        : '',
      scheduleDate: parseISODate(jobValue.scheduleDate),
      scheduledStartTime: jobValue?.scheduledStartTime
        ? formatISOToDateStringFixedDate(jobValue.scheduledStartTime)
        : null,
      scheduledEndTime: jobValue.scheduledEndTime
        ? formatISOToDateStringFixedDate(jobValue.scheduledEndTime)
        : null,
      ticketId: jobValue.ticket._id,
      jobLocationId: jobValue.jobLocation
        ? jobValue.jobLocation._id
        : jobValue.ticket.jobLocation
        ? jobValue.ticket.jobLocation._id || jobValue.ticket.jobLocation
        : '',
      jobSiteId: jobValue.jobSite
        ? jobValue.jobSite._id
        : jobValue.ticket.jobSite
        ? jobValue.ticket.jobSite._id || jobValue.ticket.jobSite
        : '',
      customerContactId: jobValue.customerContactId?._id || jobValue.customerContactId ||
        ticket?.customerContactId?._id || ticket.customerContactId ||
        ticket?.customerContact?._id || ticket.customerContact || '',
      customerPO: jobValue.customerPO || ticket.customerPO,
      images: jobValue?.images?.length ? jobValue.images : ticket.images || [],
      scheduleTimeAMPM: timeRangeOptions[jobValue?.scheduleTimeAMPM || 0],
    },
    validateOnMount: false,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values: any, { setSubmitting }: any) => {
      const tempData = {...values};
      tempData.scheduleTimeAMPM = tempData.scheduleTimeAMPM?.index || 0;
      tempData.scheduleDate = moment(values.scheduleDate).format('YYYY-MM-DD');
      tempData.customerId = customer?._id;

      if (values.scheduledStartTime)
        tempData.scheduledStartTime = formatToMilitaryTimeWithOffset(values.scheduledStartTime);
      if (values.scheduledEndTime)
        tempData.scheduledEndTime = formatToMilitaryTimeWithOffset(values.scheduledEndTime);

      if (values.customerContactId?._id) tempData.customerContactId = values.customerContactId?._id;

      const newImages = values.images.filter((image: any) => image instanceof File);
      if(newImages.length > 0)
        tempData.images = newImages;
      else
        delete tempData.images;

      delete tempData.dueDate;

      const tasks = values.tasks.map((task: any) => ({
        employeeType: task.employeeType.toString(),
        contractorId: task.contractor ? task.contractor._id : '',
        technicianId: task.employee ? task.employee._id : '',
        jobTypes: task.jobTypes.map((type: any) => ({jobTypeId: type._id}))
      }))

      tempData.tasks = tasks;

      if(job.jobFromRequest || job.request){
        tempData.jobRequestId = tempData.ticketId;
        delete tempData.ticketId;
      }

      const requestObj = formatRequestObj(tempData)

      const editJob = async(tempData: any) => {
        tempData.jobId = job._id;
        // if incomplete make pending
        if (job.status === 6) {
          const data = {jobId: job._id, status: 0};
          await callUpdateJobAPI(data)
        }
        return callEditJobAPI(tempData);
      };

      const createJob = (tempData: any) => {
        return callCreateJobAPI(tempData);
      };

      const request = job._id ? editJob : createJob;

      request(requestObj)
        .then(async (response: any) => {
          if (response.status === 0) {
            dispatch(error(response.message));
            return;
          }
          /*if (response.message === 'Job created successfully.' || response.message === 'Job edited successfully.') {
            await callEditTicketAPI(formatedTicketRequest);
          }*/
          if(!job.jobFromMap && !job._id){
            dispatch(refreshServiceTickets(true));
            dispatch(refreshJobRequests(true));
          }
          dispatch(setTicket2JobID(response?.createJob?.job?.ticket || response?.createJob?.job?.request));
          dispatch(refreshJobs(false));
          dispatch(refreshJobs(true));
          dispatch(closeModalAction());
          dispatch(setOpenServiceTicketLoading(false));

          // Executed only when job is created from Map View.
          if (job.jobFromMap) {
            dispatch(setOpenServiceTicketLoading(true));
            getOpenServiceTickets({
              ...openServiceTicketFilter,
              pageNo: 1,
              pageSize: 6,
            })
              .then((response: any) => {
                dispatch(setOpenServiceTicketLoading(false));
                dispatch(setOpenServiceTicket(response));
                dispatch(closeModalAction());
                setTimeout(() => {
                  dispatch(
                    setModalDataAction({
                      data: {},
                      type: '',
                    })
                  );
                }, 200);
              })
              .catch((err: any) => {
                throw err;
              });
          }
          setTimeout(() => {
            dispatch(
              setModalDataAction({
                data: {},
                type: '',
              })
            );
          }, 200);

          if (
            response.message === 'Job created successfully.' ||
            response.message === 'Job edited successfully.'
          ) {
            dispatch(success(response.message));
          }
        })
        .catch((err: any) => {
          throw err;
        })
        .finally(() => {
          setSubmitting(false);
        });
    },
    validate: (values: any) => {
      const errors: any = {};
      const {scheduleDate, scheduledStartTime, scheduledEndTime} = values;

      if (scheduleDate === null) {
        errors['scheduleDate'] = 'Please select date';
      } else if (moment().isAfter(scheduleDate, 'day')){
        errors['scheduleDate'] = 'Cannot select a date that has already passed';
      }

      if (scheduledStartTime === null && scheduledEndTime !== null) {
        errors['scheduledStartTime'] = 'Start time is required when end time is provided';
      } else if (scheduledStartTime !== null && scheduledEndTime !== null) {
        const d1 = moment(scheduledStartTime);
        const d2 = moment(scheduledEndTime);
        if (d2.isSameOrBefore(d1)) errors['scheduledStartTime'] = 'Start time must be before end time';
      }
      return errors;
    },
  });

  const {
    errors: FormikErrors,
    values: FormikValues,
    handleChange: formikChange,
    handleSubmit: FormikSubmit,
    setFieldValue,
    isSubmitting,
  } = form;

  const closeModal = () => {
    dispatch(closeModalAction());
    setTimeout(() => {
      dispatch(
        setModalDataAction({
          data: {},
          type: '',
        })
      );
    }, 200);
  };

/*  const disabledChips = job?._id
    ? job.tasks.length
      ? job.tasks.map(({ jobType }: any) => jobType._id)
      : [job.type._id]
    : [];*/


  useEffect(() => {
    if (FormikValues.images) {
      const images: any[] = [];
      const prs: any[] = [];

      FormikValues.images.forEach((image: any) => {
        if (image.imageUrl) {
          images.push(image.imageUrl);
        } else {
          if (image.type.match('image.*')) prs.push(readImage(image))
        }
      });

      if (prs.length) {
        Promise.all(prs).then(reads => {
          images.push(...reads.filter((image: any) => image !== null));
          setThumbs(images);
        });
      } else {
        setThumbs(images);
      }
    }
  }, [FormikValues.images]);

  const readImage = (image: File) => {
    return new Promise(function(resolve,reject){
      let fr = new FileReader();

      fr.onload = function(){
        resolve(fr.result);
      };

      fr.onerror = function(){
        reject(null);
      };

      fr.readAsDataURL(image);
    });
  }

  if (isLoading) {
    return <BCCircularLoader />;
  }

  function handleImageDrop(files: FileList) {
    const images = [...FormikValues.images];
    const newImages = Array.from(files);
    images.push(...newImages);
    setFieldValue('images', images);
  }

  const handleRemoveImage = (index: number) => {
    const images = [...FormikValues.images];
    images.splice(index, 1);
    setFieldValue('images', images);
  }

  //const headerError = FormikErrors.scheduleDate || FormikErrors.scheduledStartTime || FormikErrors.scheduledEndTime || '';

  const columns: any = [
    {
      Header: 'User',
      id: 'user',
      sortable: false,
      Cell({row}: any) {
        const user = employeesForJob.filter(
          (employee: any) => employee._id === row.original.user
        )[0];
        const vendor = vendorsList.find((v: any) => v.admin._id === row.original.user);
        const { displayName } = user?.profile || vendor?.admin.profile || '';
        return <div>{displayName}</div>;
      },
    },
    {
      Header: 'Date',
      id: 'date',
      sortable: false,
      Cell({ row }: any) {
        const dataTime = moment(new Date(row.original.date)).format(
          'MM/DD/YYYY h:mm A'
        );
        return (
          <div style={{ color: 'gray', fontStyle: 'italic' }}>
            {`${dataTime}`}
          </div>
        );
      },
    },
    {
      Header: 'Notes',
      id: 'note',
      sortable: false,
      Cell({ row }: { row:{ original: { note: string } } }) {
        const [clipped, setClipped] = useState(true);
        const originalString = row.original.note;
        const clippedString = shortenStringWithElipsis(originalString, 50);
        return (
          <div>
            <ul className={classes.actionsList}>
              <li style={{maxWidth: 200}}>
                {originalString.length < 50
                  ? originalString
                  : clipped
                    ? (
                      <>
                        {clippedString}
                        <span
                          onClick={() => setClipped(!clipped)}
                          style={{fontWeight: 800, textDecoration: 'underline'}}
                        >
                          more
                        </span>
                      </>
                    ) : (
                      <>
                        {originalString.split(/((?:[a-zA-Z.,!]+ ){9})/g).map((v,i)=><div key={i}>{v}</div>)}
                        <span
                          onClick={() => setClipped(!clipped)}
                          style={{fontWeight: 800, textDecoration: 'underline'}}
                        >
                          less
                        </span>
                      </>
                    )
                }
              </li>
            </ul>
          </div>
        );
      },
    },
  ];

  const filteredJobRescheduleHistory: any[] = job.track
    ? job.track.filter((history: {action: string;}) => history.action.includes('rescheduling'))
    : []

  return (
    <DataContainer className={'new-modal-design'}>
      {job._id &&
      <Typography variant={'caption'} className={'jobIdText'}>{job.jobId}</Typography>
      }
        <form onSubmit={FormikSubmit}>
        <Grid container className={'modalPreview'} justify={'space-between'} spacing={4}>
          <Grid item xs={3}>
            <Typography variant={'caption'} className={'previewCaption'}>customer</Typography>
            <Typography variant={'h6'} className={'previewText'}>{job.customer.profile
              ? job.customer.profile.displayName
              : displayName}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant={'caption'} className={'previewCaption'}>due date</Typography>
            <Typography variant={'h6'} className={'previewText'}>{FormikValues.dueDate}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant={'caption'} className={'required previewCaption'}>schedule date</Typography>
            <BCDateTimePicker
              disablePast={true}
              handleChange={(e: any) => dateChangeHandler(e, 'scheduleDate')}
              name={'scheduleDate'}
              minDateMessage={form.errors.scheduleDate}
              value={FormikValues.scheduleDate}
              errorText={FormikErrors.scheduleDate}
              required={true}
              showRequired={true}
            />
          </Grid>
          <Grid item xs={2}>
            <Typography variant={'caption'} className={'previewCaption'}>open time</Typography>
            <BCDateTimePicker
              dateFormat={'HH:mm:ss'}
              disablePast={!job._id}
              handleChange={(e: any) =>
                dateChangeHandler(e, 'scheduledStartTime')
              }
              name={'scheduledStartTime'}
              pickerType={'time'}
              placeholder={'Start Time'}
              minDateMessage={form?.errors?.scheduledStartTime || ''}
              value={FormikValues.scheduledStartTime}
              errorText={FormikErrors.scheduledStartTime}
              disabled={FormikValues.scheduleTimeAMPM?.index !== 0 ? true : false}
            />
          </Grid>
          <Grid item xs={2}>
            <Typography variant={'caption'} className={'previewCaption'}>close time</Typography>
            <BCDateTimePicker
              dateFormat={'HH:mm:ss'}
              disablePast={!job._id }
              handleChange={(e: any) =>
                dateChangeHandler(e, 'scheduledEndTime')
              }
              name={'scheduledEndTime'}
              pickerType={'time'}
              minDateMessage={form?.errors?.scheduledEndTime || ''}
              placeholder={'End Time'}
              value={FormikValues.scheduledEndTime}
              errorText={FormikErrors.scheduledEndTime}
              disabled={FormikValues.scheduleTimeAMPM?.index !== 0 ? true : false}
            />
          </Grid>
          <Grid item xs={1}>
            <Typography variant={'caption'} className={'previewCaption'}>AM/PM</Typography>
            <Autocomplete
                disableClearable={true}
                defaultValue={timeRangeOptions[0]}
                disabled={FormikValues.scheduledStartTime || FormikValues.scheduledEndTime ? true : false}
                getOptionLabel={(option) =>
                  option.name ? option.name : ''
                }
                id={'tags-standard'}
                options={timeRangeOptions}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant={'outlined'}
                  />
                )}
                value={FormikValues.scheduleTimeAMPM} 
                onChange={(ev: any, newValue: any) =>
                  setFieldValue('scheduleTimeAMPM', newValue)
                }
              />
          </Grid>
{/*          {headerError &&
          <span style={{position: 'absolute', bottom: 0, right: 50, color: '#F44336', fontSize: 12}}>{headerError}</span>
          }*/}
        </Grid>
        <div className={'modalDataContainer'}>
          {FormikValues.tasks.map((task: any, index) =>
            <Grid container key={`Grid_${index}`} className={`modalContent ${classes.relative}`} justify={'space-between'} spacing={4}>
              <Grid item xs>
                <Typography variant={'caption'} className={' required previewCaption'}>technician type</Typography>
                <Autocomplete
                  getOptionLabel={(option) =>
                    option.name ? option.name : ''
                  }
                  id={'tags-standard'}
                  onChange={(ev: any, newValue: any) =>
                    handleTaskChange('employeeType', newValue, index)
                  }
                  options={employeeTypes}
                  renderInput={(params) => (
                    <TextField
                      required
                      {...params}
                      variant={'outlined'}
                    />
                  )}
                  value={task.employeeType ? employeeTypes[1] : employeeTypes[0]}
                />
              </Grid>
              <Grid item xs>
                <Typography variant={'caption'} className={' required previewCaption'}>{task.employeeType ? 'contractor' : 'technician'}</Typography>
                {task.employeeType ?
                  <Autocomplete
                    getOptionLabel={(option) =>
                      option?.info?.companyName
                        ? option.info.companyName
                        : ''
                    }
                    id={'tags-standard'}
                    onChange={(ev: any, newValue: any) => handleTaskChange('contractorId', newValue, index)}
                    options={
                      vendorsList && vendorsList.length !== 0
                        ? vendorsList.sort((a: any, b: any) =>
                          a.info.companyName >
                          b.info.companyName
                            ? 1
                            : b.info.companyName >
                            a.info.companyName
                              ? -1
                              : 0
                        )
                        : []
                    }
                    renderInput={(params) => (
                      <TextField
                        required
                        {...params}
                        variant={'outlined'}
                      />
                    )}
                    value={task.contractor}
                  />
                  :
                  <Autocomplete
                    getOptionLabel={(option) =>
                      option.profile ? option.profile.displayName : ''
                    }
                    id={'tags-standard'} // Options={employeesForJob && employeesForJob.length !== 0 ? (employeesForJob.sort((a: any, b: any) => (a.profile.displayName > b.profile.displayName) ? 1 : ((b.profile.displayName > a.profile.displayName) ? -1 : 0))) : []}
                    onChange={(ev: any, newValue: any) => handleTaskChange('technicianId', newValue, index)}
                    options={
                      employeesForJob && employeesForJob.length !== 0
                        ? employeesForJob.sort((a: any, b: any) =>
                          a.profile.displayName > b.profile.displayName
                            ? 1
                            : b.profile.displayName > a.profile.displayName
                              ? -1
                              : 0
                        )
                        : []
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        variant={'outlined'}
                      />
                    )}
                    value={task.employee}
                  />
                }
              </Grid>
              <Grid item xs>
                <Typography variant={'caption'} className={' required previewCaption'}>job type</Typography>
                <Autocomplete
                  // getOptionDisabled={option => job._id ? disabledChips.includes(option._id) : null}
                  getOptionDisabled={(option)=>!option.isJobType}
                  getOptionLabel={option => {
                    const {title} = option;
                    return `${title || '...'}`
                  }}
                  id={'tags-standard'}
                  multiple
                  onChange={(ev: any, newValue: any) => handleTaskChange('jobTypes', newValue, index)}
                  options={
                    items && items.length !== 0
                      ? stringSortCaseInsensitive(items.map((item:{name:string;jobType:string})=>({...item, title:item.name,_id:item.jobType})), 'title')
                        .sort((a: {isJobType:boolean}, b: {isJobType:boolean}) => a.isJobType.toString() > b.isJobType.toString() ? -1 : 1)
                      : []
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant={'outlined'}
                      required={!task.jobTypes.length}
                    />
                  )}
                  classes={{popper: classes.popper}}
                  renderOption={(option:{title:string; isJobType:boolean})=>{
                    const {title, isJobType} = option;
                    if(!isJobType){
                      return ''
                    } else {
                      return `${title || '...'}`
                    }
                  }}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => {
                      return (
                        <Chip
                          label={`${option.title || '...'}`}
                          {...getTagProps({ index })}
                          // disabled={disabledChips.includes(option._id) || !job._id}
                        />
                      );
                    })
                  }
                  value={task.jobTypes}
                  getOptionSelected={() => false}
                />
              </Grid>
              {index > 0 && !jobTypesLoading &&
              <IconButton className={classes.removeJobTypeButton}
                          component="span"
                          onClick={() => removeTask(index)}
              >
                <RemoveCircleIcon/>
              </IconButton>
              }
            </Grid>
          )}
          <Grid container className={'modalContent'} justify={'space-between'} spacing={4}>
            <Grid item xs>
              <Button
                color={'primary'}
                disabled={jobTypesLoading}
                classes={{root: classes.addJobTypeButton}}
                variant={'outlined'}
                onClick={addEmptyTask}
                startIcon={<AddCircleIcon />}
              >Add Technician</Button>

            </Grid>
          </Grid>
          <Grid container className={'modalContent'} justify={'space-between'} spacing={4}>
            <Grid item xs>
              <Typography variant={'caption'} className={' previewCaption'}>Subdivision</Typography>
              <Autocomplete
                defaultValue={
                  ticket.jobLocation !== '' &&
                  jobLocations.length !== 0 &&
                  jobLocations.filter(
                    (jobLocation: any) =>
                      jobLocation._id === ticket.jobLocation
                  )[0]
                }
                disabled={ticket.jobLocation}
                getOptionLabel={(option) =>
                  option.name ? option.name : ''
                }
                getOptionDisabled={(option) => !option.isActive}
                id={'tags-standard'}
                onChange={(ev: any, newValue: any) => handleLocationChange('jobLocationId', newValue)
                }
                options={
                  jobLocations && jobLocations.length !== 0
                    ? jobLocations.sort((a: any, b: any) =>
                      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
                    )
                    : []
                }
                renderInput={(params) => (
                  <TextField
                    error={
                      form.touched.jobLocationId &&
                      Boolean(form.errors.jobLocationId)
                    }
                    helperText={
                      form.touched.jobLocationId &&
                      form.errors.jobLocationId
                    }
                    {...params}
                    variant={'outlined'}
                  />
                )}
                value={jobLocationValue}
              />
            </Grid>
            <Grid item xs>
              <Typography variant={'caption'} className={' previewCaption'}>Job Address</Typography>
              <Autocomplete
                defaultValue={
                  ticket.jobSite !== '' &&
                  jobSites.length !== 0 &&
                  jobSites.filter(
                    (jobSite: any) => jobSite._id === ticket.jobSite
                  )[0]
                }
                disabled={
                  ticket.jobSite ||
                  FormikValues.jobLocationId === '' ||
                  detail
                }
                getOptionLabel={(option) =>
                  option.name ? option.name : ''
                }
                id={'tags-standard'}
                onChange={(ev: any, newValue: any) => handleJobSiteChange('jobSiteId', newValue)}
                options={
                  jobSites && jobSites.length !== 0
                    ? jobSites.sort((a: any, b: any) =>
                      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
                    )
                    : []
                }
                renderInput={(params) => (
                  <TextField
                    error={
                      form.touched.jobSiteId &&
                      Boolean(form.errors.jobSiteId)
                    }
                    helperText={
                      form.touched.jobSiteId && form.errors.jobSiteId
                    }
                    {...params}
                    variant={'outlined'}
                  />
                )}
                value={jobSiteValue}
              />
            </Grid>
            <Grid item xs>
              <Typography variant={'caption'} className={'previewCaption'}>equipment</Typography>
              <Autocomplete
                className={detail ? 'detail-only' : ''}
                disabled={detail}
                getOptionLabel={(option) =>
                  option.company ? option.company : ''
                }
                id={'tags-standard'}
                onChange={(ev: any, newValue: any) =>
                  handleSelectChange('equipmentId', newValue?._id)
                }
                options={
                  equipments && equipments.length !== 0
                    ? equipments.sort((a: any, b: any) =>
                      a.company > b.company
                        ? 1
                        : b.company > a.company
                          ? -1
                          : 0
                    )
                    : []
                }
                renderInput={(params) => (
                  <TextField
                    error={
                      form.touched.equipmentId &&
                      Boolean(form.errors.equipmentId)
                    }
                    helperText={
                      form.touched.equipmentId && form.errors.equipmentId
                    }
                    {...params}
                    variant={'outlined'}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid container className={'modalContent'} justify={'space-between'} spacing={4}>
            <Grid container xs={8} spacing={4}>
              <Grid container xs={12} spacing={4}>
                <Grid item xs>
                  <Typography variant={'caption'} className={'previewCaption'}>contact associated</Typography>
                  <Autocomplete
                    getOptionLabel={(option) =>
                      option.name ? option.name : ''
                    }
                    id={'tags-standard'}
                    onChange={(ev: any, newValue: any) =>
                      handleSelectChange(
                        'customerContactId',
                        newValue?._id,
                        setContactValue(newValue)
                      )
                    }
                    options={
                      contacts && contacts.length !== 0
                        ? contacts.filter((contact:any) =>
                          contact.isActive
                        ).sort((a: any, b: any) =>
                          a.name > b.name ? 1 : b.name > a.name ? -1 : 0
                        )
                        : []
                    }
                    renderInput={(params) => (
                      <TextField
                        error={
                          form.touched.customerContactId &&
                          Boolean(form.errors.customerContactId)
                        }
                        helperText={
                          form.touched.customerContactId &&
                          form.errors.customerContactId
                        }
                        {...params}
                        variant={'outlined'}
                      />
                    )}
                    value={contactValue}
                  />
                </Grid>
                <Grid item xs>
                  <Typography variant={'caption'} className={'previewCaption'}>customer po</Typography>
                  <BCInput
                    className={'serviceTicketLabel'}
                    disabled={ticket.customerPO}
                    handleChange={formikChange}
                    name={'customerPO'}
                    placeholder={'Customer PO / Sales Order #'}
                    value={FormikValues.customerPO}
                    error={
                      form.touched.customerPO && Boolean(form.errors.customerPO)
                    }
                    helperText={
                      form.touched.customerPO && form.errors.customerPO
                    }
                  />
                </Grid>
              </Grid>
              <Grid container xs={12}>
                <Grid item xs>
                  <Typography variant={'caption'} className={'previewCaption'}>description</Typography>
                  <BCInput
                    handleChange={formikChange}
                    multiline
                    name={'description'}
                    value={FormikValues.description}
                    error={
                      form.touched.description &&
                      Boolean(form.errors.description)
                    }
                    helperText={
                      form.touched.description && form.errors.description
                    }
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item container xs={4} style={{paddingTop: 16}}>
              <BCDragAndDrop images={thumbs} onDrop={(files) => handleImageDrop(files)}  onDelete={handleRemoveImage}/>
            </Grid>
            {job.status === 4 && (
              <Grid container className={classes.lastContent} justify={'space-between'}>
                <Grid item style={{width: '100%'}}>
                  <Typography variant={'caption'} className={'previewCaption'}>Job Reschedule History</Typography>
                  <BCTableContainer
                    className={classes.tableContainer}
                    columns={columns}
                    initialMsg={'No history yet'}
                    isDefault
                    isLoading={loading}
                    onRowClick={() => null}
                    pageSize={5}
                    pagination={true}
                    stickyHeader
                    tableData={filteredJobRescheduleHistory}
                  />
                </Grid>
                <Grid item style={{width: '32%'}} />
              </Grid>
            )}
          </Grid>

          <DialogActions>
            {job.status === 0 &&(
              <div className={classes.markCompleteContainer}>
                <Button
                  color={'primary'}
                  disabled={isSubmitting}
                  onClick={() => openMarkCompleteJobModal(job)}
                  style={{marginLeft: 0}}
                  variant={'contained'}
                >Mark as Complete</Button>
              </div>
            )}
            <div className={classes.actionsContainer}>
              <Button
                disabled={isSubmitting}
                onClick={() => closeModal()}
                variant={'outlined'}
              >Close</Button>
              {job._id &&
                <>
                  <Button
                    color={'secondary'}
                    disabled={isSubmitting}
                    onClick={() => openCancelJobModal(job, true)}
                    style={{}}
                    variant={'contained'}
                  >Cancel Job</Button>
                  {job?.ticket?.ticketId && (
                    <Button
                      color={'secondary'}
                      disabled={isSubmitting}
                      onClick={() => openCancelJobModal(job, false)}
                      style={{}}
                      variant={'contained'}
                    >Cancel Job and Service Ticket</Button>
                  )}
                </>
              }
              <Button
                color={'primary'}
                disabled={isSubmitting}
                type={'submit'}
                variant={'contained'}
                style={{ marginLeft: 30 }}
              >{job._id ? 'Update' : 'Submit'}</Button>
            </div>
          </DialogActions>
        </div>
      </form>
    </DataContainer>
  );
}

const DataContainer = styled.div`
  overflow-y: hidden;
  *:not(.MuiGrid-container) > .MuiGrid-container {
    width: 100%;
    padding: 0px 40px;
  }
  .MuiGrid-spacing-xs-4 > .MuiGrid-spacing-xs-4 {
    margin: 0;
  }
  .MuiGrid-root.MuiGrid-item > .MuiGrid-root.MuiGrid-container {
    padding: 0;
  }
  .MuiGrid-grid-xs-true {
    padding: 10px 16px;
  }
  .MuiOutlinedInput-root {
    border-radius: 8px;
    padding: 2px;
  }

  .MuiOutlinedInput-input {
    padding: 9.5px 4px;
  }

  span.required:after {
    margin-left: 3px;
    content: "*";
    color: red;
  }
`;

export default withStyles(styles, { withTheme: true })(BCJobModal);
