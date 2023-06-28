import BCTableContainer from 'app/components/bc-table-container/bc-table-container';
import styles from './bc-job-modal.styles';
import {
  Button, DialogActions,
  Grid,
  Typography,
  withStyles,
  FormControlLabel,
  Checkbox
} from '@material-ui/core';
import React, {useEffect, useMemo, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  formatDate,
  formatTime,
} from 'helpers/format';
import styled from 'styled-components';
import { getEmployeesForJobAction } from 'actions/employees-for-job/employees-for-job.action';
import '../../../scss/job-poup.scss';
import moment from 'moment';
import classNames from "classnames";
import {getVendors} from "../../../actions/vendor/vendor.action";
import BCDragAndDrop from "../../components/bc-drag-drop/bc-drag-drop";
import EditIcon from '@material-ui/icons/Edit';
import {
  closeModalAction,
  openModalAction,
  setModalDataAction
} from "../../../actions/bc-modal/bc-modal.action";
import {modalTypes} from "../../../constants";
import {getContacts} from "../../../api/contacts.api";
import {callUpdateJobAPI} from "../../../api/job.api";
import {refreshJobs} from "../../../actions/job/job.action";
import {error, success} from "../../../actions/snackbar/snackbar.action";
import BCJobStatus from "../../components/bc-job-status";
import { Job } from 'actions/job/job.types';

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
};
function BCViewJobModal({
  classes,
  job = initialJobState,
}: any): JSX.Element {
  const dispatch = useDispatch();
  const calculateJobType = (task: any) => {
    let title: string[] = [];
    task.jobTypes.forEach((type: any) => title.push(type.jobType?.title))
    return title;
  }
  // const equipments = useSelector(({ inventory }: any) => inventory.data);
  const { contacts } = useSelector((state: any) => state.contacts);
  const { loading, data } = useSelector(
    ({ employeesForJob }: any) => employeesForJob
  );
  const vendorsList = useSelector(({ vendors }: any) =>
    vendors.data.filter((vendor: any) => vendor.status <= 1)
  );

  const employeesForJob = useMemo(() => [...data], [data]);
  const [isSubmitting, SetIsSubmitting] = useState(false);

  const customerContact = job.customerContactId?.name ||
    contacts.find((contact :any) => contact._id === job.customerContactId)?.name;
  const vendorWithCommisionTier = job.tasks.filter((res: any) => res.contractor?.commissionTier);

  useEffect(() => {
    const data: any = {
      type: 'Customer',
      referenceNumber: job.customer?._id,
    };
    dispatch(getContacts(data));
    dispatch(getEmployeesForJobAction());
    dispatch(getVendors());
  }, []);

  const columns: any = [
    {
      Header: 'User',
      id: 'user',
      sortable: true,
      Cell({ row }: any) {
        if(row.original.user === 'tech'){
          return <div>{'Technician\'s comment'}</div>
        }
        const user = employeesForJob.filter(
          (employee: any) => employee._id === row.original.user
        )[0];
        const vendor = vendorsList.find((v: any) => v.contractor.admin?._id === row.original.user);
        const { displayName } = user?.profile || vendor?.contractor.admin.profile || '';
        return <div>{displayName}</div>;
      },
    },
    {
      Header: 'Date',
      id: 'date',
      sortable: true,
      Cell({ row }: any) {
        const dataTime = row.original.date ? moment(new Date(row.original.date)).format(
          'MM/DD/YYYY h:mm A'
        ) : '-';
        return (
          <div style={{ color: 'gray', fontStyle: 'italic' }}>
            {`${dataTime}`}
          </div>
        );
      },
    },
    {
      Header: 'Actions',
      id: 'action',
      sortable: true,
      Cell({ row }: any) {
        const splittedActions = row.original.action.split('|');
        const actions = splittedActions.filter((action: any) => action !== '');
        if(row.original.note){
          actions.push(`Note: ${row.original.note}` );
        }
        return (
          <>
            {actions.length === 0 ? (
              <div />
            ) : (
              <ul className={classes.actionsList}>
                {actions.map((action: any) => (
                  <li>{action}</li>
                ))}
              </ul>
            )}
          </>
        );
      },
    },
  ];

  const scheduleDate = job.scheduleDate;
  // Format time
  const startTime = job.scheduledStartTime ? formatTime(job.scheduledStartTime) : 'N/A';
  const endTime = job.scheduledEndTime ? formatTime(job.scheduledEndTime) : 'N/A';
  const scheduleTimeAMPM = job.scheduleTimeAMPM ?
    job.scheduleTimeAMPM === 1 ? 'AM' :
      job.scheduleTimeAMPM === 2 ? 'PM' :
        job.scheduleTimeAMPM === 3 ? 'All day' : 'N/A'
  : 'N/A';
  const canEdit = [0, 4, 6].indexOf(job.status) >= 0;
  let jobImages = job?.images?.length ? [...job.images] : [];
  jobImages = job?.technicianImages?.length ? [...jobImages, ...job.technicianImages] : jobImages;
  let technicianNotes = job?.tasks?.length ?  job.tasks.filter((task: any) => task.comment).map((task: any) => {
    return {
      user: 'tech',
      action: task.comment,
      date: '',
    }
  }) : [];

  const rescheduleJob= () => {
    dispatch(
      setModalDataAction({
        data: {
          job,
          modalTitle: `Reschedule Job`,
          removeFooter: false,
        },
        type: modalTypes.RESCEDULE_JOB_MODAL,
      })
    );
  }

  const openEditJobModal = () => {
    dispatch(
      setModalDataAction({
        data: {
          job: job,
          modalTitle: 'Edit Job',
          removeFooter: false,
        },
        type: modalTypes.EDIT_JOB_MODAL,
      })
    );
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  const openCancelJobModal = async (jobOnly?: boolean) => {
    dispatch(
      setModalDataAction({
        data: {
          job,
          jobOnly,
          modalTitle: `Cancel Job`,
          removeFooter: false,
        },
        type: modalTypes.CANCEL_JOB_MODAL,
      })
    );
  };

  const openMarkCompleteJobModal = async (job: Job) => {
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

  const completeJob= () => {
    SetIsSubmitting(true);
    const data = {jobId: job._id, status: 2};
    callUpdateJobAPI(data).then((response: any) => {
      if (response.status !== 0) {
        dispatch(refreshJobs(true));
        dispatch(success(`Job completed successfully!`));
        dispatch(closeModalAction());
        setTimeout(() => {
          dispatch(
            setModalDataAction({
              data: {},
              type: '',
            })
          );
        }, 200);
      } else {
        dispatch(error(response.message));
        SetIsSubmitting(false);
      }
    }).catch(e => {
      dispatch(error(e.message));
      SetIsSubmitting(false);
    })
  }
  const openEditJobCostingModal = () => {
    dispatch(
      setModalDataAction({
        data: {
          job,
          removeFooter: false,
          maxHeight: '100%',
          modalTitle: 'Job Costing'
        },
        type: modalTypes.EDIT_JOB_COSTING_MODAL,
      })
    );
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };
  
  return (
    <DataContainer className={'new-modal-design'}>
      <Grid container className={'modalPreview'} justify={'space-around'}>
        {vendorWithCommisionTier.length > 0 &&
          <Grid item xs={12}>
            <Button
              color='primary'
              variant="outlined"
              className='whiteButtonBg'
              onClick={openEditJobCostingModal}
            >
              Job Costing
            </Button>
          </Grid>
        }
        <Grid item style={{width: '40%'}}>
          {canEdit &&
            <>
            <Button size='small'
              classes={{root: classes.editButton, label: classes.editButtonText}}
              startIcon={<EditIcon />}
              onClick={openEditJobModal}
            >Edit Job {job.jobId.replace('Job ', '#')}</Button><br/></>
          }
          <Typography variant={'caption'} className={'previewCaption'}>customer</Typography>
          <Typography variant={'h6'} className={'bigText'}>{job.customer?.profile?.displayName || 'N/A'}</Typography>
        </Grid>
        <Grid item xs className={classNames({[classes.editButtonPadding]: canEdit})}>
          <Typography variant={'caption'} className={'previewCaption'}>schedule date</Typography>
          <Typography variant={'h6'} className={'previewTextTitle'}>{scheduleDate ? formatDate(scheduleDate) : 'N/A'}</Typography>
        </Grid>
        <Grid item xs className={classNames({[classes.editButtonPadding]: canEdit})}>
          <Typography variant={'caption'} className={'previewCaption'}>open time</Typography>
          <Typography variant={'h6'} className={'previewTextTitle'}>{startTime}</Typography>
        </Grid>
        <Grid item xs className={classNames({[classes.editButtonPadding]: canEdit})}>
          <Typography variant={'caption'} className={'previewCaption'}>close time</Typography>
          <Typography variant={'h6'} className={'previewTextTitle'}>{endTime}</Typography>
        </Grid>
        <Grid item xs className={classNames({[classes.editButtonPadding]: canEdit})}>
          <Typography variant={'caption'} className={'previewCaption'}>time range</Typography>
          <Typography variant={'h6'} className={'previewTextTitle'}>{scheduleTimeAMPM}</Typography>
        </Grid>
      </Grid>
      <div className={'modalDataContainer'}>
        {job.tasks.map((task: any) =>
          <>
            <Grid container className={'modalContent'} justify={'space-around'}>
            <Grid item xs>
              <Typography variant={'caption'} className={'previewCaption'}>technician type</Typography>
            </Grid>
            <Grid item xs>
              <Typography variant={'caption'} className={'previewCaption'}>technician name</Typography>
            </Grid>
            <Grid item xs>
              <Typography variant={'caption'} className={'previewCaption'}>job type</Typography>
            </Grid>
            <Grid item style={{width: 100}}>
            </Grid>
          </Grid>
            <Grid container className={classNames(classes.taskList)} justify={'space-around'}>
              <Grid container className={classNames(classes.task)}>
              <Grid item xs>
                <Typography variant={'h6'} className={'previewText'} style={{borderTop: 1, borderColor: 'black'}}>{task.employeeType ? 'Contractor' : 'Employee'}</Typography>
              </Grid>
              <Grid item xs>
              <Typography variant={'h6'} className={'previewText'} style={{borderTop: 1}}>{task.technician?.profile?.displayName || 'N/A'}</Typography>
              </Grid>
              <Grid item xs>
                  <Typography variant={'h6'} className={'previewText'} style={{ borderTop: 1 }}>{calculateJobType(task).map((type: string, i: number) => <span key={i} className={'jobTypeText'}>{type}</span>)}</Typography>
              </Grid>
              <Grid item style={{width: 100}}>
                <BCJobStatus status={task.status || 0} size={'small'}/>
              </Grid>
              </Grid>
            </Grid>
          </>
        )}
        <Grid container className={'modalContent'} justify={'space-around'}>
          <Grid item xs>
            <Typography variant={'caption'} className={'previewCaption'}>Subdivision</Typography>
            <Typography variant={'h6'} className={'previewText'}>{job.jobLocation?.name || 'N/A'}</Typography>
          </Grid>
          <Grid item xs>
            <Typography variant={'caption'} className={'previewCaption'}>Job Address</Typography>
            <Typography variant={'h6'} className={'previewText'}>{job.jobSite?.name || 'N/A'}</Typography>
          </Grid>
          <Grid item xs>
            <Typography variant={'caption'} className={'previewCaption'}>equipment</Typography>
            <Typography variant={'h6'} className={'previewText'}>N/A</Typography>
          </Grid>
        </Grid>
        <Grid container className={'modalContent'} justify={'space-around'}>
          <Grid container xs={8}>
            <Grid container xs={12}>
              <Grid item xs>
                <Typography variant={'caption'} className={'previewCaption'}>contact associated</Typography>
                <Typography variant={'h6'} className={'previewText'}>{customerContact || 'N/A'}</Typography>
              </Grid>
              <Grid item xs>
                <Typography variant={'caption'} className={'previewCaption'}>Customer PO</Typography>
                <Typography variant={'h6'} className={'previewText'}>{job.customerPO || 'N/A'}</Typography>
              </Grid>
            </Grid>
            <Grid container className={classes.innerRow} xs={12}>
              <Grid item xs>
                <Typography variant={'caption'} className={'previewCaption'}>description</Typography>
                <Typography variant={'h6'} className={classNames('previewText', 'description')}>{job.description || 'N/A'}</Typography>
              </Grid>
        </Grid>
          </Grid>
          <Grid item container xs={4}>
            <Grid item xs>
              <Typography variant={'caption'} className={'previewCaption'}>photo(s);</Typography>
              <BCDragAndDrop images={jobImages.map((image: any) => image.imageUrl)} readonly={true}  />
            </Grid>
          </Grid>
        </Grid>
        <Grid container className={'modalContent'} justify={'space-between'}>
          <Grid container xs={12}>
            <FormControlLabel
              classes={{label: classes.checkboxLabel}}
              control={
                <Checkbox
                  color={'primary'}
                  checked={job.isHomeOccupied }
                  name="isHomeOccupied"
                  classes={{root: classes.checkboxInput}}
                  disabled={true}
                />
              }
              label={`HOUSE IS OCCUPIED`}
            />
          </Grid>
          {
            job.isHomeOccupied ? (
            <Grid container xs={12}>
              <Grid justify={'space-between'} xs>
                <Typography variant={'caption'} className={'previewCaption'}>
                  First name
                </Typography>
                <Typography variant={'h6'} className={'previewText'}>{job?.homeOwnerObj[0]?.profile?.firstName ||'N/A'}</Typography>
              </Grid>
              <Grid justify={'space-between'} xs>
                <Typography variant={'caption'} className={'previewCaption'}>
                  Last name
                </Typography>
                <Typography variant={'h6'} className={'previewText'}>{job?.homeOwnerObj[0]?.profile?.lastName ||'N/A'}</Typography>
              </Grid>
              <Grid justify={'space-between'} xs>
                <Typography variant={'caption'} className={'previewCaption'}>Email</Typography>
                <Typography variant={'h6'} className={'previewText'}>{job?.homeOwnerObj[0]?.info?.email ||'N/A'}</Typography>
              </Grid>
              <Grid justify={'space-between'} xs>
                <Typography variant={'caption'} className={'previewCaption'}>Phone</Typography>
                <Typography variant={'h6'} className={'previewText'}>{job?.homeOwnerObj[0]?.contact?.phone ||'N/A'}</Typography>
              </Grid>
            </Grid>
            ) : null
          }
        </Grid>
        <Grid container className={classNames('modalContent', classes.lastRow)}  justify={'space-between'}>
          <Grid item xs>
            <Typography variant={'caption'} className={'previewCaption'}>&nbsp;&nbsp;job history</Typography>
            <div >
              <BCTableContainer
                className={classes.tableContainer}
                columns={columns}
                initialMsg={'No history yet'}
                isDefault
                isLoading={loading}
                onRowClick={() => {}}
                pageSize={5}
                pagination={true}
                stickyHeader
                tableData={[...job.track, ...technicianNotes]}
              />
            </div>
          </Grid>
        </Grid>
        {job.status === 1 && (
          <DialogActions>
            <div className={classes.markCompleteContainer}>
              <Button
                color={'primary'}
                disabled={isSubmitting}
                onClick={() => openMarkCompleteJobModal(job)}
                style={{marginLeft: 0}}
                variant={'contained'}
              >Mark as Complete</Button>
            </div>
          </DialogActions>
        )}
        {job.status === 6 &&
        <DialogActions>
          <Button
            disabled={isSubmitting}
            color={'secondary'}
            onClick={() => openCancelJobModal(true)}
            variant={'contained'}
          >Cancel Job</Button>
          {job?.ticket?.ticketId && (
            <Button
              disabled={isSubmitting}
              color={'secondary'}
              onClick={() => openCancelJobModal(false)}
              variant={'contained'}
            >Cancel Job and Service Ticket</Button>
          )}
          <Button
            disabled={isSubmitting}
            color={'primary'}
            onClick={completeJob}
            variant={'contained'}
            style={{ marginLeft: 30 }}
          >Complete</Button>
          {/*<Button
            disabled={isSubmitting}
            color={'primary'}
            onClick={completeJob}
            variant={'contained'}
          >Reschedule</Button>*/}
        </DialogActions>
        }
      </div>
    </DataContainer>
  );
}

const DataContainer = styled.div`
  margin: auto 0;

  .modalContent {
    padding-top: 15px !important;
  }

  .MuiTableCell-root {
    line-height: normal;
  }

  .MuiTableCell-sizeSmall {
    padding: 0px 16px;
  }

  .whiteButtonBg {
    background-color: #ffffff;
    border-radius: 8px;
    margin-bottom: 10px
  }

  .MuiButton-containedSecondary {
    margin-left: 15px !important;
}

`;

export default withStyles(styles, { withTheme: true })(BCViewJobModal);
