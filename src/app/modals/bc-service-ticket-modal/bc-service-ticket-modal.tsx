import BCDateTimePicker from 'app/components/bc-date-time-picker/bc-date-time-picker';
import BCInput from 'app/components/bc-input/bc-input';
import React, {useEffect, useRef, useState} from 'react';
import {formatDateTimeYMD, formatDateYMD, parseISODate} from 'helpers/format';
import {refreshServiceTickets} from 'actions/service-ticket/service-ticket.action';
import styles from './bc-service-ticket-modal.styles';
import BCEmailValidateInput from '../../components/bc-email-validate-input/bc-email-validate-input';
import {FormDataModel} from '../../models/form-data';
import BCPhoneNumberInput from '../../components/bc-phone-number-input/bc-phone-number-input';
import {useFormik} from 'formik';
import {
  Button,
  Checkbox,
  Chip,
  DialogActions,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
  withStyles,
} from '@material-ui/core';
import moment from 'moment';
import {
  callCreateTicketAPI,
  callEditTicketAPI,
} from 'api/service-tickets.api';
import {
  closeModalAction,
  setModalDataAction,
} from 'actions/bc-modal/bc-modal.action';
import {useDispatch, useSelector} from 'react-redux';
import {
  clearJobSiteStore,
  getJobSites,
  updateJobSiteAction,
} from 'actions/job-site/job-site.action';
import {
  clearJobLocationStore,
  getJobLocationsAction,
  setJobLocations,
} from 'actions/job-location/job-location.action';
import styled from 'styled-components';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {getContacts} from 'api/contacts.api';
import {
  convertMilitaryTime,
  formatDate,
  formatToMilitaryTime,
} from 'helpers/format';
import {
  error as SnackBarError,
  success,
} from 'actions/snackbar/snackbar.action';
import {getEmployeesForJobAction} from 'actions/employees-for-job/employees-for-job.action';
import {modalTypes} from '../../../constants';
import {refreshJobs} from '../../../actions/job/job.action';
import {stringSortCaseInsensitive} from '../../../helpers/sort';
import BCDragAndDrop from '../../components/bc-drag-drop/bc-drag-drop';
import {createFilterOptions} from '@material-ui/lab/Autocomplete';
import {useHistory} from 'react-router-dom';
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';
import { callCreateHomeOwner } from 'api/home-owner.api';
import { getHomeOwnerAction, clearHomeOwnerStore } from 'actions/home-owner/home-owner.action';

function BCServiceTicketModal(
  {
    classes,
    ticket = {
      customer: {
        _id: '',
      },
      source: 'blueclerk',
      jobSite: '',
      jobLocation: '',
      jobType: '',
      note: '',
      updateFlag: '',
      dueDate: null,
      customerContactId: '',
      customerPO: '',
      images: [],
      postCode: '',
    },
    error = {
      status: false,
      message: '',
    },
    onSubmit,
    detail = false,
    allowEditWithJob = false,
    refreshTicketAfterEditing = true,
  }: any): JSX.Element {
  const dispatch = useDispatch();
  const [notesLabelState, setNotesLabelState] = useState(false);
  const [isHomeOccupied, setHomeOccupied] = useState(false);
  const [homeOwnerId, setHomeOwnerId] = useState("");
  const [jobLocationValue, setJobLocationValue] = useState<any>([]);
  const [contactValue, setContactValue] = useState<any>([]);
  const [jobSiteValue, setJobSiteValue] = useState<any>([]);
  const [isLoadingDatas, setIsLoadingDatas] = useState(false);
  const [thumbs, setThumbs] = useState<any[]>([]);
  const isFieldsDisabled = !!ticket.jobCreated && !allowEditWithJob;
  const [formDataPhone, setFormDataPhone] = useState<FormDataModel>({
    'errorMsg': '',
    'validate': true,
    'value': ticket.homeOwner?.contact?.phone || '',
  });
  const [formDataEmail, setFormDataEmail] = useState<FormDataModel>({
    'errorMsg': 'Occupied house must have email or phone number',
    'validate': true,
    'value': ticket.homeOwner?.info?.email || '',
  });
  const {loading, data} = useSelector(
    ({employeesForJob}: any) => employeesForJob
  );
  const employeesForJob = [...data];
  const jobTypesInput = useRef<HTMLInputElement>(null);
  const history = useHistory();
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const filter = createFilterOptions();

  const resetHomeOwnerFields = async () => {
    await setFieldValue('customerFirstName', '');
    await setFieldValue('customerLastName', '');
    await setFormDataEmail({
      ...formDataEmail,
      value: ''
    });
    await setFormDataPhone({
      ...formDataPhone,
      value: ''
    });
    await setHomeOwnerId('');
    await setHomeOccupied(false);
    await setFieldValue('isHomeOccupied', false);
  }

  const handleCustomerChange = async (
    event: any,
    fieldName: any,
    setFieldValue: any,
    newValue: any
  ) => {
    const customerId = newValue ? newValue._id : '';
    await setFieldValue(fieldName, '');
    await setFieldValue('jobLocationId', '');
    await setFieldValue('jobSiteId', '');
    await setFieldValue('customerContactId', '');
    await setJobLocationValue([]);
    await setContactValue([]);
    await setJobSiteValue([]);

    // Clean homeowner fields on customer update
    await resetHomeOwnerFields();

    if (customerId !== '') {
      const data: any = {
        type: 'Customer',
        referenceNumber: customerId,
      };

      await dispatch(getContacts(data));
      await dispatch(getJobLocationsAction({customerId, isActive: true}));
    }

    await setFieldValue(fieldName, customerId);
  };

  const handleContactChange = (
    event: any,
    fieldName: any,
    setFieldValue: any,
    newValue: any
  ) => {
    const contactId = newValue ? newValue._id : '';
    setFieldValue(fieldName, contactId);
    setContactValue(newValue);
  };

  const handleLocationChange = async (
    event: any,
    fieldName: any,
    setFieldValue: any,
    getFieldMeta: any,
    newValue: any
  ) => {
    const locationId = newValue ? newValue._id : '';

    const customerId = getFieldMeta('customerId').value;

    await setFieldValue(fieldName, '');
    await setFieldValue('jobSiteId', '');
    await setJobSiteValue([]);
    await setJobLocationValue(newValue);
    if (locationId !== '') {
      await dispatch(getJobSites({customerId, locationId}));
    } else {
      await dispatch(clearJobSiteStore());
    }
    await setFieldValue(fieldName, locationId);

    // Clean homeowner fields on location update
    await resetHomeOwnerFields();
  };

  const handleJobSiteChange = async (
    event: any,
    fieldName: any,
    setFieldValue: any,
    newValue: any
  ) => {
    // Clean homeowner fields on site update
    await resetHomeOwnerFields();
    dispatch(getHomeOwnerAction(newValue?._id || FormikValues.jobSiteId, FormikValues.jobLocationId));
    if (newValue?._id) {
      setFieldValue(fieldName, newValue._id);
      setJobSiteValue(newValue);
    } else {
      const tempTicket = {
        ...ticket,
        jobSite: FormikValues.jobSiteId,
        jobLocation: FormikValues.jobLocationId,
        note: FormikValues.note,
        dueDate: FormikValues.dueDate
          ? `${formatDateTimeYMD(FormikValues.dueDate)}.000Z`
          : null,
        customerContactId: FormikValues.customerContactId,
        customerPO: FormikValues.customerPO,
        images: FormikValues.images,
        tasks: FormikValues.jobTypes.map((jobType: any) => ({jobType: jobType.jobTypeId || jobType._id})),
        customer: customers.find((customer: any) => customer?._id === FormikValues.customerId),
        homeOwnerId: "",
        isHomeOccupied: false,
        homeOwner: {
          profile: {
            firstName: '',
            lastName: '',
          },
          contact: {
            phone: '',
          },
          info: {
            email: '',
          }
        }
      }
      history.push({
        state: {
          ...jobLocationValue,
        },
      });
      dispatch(
        setModalDataAction({
          data: {
            ticket: tempTicket,
            jobSiteInfo: {
              name: newValue?.inputValue || newValue,
              locationId: FormikValues.jobLocationId,
            },
            modalTitle: `Add Job Address`,
            removeFooter: false,
          },
          type: modalTypes.ADD_JOB_SITE,
        })
      );
    }
  };

  const handleJobTypeChange = (
    event: any,
    setFieldValue: any,
    newValue: any
  ) => {
    let jobType = '';
    jobType = newValue.map((val: any) => ({
      _id: val._id || val.jobTypeId,
      title: val.title,
      description: val.description,
    }));
    setFieldValue('jobTypes', jobType);
  };

  const isValidate = (requestObj: any) => {
    let validateFlag = true;
    if (requestObj.note === undefined || requestObj.note === '') {
      setNotesLabelState(true);
      validateFlag = false;
    } else {
      setNotesLabelState(false);
    }
    return validateFlag;
  };

  const formatRequestObj = (rawReqObj: any) => {
    for (const key in rawReqObj) {
      if (rawReqObj[key] === '' || rawReqObj[key] === null) {
        delete rawReqObj[key];
      }
    }
    return rawReqObj;
  };

  const openCancelTicketModal = async (ticket: any) => {
    dispatch(
      setModalDataAction({
        data: {
          ticket: ticket,
          modalTitle: `Cancel Service Ticket`,
          removeFooter: false,
        },
        type: modalTypes.CANCEL_SERVICE_TICKET_MODAL,
      })
    );
  };

  const openEditTicketConfirmationModal = () => {
    dispatch(
      setModalDataAction({
        data: {
          ticket: ticket,
          modalTitle: `Edit Service Ticket`,
        },
        type: modalTypes.EDIT_SERVICE_TICKET_CONFIRMATION_MODAL,
      })
    );
  };

  const checkValidHomeOwner = () => {
    if(!jobSiteValue || jobSiteValue.length === 0) {
      dispatch(SnackBarError("Address is required when house is occupied"));
      return false;
    }
    if(!formDataPhone.value && !formDataEmail.value) {
      dispatch(SnackBarError("Occupied house must have email or phone number"));
      return false;
    }
    return true;
  }

  useEffect(() => {
    if (!ticket.updateFlag) {
      dispatch(clearJobLocationStore());
      dispatch(clearJobSiteStore());
      dispatch(clearHomeOwnerStore());
    }
  }, []);

  const mapTask = (tasks: any) => {
    if (tasks)
      return tasks.map((t: any) => {
        return {jobTypeId: t.jobType};
      });
    else return [];
  };
  
  const {
    values: FormikValues,
    handleChange: formikChange,
    handleSubmit: FormikSubmit,
    errors: FormikErrors,
    setFieldValue,
    getFieldMeta,
    isSubmitting,
  } = useFormik({
    initialValues: {
      customerId: ticket?.customer?._id,
      source: 'blueclerk',
      jobSiteId: ticket.jobSite ? ticket?.jobSite?._id || ticket.jobSite : '',
      jobLocationId: ticket.jobLocation
        ? ticket?.jobLocation?._id || ticket.jobLocation
        : '',
      jobTypes: ticket.tasks ? mapTask(ticket.tasks) : [],
      note: ticket.note,
      dueDate: parseISODate(ticket.dueDate),
      updateFlag: ticket.updateFlag,
      customerContactId:
        ticket.customerContactId !== undefined
          ? ticket?.customerContactId?._id || ticket.customerContactId
          : '',
      customerPO: ticket?.customerPO !== undefined ? ticket?.customerPO : [],
      images: ticket.images !== undefined ? ticket.images : [],
      isHomeOccupied: ticket.isHomeOccupied || false,
      customerFirstName: ticket.homeOwner?.profile.firstName || '',
      customerLastName: ticket.homeOwner?.profile.lastName || '',
    },
    onSubmit: async (values, {setSubmitting}) => {
      const tempData = {
        ...ticket,
        ...values,
      };
      tempData.jobTypes = JSON.stringify(tempData.jobTypes);
      tempData.images = tempData.images.filter(
        (image: any) => image instanceof File
      );

      //add division and location field
      if (currentDivision.data?.locationId) {
        tempData.companyLocation = currentDivision.data?.locationId;
      }
      
      if (currentDivision.data?.workTypeId) {
        tempData.workType = currentDivision.data?.workTypeId;
      }

      const editTicketObj = {...values, ticketId: ''};
      const updateHomeOccupationStatus = () => {
        if (jobSiteValue.isHomeOccupied === isHomeOccupied) return;
        
        //Verify if the location payload meets the requirements of the backend => location: {long: 0, lat: 0}
        if (jobSiteValue?.location && jobSiteValue?.location?.coordinates.length && (!jobSiteValue?.long && !jobSiteValue?.lat)) {
          jobSiteValue.location.long = jobSiteValue.location.coordinates[0];
          jobSiteValue.location.lat = jobSiteValue.location.coordinates[1];
        }

        const newJobSiteValue = {
          ...jobSiteValue,
          jobSiteId: jobSiteValue._id,
          isHomeOccupied
        };
        dispatch(updateJobSiteAction(newJobSiteValue));
      };
      if (ticket._id) {
        editTicketObj.ticketId = ticket._id;
        // Delete editTicketObj.customerId;
        if (isValidate(editTicketObj)) {
          const formatedRequest = formatRequestObj(editTicketObj);
          if (formatedRequest.dueDate) {
            formatedRequest.dueDate = formatDateYMD(formatedRequest.dueDate);
          }
          formatedRequest.jobTypes = JSON.stringify(
            formatedRequest.jobTypes.map(
              (jt: { jobTypeId?: string; _id: string }) => ({
                jobTypeId: jt.jobTypeId || jt._id,
              })
            )
          );

          // Create home owner if it has been updated or added
          if (formatedRequest.isHomeOccupied) {
            if(!checkValidHomeOwner()) return;
            if (homeOwners.length > 0 &&
              formatedRequest.customerFirstName === homeOwners?.[0]?.profile?.firstName &&
              formatedRequest.customerLastName === homeOwners?.[0]?.profile?.lastName &&
              formDataEmail.value === homeOwners?.[0]?.info?.email &&
              formDataPhone.value === homeOwners?.[0]?.contact?.phone
            ) {
              formatedRequest.homeOwnerId = homeOwners?.[0]._id;
            }
            else if(!ticket.isHomeOccupied || 
              formatedRequest.customerFirstName !== ticket.homeOwner?.profile?.firstName ||
              formatedRequest.customerLastName !== ticket.homeOwner?.profile?.lastName ||
              formDataEmail.value !== ticket.homeOwner.info?.email ||
              formDataPhone.value !== ticket.homeOwner.contact?.phone
            ) {
              let homeOwnerData : any = {
                firstName: formatedRequest.customerFirstName ?? '',
                lastName: formatedRequest.customerLastName ?? '',
                address: formatedRequest.jobSiteId ?? '',
                ...(
                  (formatedRequest.jobLocationId && formatedRequest.jobLocationId.length > 0) &&
                  {subdivision: formatedRequest.jobLocationId}
                ),
                ...((formDataEmail.value && formDataEmail.value.length > 0) && {email: formDataEmail.value}),
                ...((formDataPhone.value && formDataPhone.value.length > 0) && {phone: formDataPhone.value}),

              };
              const homOwnerResult = await callCreateHomeOwner(homeOwnerData)
                .then((response: any) => {
                  if(response.status !== 1) {
                    dispatch(SnackBarError("Could not create home owner"));
                    return false;
                  }
                  formatedRequest.homeOwnerId = response.homeOwner._id;
                  return true;
                });
              if(!homOwnerResult) { return; }
            }
          }
          else {
            formatedRequest.homeOwnerId = '';
          }
          callEditTicketAPI(formatedRequest)
            .then((response: any) => {
              if (response.status === 0) {
                dispatch(SnackBarError(response.message));
                setSubmitting(false);
                return;
              }
              if (refreshTicketAfterEditing) {
                dispatch(refreshServiceTickets(true));
              }
              dispatch(refreshJobs(true));
              dispatch(closeModalAction());
              setTimeout(() => {
                dispatch(
                  setModalDataAction({
                    data: {},
                    type: '',
                  })
                );
              }, 200);
              setSubmitting(false);
              updateHomeOccupationStatus();

              if (response.message === 'Ticket updated successfully.') {
                dispatch(success(response.message));

                if (typeof onSubmit == 'function') {
                  setTimeout(() => {
                    onSubmit(response, ticket._id);
                  }, 500);
                }
              }
            })
            .catch((err: any) => {
              setSubmitting(false);
              throw err;
            });
        } else {
          setSubmitting(false);
        }
      } else {
        delete tempData.customer;
        const formatedRequest = {...formatRequestObj(tempData)};
        formatedRequest.jobTypes = JSON.stringify(
          JSON.parse(formatedRequest.jobTypes).map((jt: any) => ({
            jobTypeId: jt._id,
          }))
        );
        // Create home owner if needed
        if (formatedRequest.isHomeOccupied) {
          if(!checkValidHomeOwner()) return;
          if(homeOwnerId !== '' && 
            formatedRequest.customerFirstName === homeOwners?.[0]?.profile?.firstName &&
            formatedRequest.customerLastName === homeOwners?.[0]?.profile?.lastName &&
            formDataEmail.value === homeOwners?.[0]?.info?.email &&
            formDataPhone.value === homeOwners?.[0]?.contact?.phone
          ) {
            formatedRequest.homeOwnerId = homeOwnerId;
          }
          else {
            let homeOwnerData : any = {
              firstName: formatedRequest.customerFirstName ?? '',
              lastName: formatedRequest.customerLastName ?? '',
              address: formatedRequest.jobSiteId ?? '',
              ...(
                (formatedRequest.jobLocationId && formatedRequest.jobLocationId.length > 0) &&
                {subdivision: formatedRequest.jobLocationId}
              ),
              ...((formDataEmail.value && formDataEmail.value.length > 0) && {email: formDataEmail.value}),
              ...((formDataPhone.value && formDataPhone.value.length > 0) && {phone: formDataPhone.value}),

            };
            const homeOwnerResult = await callCreateHomeOwner(homeOwnerData)
              .then((response: any) => {
                if(response.status !== 1) {
                  dispatch(SnackBarError("Could not create home owner"));
                  return false;
                }
                formatedRequest.homeOwnerId = response.homeOwner._id;
                return true;
              });
            if(!homeOwnerResult) { return; }
          }
        }
        callCreateTicketAPI(formatedRequest)
          .then((response: any) => {
            if (response.status === 0) {
              dispatch(SnackBarError(response.message));
              setSubmitting(false);
              return;
            }
            dispatch(refreshServiceTickets(true));
            dispatch(closeModalAction());
            setTimeout(() => {
              dispatch(
                setModalDataAction({
                  data: {},
                  type: '',
                })
              );
            }, 200);
            setSubmitting(false);
            updateHomeOccupationStatus();

            if (response.message === 'Service ticket created successfully.') {
              dispatch(success(response.message));
            }
          })
          .catch((err: any) => {
            setSubmitting(false);
            throw err;
          });
      }
    },
    validate: (values: any) => {
      const errors: any = {};

      if (moment().isAfter(values.dueDate, 'day')) {
        errors.dueDate = 'Cannot select a date that has already passed';
      }
      if (values.jobTypes.length === 0) {
        errors.jobTypes = 'Select at least one (1) job';
        if (jobTypesInput.current !== null) {
          jobTypesInput.current.setCustomValidity(
            'Select at least one (1) job'
          );
        }
      } else {
        if (jobTypesInput.current !== null) {
          jobTypesInput.current.setCustomValidity('');
        }
      }
      return errors;
    },
  });

  const customers = useSelector(({customers}: any) => customers.data);
  const jobLocations = useSelector((state: any) => state.jobLocations.data);
  const jobSites = useSelector((state: any) => state.jobSites.data);
  const jobTypes = useSelector((state: any) => state.jobTypes.data);
  const items = useSelector((state: any) => state.invoiceItems.items);
  const {contacts} = useSelector((state: any) => state.contacts);
  const homeOwners = useSelector((state: any) => state.homeOwner.data);

  useEffect(() => {
    const filteredHomeOwners = homeOwners.filter((item: any) => 
      item?.address === FormikValues.jobSiteId || item?.address === jobSiteValue?._id
    );
    if (filteredHomeOwners && filteredHomeOwners.length > 0 && (FormikValues.jobSiteId !== '' || jobSiteValue?._id)) {
      setFieldValue('customerFirstName', filteredHomeOwners[0].profile.firstName);
      setFieldValue('customerLastName', filteredHomeOwners[0].profile.lastName);
      setFormDataEmail({
        ...formDataEmail,
        value: filteredHomeOwners[0].info?.email || ''
      });
      setFormDataPhone({
        ...formDataPhone,
        value: filteredHomeOwners[0].contact?.phone || ''
      });
      setHomeOwnerId(filteredHomeOwners[0]._id); 
      setHomeOccupied(true);
      setFieldValue('isHomeOccupied', true);
    }
  }, [homeOwners]);

  const dateChangeHandler = (date: string) => {
    setFieldValue('dueDate', date);
  };

  const handleImageDrop = (files: FileList) => {
    const images = [...FormikValues.images];
    const newImages = Array.from(files);
    images.push(...newImages);

    setFieldValue('images', images);
  };

  const handleRemoveImage = (index: number) => {
    const images = [...FormikValues.images];
    images.splice(index, 1);
    setFieldValue('images', images);
  };

  const closeModal = () => {
    dispatch(clearHomeOwnerStore());
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

  useEffect(() => {
    dispatch(getEmployeesForJobAction());

    if (ticket.customer?._id !== '') {
      dispatch(getJobLocationsAction({customerId: ticket.customer?._id}));

      const data: any = {
        type: 'Customer',
        referenceNumber: ticket.customer?._id,
      };
      dispatch(getContacts(data));
    }
  }, []);

  useEffect(() => {
    if (ticket.customer?._id) {
      const jobLocation = jobLocations.filter(
        (jobLocation: any) =>
          jobLocation._id === ticket.jobLocation ||
          jobLocation._id === ticket?.jobLocation?._id
      )[0];

      if (jobLocation && ticket?.customer?._id === FormikValues.customerId) {
        setJobLocationValue(jobLocation);
        if (jobLocation.isActive) {
          dispatch(
            getJobSites({
              customerId: ticket.customer._id,
              locationId: ticket?.jobLocation?._id || ticket.jobLocation,
            })
          );
        }
      }
      const activeJobLocations = jobLocations.filter(
        (location: any) =>
          location.isActive || location._id === jobLocation?._id
      );
      if (activeJobLocations.length !== jobLocations.length)
        dispatch(setJobLocations(activeJobLocations));
    }
  }, [jobLocations]);

  useEffect(() => {
    if (ticket.customer?._id !== '') {
      if (contacts.length !== 0) {
        setContactValue(
          contacts.filter(
            (contact: any) =>
              contact._id === ticket.customerContactId ||
              contact._id === ticket?.customerContactId?._id
          )[0]
        );
      }
    }
  }, [contacts]);

  useEffect(() => {
    if (ticket.customer?._id !== '') {
      if (
        jobSites.length !== 0 &&
        jobLocationValue?._id &&
        ticket?.customer?._id === FormikValues.customerId
      ) {
        const newJobSite = jobSites.filter(
          (jobSite: any) =>
            jobSite._id === ticket.jobSite ||
            jobSite._id === ticket?.jobSite?._id
        )[0];
        setJobSiteValue(newJobSite);
        if(newJobSite?._id) {
          dispatch(getHomeOwnerAction(newJobSite?._id, jobLocationValue?._id));
        }
      }
    }
  }, [jobSites, jobLocationValue]);

  useEffect(() => {
    if (FormikValues.images) {
      const images: any[] = [];
      const prs: any[] = [];

      FormikValues.images.forEach((image: any) => {
        if (image.imageUrl) {
          images.push(image.imageUrl);
        } else {
          if (image.type.match('image.*')) prs.push(readImage(image));
        }
      });

      if (prs.length) {
        Promise.all(prs).then((reads) => {
          images.push(...reads.filter((image: any) => image !== null));
          setThumbs(images);
        });
      } else {
        setThumbs(images);
      }
    }
  }, [FormikValues.images]);

  const readImage = (image: File) => {
    return new Promise(function (resolve) {
      let fr = new FileReader();

      fr.onload = function () {
        resolve(fr.result);
      };

      fr.onerror = function () {
        resolve(null);
      };

      fr.readAsDataURL(image);
    });
  };

  const getJobType = () => {
    if (jobTypes?.length && items?.length) {
      if (ticket?.tasks?.length) {
        const ids = ticket.tasks.map((ticket: any) => ticket.jobType);
        const result = ids.map((id: any) => {
          const currentItem = items.filter(
            (item: { jobType: string }) =>
              item.jobType && (item.jobType === id || item.jobType === id._id)
          )[0];
          return {
            _id: currentItem?.jobType,
            title: currentItem?.name,
            description: currentItem?.description,
          };
        });
        const newValue = result.map(
          (val: { _id: string; title: string; description: string }) => ({
            jobTypeId: val._id,
            title: val.title,
            description: val.description,
          })
        );
        setFieldValue('jobTypes', newValue);
      }
      if (ticket?.jobType) {
        return [jobTypes.filter((job: any) => job._id === ticket.jobType)[0]];
      }
    }
    return [];
  };

  useEffect(() => {
    getJobType();
  }, [items]);

  if (error.status) {
    return <ErrorMessage>{error.message}</ErrorMessage>;
  }
  return (
    <DataContainer className={'new-modal-design'}>
      <form onSubmit={FormikSubmit}>
        <Grid
          container
          className={'modalPreview'}
          justify={'space-between'}
          spacing={4}
        >
          <Grid item xs={5}>
            <Typography variant={'caption'} className={'previewCaption'}>
              customer
            </Typography>
            <Autocomplete
              className={detail ? 'detail-only' : ''}
              defaultValue={
                ticket.customer &&
                customers.length !== 0 &&
                customers.filter(
                  (customer: any) => customer?._id === ticket.customer?._id
                )[0]
              }
              disabled={
                ticket.customer?.source === 'blueclerk' ||
                isLoadingDatas ||
                detail ||
                !!ticket.jobCreated
              }
              getOptionLabel={(option) =>
                option.profile?.displayName ? option.profile.displayName : ''
              }
              id={'tags-standard'}
              onChange={(ev: any, newValue: any) =>
                handleCustomerChange(ev, 'customerId', setFieldValue, newValue)
              }
              options={
                customers && customers.length !== 0
                  ? customers.sort((a: any, b: any) =>
                    a.profile.displayName > b.profile.displayName
                      ? 1
                      : b.profile.displayName > a.profile.displayName
                      ? -1
                      : 0
                  )
                  : []
              }
              renderInput={(params) => (
                <TextField required {...params} variant={'standard'}/>
              )}
            />
          </Grid>
          <Grid item xs={1}>
            &nbsp;
          </Grid>
          <Grid item xs={2}>
            <Typography variant={'caption'} className={'previewCaption'}>
              due date
            </Typography>
            <BCDateTimePicker
              className={'due_date'}
              disabled={detail || isFieldsDisabled}
              disablePast
              handleChange={dateChangeHandler}
              name={'dueDate'}
              id={'dueDate'}
              placeholder={'Date'}
              value={FormikValues.dueDate}
              errorText={!isFieldsDisabled && FormikErrors.dueDate}
            />
          </Grid>

        </Grid>
        <div className={'modalDataContainer'}>
          <Grid
            container
            className={'modalContent'}
            justify={'space-between'}
            spacing={4}
          >
            <Grid item xs>
              <Typography variant={'caption'} className={'previewCaption'}>
                Subdivision
              </Typography>
              <Autocomplete
                defaultValue={
                  ticket.jobLocation !== '' &&
                  jobLocations.length !== 0 &&
                  jobLocations.filter(
                    (jobLocation: any) => jobLocation._id === ticket.jobLocation
                  )[0]
                }
                disabled={
                  FormikValues.customerId === '' ||
                  isLoadingDatas ||
                  detail ||
                  !!ticket.jobCreated
                }
                getOptionLabel={(option) => (option.name ? option.name : '')}
                getOptionDisabled={(option) => !option.isActive}
                id={'tags-standard'}
                onChange={(ev: any, newValue: any) =>
                  handleLocationChange(
                    ev,
                    'jobLocationId',
                    setFieldValue,
                    getFieldMeta,
                    newValue
                  )
                }
                options={
                  jobLocations && jobLocations.length !== 0
                    ? jobLocations.sort((a: any, b: any) =>
                      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
                    )
                    : []
                }
                renderInput={(params) => (
                  <TextField {...params} variant={'outlined'}/>
                )}
                value={jobLocationValue}
              />
            </Grid>
            <Grid item xs>
              <Typography 
                variant={'caption'} 
                className={
                  FormikValues.isHomeOccupied || isHomeOccupied
                  ? `required ${'previewCaption'}`
                  : 'previewCaption'}
                >
                Job Address
              </Typography>
              <Autocomplete
                className={detail ? 'detail-only' : ''}
                disabled={
                  FormikValues.jobLocationId === '' ||
                  isLoadingDatas ||
                  detail ||
                  !!ticket.jobCreated
                }
                getOptionLabel={(option) => (option.name ? option.name : '')}
                id={'tags-standard'}
                freeSolo
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                onChange={(ev: any, newValue: any) =>
                  handleJobSiteChange(ev, 'jobSiteId', setFieldValue, newValue)
                }
                options={
                  jobSites && jobSites.length !== 0
                    ? jobSites.sort((a: any, b: any) =>
                      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
                    )
                    : []
                }
                renderInput={(params) => (
                  <TextField {...params} variant={'outlined'}/>
                )}
                filterOptions={(options, params) => {
                  const filtered = filter(options, params);

                  // Suggest the creation of a new value
                  if (params.inputValue !== '' && filtered.length === 0) {
                    filtered.push({
                      inputValue: params.inputValue,
                      name: `Add "${params.inputValue}"`,
                    });
                  }

                  return filtered;
                }}
                value={jobSiteValue}
              />
            </Grid>
            <Grid item xs>
              <Typography
                variant={'caption'}
                className={`required ${'previewCaption'}`}
              >
                job type
              </Typography>
              <Autocomplete
                className={detail ? 'detail-only' : ''}
                value={FormikValues.jobTypes}
                getOptionDisabled={(option) => !option.isJobType}
                disabled={detail || !!ticket.jobCreated}
                getOptionLabel={(option) => {
                  const {title, description} = option;
                  return `${title || '...'}${
                    description ? ' - ' + description : ''
                  }`;
                }}
                id={'tags-standard'}
                multiple
                onChange={(ev: any, newValue: any) =>
                  handleJobTypeChange(ev, setFieldValue, newValue)
                }
                options={
                  items && items.length !== 0
                    ? stringSortCaseInsensitive(
                    items.map(
                      (item: { name: string; jobType: string }) => ({
                        ...item,
                        title: item.name,
                        _id: item.jobType,
                      })
                    ),
                    'title'
                    ).sort(
                    (
                      a: { isJobType: boolean },
                      b: { isJobType: boolean }
                    ) =>
                      a.isJobType.toString() > b.isJobType.toString()
                        ? -1
                        : 1
                    )
                    : []
                }
                classes={{popper: classes.popper}}
                renderOption={(option: {
                  title: string;
                  description: string;
                  isJobType: string;
                }) => {
                  const {title, description, isJobType} = option;
                  if (!isJobType) {
                    return '';
                  } else {
                    return `${title || '...'}${
                      description ? ' - ' + description : ''
                    }`;
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    inputRef={jobTypesInput}
                    variant={'outlined'}
                  />
                )}
                getOptionSelected={() => false}
              />
            </Grid>

          </Grid>

          <Grid
            container
            className={'modalContent'}
            justify={'space-between'}
            spacing={4}
          >
            <Grid container xs={8} spacing={4}>
              <Grid container xs={12} spacing={4}>
                <Grid item xs>
                  <Typography variant={'caption'} className={'previewCaption'}>
                    contact associated
                  </Typography>
                  <Autocomplete
                    disabled={
                      FormikValues.customerId === '' ||
                      isLoadingDatas ||
                      detail ||
                      isFieldsDisabled
                    }
                    getOptionLabel={(option) =>
                      option.name ? option.name : ''
                    }
                    id={'tags-standard'}
                    onChange={(ev: any, newValue: any) =>
                      handleContactChange(
                        ev,
                        'customerContactId',
                        setFieldValue,
                        newValue
                      )
                    }
                    options={
                      contacts && contacts.length !== 0
                        ? contacts
                          .filter((contact: any) => contact.isActive)
                          .sort((a: any, b: any) =>
                            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
                          )
                        : []
                    }
                    renderInput={(params) => (
                      <TextField {...params} variant={'outlined'}/>
                    )}
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => {
                        return (
                          <Chip
                            label={`${option.title}${
                              option.description
                                ? ' - ' + option.description
                                : ''
                            }`}
                            {...getTagProps({index})}
                            // disabled={disabledChips.includes(option._id) || !job._id}
                          />
                        );
                      })
                    }
                    value={contactValue}
                  />
                </Grid>
                <Grid item xs>
                  <Typography variant={'caption'} className={'previewCaption'}>
                    customer PO
                  </Typography>
                  <BCInput
                    disabled={detail || isFieldsDisabled}
                    handleChange={formikChange}
                    name={'customerPO'}
                    value={FormikValues.customerPO}
                  />
                </Grid>
              </Grid>
              <Grid container xs={12}>
                <Grid item xs>
                  <Typography variant={'caption'} className={'previewCaption'}>
                    notes / special instructions
                  </Typography>
                  <BCInput
                    className={'serviceTicketLabel'}
                    disabled={detail || isFieldsDisabled}
                    handleChange={formikChange}
                    multiline
                    name={'note'}
                    value={FormikValues.note}
                  />
                  <Label>
                    {notesLabelState
                      ? ' Notes are required while updating the ticket.'
                      : null}
                  </Label>
                </Grid>
              </Grid>
            </Grid>
            <Grid item container xs={4} style={{paddingTop: 0}}>
              <BCDragAndDrop
                images={thumbs}
                onDrop={(files) => handleImageDrop(files)}
                onDelete={handleRemoveImage}
                readonly={!!ticket.jobCreated}
              />
            </Grid>
          </Grid>
          <Grid
            container
            className={'modalContent'}
            justify={'space-between'}
            spacing={4}
          >
            <Grid container xs={3} spacing={4}>
              <Grid container xs={12} spacing={4}>
                <FormControlLabel
                  classes={{label: classes.checkboxLabel}}
                  control={
                    <Checkbox
                      color={'primary'}
                      checked={FormikValues.isHomeOccupied || isHomeOccupied}
                      onChange={(e) => {
                        formikChange(e)
                        setHomeOccupied((v) => !v)
                      }}
                      name="isHomeOccupied"
                      classes={{root: classes.checkboxInput}}
                    />
                  }
                  label={`HOUSE IS OCCUPIED`}
                />
              </Grid>
            </Grid>
            { 
              FormikValues.isHomeOccupied || isHomeOccupied ? (
              <Grid container xs={9} spacing={4}>
                <Grid container xs={12} spacing={4}>
                  <Grid item xs>
                    <Typography 
                      variant={'caption'} 
                      className={`required ${'previewCaption'}`}
                    >
                      First name
                    </Typography>
                    <BCInput
                      disabled={detail || isFieldsDisabled}
                      handleChange={formikChange}
                      name={'customerFirstName'}
                      value={FormikValues?.customerFirstName}
                      required={true}
                    />
                  </Grid>
                  <Grid item xs>
                    <Typography variant={'caption'} className={'previewCaption'}>
                      Last name
                    </Typography>
                    <BCInput
                      disabled={detail || isFieldsDisabled}
                      handleChange={formikChange}
                      name={'customerLastName'}
                      value={FormikValues?.customerLastName}
                    />
                  </Grid>
                  <Grid item xs>
                    <Typography 
                      variant={'caption'} 
                      className={'previewCaption'}
                    >
                      Email
                    </Typography>
                    <BCEmailValidateInput
                      id={'email'}
                      inputData={formDataEmail}
                      disabled={detail || isFieldsDisabled}
                      label={''}
                      onChange={(newEmail: FormDataModel) => setFormDataEmail(newEmail)}
                      size={'small'}
                      variant={'outlined'}
                      required={false}
                      referenceEmail=" "
                    />  
                  </Grid>
                  <Grid item xs>
                    <Typography 
                        variant={'caption'}
                        className={'previewCaption'}
                      >
                        Phone
                    </Typography>
                    <BCPhoneNumberInput
                      changeData={(data: FormDataModel) => setFormDataPhone(data)}
                      id={'phone_number'}
                      inputData={formDataPhone}
                      label={''}
                      size={'small'}
                    />
                  </Grid>
                </Grid>
              </Grid>
              ) : null
            }
          </Grid>

          <DialogActions>
            <Button
              disabled={isSubmitting || isLoadingDatas}
              disableElevation={true}
              onClick={() => closeModal()}
              variant={'outlined'}
            >
              Close
            </Button>
            {ticket._id && (
              <Button
                color={'secondary'}
                disabled={isSubmitting || isLoadingDatas || isFieldsDisabled}
                onClick={() => openCancelTicketModal(ticket)}
                variant={'contained'}
              >
                {'Cancel Ticket'}
              </Button>
            )}
            <Button
              color={'primary'}
              disableElevation={true}
              disabled={isSubmitting || isLoadingDatas || isFieldsDisabled}
              type={'submit'}
              variant={'contained'}
            >
              Submit
            </Button>
            {isFieldsDisabled && (
              <Button
                color={'primary'}
                disableElevation={true}
                onClick={() => openEditTicketConfirmationModal()}
                variant={'contained'}
              >
                Edit Ticket
              </Button>
            )}
          </DialogActions>
        </div>
      </form>
    </DataContainer>
  );
}

const Label = styled.div`
  color: red;
  font-size: 15px;
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 18px;
  padding: 5px;
  text-align: center;
`;

const DataContainer = styled.div`
  *:not(.MuiGrid-container) > .MuiGrid-container {
    width: 100%;
    padding: 10px 40px;
  }
  .MuiGrid-spacing-xs-4 > .MuiGrid-spacing-xs-4 {
    margin: -16px 0;
  }
  .MuiGrid-grid-xs-true {
    padding: 16px;
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
    content: '*';
    color: red;
  }
`;

export default withStyles(styles, {withTheme: true})(BCServiceTicketModal);
